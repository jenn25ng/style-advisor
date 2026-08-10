// src/data/__tests__/lookShapes.test.ts
import { describe, it, expect } from 'vitest';
import { neutralBase } from '../lookShapes';

describe('lookShapes', () => {
  it('warm/cool 각각 중립 베이스 색이 2개 이상', () => {
    expect(neutralBase.warm.length).toBeGreaterThan(1);
    expect(neutralBase.cool.length).toBeGreaterThan(1);
    for (const s of [...neutralBase.warm, ...neutralBase.cool]) {
      expect(s.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
