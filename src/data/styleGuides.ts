import type { StyleGuide } from '../types';

// 강조/상충 조합만 개별 문구로 덮어씀. 기본은 guideBuilder가 합성.
// 예: { 'spring-bright/natural': { oneLineTip: '...' } }
export const overrides: Record<string, Partial<StyleGuide>> = {};
