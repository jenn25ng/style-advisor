import type { DiagnosisResult } from '../../types';
import { buildLooks } from '../../engine/lookBuilder';
import { frameFitTip } from '../../config/shopConfig';
import { LookCard } from './LookCard';

interface Props {
  result: DiagnosisResult;
}

export function Lookbook({ result }: Props) {
  const looks = buildLooks(result.colorType, result.frameType);
  return (
    <section className="lookbook">
      <h3>이렇게 입어보세요</h3>
      <p className="fit-tip">👗 핏 포인트 — {frameFitTip[result.frameType]}</p>
      <div className="looks">
        {looks.map((lk, i) => (
          <LookCard key={i} look={lk} />
        ))}
      </div>
    </section>
  );
}
