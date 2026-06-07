export interface AppImageMeta {
  width: number;
  height: number;
  colorDepth: number; // бит на пиксель
  format: string;     // 'PNG' | 'JPG' | 'GB7'
  fileName: string;
}

export function loadImageFromFile(file: File): Promise<{ imageData: ImageData; meta: AppImageMeta }> {
  const ext = file.name.split('.').pop()?.toLowerCase() ?? '';

  if (ext === 'gb7') {
    return loadGB7File(file);
  } else {
    return loadStandardImage(file);
  }
}

async function loadStandardImage(file: File): Promise<{ imageData: ImageData; meta: AppImageMeta }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
      const format = ext === 'jpg' || ext === 'jpeg' ? 'JPG' : 'PNG';

      resolve({
        imageData,
        meta: {
          width: img.naturalWidth,
          height: img.naturalHeight,
          colorDepth: 24, // RGBA = 8 бит × 3 канала
          format,
          fileName: file.name,
        },
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Не удалось загрузить изображение'));
    };

    img.src = url;
  });
}

async function loadGB7File(file: File): Promise<{ imageData: ImageData; meta: AppImageMeta }> {
  const { decodeGB7, gb7ToImageData } = await import('../formats/gb7');
  const buffer = await file.arrayBuffer();
  const gb7 = decodeGB7(buffer);
  const imageData = gb7ToImageData(gb7);

  return {
    imageData,
    meta: {
      width: gb7.width,
      height: gb7.height,
      colorDepth: gb7.hasMask ? 8 : 7,
      format: 'GB7',
      fileName: file.name,
    },
  };
}