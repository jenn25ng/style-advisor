import type { ReactElement } from 'react';
import type { Look, FrameTypeId } from '../../types';
import { frameSilhouette } from '../../data/lookShapes';

interface Props {
  look: Look;
  frame: FrameTypeId;
}

const STROKE = '#00000022';

export function LookCard({ look, frame }: Props) {
  const sil = frameSilhouette[frame];
  const cx = 50;

  // --- 상의(Top) ---------------------------------------------------------
  // 어깨/소매 rect + 몸통. topWidth 로 몸통 폭 결정.
  const topHalf = sil.topWidth / 2;
  const topLeft = cx - topHalf;
  const topY = 8;
  // fitted 는 밑단이 좁아지고, oversized 는 더 길고 넓게.
  const bodyBottomHalf =
    sil.top === 'fitted' ? topHalf * 0.7 : topHalf;
  const bodyBottomY = sil.top === 'oversized' ? 60 : 56;
  const bodyPath = [
    `M ${topLeft} ${topY + 6}`,
    `L ${cx + topHalf} ${topY + 6}`,
    `L ${cx + bodyBottomHalf} ${bodyBottomY}`,
    `L ${cx - bodyBottomHalf} ${bodyBottomY}`,
    'Z',
  ].join(' ');
  // 어깨 폭은 몸통보다 살짝 넓게(소매 표현).
  const shoulderHalf = topHalf + (sil.top === 'oversized' ? 8 : 5);

  // --- 하의(Bottom) ------------------------------------------------------
  const bottomTopY = 60;
  const hemY = 110;
  const hemHalf = sil.hemWidth / 2;
  const waistHalf = Math.min(topHalf, 20);

  let bottomShapes: ReactElement;
  if (sil.bottom === 'flare-skirt') {
    // 허리에서 밑단으로 넓어지는 사다리꼴.
    const skirtPath = [
      `M ${cx - waistHalf} ${bottomTopY}`,
      `L ${cx + waistHalf} ${bottomTopY}`,
      `L ${cx + hemHalf} ${hemY}`,
      `L ${cx - hemHalf} ${hemY}`,
      'Z',
    ].join(' ');
    bottomShapes = (
      <path d={skirtPath} fill={look.bottom.hex} stroke={STROKE} strokeWidth={1} />
    );
  } else {
    // straight-pants / wide-pants: 두 다리 rect. hemWidth 로 다리 폭.
    const legW = (sil.hemWidth / 2) * (sil.bottom === 'wide-pants' ? 0.9 : 0.7);
    const gap = 3;
    const leftLegX = cx - gap / 2 - legW;
    const rightLegX = cx + gap / 2;
    bottomShapes = (
      <>
        <rect
          x={leftLegX}
          y={bottomTopY}
          width={legW}
          height={hemY - bottomTopY}
          fill={look.bottom.hex}
          stroke={STROKE}
          strokeWidth={1}
        />
        <rect
          x={rightLegX}
          y={bottomTopY}
          width={legW}
          height={hemY - bottomTopY}
          fill={look.bottom.hex}
          stroke={STROKE}
          strokeWidth={1}
        />
      </>
    );
  }

  // --- 포인트(Point): 작은 신발/가방 ------------------------------------
  const pointY = 116;

  const ariaLabel = `${look.theme} 룩: 상의 ${look.top.name}, 하의 ${look.bottom.name}, 포인트 ${look.point.name}`;

  return (
    <article className="look-card">
      <svg
        role="img"
        aria-label={ariaLabel}
        viewBox="0 0 100 130"
        className="look-figure"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 어깨/소매 */}
        <rect
          x={cx - shoulderHalf}
          y={topY}
          width={shoulderHalf * 2}
          height={10}
          rx={3}
          fill={look.top.hex}
          stroke={STROKE}
          strokeWidth={1}
        />
        {/* 몸통 */}
        <path d={bodyPath} fill={look.top.hex} stroke={STROKE} strokeWidth={1} />
        {/* 하의 */}
        {bottomShapes}
        {/* 포인트: 두 개의 작은 신발 */}
        <rect
          x={cx - 16}
          y={pointY}
          width={12}
          height={7}
          rx={3}
          fill={look.point.hex}
          stroke={STROKE}
          strokeWidth={1}
        />
        <rect
          x={cx + 4}
          y={pointY}
          width={12}
          height={7}
          rx={3}
          fill={look.point.hex}
          stroke={STROKE}
          strokeWidth={1}
        />
      </svg>

      <p className="look-theme">{look.theme}</p>
      <div className="look-items">
        <span className="look-item">
          <span
            className="look-dot"
            aria-hidden="true"
            style={{ background: look.top.hex }}
          />
          상의 · {look.top.name}
        </span>
        <span className="look-item">
          <span
            className="look-dot"
            aria-hidden="true"
            style={{ background: look.bottom.hex }}
          />
          하의 · {look.bottom.name}
        </span>
        <span className="look-item">
          <span
            className="look-dot"
            aria-hidden="true"
            style={{ background: look.point.hex }}
          />
          포인트 · {look.point.name}
        </span>
      </div>
      <p className="look-fit">{look.fitLabel}</p>
    </article>
  );
}
