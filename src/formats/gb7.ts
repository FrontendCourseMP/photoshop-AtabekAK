export interface GB7Image {
  width: number;
  height: number;
  hasMask: boolean;
  pixels: Uint8Array;
}

const SIGNATURE = [0x47, 0x42, 0x37, 0x1d]; // GB7·

export function decodeGB7(buffer: ArrayBuffer): GB7Image {
  const bytes = new Uint8Array(buffer);

  // Проверка сигнатуры
  for (let i = 0; i < 4; i++) {
    if (bytes[i] !== SIGNATURE[i]) {
      throw new Error('Неверная сигнатура файла GB7');
    }
  }

  const version = bytes[4];
  if (version !== 0x01) {
    throw new Error(`Неподдерживаемая версия GB7: ${version}`);
  }

  const flag = bytes[5];
  const hasMask = (flag & 0x01) === 1;

  // Ширина и высота — big-endian (2 байта каждый)
  const width = (bytes[6] << 8) | bytes[7];
  const height = (bytes[8] << 8) | bytes[9];
  // bytes[10], bytes[11] — зарезервировано

  const expectedPixels = width * height;
  const actualPixels = bytes.length - 12;

  if (actualPixels < expectedPixels) {
    throw new Error(`Недостаточно данных: ожидалось ${expectedPixels}, получено ${actualPixels}`);
  }

  const pixels = bytes.slice(12, 12 + expectedPixels);

  return { width, height, hasMask, pixels };
}

export function encodeGB7(imageData: ImageData): ArrayBuffer {
  const { width, height, data } = imageData;
  const totalBytes = 12 + width * height;
  const buffer = new ArrayBuffer(totalBytes);
  const bytes = new Uint8Array(buffer);

  // Сигнатура
  bytes[0] = 0x47;
  bytes[1] = 0x42;
  bytes[2] = 0x37;
  bytes[3] = 0x1d;

  // Версия
  bytes[4] = 0x01;

  // Флаг — маски нет
  bytes[5] = 0x00;

  // Ширина big-endian
  bytes[6] = (width >> 8) & 0xff;
  bytes[7] = width & 0xff;

  // Высота big-endian
  bytes[8] = (height >> 8) & 0xff;
  bytes[9] = height & 0xff;

  // Резерв
  bytes[10] = 0x00;
  bytes[11] = 0x00;

  // Пиксели — конвертируем RGB в grayscale, обрезаем до 7 бит
  for (let i = 0; i < width * height; i++) {
    const r = data[i * 4 + 0];
    const g = data[i * 4 + 1];
    const b = data[i * 4 + 2];
    // Стандартная формула luminance
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    // Обрезаем до 7 бит (0-127), масштабируем из 0-255
    bytes[12 + i] = Math.round((gray / 255) * 127) & 0x7f;
  }

  return buffer;
}

export function gb7ToImageData(gb7: GB7Image): ImageData {
  const { width, height, hasMask, pixels } = gb7;
  const imageData = new ImageData(width, height);
  const data = imageData.data;

  for (let i = 0; i < width * height; i++) {
    const byte = pixels[i];
    // 7 младших бит — значение серого (0-127), масштабируем в 0-255
    const gray7 = byte & 0x7f;
    const gray = Math.round((gray7 / 127) * 255);

    // Альфа канал
    let alpha = 255;
    if (hasMask) {
      const maskBit = (byte >> 7) & 0x01;
      alpha = maskBit === 0 ? 0 : 255;
    }

    data[i * 4 + 0] = gray; // R
    data[i * 4 + 1] = gray; // G
    data[i * 4 + 2] = gray; // B
    data[i * 4 + 3] = alpha; // A
  }

  return imageData;
}