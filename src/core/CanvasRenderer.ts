import { scaleImage } from './Interpolation';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private originalImageData: ImageData | null = null;
  private currentZoom: number = 1.0;

  // FIX ЛР4: Метод интерполяции для зума — по умолчанию bilinear
  private zoomMethod: 'nearest' | 'bilinear' = 'bilinear';

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
  }

  setZoomMethod(method: 'nearest' | 'bilinear'): void {
    this.zoomMethod = method;
  }

  render(imageData: ImageData): void {
    this.originalImageData = imageData;
    this.applyZoom(this.currentZoom);
  }

  applyZoom(zoom: number): void {
    if (!this.originalImageData) return;
    this.currentZoom = zoom;

    const w = Math.round(this.originalImageData.width  * zoom);
    const h = Math.round(this.originalImageData.height * zoom);

    // FIX ЛР4: Используем собственную реализацию масштабирования (nearest/bilinear)
    // вместо браузерного ctx.drawImage, чтобы интерполяция работала корректно
    // и не перебивалась CSS image-rendering: pixelated
    const scaled = scaleImage(this.originalImageData, w, h, this.zoomMethod);

    this.canvas.width  = w;
    this.canvas.height = h;
    this.ctx.putImageData(scaled, 0, 0);

    this.canvas.style.width  = '';
    this.canvas.style.height = '';
  }

  fitToScreen(): void {
    const area = this.canvas.parentElement;
    if (!area || !this.originalImageData) return;
    const areaW = area.clientWidth  - 40;
    const areaH = area.clientHeight - 40;
    const imgW  = this.originalImageData.width;
    const imgH  = this.originalImageData.height;
    const scale = Math.min(1, areaW / imgW, areaH / imgH);
    this.canvas.style.width  = `${imgW * scale}px`;
    this.canvas.style.height = `${imgH * scale}px`;
  }

  getImageData(): ImageData | null {
    return this.originalImageData;
  }

  getCanvas(): HTMLCanvasElement {
    return this.canvas;
  }

  getZoom(): number {
    return this.currentZoom;
  }

  clear(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.originalImageData = null;
  }
}