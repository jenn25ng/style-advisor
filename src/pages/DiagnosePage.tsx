import { useEffect, useRef, useState } from 'react';
import type { DiagnosisResult, PhotoHint } from '../types';
import { colorQuestions, frameQuestions } from '../data/questions';
import { useDiagnosisStore } from '../store/useDiagnosisStore';
import { StepCard } from '../components/Wizard/StepCard';
import { ProgressBar } from '../components/Wizard/ProgressBar';
import { PhotoColorPicker } from '../components/PhotoStep/PhotoColorPicker';

interface Props {
  onDone: (r: DiagnosisResult) => void;
}

// 컬러 문항(6) → 사진(1) → 골격 문항(5)
const PHOTO_STEP = colorQuestions.length;
const TOTAL = colorQuestions.length + 1 + frameQuestions.length;

export function DiagnosePage({ onDone }: Props) {
  const answers = useDiagnosisStore((s) => s.answers);
  const answer = useDiagnosisStore((s) => s.answer);
  const setPhotoHint = useDiagnosisStore((s) => s.setPhotoHint);
  const computeResult = useDiagnosisStore((s) => s.computeResult);
  const saveResult = useDiagnosisStore((s) => s.saveResult);
  const reset = useDiagnosisStore((s) => s.reset);

  const [step, setStep] = useState(0);

  // 새로 시작: 마운트 시 한 번만 초기화 (StrictMode 이중 호출 방지)
  const didReset = useRef(false);
  useEffect(() => {
    if (!didReset.current) {
      reset();
      didReset.current = true;
    }
  }, [reset]);

  function goNext() {
    const nextStep = step + 1;
    if (nextStep >= TOTAL) {
      const result = computeResult();
      saveResult(result);
      onDone(result);
    } else {
      setStep(nextStep);
    }
  }

  function currentQuestion() {
    if (step < PHOTO_STEP) return colorQuestions[step];
    return frameQuestions[step - PHOTO_STEP - 1];
  }

  function onSelectOption(id: string, index: number) {
    answer(id, index);
    goNext();
  }

  // 선택 없이 넘어가면 기본값(첫 옵션)으로 기록 후 진행
  function onManualNext(id: string) {
    if (answers[id] == null) answer(id, 0);
    goNext();
  }

  function onPhotoHint(h: PhotoHint) {
    setPhotoHint(h);
    goNext();
  }

  return (
    <main className="diagnose-page">
      <ProgressBar current={step + 1} total={TOTAL} />

      {step === PHOTO_STEP ? (
        <PhotoColorPicker onHint={onPhotoHint} onSkip={goNext} />
      ) : (
        (() => {
          const q = currentQuestion();
          return (
            <div className="question-step">
              <StepCard
                text={q.text}
                options={q.options.map((o) => o.label)}
                selected={answers[q.id] ?? null}
                onSelect={(i) => onSelectOption(q.id, i)}
              />
              <button
                type="button"
                className="next-btn"
                onClick={() => onManualNext(q.id)}
              >
                다음
              </button>
            </div>
          );
        })()
      )}
    </main>
  );
}
