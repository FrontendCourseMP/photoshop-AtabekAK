export type InterpolationMethod = 'nearest' | 'bilinear';

export interface Interpolator {
  id: InterpolationMethod;
  name: string;
  description: string;
  scale(src: ImageData, newWidth: number, newHeight: number): ImageData;
}

// Метод ближайшего соседа
export const nearestNeighbor: Interpolator = {
  id: 'nearest',
  name: 'Ближайший сосед',
  description: 'Быстрый метод. Каждый новый пиксель берёт цвет ближайшего пикселя оригинала. Даёт пиксельный эффект при увеличении.',
  scale(src: ImageData, newWidth: number, newHeight: number): ImageData {
    const dst = new ImageData(newWidth, newHeight);
    const xRatio = src.width / newWidth;
    const yRatio = src.height / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const srcX = Math.min(Math.floor(x * xRatio), src.width - 1);
        const srcY = Math.min(Math.floor(y * yRatio), src.height - 1);

        const srcIdx = (srcY * src.width + srcX) * 4;
        const dstIdx = (y * newWidth + x) * 4;

        dst.data[dstIdx]     = src.data[srcIdx];
        dst.data[dstIdx + 1] = src.data[srcIdx + 1];
        dst.data[dstIdx + 2] = src.data[srcIdx + 2];
        dst.data[dstIdx + 3] = src.data[srcIdx + 3];
      }
    }
    return dst;
  }
};

// Билинейная интерполяция
export const bilinear: Interpolator = {
  id: 'bilinear',
  name: 'Билинейная',
  description: 'Плавный метод. Новый пиксель вычисляется как взвешенное среднее четырёх соседних пикселей оригинала. Устраняет ступенчатость при масштабировании.',
  scale(src: ImageData, newWidth: number, newHeight: number): ImageData {
    const dst = new ImageData(newWidth, newHeight);
    const xRatio = src.width / newWidth;
    const yRatio = src.height / newHeight;

    for (let y = 0; y < newHeight; y++) {
      for (let x = 0; x < newWidth; x++) {
        const gx = x * xRatio;
        const gy = y * yRatio;

        const x0 = Math.floor(gx);
        const y0 = Math.floor(gy);
        const x1 = Math.min(x0 + 1, src.width - 1);
        const y1 = Math.min(y0 + 1, src.height - 1);

        const dx = gx - x0;
        const dy = gy - y0;

        const idx00 = (y0 * src.width + x0) * 4;
        const idx10 = (y0 * src.width + x1) * 4;
        const idx01 = (y1 * src.width + x0) * 4;
        const idx11 = (y1 * src.width + x1) * 4;

        const dstIdx = (y * newWidth + x) * 4;

        for (let c = 0; c < 4; c++) {
          const top    = src.data[idx00 + c] * (1 - dx) + src.data[idx10 + c] * dx;
          const bottom = src.data[idx01 + c] * (1 - dx) + src.data[idx11 + c] * dx;
          dst.data[dstIdx + c] = Math.round(top * (1 - dy) + bottom * dy);
        }
      }
    }
    return dst;
  }
};

export const interpolators: Record<InterpolationMethod, Interpolator> = {
  nearest: nearestNeighbor,
  bilinear,
};

export function scaleImage(
  src: ImageData,
  newWidth: number,
  newHeight: number,
  method: InterpolationMethod = 'bilinear'
): ImageData {
  return interpolators[method].scale(src, newWidth, newHeight);
}