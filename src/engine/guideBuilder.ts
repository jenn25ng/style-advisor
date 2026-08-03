import type { ColorTypeId, FrameTypeId, StyleGuide } from '../types';
import { colorTypes } from '../data/colorTypes';
import { frameTypes } from '../data/frameTypes';
import { overrides } from '../data/styleGuides';

export function buildGuide(colorId: ColorTypeId, frameId: FrameTypeId): StyleGuide {
  const c = colorTypes.find((x) => x.id === colorId);
  const f = frameTypes.find((x) => x.id === frameId);
  if (!c || !f) throw new Error(`Unknown type: ${colorId}/${frameId}`);

  const base: StyleGuide = {
    colorType: colorId,
    frameType: frameId,
    palette: c.bestColors,
    avoidColors: c.worstColors,
    pointColor: c.bestColors[0] ?? null,
    fabrics: f.fabrics,
    fits: f.fits,
    silhouettes: f.silhouettes,
    bestItems: f.bestItems,
    avoidItems: f.avoidItems,
    oneLineTip: `${c.name} · ${f.name}: ${f.silhouettes[0]} 실루엣에 ${c.keywords[0]} 색을 매치하세요.`,
  };

  const key = `${colorId}/${frameId}`;
  return overrides[key] ? { ...base, ...overrides[key] } : base;
}
