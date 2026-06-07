import type { CanvasRenderer } from '../core/CanvasRenderer';
import { encodeGB7 } from '../formats/gb7';

export class Toolbar {
  private renderer: CanvasRenderer;
  private currentFileName: string = 'image';

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
  }

  setFileName(name: string): void {
    this.currentFileName = name.replace(/\.[^/.]+$/, '');
  }

  bindSaveButtons(): void {
    document.getElementById('btn-save-png')!
      .addEventListener('click', () => this.savePNG());

    document.getElementById('btn-save-jpg')!
      .addEventListener('click', () => this.saveJPG());

    document.getElementById('btn-save-gb7')!
      .addEventListener('click', () => this.saveGB7());
  }

  // FIX ЛР1: Создаём offscreen canvas точно в размере исходного ImageData,
  // без учёта текущего зума — чтобы сохранялось в реальном размере изображения
  private createCanvasFromImageData(): HTMLCanvasElement | null {
    const imageData = this.renderer.getImageData();
    if (!imageData) return null;

    const offscreen = document.createElement('canvas');
    offscreen.width  = imageData.width;
    offscreen.height = imageData.height;
    offscreen.getContext('2d')!.putImageData(imageData, 0, 0);
    return offscreen;
  }

  private savePNG(): void {
    const imageData = this.renderer.getImageData();
    if (!imageData) return;

    // FIX ЛР1: Сохраняем из offscreen canvas в исходном размере, а не из main canvas
    const offscreen = this.createCanvasFromImageData()!;
    offscreen.toBlob((blob) => {
      if (blob) this.download(blob, `${this.currentFileName}.png`);
    }, 'image/png');
  }

  private saveJPG(): void {
    const imageData = this.renderer.getImageData();
    if (!imageData) return;

    // FIX ЛР1: Сохраняем из offscreen canvas в исходном размере, а не из main canvas
    const offscreen = this.createCanvasFromImageData()!;
    offscreen.toBlob((blob) => {
      if (blob) this.download(blob, `${this.currentFileName}.jpg`);
    }, 'image/jpeg', 0.92);
  }

  private saveGB7(): void {
    const imageData = this.renderer.getImageData();
    if (!imageData) return;
    const buffer = encodeGB7(imageData);
    const blob = new Blob([buffer], { type: 'application/octet-stream' });
    this.download(blob, `${this.currentFileName}.gb7`);
  }

  private download(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  }
}