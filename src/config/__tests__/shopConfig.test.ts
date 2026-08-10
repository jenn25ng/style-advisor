import { describe, it, expect } from 'vitest';
import { shopSearchUrl, frameItemTerms, pointItemTerm } from '../shopConfig';

describe('shopConfig', () => {
  it('shopSearchUrl은 base + 인코딩된 검색어', () => {
    const u = shopSearchUrl('코랄 셔츠');
    expect(u.startsWith('https://search.shopping.naver.com/search/all?query=')).toBe(true);
    expect(u).toContain(encodeURIComponent('코랄 셔츠'));
  });
  it('골격 3타입 아이템 종류가 정의됨', () => {
    for (const id of ['straight', 'wave', 'natural'] as const) {
      expect(frameItemTerms[id].top.length).toBeGreaterThan(0);
      expect(frameItemTerms[id].bottom.length).toBeGreaterThan(0);
    }
    expect(pointItemTerm.length).toBeGreaterThan(0);
  });
});
