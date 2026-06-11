import './style.css';
import { CanvasRenderer }    from './core/CanvasRenderer';
import { loadImageFromFile } from './core/ImageData';
import { ImageScaler }       from './core/ImageScaler';
import { StatusBar }         from './ui/StatusBar';
import { Toolbar }           from './ui/Toolbar';
import { ChannelsPanel }     from './ui/ChannelsPanel';
import { EyedropperTool }    from './ui/EyedropperTool';
import { LevelsDialog }      from './ui/LevelsDialog';
import { ZoomControl }       from './ui/ZoomControl';
import { ResizeDialog }      from './ui/ResizeDialog';
import { KernelDialog }      from './ui/KernelDialog';

const canvas      = document.getElementById('main-canvas') as HTMLCanvasElement;
const placeholder = document.getElementById('placeholder') as HTMLElement;
const canvasArea  = document.getElementById('canvas-area') as HTMLElement;
const fileInput   = document.getElementById('file-input') as HTMLInputElement;
const btnOpen     = document.getElementById('btn-open') as HTMLButtonElement;
const btnEye      = document.getElementById('btn-eyedropper') as HTMLButtonElement;
const btnLevels   = document.getElementById('btn-levels') as HTMLButtonElement;
const btnResize   = document.getElementById('btn-resize') as HTMLButtonElement;
const btnKernel   = document.getElementById('btn-kernel') as HTMLButtonElement;

const renderer      = new CanvasRenderer(canvas);
const statusBar     = new StatusBar();
const toolbar       = new Toolbar(renderer);
const channelsPanel = new ChannelsPanel(renderer);
const eyedropper    = new EyedropperTool(renderer);
const kernelDialog  = new KernelDialog(renderer);

toolbar.bindSaveButtons();

const zoomControl = new ZoomControl((zoom) => {
  renderer.applyZoom(zoom);
});

const levelsDialog = new LevelsDialog(renderer, (appliedImage) => {
  channelsPanel.setImage(appliedImage);
});

const resizeDialog = new ResizeDialog(renderer, (resizedImage) => {
  renderer.render(resizedImage);
  channelsPanel.setImage(resizedImage);
  const zoom = ImageScaler.computeFitZoom(
    resizedImage.width, resizedImage.height,
    canvasArea.clientWidth - 170, canvasArea.clientHeight
  );
  zoomControl.setZoom(zoom);
  renderer.applyZoom(zoom);
});

function showImage(): void {
  placeholder.style.display = 'none';
  canvas.style.display = 'block';
  canvasArea.style.marginRight = '170px';
}

async function handleFile(file: File): Promise<void> {
  try {
    const { imageData, meta } = await loadImageFromFile(file);
    renderer.render(imageData);
    statusBar.update(meta);
    toolbar.setFileName(file.name);
    channelsPanel.setImage(imageData);
    showImage();

    const zoom = ImageScaler.computeFitZoom(
      imageData.width, imageData.height,
      canvasArea.clientWidth - 170, canvasArea.clientHeight, 50
    );
    zoomControl.setZoom(zoom);
    renderer.applyZoom(zoom);
  } catch (err) {
    alert(`Ошибка загрузки: ${(err as Error).message}`);
  }
}

btnOpen.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', () => {
  const file = fileInput.files?.[0];
  if (file) handleFile(file);
});

btnLevels.addEventListener('click',  () => levelsDialog.open());
btnResize.addEventListener('click',  () => resizeDialog.open());
btnKernel.addEventListener('click',  () => kernelDialog.open());

btnEye.addEventListener('click', () => {
  if (eyedropper.isActive()) {
    eyedropper.deactivate();
    btnEye.classList.remove('active');
  } else {
    eyedropper.activate();
    btnEye.classList.add('active');
  }
});

canvasArea.addEventListener('dragover',  (e) => { e.preventDefault(); canvasArea.classList.add('drag-over'); });
canvasArea.addEventListener('dragleave', ()  => canvasArea.classList.remove('drag-over'));
canvasArea.addEventListener('drop',      (e) => {
  e.preventDefault();
  canvasArea.classList.remove('drag-over');
  const file = e.dataTransfer?.files[0];
  if (file) handleFile(file);
});

window.addEventListener('resize', () => renderer.fitToScreen());