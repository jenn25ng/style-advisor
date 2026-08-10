import type { FrameTypeId } from '../types';

export const shopConfig = {
  // 네이버 쇼핑은 외부 링크 접속을 봇으로 차단 → 구글 쇼핑(외부 링크 안정적)
  searchBase: 'https://www.google.com/search?tbm=shop&q=',
};

export function shopSearchUrl(query: string): string {
  return shopConfig.searchBase + encodeURIComponent(query);
}

// 골격별 '핏 특정' 아이템 (표기 + 검색어 겸용)
export const frameItemTerms: Record<FrameTypeId, { top: string; bottom: string; point: string }> = {
  straight: { top: '베이직 셔츠', bottom: '일자 슬랙스', point: '미니멀 토트백' },
  wave: { top: '퍼프 블라우스', bottom: '부츠컷 팬츠', point: '미니 숄더백' },
  natural: { top: '오버핏 셔츠', bottom: '와이드 팬츠', point: '캔버스 백' },
};

// 골격별 핏 핵심 원리 (룩북 상단 안내)
export const frameFitTip: Record<FrameTypeId, string> = {
  straight: '군더더기 없는 I라인 정핏이 포인트 — 오버핏·과한 프릴은 피하세요.',
  wave: '허리 강조 + 하이웨이스트로 시선을 위로 — 뻣뻣하거나 헐렁한 핏은 피하세요.',
  natural: '여유로운 오버핏·와이드로 프레임을 자연스럽게 — 딱 붙는 핏은 피하세요.',
};
