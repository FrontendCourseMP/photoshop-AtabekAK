import { scaleImage, type InterpolationMethod } from './Interpolation';

export class ImageScaler {
  // Вычисляет начальный масштаб чтобы изображение вошло в экран
  static computeFitZoom(
    imgWidth: number,
    imgHeight: number,
    areaWidth: number,
    areaHeight: number,
    padding = 50
  ): number {
    const availW = areaWidth - padding * 2;
    const availH = areaHeight - padding * 2;
    const zoom = Math.min(availW / imgWidth, availH / imgHeight, 1);
    return Math.max(0.12, Math.min(3.0, zoom));
  }

  // Масштабирует ImageData до нужных размеров
  static resize(
    src: ImageData,
    newWidth: number,
    newHeight: number,
    method: InterpolationMethod = 'bilinear'
  ): ImageData {
    newWidth  = Math.max(1, Math.round(newWidth));
    newHeight = Math.max(1, Math.round(newHeight));
    return scaleImage(src, newWidth, newHeight, method);
  }
}