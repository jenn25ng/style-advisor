// src/engine/__tests__/guideBuilder.test.ts
import { describe, it, expect } from 'vitest';
import { buildGuide } from '../guideBuilder';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';
import type { ColorTypeId, FrameTypeId } from '../../types';

describe('buildGuide', () => {
  it('모든 24조합(8×3)이 빈 값 없이 생성된다', () => {
    for (const c of colorTypes) {
      for (const f of frameTypes) {
        const g = buildGuide(c.id, f.id);
        expect(g.palette.length).toBeGreaterThan(0);
        expect(g.fabrics.length).toBeGreaterThan(0);
        expect(g.fits.length).toBeGreaterThan(0);
        expect(g.silhouettes.length).toBeGreaterThan(0);
        expect(g.avoidItems.length).toBeGreaterThan(0);
        expect(g.oneLineTip.length).toBeGreaterThan(0);
      }
    }
  });
  it('색 팔레트는 해당 colorType의 bestColors에서 온다', () => {
    const g = buildGuide('spring-light' as ColorTypeId, 'straight' as FrameTypeId);
    const spring = colorTypes.find((c) => c.id === 'spring-light')!;
    expect(g.palette.map((s) => s.hex)).toEqual(spring.bestColors.map((s) => s.hex));
  });
  it('핏·소재는 해당 frameType에서 온다', () => {
    const g = buildGuide('winter-deep' as ColorTypeId, 'natural' as FrameTypeId);
    const natural = frameTypes.find((f) => f.id === 'natural')!;
    expect(g.fabrics).toEqual(natural.fabrics);
    expect(g.silhouettes).toEqual(natural.silhouettes);
  });
});
