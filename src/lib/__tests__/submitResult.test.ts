import { describe, it, expect, vi } from 'vitest';
import { submitResult } from '../submitResult';
import { isFormConfigured, type FormConfig } from '../../config/formConfig';
import type { DiagnosisResult } from '../../types';

const result: DiagnosisResult = {
  colorType: 'winter-deep', frameType: 'wave',
  colorScore: { warmCool: -3, value: -3, chroma: 3 },
  frameScore: { straight: 0, wave: 5, natural: 0 }, rationale: 'x',
};
const cfg: FormConfig = {
  actionUrl: 'https://example.com/formResponse',
  fields: {
    colorType: 'entry.1', frameType: 'entry.2', timestamp: 'entry.3',
    warmCool: 'entry.4', value: 'entry.5', chroma: 'entry.6',
    straight: 'entry.7', wave: 'entry.8', natural: 'entry.9',
  },
};

describe('isFormConfigured', () => {
  it('빈 설정은 false', () => {
    expect(isFormConfigured({ actionUrl: '', fields: cfg.fields })).toBe(false);
  });
  it('모두 채우면 true', () => {
    expect(isFormConfigured(cfg)).toBe(true);
  });
});

describe('submitResult', () => {
  it('올바른 URL·POST·no-cors로 전송한다', async () => {
    const fetchMock = vi.fn().mockResolvedValue(undefined);
    await submitResult(result, { config: cfg, now: '2026-08-04T00:00:00.000Z', fetchImpl: fetchMock });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [url, opts] = fetchMock.mock.calls[0];
    expect(url).toBe('https://example.com/formResponse');
    expect(opts.method).toBe('POST');
    expect(opts.mode).toBe('no-cors');
    expect(String(opts.body)).toContain('entry.1=winter-deep');
  });
  it('fetch 예외 시 throw(실패)한다', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new Error('network'));
    await expect(
      submitResult(result, { config: cfg, now: 'x', fetchImpl: fetchMock }),
    ).rejects.toThrow();
  });
});
