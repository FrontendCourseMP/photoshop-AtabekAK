import {
  computeHistogram,
  drawHistogram,
  type HistogramChannel,
} from '../core/Histogram';
import {
  applyLevels,
  defaultAllLevels,
  type AllLevels,
  type ChannelKey,
} from '../core/LevelsProcessor';
import type { CanvasRenderer } from '../core/CanvasRenderer';

export class LevelsDialog {
  private renderer: CanvasRenderer;
  private dialog!: HTMLDialogElement;
  private histCanvas!: HTMLCanvasElement;
  private originalImageData: ImageData | null = null;
  private levels: AllLevels = defaultAllLevels();
  private currentChannel: ChannelKey = 'master';
  private previewEnabled = true;
  private rafId: number | null = null;

  private sliderBlack!: HTMLInputElement;
  private sliderGamma!: HTMLInputElement;
  private sliderWhite!: HTMLInputElement;
  private numBlack!: HTMLInputElement;
  private numGamma!: HTMLInputElement;
  private numWhite!: HTMLInputElement;
  private logCheckbox!: HTMLInputElement;
  private channelSelect!: HTMLSelectElement;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
    this.buildDialog();
  }

  open(): void {
    const img = this.renderer.getImageData();
    if (!img) { alert('Сначала загрузите изображение'); return; }
    this.originalImageData = img;
    this.levels = defaultAllLevels();
    this.currentChannel = 'master';
    this.previewEnabled = true;
    this.syncUI();
    this.redrawHistogram();
    this.dialog.showModal();
  }

  private buildDialog(): void {
    this.dialog = document.createElement('dialog');
    this.dialog.id = 'levels-dialog';
    this.dialog.style.cssText = `
      background: #2d2d2d;
      border: 1px solid #3e3e3e;
      border-radius: 8px;
      color: #d4d4d4;
      padding: 0;
      min-width: 460px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    `;

    this.dialog.innerHTML = `
      <style>
        #levels-dialog::backdrop { background: rgba(0,0,0,0.5); }
        #levels-dialog input[type=range] {
          -webkit-appearance: none;
          height: 4px;
          border-radius: 2px;
          outline: none;
          cursor: pointer;
        }
        #levels-dialog input[type=range]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px; height: 18px;
          background: #d4d4d4;
          border-radius: 3px;
          cursor: pointer;
          border: 1px solid #888;
        }
        #levels-dialog input[type=number] {
          background: #1e1e1e;
          border: 1px solid #555;
          border-radius: 3px;
          color: #d4d4d4;
          padding: 2px 4px;
          width: 52px;
          font-size: 12px;
          text-align: center;
        }
        #levels-dialog select {
          background: #3c3c3c;
          border: 1px solid #555;
          border-radius: 4px;
          color: #d4d4d4;
          padding: 3px 6px;
          font-size: 12px;
          cursor: pointer;
        }
        .lev-btn {
          padding: 5px 16px;
          border-radius: 4px;
          border: 1px solid #555;
          font-size: 13px;
          cursor: pointer;
          transition: background 0.15s;
        }
        .lev-btn-primary { background: #0e639c; border-color: #1177bb; color: #fff; }
        .lev-btn-primary:hover { background: #1177bb; }
        .lev-btn-secondary { background: #3c3c3c; color: #d4d4d4; }
        .lev-btn-secondary:hover { background: #505050; }
      </style>

      <div style="padding:12px 16px;border-bottom:1px solid #3e3e3e;font-weight:700;font-size:14px;color:#9cdcfe;display:flex;align-items:center;justify-content:space-between;">
        <span>📊 Уровни (Levels)</span>
        <label style="font-size:12px;font-weight:400;color:#d4d4d4;display:flex;align-items:center;gap:4px;cursor:pointer;">
          <input type="checkbox" id="lev-preview" checked />
          Предпросмотр
        </label>
      </div>

      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:#888;">Канал:</span>
            <select id="lev-channel">
              <option value="master">Master (RGB)</option>
              <option value="R">Red</option>
              <option value="G">Green</option>
              <option value="B">Blue</option>
              <option value="A">Alpha</option>
            </select>
          </div>
          <label style="font-size:12px;color:#888;display:flex;align-items:center;gap:4px;cursor:pointer;">
            <input type="checkbox" id="lev-log" />
            Логарифмическая
          </label>
        </div>

        <div style="position:relative;border-radius:4px;overflow:hidden;border:1px solid #3e3e3e;">
          <canvas id="hist-canvas" width="428" height="120" style="display:block;width:100%;"></canvas>
        </div>

        <div style="display:flex;flex-direction:column;gap:8px;">
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;">Входные уровни</div>

          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:#888;width:64px;">Чёрная:</span>
            <input type="range" id="sl-black" min="0" max="254" value="0"
              style="flex:1;background:linear-gradient(to right,#000,#fff);" />
            <input type="number" id="num-black" min="0" max="254" value="0" />
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:#888;width:64px;">Гамма:</span>
            <input type="range" id="sl-gamma" min="1" max="99" value="10"
              style="flex:1;background:#3c3c3c;" />
            <input type="number" id="num-gamma" min="0.1" max="9.9" step="0.1" value="1.0" />
          </div>

          <div style="display:flex;align-items:center;gap:8px;">
            <span style="font-size:12px;color:#888;width:64px;">Белая:</span>
            <input type="range" id="sl-white" min="1" max="255" value="255"
              style="flex:1;background:linear-gradient(to right,#000,#fff);" />
            <input type="number" id="num-white" min="1" max="255" value="255" />
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:4px;border-top:1px solid #3e3e3e;">
          <button class="lev-btn lev-btn-secondary" id="lev-reset">Сброс</button>
          <button class="lev-btn lev-btn-secondary" id="lev-cancel">Отмена</button>
          <button class="lev-btn lev-btn-primary"   id="lev-apply">Применить</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.dialog);
    this.bindElements();
    this.bindEvents();
  }

  private bindElements(): void {
    this.histCanvas    = this.dialog.querySelector('#hist-canvas')!;
    this.sliderBlack   = this.dialog.querySelector('#sl-black')!;
    this.sliderGamma   = this.dialog.querySelector('#sl-gamma')!;
    this.sliderWhite   = this.dialog.querySelector('#sl-white')!;
    this.numBlack      = this.dialog.querySelector('#num-black')!;
    this.numGamma      = this.dialog.querySelector('#num-gamma')!;
    this.numWhite      = this.dialog.querySelector('#num-white')!;
    this.logCheckbox   = this.dialog.querySelector('#lev-log')!;
    this.channelSelect = this.dialog.querySelector('#lev-channel')!;
  }

  private bindEvents(): void {
    this.channelSelect.addEventListener('change', () => {
      this.currentChannel = this.channelSelect.value as ChannelKey;
      this.syncUI();
      this.redrawHistogram();
    });

    this.logCheckbox.addEventListener('change', () => this.redrawHistogram());

    const prevCb = this.dialog.querySelector('#lev-preview') as HTMLInputElement;
    prevCb.addEventListener('change', () => {
      this.previewEnabled = prevCb.checked;
      if (this.previewEnabled) {
        this.schedulePreview();
      } else {
        this.renderer.render(this.originalImageData!);
      }
    });

    const onSliderChange = () => {
      let black = parseInt(this.sliderBlack.value);
      let white = parseInt(this.sliderWhite.value);
      const gamma = parseInt(this.sliderGamma.value) / 10;

      if (black >= white) {
        if (document.activeElement === this.sliderBlack) {
          black = white - 1;
          this.sliderBlack.value = String(black);
        } else {
          white = black + 1;
          this.sliderWhite.value = String(white);
        }
      }

      this.levels[this.currentChannel] = { inBlack: black, inWhite: white, gamma };
      this.numBlack.value = String(black);
      this.numWhite.value = String(white);
      this.numGamma.value = gamma.toFixed(1);
      this.schedulePreview();
    };

    this.sliderBlack.addEventListener('input', onSliderChange);
    this.sliderGamma.addEventListener('input', onSliderChange);
    this.sliderWhite.addEventListener('input', onSliderChange);

    const onNumChange = () => {
      let black = parseInt(this.numBlack.value)   || 0;
      let white = parseInt(this.numWhite.value)   || 255;
      let gamma = parseFloat(this.numGamma.value) || 1.0;
      black = Math.max(0,   Math.min(254, black));
      white = Math.max(1,   Math.min(255, white));
      gamma = Math.max(0.1, Math.min(9.9, gamma));

      if (black >= white) black = white - 1;

      this.levels[this.currentChannel] = { inBlack: black, inWhite: white, gamma };
      this.sliderBlack.value = String(black);
      this.sliderWhite.value = String(white);
      this.sliderGamma.value = String(Math.round(gamma * 10));
      this.numBlack.value = String(black);
      this.numWhite.value = String(white);
      this.numGamma.value = gamma.toFixed(1);
      this.schedulePreview();
    };

    this.numBlack.addEventListener('change', onNumChange);
    this.numWhite.addEventListener('change', onNumChange);
    this.numGamma.addEventListener('change', onNumChange);

    this.dialog.querySelector('#lev-reset')!.addEventListener('click', () => {
      this.levels = defaultAllLevels();
      this.syncUI();
      this.schedulePreview();
    });

    this.dialog.querySelector('#lev-cancel')!.addEventListener('click', () => {
      this.renderer.render(this.originalImageData!);
      this.dialog.close();
    });

    this.dialog.querySelector('#lev-apply')!.addEventListener('click', () => {
      if (!this.originalImageData) return;
      const result = applyLevels(this.originalImageData, this.levels);
      this.renderer.render(result);
      this.dialog.close();
    });
  }

  private syncUI(): void {
    const s = this.levels[this.currentChannel];
    this.sliderBlack.value   = String(s.inBlack);
    this.sliderWhite.value   = String(s.inWhite);
    this.sliderGamma.value   = String(Math.round(s.gamma * 10));
    this.numBlack.value      = String(s.inBlack);
    this.numWhite.value      = String(s.inWhite);
    this.numGamma.value      = s.gamma.toFixed(1);
    this.channelSelect.value = this.currentChannel;
  }

  private redrawHistogram(): void {
    if (!this.originalImageData) return;
    const ch = this.currentChannel === 'master'
      ? 'master'
      : this.currentChannel as HistogramChannel;
    const data = computeHistogram(this.originalImageData, ch);
    drawHistogram(this.histCanvas, data, ch, this.logCheckbox.checked);
  }

  private schedulePreview(): void {
    if (!this.previewEnabled || !this.originalImageData) return;
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(() => {
      this.rafId = null;
      if (!this.originalImageData) return;
      const result = applyLevels(this.originalImageData, this.levels);
      this.renderer.render(result);
    });
  }
}