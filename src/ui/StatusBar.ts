import type { AppImageMeta } from '../core/ImageData';

export class StatusBar {
  private elWidth: HTMLElement;
  private elHeight: HTMLElement;
  private elDepth: HTMLElement;
  private elFormat: HTMLElement;

  constructor() {
    this.elWidth  = document.getElementById('status-width')!;
    this.elHeight = document.getElementById('status-height')!;
    this.elDepth  = document.getElementById('status-depth')!;
    this.elFormat = document.getElementById('status-format')!;
  }

  update(meta: AppImageMeta): void {
    this.elWidth.textContent  = `${meta.width}px`;
    this.elHeight.textContent = `${meta.height}px`;
    this.elDepth.textContent  = `${meta.colorDepth} bpp`;
    this.elFormat.textContent = meta.format;
  }

  reset(): void {
    this.elWidth.textContent  = '—';
    this.elHeight.textContent = '—';
    this.elDepth.textContent  = '—';
    this.elFormat.textContent = '—';
  }
}