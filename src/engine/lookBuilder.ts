import type { ColorTypeId, FrameTypeId, Look, LookItem, Swatch } from '../types';
import { colorTypes } from '../data/colorTypes';
import { buildGuide } from './guideBuilder';
import { neutralBase } from '../data/lookShapes';

const THEMES = ['데일리', '포인트 룩', '모던'];

function toItem(role: LookItem['role'], s: Swatch): LookItem {
  return { role, name: s.name, hex: s.hex };
}

export function buildLooks(colorId: ColorTypeId, frameId: FrameTypeId): Look[] {
  const guide = buildGuide(colorId, frameId);
  const c = colorTypes.find((x) => x.id === colorId)!;
  const neutrals = neutralBase[c.undertone];
  const palette = guide.palette;
  const point = guide.pointColor ?? palette[0];
  const fitLabel = `${guide.silhouettes[0]} · ${guide.fits[0]}`;

  const looks: Look[] = [];
  for (let i = 0; i < 3; i++) {
    const top = palette[i % palette.length];
    const bottom =
      palette.find((s) => s.hex !== top.hex) ?? neutrals[i % neutrals.length];
    const usedHex = new Set([top.hex, bottom.hex]);
    const pointPick =
      (!usedHex.has(point.hex) ? point : undefined) ??
      palette.find((s) => !usedHex.has(s.hex)) ??
      neutrals.find((s) => !usedHex.has(s.hex)) ??
      neutrals[(i + 1) % neutrals.length];
    looks.push({
      theme: THEMES[i],
      top: toItem('top', top),
      bottom: toItem('bottom', bottom),
      point: toItem('point', pointPick),
      fitLabel,
    });
  }
  return looks;
}
