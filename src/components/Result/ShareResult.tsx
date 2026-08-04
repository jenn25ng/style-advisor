import { useEffect, useState } from 'react';
import type { DiagnosisResult } from '../../types';
import { isFormConfigured } from '../../config/formConfig';
import { submitResult } from '../../lib/submitResult';

interface Props {
  result: DiagnosisResult;
  configured?: boolean;
  submit?: (r: DiagnosisResult) => Promise<void>;
}

type Status = 'idle' | 'sending' | 'done' | 'error';

export function ShareResult({
  result,
  configured = isFormConfigured(),
  submit = (r) => submitResult(r),
}: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const storageKey = `sa:shared:${result.colorType}:${result.frameType}`;

  useEffect(() => {
    try {
      if (localStorage.getItem(storageKey)) setStatus('done');
    } catch {
      // localStorage 접근 불가 시 무시
    }
  }, [storageKey]);

  if (configured === false) return null;

  const handleShare = async () => {
    setStatus('sending');
    try {
      await submit(result);
      setStatus('done');
      try {
        localStorage.setItem(storageKey, '1');
      } catch {
        // 저장 실패는 무시
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <section className="share-result">
      {status === 'idle' && (
        <>
          <button type="button" className="primary" onClick={handleShare}>
            결과 공유하기 (익명)
          </button>
          <p className="share-note">익명으로 전송돼요. 개인정보는 보내지 않아요.</p>
        </>
      )}
      {status === 'sending' && (
        <button type="button" disabled>
          전송 중…
        </button>
      )}
      {status === 'done' && <p className="share-done">공유 완료 · 감사합니다 🙌</p>}
      {status === 'error' && (
        <>
          <p>전송에 실패했어요.</p>
          <button type="button" className="primary" onClick={handleShare}>
            다시 시도
          </button>
        </>
      )}
    </section>
  );
}
