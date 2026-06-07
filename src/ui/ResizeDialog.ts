import { ImageScaler } from '../core/ImageScaler';
import { interpolators, type InterpolationMethod } from '../core/Interpolation';
import type { CanvasRenderer } from '../core/CanvasRenderer';

type Unit = 'percent' | 'pixels';

export class ResizeDialog {
  private renderer: CanvasRenderer;
  private dialog!: HTMLDialogElement;
  private originalImageData: ImageData | null = null;
  private onResized: (imageData: ImageData) => void;

  private unitSelect!: HTMLSelectElement;
  private widthInput!: HTMLInputElement;
  private heightInput!: HTMLInputElement;
  private lockCheckbox!: HTMLInputElement;
  private methodSelect!: HTMLSelectElement;
  private tooltip!: HTMLElement;
  private pixelsBefore!: HTMLElement;
  private pixelsAfter!: HTMLElement;
  private errorEl!: HTMLElement;

  private aspectRatio = 1;
  private lockUpdating = false;

  constructor(renderer: CanvasRenderer, onResized: (imageData: ImageData) => void) {
    this.renderer = renderer;
    this.onResized = onResized;
    this.buildDialog();
  }

  open(): void {
    const img = this.renderer.getImageData();
    if (!img) { alert('Сначала загрузите изображение'); return; }
    this.originalImageData = img;
    this.aspectRatio = img.width / img.height;
    this.resetFields();
    this.updatePixelCounts();
    this.dialog.showModal();
  }

  private buildDialog(): void {
    this.dialog = document.createElement('dialog');
    this.dialog.style.cssText = `
      background: #2d2d2d;
      border: 1px solid #3e3e3e;
      border-radius: 8px;
      color: #d4d4d4;
      padding: 0;
      min-width: 400px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.6);
    `;

    this.dialog.innerHTML = `
      <style>
        #resize-dialog::backdrop { background: rgba(0,0,0,0.5); }
        #resize-dialog input[type=number], #resize-dialog select {
          background: #1e1e1e;
          border: 1px solid #555;
          border-radius: 4px;
          color: #d4d4d4;
          padding: 4px 8px;
          font-size: 13px;
          width: 100%;
        }
        #resize-dialog input[type=number]:focus, #resize-dialog select:focus {
          outline: 1px solid #0e639c;
          border-color: #0e639c;
        }
        #resize-dialog input.error { border-color: #f48771 !important; }
        .rd-row { display:flex; align-items:center; gap:8px; margin-bottom:10px; }
        .rd-label { font-size:12px; color:#888; width:100px; flex-shrink:0; }
        .rd-btn {
          padding:5px 16px; border-radius:4px; border:1px solid #555;
          font-size:13px; cursor:pointer; transition:background 0.15s;
        }
        .rd-btn-primary { background:#0e639c; border-color:#1177bb; color:#fff; }
        .rd-btn-primary:hover { background:#1177bb; }
        .rd-btn-secondary { background:#3c3c3c; color:#d4d4d4; }
        .rd-btn-secondary:hover { background:#505050; }
        .tooltip-box {
          background:#1e1e1e; border:1px solid #3e3e3e; border-radius:4px;
          padding:6px 10px; font-size:11px; color:#888; margin-top:4px;
          line-height:1.5;
        }
      </style>

      <div style="padding:12px 16px;border-bottom:1px solid #3e3e3e;font-weight:700;font-size:14px;color:#9cdcfe;">
        📐 Изменение размера
      </div>

      <div style="padding:14px 16px;display:flex;flex-direction:column;gap:2px;">

        <!-- Пиксели до/после -->
        <div style="display:flex;gap:16px;margin-bottom:12px;padding:8px 10px;background:#1e1e1e;border-radius:4px;font-size:12px;">
          <div>До: <span id="rd-before" style="color:#9cdcfe;font-weight:600;">—</span></div>
          <div>После: <span id="rd-after" style="color:#4ec9b0;font-weight:600;">—</span></div>
        </div>

        <!-- Единицы -->
        <div class="rd-row">
          <span class="rd-label">Единицы:</span>
          <select id="rd-unit">
            <option value="percent">Проценты (%)</option>
            <option value="pixels">Пиксели (px)</option>
          </select>
        </div>

        <!-- Ширина -->
        <div class="rd-row">
          <span class="rd-label">Ширина:</span>
          <input type="number" id="rd-width" min="1" max="16000" value="100" />
        </div>

        <!-- Высота -->
        <div class="rd-row">
          <span class="rd-label">Высота:</span>
          <input type="number" id="rd-height" min="1" max="16000" value="100" />
        </div>

        <!-- Пропорции -->
        <div class="rd-row" style="margin-bottom:12px;">
          <span class="rd-label"></span>
          <label style="display:flex;align-items:center;gap:6px;font-size:12px;cursor:pointer;">
            <input type="checkbox" id="rd-lock" checked />
            Сохранить пропорции
          </label>
        </div>

        <!-- Метод интерполяции -->
        <div class="rd-row">
          <span class="rd-label">Интерполяция:</span>
          <select id="rd-method">
            <option value="bilinear">Билинейная</option>
            <option value="nearest">Ближайший сосед</option>
          </select>
        </div>

        <!-- Тултип -->
        <div class="tooltip-box" id="rd-tooltip">
          Плавный метод. Новый пиксель вычисляется как взвешенное среднее четырёх соседних пикселей оригинала.
        </div>

        <!-- Ошибка -->
        <div id="rd-error" style="color:#f48771;font-size:12px;min-height:16px;margin-top:4px;"></div>

        <!-- Кнопки -->
        <div style="display:flex;justify-content:flex-end;gap:8px;padding-top:8px;border-top:1px solid #3e3e3e;margin-top:4px;">
          <button class="rd-btn rd-btn-secondary" id="rd-cancel">Отмена</button>
          <button class="rd-btn rd-btn-primary" id="rd-apply">Применить</button>
        </div>
      </div>
    `;

    this.dialog.id = 'resize-dialog';
    document.body.appendChild(this.dialog);
    this.bindElements();
    this.bindEvents();
  }

  private bindElements(): void {
    this.unitSelect    = this.dialog.querySelector('#rd-unit')!;
    this.widthInput    = this.dialog.querySelector('#rd-width')!;
    this.heightInput   = this.dialog.querySelector('#rd-height')!;
    this.lockCheckbox  = this.dialog.querySelector('#rd-lock')!;
    this.methodSelect  = this.dialog.querySelector('#rd-method')!;
    this.tooltip       = this.dialog.querySelector('#rd-tooltip')!;
    this.pixelsBefore  = this.dialog.querySelector('#rd-before')!;
    this.pixelsAfter   = this.dialog.querySelector('#rd-after')!;
    this.errorEl       = this.dialog.querySelector('#rd-error')!;
  }

  private bindEvents(): void {
    // Смена единиц
    this.unitSelect.addEventListener('change', () => this.resetFields());

    // Ширина изменилась — обновляем высоту если lock
    this.widthInput.addEventListener('input', () => {
      if (this.lockUpdating) return;
      if (this.lockCheckbox.checked) {
        this.lockUpdating = true;
        const w = parseFloat(this.widthInput.value) || 0;
        const unit = this.unitSelect.value as Unit;
        if (unit === 'percent') {
          this.heightInput.value = this.widthInput.value;
        } else {
          this.heightInput.value = String(Math.round(w / this.aspectRatio));
        }
        this.lockUpdating = false;
      }
      this.updatePixelCounts();
      this.clearError();
    });

    // Высота изменилась — обновляем ширину если lock
    this.heightInput.addEventListener('input', () => {
      if (this.lockUpdating) return;
      if (this.lockCheckbox.checked) {
        this.lockUpdating = true;
        const h = parseFloat(this.heightInput.value) || 0;
        const unit = this.unitSelect.value as Unit;
        if (unit === 'percent') {
          this.widthInput.value = this.heightInput.value;
        } else {
          this.widthInput.value = String(Math.round(h * this.aspectRatio));
        }
        this.lockUpdating = false;
      }
      this.updatePixelCounts();
      this.clearError();
    });

    // Тултип метода
    this.methodSelect.addEventListener('change', () => {
      const method = this.methodSelect.value as InterpolationMethod;
      this.tooltip.textContent = interpolators[method].description;
    });

    // Отмена
    this.dialog.querySelector('#rd-cancel')!.addEventListener('click', () => {
      this.dialog.close();
    });

    // Применить
    this.dialog.querySelector('#rd-apply')!.addEventListener('click', () => {
      this.apply();
    });
  }

  private resetFields(): void {
    const unit = this.unitSelect.value as Unit;
    if (unit === 'percent') {
      this.widthInput.value  = '100';
      this.heightInput.value = '100';
      this.widthInput.min    = '1';
      this.widthInput.max    = '1000';
      this.heightInput.min   = '1';
      this.heightInput.max   = '1000';
    } else {
      this.widthInput.value  = String(this.originalImageData?.width ?? 100);
      this.heightInput.value = String(this.originalImageData?.height ?? 100);
      this.widthInput.min    = '1';
      this.widthInput.max    = '16000';
      this.heightInput.min   = '1';
      this.heightInput.max   = '16000';
    }
    this.clearError();
    this.updatePixelCounts();
  }

  private getTargetSize(): { w: number; h: number } | null {
    const img = this.originalImageData!;
    const unit = this.unitSelect.value as Unit;
    const wVal = parseFloat(this.widthInput.value);
    const hVal = parseFloat(this.heightInput.value);

    if (unit === 'percent') {
      return {
        w: Math.round(img.width  * wVal / 100),
        h: Math.round(img.height * hVal / 100),
      };
    } else {
      return { w: Math.round(wVal), h: Math.round(hVal) };
    }
  }

  private updatePixelCounts(): void {
    const img = this.originalImageData;
    if (!img) return;

    const before = (img.width * img.height / 1_000_000).toFixed(2);
    this.pixelsBefore.textContent = `${before} Мп (${img.width}×${img.height})`;

    const size = this.getTargetSize();
    if (size && size.w > 0 && size.h > 0) {
      const after = (size.w * size.h / 1_000_000).toFixed(2);
      this.pixelsAfter.textContent = `${after} Мп (${size.w}×${size.h})`;
    } else {
      this.pixelsAfter.textContent = '—';
    }
  }

  private validate(): string | null {
    const unit = this.unitSelect.value as Unit;
    const wVal = parseFloat(this.widthInput.value);
    const hVal = parseFloat(this.heightInput.value);

    if (isNaN(wVal) || isNaN(hVal)) return 'Введите числовые значения';
    if (!Number.isInteger(wVal) || !Number.isInteger(hVal)) {
      if (unit === 'pixels') return 'Размер в пикселях должен быть целым числом';
    }
    if (unit === 'percent') {
      if (wVal < 1 || wVal > 1000) return 'Процент должен быть от 1 до 1000';
      if (hVal < 1 || hVal > 1000) return 'Процент должен быть от 1 до 1000';
    } else {
      if (wVal < 1 || wVal > 16000) return 'Ширина должна быть от 1 до 16000 пикселей';
      if (hVal < 1 || hVal > 16000) return 'Высота должна быть от 1 до 16000 пикселей';
    }
    return null;
  }

  private apply(): void {
    const error = this.validate();
    if (error) {
      this.showError(error);
      return;
    }

    const size = this.getTargetSize()!;
    const method = this.methodSelect.value as InterpolationMethod;

    const result = ImageScaler.resize(this.originalImageData!, size.w, size.h, method);
    this.dialog.close();
    this.onResized(result);
  }

  private showError(msg: string): void {
    this.errorEl.textContent = msg;
  }

  private clearError(): void {
    this.errorEl.textContent = '';
  }
}