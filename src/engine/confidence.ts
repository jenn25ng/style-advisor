import type { DiagnosisResult } from '../types';

export type ConfidenceLevel = '높음' | '보통' | '낮음';

/**
 * 자가진단 신뢰도(참고용).
 * - 색: 세 축(웜쿨/명도/채도)이 얼마나 뚜렷한지(|점수| >= 2인 축 개수)
 * - 골격: 1등과 2등의 점수 마진
 * 두 신호가 모두 강하면 '높음', 하나라도 있으면 '보통', 둘 다 약하면(경계) '낮음'.
 */
export function confidenceLevel(result: DiagnosisResult): ConfidenceLevel {
  const cs = result.colorScore;
  const decisiveAxes = [
    Math.abs(cs.warmCool) >= 2,
    Math.abs(cs.value) >= 2,
    Math.abs(cs.chroma) >= 2,
  ].filter(Boolean).length;

  const fs = result.frameScore;
  const sorted = [fs.straight, fs.wave, fs.natural].sort((a, b) => b - a);
  const frameMargin = sorted[0] - sorted[1];

  if (decisiveAxes >= 2 && frameMargin >= 2) return '높음';
  if (decisiveAxes >= 1 || frameMargin >= 1) return '보통';
  return '낮음';
}
