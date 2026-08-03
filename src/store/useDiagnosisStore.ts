import { create } from 'zustand';
import type { Answers, DiagnosisResult, PhotoHint } from '../types';
import { scoreColor, scoreFrame, classifyColor, classifyFrame } from '../engine/scoring';
import { colorTypes } from '../data/colorTypes';

const KEY = 'sa:lastResult';

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
      return raw ? (JSON.parse(raw) as DiagnosisResult) : null;
    } catch { return null; }
  },
  reset: () => set({ answers: {}, photoHint: undefined }),
}));
