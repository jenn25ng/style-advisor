import type { Look, LookItem } from '../../types';
import { shopSearchUrl } from '../../config/shopConfig';

const ROLE_LABEL: Record<LookItem['role'], string> = {
  top: '상의', bottom: '하의', point: '포인트',
};

function ItemRow({ item }: { item: LookItem }) {
  return (
    <li className="look-item">
      <span className="look-dot" style={{ backgroundColor: item.hex }} aria-hidden="true" />
      <span className="look-item-text">
        {ROLE_LABEL[item.role]} · {item.name} — {item.itemType}
      </span>
      <a
        className="look-shop"
        href={shopSearchUrl(item.query)}
        target="_blank"
        rel="noopener noreferrer"
      >
        보러가기 →
      </a>
    </li>
  );
}

export function LookCard({ look }: { look: Look }) {
  return (
    <article className="look-card">
      <h4 className="look-title">{look.title}</h4>
      <p className="look-rationale">{look.rationale}</p>
      <ul className="look-items">
        <ItemRow item={look.top} />
        <ItemRow item={look.bottom} />
        <ItemRow item={look.point} />
      </ul>
    </article>
  );
}
