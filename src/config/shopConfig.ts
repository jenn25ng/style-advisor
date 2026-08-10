import type { FrameTypeId } from '../types';

export const shopConfig = {
  searchBase: 'https://search.shopping.naver.com/search/all?query=',
};

export function shopSearchUrl(query: string): string {
  return shopConfig.searchBase + encodeURIComponent(query);
}

export const frameItemTerms: Record<FrameTypeId, { top: string; bottom: string }> = {
  straight: { top: '셔츠', bottom: '스트레이트 팬츠' },
  wave: { top: '블라우스', bottom: '플레어 스커트' },
  natural: { top: '니트', bottom: '와이드 팬츠' },
};

export const pointItemTerm = '가방';
