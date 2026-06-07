export type EdgeStrategy = 'black' | 'white' | 'copy';

// FIX ЛР5: KernelChannel теперь — набор индексов каналов (0=R,1=G,2=B,3=A),
// а не одиночная строка. Старый тип 'all'|'R'|'G'|'B' заменён на Set<number>.
export type KernelChannelSet = Set<number>;

export interface KernelPreset {
  name: string;
  kernel: number[];
  divisor: number;
}

export const KERNEL_PRESETS: KernelPreset[] = [
  {
    name: 'Тождественное отображение',
    kernel: [0, 0, 0,  0, 1, 0,  0, 0, 0],
    divisor: 1,
  },
  {
    name: 'Повышение резкости (Sharpen)',
    kernel: [0, -1, 0,  -1, 5, -1,  0, -1, 0],
    divisor: 1,
  },
  {
    name: 'Фильтр Гаусса 3×3',
    kernel: [1, 2, 1,  2, 4, 2,  1, 2, 1],
    divisor: 16,
  },
  {
    name: 'Прямоугольное размытие (Box)',
    kernel: [1, 1, 1,  1, 1, 1,  1, 1, 1],
    divisor: 9,
  },
  {
    name: 'Оператор Прюитта (горизонталь)',
    kernel: [-1, -1, -1,  0, 0, 0,  1, 1, 1],
    divisor: 1,
  },
  {
    name: 'Оператор Прюитта (вертикаль)',
    kernel: [-1, 0, 1,  -1, 0, 1,  -1, 0, 1],
    divisor: 1,
  },
];

// Подготовка границ (отступов)
export function padImage(src: ImageData, strategy: EdgeStrategy): ImageData {
  const w = src.width + 2;
  const h = src.height + 2;
  const out = new ImageData(w, h);
  const d = out.data;
  const s = src.data;

  // Фон по-умолчанию (сплошная заливка краев черным или белым)
  if (strategy === 'white') {
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 255; d[i+1] = 255; d[i+2] = 255; d[i+3] = 255;
    }
  } else if (strategy === 'black') {
    for (let i = 0; i < d.length; i += 4) {
      d[i] = 0; d[i+1] = 0; d[i+2] = 0; d[i+3] = 255;
    }
  }

  // Копируем сам оригинал прямо в центр, отступив на 1 px
  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const si = (y * src.width + x) * 4;
      const di = ((y + 1) * w + (x + 1)) * 4;
      d[di]   = s[si];
      d[di+1] = s[si+1];
      d[di+2] = s[si+2];
      d[di+3] = s[si+3];
    }
  }

  // Заполняем пустоты "ближайшим краем" по заданию (copy strategy)
  if (strategy === 'copy') {
    for (let x = 0; x < src.width; x++) {
      const topSrc    = (0 * src.width + x) * 4;
      const botSrc    = ((src.height-1) * src.width + x) * 4;
      const topDst    = (0 * w + (x+1)) * 4;
      const botDst    = ((h-1) * w + (x+1)) * 4;
      for (let c = 0; c < 4; c++) {
        d[topDst+c] = s[topSrc+c];
        d[botDst+c] = s[botSrc+c];
      }
    }
    for (let y = 0; y < src.height; y++) {
      const leftSrc  = (y * src.width + 0) * 4;
      const rightSrc = (y * src.width + src.width-1) * 4;
      const leftDst  = ((y+1) * w + 0) * 4;
      const rightDst = ((y+1) * w + w-1) * 4;
      for (let c = 0; c < 4; c++) {
        d[leftDst+c]  = s[leftSrc+c];
        d[rightDst+c] = s[rightSrc+c];
      }
    }
    const corners = [
      [0, 0,  0, 0],
      [0, src.width-1,  0, w-1],
      [src.height-1, 0,  h-1, 0],
      [src.height-1, src.width-1,  h-1, w-1]
    ];
    for (const [sy, sx, dy, dx] of corners) {
      const si = (sy * src.width + sx) * 4;
      const di = (dy * w + dx) * 4;
      for (let c = 0; c < 4; c++) d[di+c] = s[si+c];
    }
  }

  return out;
}

// FIX ЛР5: Применение матрицы с поддержкой произвольного набора каналов (включая Alpha)
export async function applyConvolutionAsync(
  src: ImageData,
  kernel: number[],
  divisor: number,
  channels: KernelChannelSet,
  edge: EdgeStrategy,
  onProgress?: (pct: number) => void
): Promise<ImageData> {
  const padded = padImage(src, edge);
  const out = new ImageData(
    new Uint8ClampedArray(src.data),
    src.width,
    src.height
  );

  const pw = padded.width;
  const CHUNK = 80; // Размер одного такта расчета строк

  // Валидация нулевого делителя
  if (divisor === 0) divisor = 1;

  // FIX ЛР5: Определяем к каким каналам (0..3 = R,G,B,A) применять свёртку
  // Если набор пустой — ничего не делаем
  const channelIndices = [0, 1, 2, 3].filter(c => channels.has(c));

  for (let y = 0; y < src.height; y++) {
    for (let x = 0; x < src.width; x++) {
      const dstIdx = (y * src.width + x) * 4;

      for (const c of channelIndices) {
        let sum = 0;
        // Окно 3х3
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const px = (y + ky) * pw + (x + kx);
            sum += padded.data[px * 4 + c] * kernel[ky * 3 + kx];
          }
        }
        out.data[dstIdx + c] = Math.max(0, Math.min(255, Math.round(sum / divisor)));
      }
    }

    // Если достигнут ЧАНК (сброс в поток, защита от заморозки страницы)
    if (y % CHUNK === 0) {
      if (onProgress) onProgress(Math.round((y / src.height) * 100));
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }

  if (onProgress) onProgress(100);

  return out;
}