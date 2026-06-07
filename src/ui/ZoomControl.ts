export class ZoomControl {
  private zoom: number = 1.0;
  private onZoomChange: (zoom: number) => void;
  private select!: HTMLSelectElement;
  private range!: HTMLInputElement;
  private label!: HTMLSpanElement;

  constructor(onZoomChange: (zoom: number) => void) {
    this.onZoomChange = onZoomChange;
    this.build();
  }

  private build(): void {
    const toolbar = document.getElementById('toolbar')!;

    // Разделитель
    const sep = document.createElement('div');
    sep.style.cssText = 'width:1px;background:#555;height:20px;margin:0 4px;';
    toolbar.appendChild(sep);

    // Иконка
    const icon = document.createElement('span');
    icon.style.cssText = 'font-size:13px;color:#888;';
    icon.textContent = '🔍';
    toolbar.appendChild(icon);

    // Выпадающий список масштабов
    this.select = document.createElement('select');
    this.select.style.cssText = `
      background: #3c3c3c;
      border: 1px solid #555;
      border-radius: 4px;
      color: #d4d4d4;
      padding: 3px 6px;
      font-size: 12px;
      cursor: pointer;
    `;

    const presets = [12, 25, 33, 50, 67, 75, 100, 150, 200, 300];
    presets.forEach(p => {
      const opt = document.createElement('option');
      opt.value = String(p);
      opt.textContent = `${p}%`;
      if (p === 100) opt.selected = true;
      this.select.appendChild(opt);
    });

    toolbar.appendChild(this.select);

    // Range слайдер
    this.range = document.createElement('input');
    this.range.type = 'range';
    this.range.min = '12';
    this.range.max = '300';
    this.range.value = '100';
    this.range.step = '1';
    this.range.style.cssText = 'width:90px;cursor:pointer;accent-color:#0e639c;';
    toolbar.appendChild(this.range);

    // Метка %
    this.label = document.createElement('span');
    this.label.style.cssText = 'font-size:12px;color:#9cdcfe;min-width:36px;';
    this.label.textContent = '100%';
    toolbar.appendChild(this.label);

    // События
    this.select.addEventListener('change', () => {
      const val = parseInt(this.select.value) / 100;
      this.setZoom(val, false);
      this.onZoomChange(this.zoom);
    });

    this.range.addEventListener('input', () => {
      const val = parseInt(this.range.value) / 100;
      this.setZoom(val, true);
      this.onZoomChange(this.zoom);
    });
  }

  setZoom(zoom: number, fromRange = false): void {
    this.zoom = Math.max(0.12, Math.min(3.0, zoom));
    const pct = Math.round(this.zoom * 100);
    this.label.textContent = `${pct}%`;

    if (!fromRange) {
      this.range.value = String(pct);
    }

    // Синхронизируем select с ближайшим пресетом
    const presets = [12, 25, 33, 50, 67, 75, 100, 150, 200, 300];
    const closest = presets.reduce((a, b) =>
      Math.abs(b - pct) < Math.abs(a - pct) ? b : a
    );
    if (Math.abs(closest - pct) < 2) {
      this.select.value = String(closest);
    }
  }

  getZoom(): number {
    return this.zoom;
  }
}