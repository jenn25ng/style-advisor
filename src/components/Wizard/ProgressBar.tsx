export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress" aria-label={`진행률 ${pct}%`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
