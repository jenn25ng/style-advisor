export type ColorAxis = 'warmCool' | 'value' | 'chroma'; // 각 축 점수(양수/음수)
export type FrameTypeId = 'straight' | 'wave' | 'natural';
export type ColorTypeId =
  | 'spring-light' | 'spring-bright'
  | 'summer-light' | 'summer-mute'
  | 'autumn-mute'  | 'autumn-deep'
  | 'winter-bright'| 'winter-deep';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ColorOption {
  label: string;
  scores: Partial<Record<ColorAxis, number>>; // 예: { warmCool: +2 }
}
export interface FrameOption {
  label: string;
  votes: Partial<Record<FrameTypeId, number>>; // 예: { straight: 1 }
}
export interface ColorQuestion {
  id: string;
  kind: 'color';
  weight?: number;         // 약한 힌트 문항은 <1 (기본 1)
  text: string;
  options: ColorOption[];
}
export interface FrameQuestion {
  id: string;
  kind: 'frame';
  key?: 'collarbone' | 'wrist' | 'volume' | 'other'; // 타이브레이크·가중용
  text: string;
  options: FrameOption[];
}
export type Question = ColorQuestion | FrameQuestion;

export interface Swatch { name: string; hex: string; }

export interface ColorType {
  id: ColorTypeId;
  season: Season;
  name: string;            // "봄 라이트"
  undertone: 'warm' | 'cool';
  value: 'light' | 'mid' | 'dark';
  chroma: 'bright' | 'soft';
  keywords: string[];
  impression: string;
  bestColors: Swatch[];    // HEX는 예시
  worstColors: Swatch[];
}
export interface FrameType {
  id: FrameTypeId;
  name: string;            // "스트레이트"
  features: string[];
  fabrics: string[];
  fits: string[];
  silhouettes: string[];
  bestItems: string[];
  avoidItems: string[];
}

// 답변: 질문 id -> 선택한 option index
export type Answers = Record<string, number>;

export interface ColorScore { warmCool: number; value: number; chroma: number; }
export interface FrameScore { straight: number; wave: number; natural: number; }

export interface StyleGuide {
  colorType: ColorTypeId;
  frameType: FrameTypeId;
  palette: Swatch[];
  avoidColors: Swatch[];
  pointColor: Swatch | null;
  fabrics: string[];
  fits: string[];
  silhouettes: string[];
  bestItems: string[];
  avoidItems: string[];
  oneLineTip: string;
}

export interface DiagnosisResult {
  colorType: ColorTypeId;
  frameType: FrameTypeId;
  colorScore: ColorScore;
  frameScore: FrameScore;
  rationale: string;       // "웜 +3, 밝음 +2 → 봄 라이트"
  photoHint?: PhotoHint;
}
export interface PhotoHint {
  hint: 'warm' | 'cool' | 'neutral';
  confidence: number;      // 0..1
  avgHex: string;
}

export type LookKind = 'basic' | 'tonal' | 'point';
export type LookItemRole = 'top' | 'bottom' | 'point';
export interface LookItem {
  role: LookItemRole;
  name: string;
  hex: string;
  itemType: string;
  query: string;
}
export interface Look {
  kind: LookKind;
  title: string;
  rationale: string;
  top: LookItem;
  bottom: LookItem;
  point: LookItem;
}
