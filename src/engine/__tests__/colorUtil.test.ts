import { describe, it, expect } from 'vitest';
import { hexToHsv, hueDistance } from '../colorUtil';

describe('colorUtil', () => {
  it('hexToHsv: 순수 빨강', () => {
    const { h, s, v } = hexToHsv('#FF0000');
    expect(Math.round(h)).toBe(0);
    expect(s).toBeCloseTo(1, 2);
    expect(v).toBeCloseTo(1, 2);
  });
  it('hexToHsv: 채도 비교(선명한 색 > 회색)', () => {
    expect(hexToHsv('#FF6F61').s).toBeGreaterThan(hexToHsv('#9AA0A8').s);
  });
  it('hueDistance는 원형 거리(350,10)=20', () => {
    expect(hueDistance(350, 10)).toBe(20);
  });
});
