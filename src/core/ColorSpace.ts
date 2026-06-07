// RGB (0-255) → Linear RGB
function linearize(c: number): number {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

// Linear RGB → XYZ (D65)
function rgbToXYZ(r: number, g: number, b: number): [number, number, number] {
  const lr = linearize(r);
  const lg = linearize(g);
  const lb = linearize(b);

  const x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  const y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  const z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  return [x, y, z];
}

// XYZ → CIELAB
function xyzToLab(x: number, y: number, z: number): [number, number, number] {
  // D65 white point
  const xn = 0.95047;
  const yn = 1.00000;
  const zn = 1.08883;

  function f(t: number): number {
    return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  }

  const fx = f(x / xn);
  const fy = f(y / yn);
  const fz = f(z / zn);

  const L = 116 * fy - 16;
  const a = 500 * (fx - fy);
  const b = 200 * (fy - fz);

  return [L, a, b];
}

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const [x, y, z] = rgbToXYZ(r, g, b);
  return xyzToLab(x, y, z);
}