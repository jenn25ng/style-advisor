import { describe, it, expect } from 'vitest';
import { colorTypes } from '../colorTypes';

const EXPECTED = [
  'spring-light','spring-bright','summer-light','summer-mute',
  'autumn-mute','autumn-deep','winter-bright','winter-deep',
];

describe('colorTypes', () => {
  it('8세부 타입을 모두 포함한다', () => {
    expect(colorTypes.map((c) => c.id).sort()).toEqual([...EXPECTED].sort());
  });
  it('각 타입은 방향성 필드와 베스트/워스트 색을 가진다', () => {
    for (const c of colorTypes) {
      expect(['warm', 'cool']).toContain(c.undertone);
      expect(c.bestColors.length).toBeGreaterThan(2);
      expect(c.worstColors.length).toBeGreaterThan(0);
      for (const s of [...c.bestColors, ...c.worstColors]) {
        expect(s.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
  it('봄/가을은 warm, 여름/겨울은 cool 언더톤이다', () => {
    for (const c of colorTypes) {
      const warm = c.season === 'spring' || c.season === 'autumn';
      expect(c.undertone).toBe(warm ? 'warm' : 'cool');
    }
  });
});
