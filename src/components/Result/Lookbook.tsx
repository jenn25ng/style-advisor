import type { DiagnosisResult } from '../../types';
import { buildLooks } from '../../engine/lookBuilder';
import { LookCard } from './LookCard';

interface Props {
  result: DiagnosisResult;
}

export function Lookbook({ result }: Props) {
  const looks = buildLooks(result.colorType, result.frameType);
  return (
    <section className="lookbook">
      <h3>이렇게 입어보세요</h3>
      <div className="looks">
        {looks.map((lk, i) => (
          <LookCard key={i} look={lk} frame={result.frameType} />
        ))}
      </div>
    </section>
  );
}
