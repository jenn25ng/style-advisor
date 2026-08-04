import { describe, it, expect } from 'vitest';
import { buildFormBody } from '../formPayload';
import type { DiagnosisResult } from '../../types';

const result: DiagnosisResult = {
  colorType: 'spring-bright', frameType: 'straight',
  colorScore: { warmCool: 4, value: 1, chroma: 3 },
  frameScore: { straight: 6, wave: 0, natural: 0 },
  rationale: 'x',
};
const cfg = {
  actionUrl: 'https://example.com/formResponse',
  fields: {
    colorType: 'entry.1', frameType: 'entry.2', timestamp: 'entry.3',
    warmCool: 'entry.4', value: 'entry.5', chroma: 'entry.6',
    straight: 'entry.7', wave: 'entry.8', natural: 'entry.9',
  },
};

describe('buildFormBody', () => {
  it('결과를 entry.<id>=값으로 매핑한다', () => {
    const body = buildFormBody(result, cfg, '2026-08-04T00:00:00.000Z');
    expect(body.get('entry.1')).toBe('spring-bright');
    expect(body.get('entry.2')).toBe('straight');
    expect(body.get('entry.3')).toBe('2026-08-04T00:00:00.000Z');
    expect(body.get('entry.4')).toBe('4');
    expect(body.get('entry.6')).toBe('3');
    expect(body.get('entry.7')).toBe('6');
    expect(body.get('entry.9')).toBe('0');
  });
});
