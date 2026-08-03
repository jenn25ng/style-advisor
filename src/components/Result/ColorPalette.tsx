import type { Swatch } from '../../types';
export function ColorPalette({ title, colors }: { title: string; colors: Swatch[] }) {
  return (
    <section className="palette">
      <h3>{title}</h3>
      <div className="swatches">
        {colors.map((c) => (
          <figure key={c.hex + c.name} className="swatch-item">
            <div data-testid={`swatch-${c.name}`} className="swatch" style={{ backgroundColor: c.hex }} />
            <figcaption>{c.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
