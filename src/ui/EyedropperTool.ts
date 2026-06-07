import { rgbToLab } from '../core/ColorSpace';
import type { CanvasRenderer } from '../core/CanvasRenderer';

export class EyedropperTool {
  private renderer: CanvasRenderer;
  private canvas: HTMLCanvasElement;
  private active: boolean = false;
  private panel: HTMLElement;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
    this.canvas = renderer.getCanvas();
    this.panel = this.createPanel();
    document.getElementById('canvas-area')!.appendChild(this.panel);
    this.canvas.addEventListener('click', (e) => this.onClick(e));
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'eyedropper-panel';
    panel.style.cssText = `
      display: none;
      position: absolute;
      bottom: 8px;
      right: 8px;
      background: #1e1e1e;
      border: 1px solid #3e3e3e;
      border-radius: 6px;
      padding: 10px 14px;
      font-size: 12px;
      color: #d4d4d4;
      min-width: 180px;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
    `;
    panel.innerHTML = `
      <div style="font-weight:600; margin-bottom:8px; color:#9cdcfe;">🎨 Пипетка</div>
      <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
        <div id="color-preview" style="
          width:32px; height:32px;
          border-radius:4px;
          border:1px solid #555;
          background:#000;
          flex-shrink:0;
        "></div>
        <div>
          <div id="ep-coords" style="color:#888; font-size:11px;">X: — Y: —</div>
          <div id="ep-hex" style="font-weight:600; font-size:13px;">#000000</div>
        </div>
      </div>
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px;">
        <div><span style="color:#f48771;">R:</span> <span id="ep-r">—</span></div>
        <div><span style="color:#4ec9b0;">G:</span> <span id="ep-g">—</span></div>
        <div><span style="color:#569cd6;">B:</span> <span id="ep-b">—</span></div>
        <div><span style="color:#888;">A:</span> <span id="ep-a">—</span></div>
        <div style="grid-column:1/-1; margin-top:4px; border-top:1px solid #3e3e3e; padding-top:4px;">
          <span style="color:#c586c0;">L:</span> <span id="ep-l">—</span>
          <span style="color:#c586c0; margin-left:8px;">a:</span> <span id="ep-la">—</span>
          <span style="color:#c586c0; margin-left:8px;">b:</span> <span id="ep-lb">—</span>
        </div>
      </div>
    `;
    return panel;
  }

  activate(): void {
    this.active = true;
    this.canvas.style.cursor = 'crosshair';
  }

  deactivate(): void {
    this.active = false;
    this.canvas.style.cursor = 'default';
    this.panel.style.display = 'none';
  }

  isActive(): boolean {
    return this.active;
  }

  private onClick(e: MouseEvent): void {
    if (!this.active) return;
    const imageData = this.renderer.getImageData();
    if (!imageData) return;

    const rect = this.canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * imageData.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * imageData.height);

    if (x < 0 || y < 0 || x >= imageData.width || y >= imageData.height) return;

    const idx = (y * imageData.width + x) * 4;
    const r = imageData.data[idx];
    const g = imageData.data[idx + 1];
    const b = imageData.data[idx + 2];
    const a = imageData.data[idx + 3];

    // FIX ЛР2: Если пиксель полностью прозрачный (alpha=0) — показываем это явно.
    // Пипетка читает из originalImageData (оригинал), поэтому нужно вручную
    // учесть alpha: прозрачный пиксель не имеет «настоящего» цвета на экране.
    const isTransparent = a === 0;

    const [L, la, lb] = isTransparent ? [0, 0, 0] : rgbToLab(r, g, b);
    const hex = isTransparent
      ? '#------'
      : `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;

    // Цветовой квадрат показывает реальный цвет с учётом прозрачности
    (document.getElementById('color-preview') as HTMLElement).style.background =
      isTransparent ? 'transparent' : `rgb(${r},${g},${b})`;

    document.getElementById('ep-coords')!.textContent = `X: ${x}  Y: ${y}`;
    document.getElementById('ep-hex')!.textContent    = isTransparent ? 'прозрачный' : hex.toUpperCase();
    document.getElementById('ep-r')!.textContent      = isTransparent ? '—' : String(r);
    document.getElementById('ep-g')!.textContent      = isTransparent ? '—' : String(g);
    document.getElementById('ep-b')!.textContent      = isTransparent ? '—' : String(b);
    document.getElementById('ep-a')!.textContent      = String(a);
    document.getElementById('ep-l')!.textContent      = isTransparent ? '—' : L.toFixed(1);
    document.getElementById('ep-la')!.textContent     = isTransparent ? '—' : la.toFixed(1);
    document.getElementById('ep-lb')!.textContent     = isTransparent ? '—' : lb.toFixed(1);

    this.panel.style.display = 'block';
  }
}