import type { DiagnosisResult } from '../types';
import { formConfig, type FormConfig } from '../config/formConfig';
import { buildFormBody } from '../engine/formPayload';

interface Options {
  config?: FormConfig;
  now?: string;
  fetchImpl?: typeof fetch;
}

export async function submitResult(
  result: DiagnosisResult,
  opts: Options = {},
): Promise<void> {
  const cfg = opts.config ?? formConfig;
  const now = opts.now ?? new Date().toISOString();
  const doFetch = opts.fetchImpl ?? fetch;
  const body = buildFormBody(result, cfg, now);
  await doFetch(cfg.actionUrl, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
}
