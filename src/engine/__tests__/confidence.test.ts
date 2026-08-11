import { describe, it, expect } from 'vitest';
import { confidenceLevel } from '../confidence';
import type { ColorScore, DiagnosisResult, FrameScore } from '../../types';

function mk(colorScore: ColorScore, frameScore: FrameScore): DiagnosisResult {
  return {
    colorType: 'spring-bright',
    frameType: 'straight',
    colorScore,
    frameScore,
    rationale: 'x',
  };
}

describe('confidenceLevel', () => {
  it('뚜렷한 축 다수 + 큰 골격 마진 → 높음', () => {
    expect(
      confidenceLevel(mk({ warmCool: 4, value: 3, chroma: 3 }, { straight: 6, wave: 0, natural: 0 })),
    ).toBe('높음');
  });
  it('중간 신호 → 보통', () => {
    expect(
      confidenceLevel(mk({ warmCool: 2, value: 1, chroma: 0 }, { straight: 2, wave: 1, natural: 0 })),
    ).toBe('보통');
  });
  it('경계 점수(약한 신호) → 낮음', () => {
    expect(
      confidenceLevel(mk({ warmCool: 0, value: 1, chroma: 0 }, { straight: 1, wave: 1, natural: 0 })),
    ).toBe('낮음');
  });
});
