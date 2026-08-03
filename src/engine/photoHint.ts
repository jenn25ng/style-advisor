import type { PhotoHint } from '../types';

export function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function toHex(n: number) { return Math.round(n).toString(16).padStart(2, '0'); }

export function hintFromPixels(pixels: number[][]): PhotoHint {
  const n = pixels.length || 1;
  const avg = pixels.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  ).map((x) => x / n);
  const [r, g, b] = avg;
  const yellowness = g - b;      // 클수록 웜
  const redPink = r - g;         // 핑크/레드 기운
  const warmScore = yellowness - Math.max(0, redPink - 40); // 과한 붉은기는 쿨로
  const hint: PhotoHint['hint'] =
    warmScore > 8 ? 'warm' : warmScore < -2 ? 'cool' : 'neutral';
  const confidence = Math.min(1, Math.abs(warmScore) / 60);
  const avgHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return { hint, confidence, avgHex };
}
