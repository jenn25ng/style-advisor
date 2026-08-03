// src/store/__tests__/useDiagnosisStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useDiagnosisStore } from '../useDiagnosisStore';

beforeEach(() => {
  localStorage.clear();
  useDiagnosisStore.getState().reset();
});

describe('useDiagnosisStore', () => {
  it('답변을 기록하고 결과를 계산한다', () => {
    const s = useDiagnosisStore.getState();
    s.answer('c-metal', 0); // 골드
    s.answer('c-white', 0); // 아이보리
    s.answer('c-depth', 0); // 밝고
    s.answer('c-clarity', 1); // 은은
    s.answer('f-collarbone', 0); // straight
    const result = useDiagnosisStore.getState().computeResult();
    expect(result.colorType).toContain('spring');
    expect(result.frameType).toBe('straight');
    expect(result.rationale.length).toBeGreaterThan(0);
  });

  it('결과를 localStorage에 저장하고 복원한다', () => {
    const s = useDiagnosisStore.getState();
    s.answer('c-metal', 1);
    const r = s.computeResult();
    s.saveResult(r);
    expect(JSON.parse(localStorage.getItem('sa:lastResult')!)).toMatchObject({
      colorType: r.colorType, frameType: r.frameType,
    });
  });

  it('파손된 localStorage는 조용히 무시한다', () => {
    localStorage.setItem('sa:lastResult', '{broken');
    expect(() => useDiagnosisStore.getState().loadResult()).not.toThrow();
    expect(useDiagnosisStore.getState().loadResult()).toBeNull();
  });

  it('알 수 없는 타입 id가 저장돼 있으면 null을 반환한다', () => {
    localStorage.setItem('sa:lastResult', JSON.stringify({ colorType: 'bogus', frameType: 'straight' }));
    expect(useDiagnosisStore.getState().loadResult()).toBeNull();
  });
});
