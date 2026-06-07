import type { CanvasRenderer } from '../core/CanvasRenderer';

type ChannelKey = 'R' | 'G' | 'B' | 'A';

interface ChannelDef {
  key: ChannelKey;
  label: string;
  color: string;
}

export class ChannelsPanel {
  private renderer: CanvasRenderer;
  private enabled: Record<ChannelKey, boolean> = { R: true, G: true, B: true, A: true };
  private panel: HTMLElement;
  private originalImageData: ImageData | null = null;
  private channelDefs: ChannelDef[] = [];
  // FIX ЛР2: флаг — является ли изображение grayscale.
  // Для grayscale кнопка 'R' (Gray) управляет сразу R+G+B одновременно.
  private isGrayscale: boolean = false;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
    this.panel = this.createPanel();
    document.getElementById('app')!.appendChild(this.panel);
  }

  private createPanel(): HTMLElement {
    const panel = document.createElement('div');
    panel.id = 'channels-panel';
    panel.style.cssText = `
      position: fixed;
      right: 0;
      top: 40px;
      bottom: 24px;
      width: 170px;
      background: #252526;
      border-left: 1px solid #3e3e3e;
      display: flex;
      flex-direction: column;
      z-index: 5;
      overflow: hidden;
    `;
    panel.innerHTML = `
      <div style="
        padding: 8px 10px;
        font-size: 11px;
        font-weight: 700;
        color: #9cdcfe;
        border-bottom: 1px solid #3e3e3e;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        flex-shrink: 0;
      ">Каналы</div>
      <div id="channel-list" style="
        flex: 1;
        overflow-y: auto;
        padding: 8px 8px;
        display: flex;
        flex-direction: column;
        gap: 8px;
      "></div>
    `;
    return panel;
  }

  setImage(imageData: ImageData): void {
    this.originalImageData = imageData;
    this.enabled = { R: true, G: true, B: true, A: true };
    this.channelDefs = this.detectChannels(imageData);
    this.buildUI();
  }

  private detectChannels(imageData: ImageData): ChannelDef[] {
    const data = imageData.data;
    let hasAlpha = false;
    let isGray = true;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] < 255) hasAlpha = true;
      if (data[i] !== data[i + 1] || data[i + 1] !== data[i + 2]) isGray = false;
      if (hasAlpha && !isGray) break;
    }

    // FIX ЛР2: запоминаем флаг grayscale для использования в toggleChannel
    this.isGrayscale = isGray;

    if (isGray && !hasAlpha) {
      return [{ key: 'R', label: 'Gray', color: '#aaaaaa' }];
    }
    if (isGray && hasAlpha) {
      return [
        { key: 'R', label: 'Gray',  color: '#aaaaaa' },
        { key: 'A', label: 'Alpha', color: '#666666' },
      ];
    }
    if (!hasAlpha) {
      return [
        { key: 'R', label: 'Red',   color: '#f48771' },
        { key: 'G', label: 'Green', color: '#4ec9b0' },
        { key: 'B', label: 'Blue',  color: '#569cd6' },
      ];
    }
    return [
      { key: 'R', label: 'Red',   color: '#f48771' },
      { key: 'G', label: 'Green', color: '#4ec9b0' },
      { key: 'B', label: 'Blue',  color: '#569cd6' },
      { key: 'A', label: 'Alpha', color: '#666666' },
    ];
  }

  private buildUI(): void {
    const list = document.getElementById('channel-list')!;
    list.innerHTML = '';
    list.appendChild(this.createChannelRow(null, 'Все каналы', '#ffffff'));
    this.channelDefs.forEach(def => {
      list.appendChild(this.createChannelRow(def.key, def.label, def.color));
    });
  }

  private createChannelRow(
    channel: ChannelKey | null,
    label: string,
    color: string
  ): HTMLElement {
    const isToggleable = channel !== null;
    const key = channel ?? 'composite';

    const wrapper = document.createElement('div');
    wrapper.style.cssText = `
      display: flex;
      flex-direction: column;
      gap: 3px;
      cursor: ${isToggleable ? 'pointer' : 'default'};
    `;
    wrapper.dataset.channel = key;

    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      align-items: center;
      gap: 5px;
      padding: 0 2px;
      user-select: none;
    `;

    const dot = document.createElement('span');
    dot.style.cssText = `
      width: 9px; height: 9px;
      border-radius: 50%;
      background: ${color};
      flex-shrink: 0;
      display: inline-block;
    `;

    const name = document.createElement('span');
    name.style.cssText = `font-size: 12px; color: #d4d4d4; flex: 1;`;
    name.textContent = label;

    const eye = document.createElement('span');
    eye.style.cssText = `font-size: 13px; opacity: 1; transition: opacity 0.15s; pointer-events: none;`;
    eye.textContent = '👁';
    eye.id = `eye-${key}`;

    header.appendChild(dot);
    header.appendChild(name);
    if (isToggleable) header.appendChild(eye);

    const thumbCanvas = document.createElement('canvas');
    thumbCanvas.width = 140;
    thumbCanvas.height = 90;
    thumbCanvas.style.cssText = `
      width: 100%; height: auto;
      border-radius: 3px;
      border: 2px solid ${isToggleable ? '#0e639c' : '#3e3e3e'};
      display: block;
      pointer-events: none;
      transition: opacity 0.15s, border-color 0.15s;
    `;
    thumbCanvas.id = `thumb-${key}`;
    this.drawThumbnail(thumbCanvas, channel);

    wrapper.appendChild(header);
    wrapper.appendChild(thumbCanvas);

    if (isToggleable) {
      wrapper.addEventListener('click', () => this.toggleChannel(channel!));
    }

    return wrapper;
  }

  private toggleChannel(channel: ChannelKey): void {
    this.enabled[channel] = !this.enabled[channel];
    const on = this.enabled[channel];

    // FIX ЛР2: для grayscale-изображений кнопка 'R' (Gray) управляет сразу
    // R, G и B — иначе при выключении только R серый превращается в сине-зелёный.
    if (this.isGrayscale && channel === 'R') {
      this.enabled.G = on;
      this.enabled.B = on;
    }

    const key = channel as string;
    const thumb = document.getElementById(`thumb-${key}`) as HTMLCanvasElement | null;
    const eye   = document.getElementById(`eye-${key}`);

    if (thumb) {
      thumb.style.opacity     = on ? '1' : '0.3';
      thumb.style.borderColor = on ? '#0e639c' : '#555';
    }
    if (eye) eye.style.opacity = on ? '1' : '0.25';

    this.applyChannels();
  }

  private applyChannels(): void {
    if (!this.originalImageData) return;

    const src = this.originalImageData;
    const out = new ImageData(src.width, src.height);
    const len = src.width * src.height;

    for (let i = 0; i < len; i++) {
      const si = i * 4;
      out.data[si]     = this.enabled.R ? src.data[si]     : 0;
      out.data[si + 1] = this.enabled.G ? src.data[si + 1] : 0;
      out.data[si + 2] = this.enabled.B ? src.data[si + 2] : 0;
      out.data[si + 3] = this.enabled.A ? src.data[si + 3] : 255;
    }

    this.renderer.render(out);
  }

  private drawThumbnail(canvas: HTMLCanvasElement, channel: ChannelKey | null): void {
    if (!this.originalImageData) return;
    const src = this.originalImageData;

    const tmp    = document.createElement('canvas');
    tmp.width    = src.width;
    tmp.height   = src.height;
    const tmpCtx = tmp.getContext('2d')!;
    const out    = tmpCtx.createImageData(src.width, src.height);
    const len    = src.width * src.height;

    for (let i = 0; i < len; i++) {
      const si = i * 4;
      if (channel === null) {
        out.data[si]     = src.data[si];
        out.data[si + 1] = src.data[si + 1];
        out.data[si + 2] = src.data[si + 2];
        out.data[si + 3] = src.data[si + 3];
      } else if (channel === 'A') {
        const v = src.data[si + 3];
        out.data[si] = out.data[si + 1] = out.data[si + 2] = v;
        out.data[si + 3] = 255;
      } else {
        const chIdx = channel === 'R' ? 0 : channel === 'G' ? 1 : 2;
        const v = src.data[si + chIdx];
        out.data[si] = out.data[si + 1] = out.data[si + 2] = v;
        out.data[si + 3] = 255;
      }
    }

    tmpCtx.putImageData(out, 0, 0);
    canvas.getContext('2d')!.drawImage(tmp, 0, 0, canvas.width, canvas.height);
  }
}