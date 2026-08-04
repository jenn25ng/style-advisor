// src/data/__tests__/lookShapes.test.ts
import { describe, it, expect } from 'vitest';
import { neutralBase, frameSilhouette } from '../lookShapes';

describe('lookShapes', () => {
  it('warm/cool 각각 중립 베이스 색이 2개 이상', () => {
    expect(neutralBase.warm.length).toBeGreaterThan(1);
    expect(neutralBase.cool.length).toBeGreaterThan(1);
    for (const s of [...neutralBase.warm, ...neutralBase.cool]) {
      expect(s.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
  it('3개 골격 실루엣 파라미터가 모두 정의됨', () => {
    for (const id of ['straight', 'wave', 'natural'] as const) {
      expect(frameSilhouette[id]).toBeTruthy();
      expect(frameSilhouette[id].bottom).toMatch(/pants|skirt|wide/);
    }
  });
});
