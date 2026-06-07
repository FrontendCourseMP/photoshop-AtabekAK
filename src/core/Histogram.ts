export type HistogramChannel = 'master' | 'R' | 'G' | 'B' | 'A';

export interface HistogramData {
  counts: number[];   // 256 значений
  max: number;
}

export function computeHistogram(
  imageData: ImageData,
  channel: HistogramChannel
): HistogramData {
  const data = imageData.data;
  const counts = new Array(256).fill(0);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    let value: number;
    if (channel === 'master') {
      value = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    } else if (channel === 'R') {
      value = r;
    } else if (channel === 'G') {
      value = g;
    } else if (channel === 'B') {
      value = b;
    } else {
      value = a;
    }

    counts[value]++;
  }

  const max = Math.max(...counts);
  return { counts, max };
}

export function drawHistogram(
  canvas: HTMLCanvasElement,
  data: HistogramData,
  channel: HistogramChannel,
  logarithmic: boolean
): void {
  const ctx = canvas.getContext('2d')!;
  const w = canvas.width;
  const h = canvas.height;

  ctx.clearRect(0, 0, w, h);

  // Фон
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, w, h);

  const { counts, max } = data;
  const logMax = Math.log(max + 1);

  const barW = w / 256;

  // Цвет гистограммы по каналу
  const colors: Record<HistogramChannel, string> = {
    master: '#aaaaaa',
    R: '#f48771',
    G: '#4ec9b0',
    B: '#569cd6',
    A: '#888888',
  };
  ctx.fillStyle = colors[channel];

  for (let i = 0; i < 256; i++) {
    const raw = counts[i];
    let normalized: number;

    if (logarithmic) {
      normalized = raw > 0 ? Math.log(raw + 1) / logMax : 0;
    } else {
      normalized = raw / max;
    }

    const barH = normalized * h;
    const x = i * barW;
    ctx.fillRect(x, h - barH, barW + 0.5, barH);
  }

  // Сетка
  ctx.strokeStyle = '#2e2e2e';
  ctx.lineWidth = 1;
  for (let i = 1; i < 4; i++) {
    const x = (w / 4) * i;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, h);
    ctx.stroke();
  }
}