interface Props {
  text: string;
  options: string[];
  selected: number | null;
  onSelect: (index: number) => void;
}
export function StepCard({ text, options, selected, onSelect }: Props) {
  return (
    <div className="step-card">
      <h2 className="step-question">{text}</h2>
      <div className="step-options">
        {options.map((label, i) => (
          <button
            key={i}
            className={`option-btn ${selected === i ? 'selected' : ''}`}
            onClick={() => onSelect(i)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
