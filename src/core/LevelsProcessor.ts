export interface LevelSettings {
  inBlack: number;
  inWhite: number;
  gamma: number;
}

export type ChannelKey = 'master' | 'R' | 'G' | 'B' | 'A';

export type AllLevels = Record<ChannelKey, LevelSettings>;

export function defaultLevel(): LevelSettings {
  return { inBlack: 0, inWhite: 255, gamma: 1.0 };
}

export function defaultAllLevels(): AllLevels {
  return {
    master: defaultLevel(),
    R: defaultLevel(),
    G: defaultLevel(),
    B: defaultLevel(),
    A: defaultLevel(),
  };
}

function buildLUT(settings: LevelSettings): Uint8Array {
  const lut = new Uint8Array(256);
  const { inBlack, inWhite, gamma } = settings;
  const range = inWhite - inBlack || 1;

  for (let i = 0; i < 256; i++) {
    let v = (i - inBlack) / range;
    v = Math.max(0, Math.min(1, v));
    if (gamma !== 1.0) {
      v = Math.pow(v, 1.0 / gamma);
    }
    lut[i] = Math.round(v * 255);
  }

  return lut;
}

export function applyLevels(
  src: ImageData,
  levels: AllLevels
): ImageData {
  const out = new ImageData(
    new Uint8ClampedArray(src.data),
    src.width,
    src.height
  );

  const lutR = buildLUT(levels.R);
  const lutG = buildLUT(levels.G);
  const lutB = buildLUT(levels.B);
  const lutA = buildLUT(levels.A);
  const lutM = buildLUT(levels.master);

  const isMasterDefault =
    levels.master.inBlack === 0 &&
    levels.master.inWhite === 255 &&
    levels.master.gamma === 1.0;

  const data = out.data;

  for (let i = 0; i < data.length; i += 4) {
    const r0 = isMasterDefault ? data[i]     : lutM[data[i]];
    const g0 = isMasterDefault ? data[i + 1] : lutM[data[i + 1]];
    const b0 = isMasterDefault ? data[i + 2] : lutM[data[i + 2]];
    // FIX ЛР3: Alpha-канал master НЕ трогает
    const a0 = data[i + 3];

    data[i]     = lutR[r0];
    data[i + 1] = lutG[g0];
    data[i + 2] = lutB[b0];
    data[i + 3] = lutA[a0];
  }

  return out;
}