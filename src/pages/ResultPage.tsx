import type { DiagnosisResult } from '../types';
import { buildGuide } from '../engine/guideBuilder';
import { TypeSummary } from '../components/Result/TypeSummary';
import { ColorPalette } from '../components/Result/ColorPalette';
import { StyleGuideCard } from '../components/Result/StyleGuideCard';
import { Lookbook } from '../components/Result/Lookbook';

interface Props {
  result: DiagnosisResult;
  onRestart: () => void;
}

export function ResultPage({ result, onRestart }: Props) {
  const guide = buildGuide(result.colorType, result.frameType);

  return (
    <main className="result-page">
      <TypeSummary result={result} />
      <ColorPalette title="어울리는 색" colors={guide.palette} />
      <ColorPalette title="피해야 할 색" colors={guide.avoidColors} />
      <StyleGuideCard guide={guide} />
      <Lookbook result={result} />

      <div className="result-actions">
        <button type="button" className="primary" onClick={onRestart}>
          다시 진단
        </button>
      </div>
      <p className="save-note">결과는 이 기기(브라우저)에 저장돼요.</p>
    </main>
  );
}
