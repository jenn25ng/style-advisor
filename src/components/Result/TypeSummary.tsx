import type { DiagnosisResult } from '../../types';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';
export function TypeSummary({ result }: { result: DiagnosisResult }) {
  const c = colorTypes.find((x) => x.id === result.colorType)!;
  const f = frameTypes.find((x) => x.id === result.frameType)!;
  return (
    <header className="type-summary">
      <h1>{c.name} · {f.name}</h1>
      <p className="impression">{c.impression}</p>
      <p className="rationale">왜 이 타입인가요? {result.rationale}</p>
      {result.photoHint && result.photoHint.hint !== 'neutral' && (
        <p className="photo-hint">사진 참고: {result.photoHint.hint === 'warm' ? '웜' : '쿨'} 경향 (참고용)</p>
      )}
    </header>
  );
}
