interface Props {
  hasSaved: boolean;
  onStart: () => void;
  onViewSaved: () => void;
}

export function StartPage({ hasSaved, onStart, onViewSaved }: Props) {
  return (
    <section className="start-page">
      <h1>퍼스널 스타일 어드바이저</h1>
      <p className="intro">
        몇 가지 질문에 답하면 어울리는 컬러와 체형별 스타일 가이드를 알려드려요.
        사진은 브라우저 안에서만 쓰이고 서버로 전송되지 않아요.
      </p>
      <div className="start-actions">
        <button type="button" className="primary" onClick={onStart}>
          진단 시작
        </button>
        {hasSaved && (
          <button type="button" className="secondary" onClick={onViewSaved}>
            저장된 결과 보기
          </button>
        )}
      </div>
    </section>
  );
}
