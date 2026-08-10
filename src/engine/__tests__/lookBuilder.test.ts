import { describe, it, expect } from 'vitest';
import { buildLooks } from '../lookBuilder';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';
import { neutralBase } from '../../data/lookShapes';

describe('buildLooks v2', () => {
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
  it('basic 룩의 하의는 중립색이다', () => {
    const c = colorTypes[0];
    const looks = buildLooks(c.id, 'straight');
    const neutrals = neutralBase[c.undertone].map((s) => s.hex);
    expect(neutrals).toContain(looks[0].bottom.hex);
  });
  it('point 룩의 상·하의는 중립색이다', () => {
    const c = colorTypes[0];
    const looks = buildLooks(c.id, 'straight');
    const neutrals = neutralBase[c.undertone].map((s) => s.hex);
    expect(neutrals).toContain(looks[2].top.hex);
    expect(neutrals).toContain(looks[2].bottom.hex);
  });
});
