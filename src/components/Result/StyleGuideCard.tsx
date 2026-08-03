import type { StyleGuide } from '../../types';
export function StyleGuideCard({ guide }: { guide: StyleGuide }) {
  return (
    <section className="guide-card">
      <p className="tip">{guide.oneLineTip}</p>
      <dl>
        <dt>소재</dt><dd>{guide.fabrics.join(', ')}</dd>
        <dt>핏</dt><dd>{guide.fits.join(', ')}</dd>
        <dt>실루엣</dt><dd>{guide.silhouettes.join(', ')}</dd>
        <dt>추천 아이템</dt><dd>{guide.bestItems.join(', ')}</dd>
        <dt>피할 것</dt><dd>{guide.avoidItems.join(', ')}</dd>
      </dl>
    </section>
  );
}
