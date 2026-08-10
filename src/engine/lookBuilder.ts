import type { ColorTypeId, FrameTypeId, Look, LookItem, LookItemRole, Swatch } from '../types';
import { colorTypes } from '../data/colorTypes';
import { buildGuide } from './guideBuilder';
import { neutralBase } from '../data/lookShapes';
import { frameItemTerms } from '../config/shopConfig';
import { hexToHsv, hueDistance } from './colorUtil';

function item(role: LookItemRole, sw: Swatch, itemType: string): LookItem {
  return { role, name: sw.name, hex: sw.hex, itemType, query: `${sw.name} ${itemType}` };
}

function mostVivid(palette: Swatch[]): Swatch {
  return palette.reduce((a, b) => (hexToHsv(b.hex).s > hexToHsv(a.hex).s ? b : a));
}
function leastVivid(palette: Swatch[]): Swatch {
  return palette.reduce((a, b) => (hexToHsv(b.hex).s < hexToHsv(a.hex).s ? b : a));
}
function closestHuePair(palette: Swatch[]): [Swatch, Swatch] {
  let best: [Swatch, Swatch] = [palette[0], palette[1] ?? palette[0]];
  let bestD = Infinity;
  for (let i = 0; i < palette.length; i++) {
    for (let j = i + 1; j < palette.length; j++) {
      const d = hueDistance(hexToHsv(palette[i].hex).h, hexToHsv(palette[j].hex).h);
      if (d < bestD) { bestD = d; best = [palette[i], palette[j]]; }
    }
  }
  return best;
}

export function buildLooks(colorId: ColorTypeId, frameId: FrameTypeId): Look[] {
  const guide = buildGuide(colorId, frameId);
  const c = colorTypes.find((x) => x.id === colorId)!;
  const neutrals = neutralBase[c.undertone];
  const palette = guide.palette;
  const terms = frameItemTerms[frameId];

  const lightNeutral = neutrals[0];
  const darkNeutral = neutrals[neutrals.length - 1];
  const midNeutral = neutrals[1] ?? darkNeutral;

  const accent = mostVivid(palette);
  const soft = leastVivid(palette);
  const [tonalA, tonalB] = closestHuePair(palette);

  const basic: Look = {
    kind: 'basic',
    title: '기본 조합',
    rationale: `무난한 데일리 — ${lightNeutral.name}·${darkNeutral.name} 중립 베이스에 ${soft.name}만 살짝.`,
    top: item('top', lightNeutral, terms.top),
    bottom: item('bottom', darkNeutral, terms.bottom),
    point: item('point', soft, terms.point),
  };

  const tonal: Look = {
    kind: 'tonal',
    title: '톤 매치',
    rationale: `톤온톤 — 비슷한 계열 ${tonalA.name}·${tonalB.name}로 통일감 있게.`,
    top: item('top', tonalA, terms.top),
    bottom: item('bottom', tonalB, terms.bottom),
    point: item('point', midNeutral, terms.point),
  };

  const pointLook: Look = {
    kind: 'point',
    title: '포인트 컬러',
    rationale: `차분한 중립에 쨍한 ${accent.name}로 포인트.`,
    top: item('top', lightNeutral, terms.top),
    bottom: item('bottom', darkNeutral, terms.bottom),
    point: item('point', accent, terms.point),
  };

  return [basic, tonal, pointLook];
}
