import { useEffect, useState } from 'react';
import type { DiagnosisResult } from './types';
import { useDiagnosisStore } from './store/useDiagnosisStore';
import { StartPage } from './pages/StartPage';
import { DiagnosePage } from './pages/DiagnosePage';
import { ResultPage } from './pages/ResultPage';
import './App.css';

type Phase = 'start' | 'diagnose' | 'result';

export function App() {
  const [phase, setPhase] = useState<Phase>('start');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const loadResult = useDiagnosisStore((s) => s.loadResult);

  // 마운트 시 저장된 결과가 있으면 불러오되, 시작 화면에 머문다.
  useEffect(() => {
    const saved = loadResult();
    if (saved) setResult(saved);
  }, [loadResult]);

  if (phase === 'diagnose') {
    return (
      <DiagnosePage
        onDone={(r) => {
          setResult(r);
          setPhase('result');
        }}
      />
    );
  }

  if (phase === 'result' && result) {
    return <ResultPage result={result} onRestart={() => setPhase('diagnose')} />;
  }

  return (
    <StartPage
      hasSaved={result !== null}
      onStart={() => setPhase('diagnose')}
      onViewSaved={() => {
        if (result) setPhase('result');
      }}
    />
  );
}

export default App;
