import { describe, it, expect } from 'vitest';
import { frameTypes } from '../frameTypes';
import type { FrameTypeId } from '../../types';

describe('frameTypes', () => {
  it('스트레이트/웨이브/내추럴 3타입을 모두 포함한다', () => {
    const ids = frameTypes.map((f) => f.id).sort();
    expect(ids).toEqual(['natural', 'straight', 'wave'] as FrameTypeId[]);
  });
  it('각 타입은 소재·핏·실루엣·회피 아이템이 비어있지 않다', () => {
    for (const f of frameTypes) {
      expect(f.fabrics.length).toBeGreaterThan(0);
      expect(f.fits.length).toBeGreaterThan(0);
      expect(f.silhouettes.length).toBeGreaterThan(0);
      expect(f.avoidItems.length).toBeGreaterThan(0);
    }
  });
});
