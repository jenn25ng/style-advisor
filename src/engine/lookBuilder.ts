import type { ColorTypeId, FrameTypeId, Look, LookItem, LookItemRole, Swatch } from '../types';
import { colorTypes } from '../data/colorTypes';
import { buildGuide } from './guideBuilder';
import { neutralBase } from '../data/lookShapes';
import { frameItemTerms, pointItemTerm } from '../config/shopConfig';

function item(role: LookItemRole, sw: Swatch, itemType: string): LookItem {
  return { role, name: sw.name, hex: sw.hex, itemType, query: `${sw.name} ${itemType}` };
}

export function buildLooks(colorId: ColorTypeId, frameId: FrameTypeId): Look[] {
  const guide = buildGuide(colorId, frameId);
  const c = colorTypes.find((x) => x.id === colorId)!;
  const neutrals = neutralBase[c.undertone];
  const palette = guide.palette;
  const point = guide.pointColor ?? palette[0];
  const terms = frameItemTerms[frameId];

  const lightNeutral = neutrals[0];
  const darkNeutral = neutrals[neutrals.length - 1];
  const midNeutral = neutrals[1] ?? darkNeutral;

  const basic: Look = {
    kind: 'basic',
    title: '기본 조합',
    rationale: `실패 없는 데일리 — ${palette[0].name} ${terms.top}에 ${darkNeutral.name} 하의로 안정감.`,
    top: item('top', palette[0], terms.top),
    bottom: item('bottom', darkNeutral, terms.bottom),
    point: item('point', midNeutral, pointItemTerm),
  };

  const bottomTonal = palette.find((s) => s.hex !== palette[0].hex) ?? midNeutral;
  const pointTonal =
    palette.find((s) => s.hex !== palette[0].hex && s.hex !== bottomTonal.hex) ?? point;
  const tonal: Look = {
    kind: 'tonal',
    title: '톤 매치',
    rationale: `통일감 있는 톤 매치 — 같은 계열 ${palette[0].name}·${bottomTonal.name}로 세련되게.`,
    top: item('top', palette[0], terms.top),
    bottom: item('bottom', bottomTonal, terms.bottom),
    point: item('point', pointTonal, pointItemTerm),
  };

  const pointLook: Look = {
    kind: 'point',
    title: '포인트 컬러',
    rationale: `차분한 베이스에 ${point.name}로 포인트 — 소품으로 힘주기.`,
    top: item('top', lightNeutral, terms.top),
    bottom: item('bottom', darkNeutral, terms.bottom),
    point: item('point', point, pointItemTerm),
  };

  return [basic, tonal, pointLook];
}
