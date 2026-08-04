import type { FrameTypeId, Swatch } from '../types';

// HEX는 렌더링용 예시(퍼스널컬러 원칙과 동일).
export const neutralBase: Record<'warm' | 'cool', Swatch[]> = {
  warm: [
    { name: '아이보리', hex: '#F3EAD8' },
    { name: '카멜', hex: '#B98C5A' },
    { name: '차콜 브라운', hex: '#4A3F35' },
  ],
  cool: [
    { name: '오프 화이트', hex: '#F2F2F4' },
    { name: '쿨 그레이', hex: '#9AA0A8' },
    { name: '네이비', hex: '#26324A' },
  ],
};

export interface Silhouette {
  top: 'boxy' | 'fitted' | 'oversized';
  bottom: 'straight-pants' | 'flare-skirt' | 'wide-pants';
  topWidth: number;   // viewBox 100 기준 상의 폭
  hemWidth: number;   // 하의 밑단 폭
}
export const frameSilhouette: Record<FrameTypeId, Silhouette> = {
  straight: { top: 'boxy',      bottom: 'straight-pants', topWidth: 46, hemWidth: 30 },
  wave:     { top: 'fitted',    bottom: 'flare-skirt',    topWidth: 38, hemWidth: 54 },
  natural:  { top: 'oversized', bottom: 'wide-pants',     topWidth: 58, hemWidth: 48 },
};
