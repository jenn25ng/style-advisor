import type { DiagnosisResult } from '../../types';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';
import { confidenceLevel } from '../../engine/confidence';
export function TypeSummary({ result }: { result: DiagnosisResult }) {
  const c = colorTypes.find((x) => x.id === result.colorType)!;
  const f = frameTypes.find((x) => x.id === result.frameType)!;
  const conf = confidenceLevel(result);
  return (
    <header className="type-summary">
      <h1>{c.name} · {f.name}</h1>
      <p className="impression">{c.impression}</p>
      <p className="rationale">왜 이 타입인가요? {result.rationale}</p>
      {result.photoHint && result.photoHint.hint !== 'neutral' && (
        <p className="photo-hint">사진 참고: {result.photoHint.hint === 'warm' ? '웜' : '쿨'} 경향 (참고용)</p>
      )}
      <p className={`confidence confidence--${conf === '높음' ? 'high' : conf === '보통' ? 'mid' : 'low'}`}>
        진단 신뢰도 <strong>{conf}</strong>
      </p>
      <p className="disclaimer">
        ⓘ 자가진단 기반 <strong>참고용</strong> 결과예요 — 조명·화면·주관에 따라 실제와 다를 수 있어요.
      </p>
    </header>
  );
}
