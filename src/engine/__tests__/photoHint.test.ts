import { describe, it, expect } from 'vitest';
import { hintFromPixels, rgbToHsv } from '../photoHint';

describe('rgbToHsv', () => {
  it('순수 빨강의 hue는 0에 가깝다', () => {
    expect(rgbToHsv(255, 0, 0).h).toBeCloseTo(0, 0);
  });
});

describe('hintFromPixels', () => {
  it('따뜻한 살구빛 픽셀들은 warm 힌트를 준다', () => {
    const px = [[240, 190, 150], [235, 185, 145]]; // 웜 스킨
    expect(hintFromPixels(px).hint).toBe('warm');
  });
  it('붉은기 도는 창백/핑크빛 픽셀은 cool 힌트를 준다', () => {
    const px = [[235, 180, 190], [240, 185, 195]]; // 쿨(핑크) 스킨
    expect(hintFromPixels(px).hint).toBe('cool');
  });
  it('confidence는 0..1 범위이고 avgHex를 반환한다', () => {
    const r = hintFromPixels([[240, 190, 150]]);
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
    expect(r.avgHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
