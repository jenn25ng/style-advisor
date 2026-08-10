import { describe, it, expect } from 'vitest';
import { buildLooks } from '../lookBuilder';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';
import { neutralBase } from '../../data/lookShapes';
import { hexToHsv } from '../colorUtil';

describe('buildLooks v3 (색 역할 배정)', () => {
  it('모든 24조합에서 basic/tonal/point 3룩이 채워져 생성된다', () => {
    for (const c of colorTypes) for (const f of frameTypes) {
      const looks = buildLooks(c.id, f.id);
      expect(looks.map((l) => l.kind)).toEqual(['basic', 'tonal', 'point']);
      for (const lk of looks) {
        expect(lk.title.length).toBeGreaterThan(0);
        expect(lk.rationale.length).toBeGreaterThan(0);
        for (const it of [lk.top, lk.bottom, lk.point]) {
          expect(it.name.length).toBeGreaterThan(0);
          expect(it.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
          expect(it.itemType.length).toBeGreaterThan(0);
          expect(it.query).toContain(it.itemType);
        }
      }
    }
  });
  it('기본 조합의 상·하의는 중립색이다', () => {
    const c = colorTypes[0];
    const looks = buildLooks(c.id, 'straight');
    const neutrals = neutralBase[c.undertone].map((s) => s.hex);
    expect(neutrals).toContain(looks[0].top.hex);
    expect(neutrals).toContain(looks[0].bottom.hex);
  });
  it('포인트 컬러 룩의 포인트는 팔레트에서 가장 선명(채도 최고)한 색이다', () => {
    for (const c of colorTypes) {
      const guidePaletteMaxS = Math.max(
        ...c.bestColors.map((s) => hexToHsv(s.hex).s),
      );
      const looks = buildLooks(c.id, 'straight');
      expect(hexToHsv(looks[2].point.hex).s).toBeCloseTo(guidePaletteMaxS, 5);
    }
  });
  it('포인트 룩의 포인트가 기본 룩의 포인트보다 선명하다(accent>soft)', () => {
    const looks = buildLooks('spring-bright', 'straight');
    expect(hexToHsv(looks[2].point.hex).s).toBeGreaterThanOrEqual(
      hexToHsv(looks[0].point.hex).s,
    );
  });
});
