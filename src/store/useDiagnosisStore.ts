import { create } from 'zustand';
import type { Answers, DiagnosisResult, PhotoHint } from '../types';
import { scoreColor, scoreFrame, classifyColor, classifyFrame } from '../engine/scoring';
import { colorTypes } from '../data/colorTypes';
import { frameTypes } from '../data/frameTypes';

const KEY = 'sa:lastResult';

const COLOR_IDS = new Set(colorTypes.map((c) => c.id));
const FRAME_IDS = new Set(frameTypes.map((f) => f.id));

interface State {
  answers: Answers;
  photoHint?: PhotoHint;
  answer: (id: string, optionIndex: number) => void;
  setPhotoHint: (h: PhotoHint) => void;
  computeResult: () => DiagnosisResult;
  saveResult: (r: DiagnosisResult) => void;
  loadResult: () => DiagnosisResult | null;
  reset: () => void;
}

export const useDiagnosisStore = create<State>((set, get) => ({
  answers: {},
  answer: (id, optionIndex) => set((s) => ({ answers: { ...s.answers, [id]: optionIndex } })),
  setPhotoHint: (h) => set({ photoHint: h }),

  computeResult: () => {
    const { answers, photoHint } = get();
    const cScore = scoreColor(answers);
    const fScore = scoreFrame(answers);
    const colorType = classifyColor(cScore);
    const frameType = classifyFrame(fScore, answers);
    const name = colorTypes.find((c) => c.id === colorType)?.name ?? colorType;
    const rationale =
      `웜쿨 ${cScore.warmCool >= 0 ? '웜' : '쿨'}(${cScore.warmCool}), ` +
      `명도 ${cScore.value}, 채도 ${cScore.chroma} → ${name}`;
    return { colorType, frameType, colorScore: cScore, frameScore: fScore, rationale, photoHint };
  },

  saveResult: (r) => {
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* 무시 */ }
  },
  loadResult: () => {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as DiagnosisResult;
      // 저장된 blob이 오래되었거나 손상되어 알 수 없는 타입 id를 담고 있으면 렌더 크래시를 막기 위해 무시한다.
      if (!COLOR_IDS.has(parsed?.colorType) || !FRAME_IDS.has(parsed?.frameType)) return null;
      return parsed;
    } catch { return null; }
  },
  reset: () => set({ answers: {}, photoHint: undefined }),
}));
