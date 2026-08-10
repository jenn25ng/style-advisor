import { describe, it, expect } from 'vitest';
import { shopSearchUrl, frameItemTerms, frameFitTip } from '../shopConfig';

describe('shopConfig', () => {
  it('shopSearchUrl은 구글쇼핑 base + 인코딩된 검색어', () => {
    const u = shopSearchUrl('코랄 셔츠');
    expect(u.startsWith('https://www.google.com/search?tbm=shop&q=')).toBe(true);
    expect(u).toContain(encodeURIComponent('코랄 셔츠'));
  });
  it('골격 3타입 핏 특정 아이템(top/bottom/point)이 정의됨', () => {
    for (const id of ['straight', 'wave', 'natural'] as const) {
      expect(frameItemTerms[id].top.length).toBeGreaterThan(0);
      expect(frameItemTerms[id].bottom.length).toBeGreaterThan(0);
      expect(frameItemTerms[id].point.length).toBeGreaterThan(0);
    }
  });
  it('골격별 핏 포인트 문구가 정의됨', () => {
    for (const id of ['straight', 'wave', 'natural'] as const) {
      expect(frameFitTip[id].length).toBeGreaterThan(0);
    }
  });
});
