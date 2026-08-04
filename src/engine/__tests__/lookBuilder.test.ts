// src/engine/__tests__/lookBuilder.test.ts
import { describe, it, expect } from 'vitest';
import { buildLooks } from '../lookBuilder';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';

describe('buildLooks', () => {
  it('모든 24조합에서 룩 3개가 생성되고 각 룩 필드가 채워진다', () => {
    for (const c of colorTypes) for (const f of frameTypes) {
      const looks = buildLooks(c.id, f.id);
      expect(looks).toHaveLength(3);
      for (const lk of looks) {
        expect(lk.theme.length).toBeGreaterThan(0);
        expect(lk.fitLabel.length).toBeGreaterThan(0);
        for (const it of [lk.top, lk.bottom, lk.point]) {
          expect(it.name.length).toBeGreaterThan(0);
          expect(it.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
        }
      }
    }
  });
  it('한 룩 안에서 상/하/포인트 색은 서로 다르다', () => {
    const looks = buildLooks('spring-bright', 'straight');
    for (const lk of looks) {
      const hexes = new Set([lk.top.hex, lk.bottom.hex, lk.point.hex]);
      expect(hexes.size).toBe(3);
    }
  });
});
