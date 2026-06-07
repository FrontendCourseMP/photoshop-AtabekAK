import {
  KERNEL_PRESETS,
  applyConvolutionAsync,
  type EdgeStrategy,
  type KernelChannelSet,
} from '../core/Convolution';
import type { CanvasRenderer } from '../core/CanvasRenderer';

export class KernelDialog {
  private renderer: CanvasRenderer;
  private dialog!: HTMLDialogElement;
  private originalImageData: ImageData | null = null;
  private previewEnabled = true;
  private isProcessing = false;
  private rafId: number | null = null;
  // FIX ЛР5: флаг — было ли нажато «Применить»
  private appliedPermanently = false;

  private presetSelect!: HTMLSelectElement;
  private cells!: HTMLInputElement[];
  private channelCheckboxes!: Record<string, HTMLInputElement>;
  private edgeSelect!: HTMLSelectElement;
  private progressBar!: HTMLElement;
  private progressWrap!: HTMLElement;
  private applyBtn!: HTMLButtonElement;

  constructor(renderer: CanvasRenderer) {
    this.renderer = renderer;
    this.buildDialog();
  }

  open(): void {
    const img = this.renderer.getImageData();
    if (!img) { alert('Сначала загрузите изображение'); return; }
    this.originalImageData = img;
    this.previewEnabled = true;
    // FIX ЛР5: сбрасываем флаг при каждом открытии
    this.appliedPermanently = false;
    this.loadPreset(0);
    this.dialog.showModal();
  }

  private buildDialog(): void {
    this.dialog = document.createElement('dialog');
    this.dialog.id = 'kernel-dialog';
    this.dialog.style.cssText = `
      background: #2d2d2d;
      border: 1px solid #3e3e3e;
      border-radius: 8px;
      color: #d4d4d4;
      padding: 0;
      min-width: 420px;
      max-width: 480px;
      width: 100%;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    `;

    this.dialog.innerHTML = `
      <style>
        #kernel-dialog::backdrop { background: rgba(0,0,0,0.5); }
        #kernel-dialog select, #kernel-dialog input[type=number] {
          background: #1e1e1e; border: 1px solid #555; border-radius: 4px;
          color: #d4d4d4; padding: 3px 6px; font-size: 12px;
        }
        #kernel-dialog input[type=number]:focus, #kernel-dialog select:focus {
          outline: 1px solid #0e639c; border-color: #0e639c;
        }
        .kd-cell {
          width: 52px; height: 36px;
          text-align: center; font-size: 13px;
          background: #1e1e1e; border: 1px solid #555; border-radius: 4px;
          color: #d4d4d4;
        }
        .kd-cell:focus { outline: 1px solid #0e639c; border-color: #0e639c; }
        .kd-btn {
          padding: 5px 16px; border-radius: 4px; border: 1px solid #555;
          font-size: 13px; cursor: pointer; transition: background 0.15s;
        }
        .kd-btn-primary { background: #0e639c; border-color: #1177bb; color: #fff; }
        .kd-btn-primary:hover { background: #1177bb; }
        .kd-btn-primary:disabled { background: #555; border-color: #555; cursor: not-allowed; }
        .kd-btn-secondary { background: #3c3c3c; color: #d4d4d4; }
        .kd-btn-secondary:hover { background: #505050; }
        .kd-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
        .kd-label { font-size:12px; color:#888; width:90px; flex-shrink:0; }
        .progress-bar {
          height: 4px; background: #0e639c; border-radius: 2px;
          width: 0%; transition: width 0.1s;
        }
      </style>

      <div style="padding:12px 16px;border-bottom:1px solid #3e3e3e;font-weight:700;font-size:14px;color:#9cdcfe;display:flex;align-items:center;justify-content:space-between;">
        <span>🔲 Фильтрация (ядро свёртки)</span>
        <label style="font-size:12px;font-weight:400;color:#d4d4d4;display:flex;align-items:center;gap:4px;cursor:pointer;">
          <input type="checkbox" id="kd-preview" checked />
          Предпросмотр
        </label>
      </div>

      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:4px;">

        <div class="kd-row">
          <span class="kd-label">Преднастройка:</span>
          <select id="kd-preset" style="flex:1;">
            ${KERNEL_PRESETS.map((p, i) => `<option value="${i}">${p.name}</option>`).join('')}
            <!-- FIX ЛР5: опция Пользовательский при ручном редактировании -->
            <option value="custom" disabled style="color:#9cdcfe;">— Пользовательский —</option>
          </select>
        </div>

        <div style="margin-bottom:10px;">
          <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:6px;">Ядро свёртки 3×3</div>
          <div id="kd-grid" style="display:grid;grid-template-columns:repeat(3,52px);gap:4px;justify-content:start;"></div>
        </div>

        <!-- FIX ЛР5: checkbox вместо radio, включая Alpha -->
        <div class="kd-row" style="flex-wrap:wrap;gap:6px;align-items:center;">
          <span class="kd-label">Каналы:</span>
          <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;">
            <input type="checkbox" name="kd-ch" value="0" checked /> <span style="color:#f48771;">R</span>
          </label>
          <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;">
            <input type="checkbox" name="kd-ch" value="1" checked /> <span style="color:#4ec9b0;">G</span>
          </label>
          <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;">
            <input type="checkbox" name="kd-ch" value="2" checked /> <span style="color:#569cd6;">B</span>
          </label>
          <label style="font-size:12px;display:flex;align-items:center;gap:4px;cursor:pointer;">
            <input type="checkbox" name="kd-ch" value="3" /> <span style="color:#888;">A</span>
          </label>
          <button id="kd-ch-all" style="
            font-size:11px; padding:2px 8px; border-radius:3px;
            background:#3c3c3c; border:1px solid #555; color:#d4d4d4;
            cursor:pointer; margin-left:4px;
          ">Все</button>
        </div>

        <div class="kd-row">
          <span class="kd-label">Заполнение края:</span>
          <select id="kd-edge" style="flex:1;">
            <option value="black">Чёрным</option>
            <option value="white">Белым</option>
            <option value="copy">Копирование</option>
          </select>
        </div>

        <div id="kd-progress-wrap" style="display:none;margin-bottom:6px;">
          <div style="font-size:11px;color:#888;margin-bottom:3px;">Обработка... <span id="kd-pct">0%</span></div>
          <div style="background:#3c3c3c;border-radius:2px;overflow:hidden;">
            <div class="progress-bar" id="kd-bar"></div>
          </div>
        </div>

        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:8px;border-top:1px solid #3e3e3e;margin-top:4px;">
          <button class="kd-btn kd-btn-secondary" id="kd-reset">Сброс</button>
          <button class="kd-btn kd-btn-secondary" id="kd-cancel">Отмена</button>
          <button class="kd-btn kd-btn-primary"   id="kd-apply">Применить</button>
        </div>
      </div>
    `;

    document.body.appendChild(this.dialog);
    this.buildGrid();
    this.bindElements();
    this.bindEvents();
  }

  private buildGrid(): void {
    const grid = this.dialog.querySelector('#kd-grid')!;
    this.cells = [];
    for (let i = 0; i < 9; i++) {
      const input = document.createElement('input');
      input.type = 'number';
      input.className = 'kd-cell';
      input.value = i === 4 ? '1' : '0';
      input.step = '0.01';
      grid.appendChild(input);
      this.cells.push(input);
    }
  }

  private bindElements(): void {
    this.presetSelect  = this.dialog.querySelector('#kd-preset')!;
    this.edgeSelect    = this.dialog.querySelector('#kd-edge')!;
    this.progressBar   = this.dialog.querySelector('#kd-bar')!;
    this.progressWrap  = this.dialog.querySelector('#kd-progress-wrap')!;
    this.applyBtn      = this.dialog.querySelector('#kd-apply')!;

    this.channelCheckboxes = {};
    this.dialog.querySelectorAll<HTMLInputElement>('input[name="kd-ch"]').forEach(cb => {
      this.channelCheckboxes[cb.value] = cb;
    });
  }

  private bindEvents(): void {
    this.presetSelect.addEventListener('change', () => {
      const val = this.presetSelect.value;
      if (val === 'custom') return;
      this.loadPreset(parseInt(val));
    });

    // FIX ЛР5: при ручном редактировании ячейки — переключаем на «Пользовательский»
    this.cells.forEach(cell => {
      cell.addEventListener('input', () => {
        this.markAsCustom();
        this.schedulePreview();
      });
    });

    Object.values(this.channelCheckboxes).forEach(cb => {
      cb.addEventListener('change', () => this.schedulePreview());
    });

    this.dialog.querySelector('#kd-ch-all')!.addEventListener('click', () => {
      Object.values(this.channelCheckboxes).forEach(cb => { cb.checked = true; });
      this.schedulePreview();
    });

    this.edgeSelect.addEventListener('change', () => this.schedulePreview());

    const prevCb = this.dialog.querySelector('#kd-preview') as HTMLInputElement;
    prevCb.addEventListener('change', () => {
      this.previewEnabled = prevCb.checked;
      if (this.previewEnabled) {
        this.schedulePreview();
      } else {
        this.renderer.render(this.originalImageData!);
      }
    });

    this.dialog.querySelector('#kd-reset')!.addEventListener('click', () => {
      this.loadPreset(0);
    });

    this.dialog.querySelector('#kd-cancel')!.addEventListener('click', () => {
      this.renderer.render(this.originalImageData!);
      this.dialog.close();
    });

    this.applyBtn.addEventListener('click', async () => {
      await this.runConvolution(true);
    });

    // FIX ЛР5: Escape восстанавливает оригинал
    this.dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      if (!this.appliedPermanently) {
        this.renderer.render(this.originalImageData!);
      }
      this.dialog.close();
    });

    // FIX ЛР5: страховка при любом закрытии без «Применить»
    this.dialog.addEventListener('close', () => {
      if (!this.appliedPermanently && this.originalImageData) {
        this.renderer.render(this.originalImageData);
      }
      this.appliedPermanently = false;
    });
  }

  // FIX ЛР5: переключаем селект на «Пользовательский»
  private markAsCustom(): void {
    this.presetSelect.value = 'custom';
  }

  private loadPreset(index: number): void {
    const preset = KERNEL_PRESETS[index];
    preset.kernel.forEach((v, i) => {
      this.cells[i].value = String(v);
    });
    this.presetSelect.value = String(index);
    this.schedulePreview();
  }

  private getKernel(): { kernel: number[]; divisor: number } {
    const kernel = this.cells.map(c => parseFloat(c.value) || 0);
    const sum = kernel.reduce((a, b) => a + b, 0);

    // FIX ЛР5: для именованного пресета берём его divisor напрямую
    const presetVal = this.presetSelect.value;
    if (presetVal !== 'custom') {
      const presetIndex = parseInt(presetVal);
      if (!isNaN(presetIndex) && KERNEL_PRESETS[presetIndex]) {
        return { kernel, divisor: KERNEL_PRESETS[presetIndex].divisor };
      }
    }

    return { kernel, divisor: sum !== 0 ? sum : 1 };
  }

  private getChannelSet(): KernelChannelSet {
    const set: KernelChannelSet = new Set();
    for (const [val, cb] of Object.entries(this.channelCheckboxes)) {
      if (cb.checked) set.add(parseInt(val));
    }
    if (set.size === 0) {
      set.add(0); set.add(1); set.add(2);
    }
    return set;
  }

  private schedulePreview(): void {
    if (!this.previewEnabled || !this.originalImageData || this.isProcessing) return;
    if (this.rafId !== null) return;
    this.rafId = requestAnimationFrame(async () => {
      this.rafId = null;
      await this.runConvolution(false);
    });
  }

  private async runConvolution(applyPermanently: boolean): Promise<void> {
    if (!this.originalImageData || this.isProcessing) return;

    this.isProcessing = true;
    this.applyBtn.disabled = true;

    const { kernel, divisor } = this.getKernel();
    const channelSet = this.getChannelSet();
    const edge       = this.edgeSelect.value as EdgeStrategy;

    if (applyPermanently) {
      this.progressWrap.style.display = 'block';
    }

    try {
      const result = await applyConvolutionAsync(
        this.originalImageData,
        kernel,
        divisor,
        channelSet,
        edge,
        applyPermanently ? (pct) => {
          this.progressBar.style.width = `${pct}%`;
          const pctEl = this.dialog.querySelector('#kd-pct');
          if (pctEl) pctEl.textContent = `${pct}%`;
        } : undefined
      );

      this.renderer.render(result);

      if (applyPermanently) {
        // FIX ЛР5: помечаем — Применить нажато, откат не нужен
        this.appliedPermanently = true;
        this.dialog.close();
      }
    } finally {
      this.isProcessing = false;
      this.applyBtn.disabled = false;
      this.progressWrap.style.display = 'none';
      this.progressBar.style.width = '0%';
    }
  }
}