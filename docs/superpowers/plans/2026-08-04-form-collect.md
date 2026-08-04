# 구글폼 결과 수집 — 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 결과 페이지에서 사용자가 버튼을 눌러 동의하면 진단 결과(익명)를 구글폼으로 전송한다. 폼 미설정 시 버튼 숨김.

**Architecture:** 설정(config)·순수 페이로드 빌더(engine)·전송 래퍼(lib)·UI(component)로 분리. 서버 없음. 기존 구조·톤 준수.

**근거:** `docs/superpowers/specs/2026-08-04-form-collect-design.md`

---

## Task F1: 설정 + 페이로드 빌더

**Files:**
- Create: `src/config/formConfig.ts`
- Create: `src/engine/formPayload.ts`
- Test: `src/engine/__tests__/formPayload.test.ts`

- [ ] **Step 1: 실패 테스트 작성**
```typescript
// src/engine/__tests__/formPayload.test.ts
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
```

- [ ] **Step 2: 실패 확인** `npx vitest run src/engine/__tests__/formPayload.test.ts`

- [ ] **Step 3: 구현**
`src/config/formConfig.ts`:
```typescript
export interface FormConfig {
  actionUrl: string;
  fields: {
    colorType: string; frameType: string; timestamp: string;
    warmCool: string; value: string; chroma: string;
    straight: string; wave: string; natural: string;
  };
}
export const formConfig: FormConfig = {
  actionUrl: '',
  fields: {
    colorType: '', frameType: '', timestamp: '',
    warmCool: '', value: '', chroma: '',
    straight: '', wave: '', natural: '',
  },
};
export const isFormConfigured = (cfg: FormConfig = formConfig): boolean =>
  cfg.actionUrl !== '' && Object.values(cfg.fields).every((v) => v !== '');
```
`src/engine/formPayload.ts`:
```typescript
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
```

- [ ] **Step 4: 통과 확인** `npx vitest run src/engine/__tests__/formPayload.test.ts` → PASS. `npx tsc --noEmit` clean.
- [ ] **Step 5: Commit** `feat: 폼 설정 + 결과→구글폼 페이로드 빌더`

---

## Task F2: 전송 래퍼 + isFormConfigured 테스트

**Files:**
- Create: `src/lib/submitResult.ts`
- Test: `src/lib/__tests__/submitResult.test.ts`

- [ ] **Step 1: 실패 테스트 작성**
```typescript
// src/lib/__tests__/submitResult.test.ts
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
```

- [ ] **Step 2: 실패 확인** `npx vitest run src/lib/__tests__/submitResult.test.ts`

- [ ] **Step 3: 구현** `src/lib/submitResult.ts`:
```typescript
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
```
※ 테스트에서 `now: 'x'`를 넘기므로 기본 `new Date()`는 테스트 경로에서 실행되지 않음(주입값 우선).

- [ ] **Step 4: 통과 확인** `npx vitest run src/lib/__tests__/submitResult.test.ts` → PASS. 전체 `npx vitest run`.
- [ ] **Step 5: Commit** `feat: 결과 전송 래퍼(no-cors) + isFormConfigured 테스트`

---

## Task F3: ShareResult 컴포넌트 + 결과 통합

**Files:**
- Create: `src/components/Result/ShareResult.tsx`
- Modify: `src/pages/ResultPage.tsx` (Lookbook 아래 `<ShareResult result={result} />`)
- Modify: `src/index.css` (공유 섹션 스타일 append)
- Test: `src/components/Result/__tests__/ShareResult.test.tsx`

- [ ] **Step 1: 실패 테스트 작성**
```tsx
// src/components/Result/__tests__/ShareResult.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareResult } from '../ShareResult';
import type { DiagnosisResult } from '../../types';

const result: DiagnosisResult = {
  colorType: 'spring-bright', frameType: 'straight',
  colorScore: { warmCool: 4, value: 1, chroma: 3 },
  frameScore: { straight: 6, wave: 0, natural: 0 }, rationale: 'x',
};

beforeEach(() => localStorage.clear());

describe('ShareResult', () => {
  it('폼 미설정이면 아무것도 렌더하지 않는다', () => {
    const { container } = render(
      <ShareResult result={result} configured={false} submit={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('설정되면 버튼 노출, 클릭 시 submit 호출 후 완료 상태', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    render(<ShareResult result={result} configured={true} submit={submit} />);
    const btn = screen.getByRole('button', { name: /결과 공유/ });
    await userEvent.click(btn);
    expect(submit).toHaveBeenCalledWith(result);
    expect(await screen.findByText(/공유 완료/)).toBeInTheDocument();
  });
  it('submit 실패 시 에러 안내와 재시도 버튼을 보인다', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('net'));
    render(<ShareResult result={result} configured={true} submit={submit} />);
    await userEvent.click(screen.getByRole('button', { name: /결과 공유/ }));
    expect(await screen.findByText(/다시 시도/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인** `npx vitest run src/components/Result/__tests__/ShareResult.test.tsx`

- [ ] **Step 3: 구현** `src/components/Result/ShareResult.tsx`:
- Props: `{ result: DiagnosisResult; configured?: boolean; submit?: (r: DiagnosisResult) => Promise<void> }`.
  - 기본값: `configured = isFormConfigured()`, `submit = (r) => submitResult(r)` (import). 테스트는 주입.
- `configured === false` → `return null`.
- 상태 `status: 'idle'|'sending'|'done'|'error'`. 마운트 시 localStorage 키 `sa:shared:<result.timestamp근사>` 대신 결과 식별자로 `sa:shared:${result.colorType}:${result.frameType}` 확인 → 있으면 `done`으로 시작.
  - (주의: DiagnosisResult에는 timestamp 필드가 없음. 중복 방지 키는 `sa:shared:${colorType}:${frameType}` 사용.)
- 버튼 클릭 → `status='sending'` → `await submit(result)` → 성공 시 `done` + localStorage 플래그 set; 실패 시 `error`.
- 렌더:
  - idle: `<button>결과 공유하기 (익명)</button>` + `<p class="share-note">익명으로 전송돼요. 개인정보는 보내지 않아요.</p>`
  - sending: 버튼 비활성 "전송 중…"
  - done: `<p class="share-done">공유 완료 · 감사합니다 🙌</p>`
  - error: 안내 `<p>전송에 실패했어요.</p>` + `<button>다시 시도</button>`
- 최상위 `<section className="share-result">`.

`src/pages/ResultPage.tsx`: import ShareResult, `<Lookbook>` 아래에 `<ShareResult result={result} />`.
`src/index.css`(append): `.share-result{margin:8px 0 24px;text-align:center;} .share-note{margin:8px 0 0;font-size:.78rem;color:var(--text);} .share-done{font-weight:600;color:var(--accent-strong);}`

- [ ] **Step 4: 통과 확인** `npx vitest run src/components/Result/__tests__/ShareResult.test.tsx` → PASS. 전체 `npx vitest run`(기존 + 신규) 및 `npm run build`, `npx tsc --noEmit`.
- [ ] **Step 5: Commit** `feat: 결과 공유 버튼(ShareResult) + 결과 페이지 통합`

---

## Task F4: 브라우저 검증 + 폼 안내

- [ ] dev 서버에서 결과 페이지 확인 → **미설정이므로 공유 버튼이 안 보여야 정상**(기존 화면과 동일). 콘솔 에러 없음.
- [ ] (선택) `formConfig`에 더미 값 임시 주입 후 버튼 노출·클릭 상태전환 육안 확인 → 확인 후 되돌림(커밋하지 않음).
- [ ] 사용자에게 만들 **구글폼 문항 목록** 안내(아래) 제공.

**사용자가 만들 구글폼 문항 (단답형 9개):**
`colorType`, `frameType`, `timestamp`, `warmCool`, `value`, `chroma`, `straight`, `wave`, `natural`
→ 폼 생성 후 각 문항의 `entry.<id>`와 formResponse URL을 받아 `formConfig.ts`에 채우면 활성화.

## 완료 기준
- 미설정 상태에서 앱 정상(버튼 숨김), 전체 테스트/빌드 통과.
- 페이로드·전송·컴포넌트 상태 전이 테스트 통과.
- 폼 값만 채우면 즉시 동작하는 구조.
