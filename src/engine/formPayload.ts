import type { DiagnosisResult } from '../types';
import type { FormConfig } from '../config/formConfig';

export function buildFormBody(
  result: DiagnosisResult,
  cfg: FormConfig,
  nowISO: string,
): URLSearchParams {
  const f = cfg.fields;
  const b = new URLSearchParams();
  b.set(f.colorType, result.colorType);
  b.set(f.frameType, result.frameType);
  b.set(f.timestamp, nowISO);
  b.set(f.warmCool, String(result.colorScore.warmCool));
  b.set(f.value, String(result.colorScore.value));
  b.set(f.chroma, String(result.colorScore.chroma));
  b.set(f.straight, String(result.frameScore.straight));
  b.set(f.wave, String(result.frameScore.wave));
  b.set(f.natural, String(result.frameScore.natural));
  return b;
}
