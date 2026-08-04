import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LookCard } from '../LookCard';
import type { Look } from '../../../types';

const look: Look = {
  theme: '데일리',
  top: { role: 'top', name: '브라이트 코랄', hex: '#FF6F61' },
  bottom: { role: 'bottom', name: '네이비', hex: '#26324A' },
  point: { role: 'point', name: '클리어 골든 옐로', hex: '#F7C948' },
  fitLabel: 'I라인 · 저스트사이즈',
};

describe('LookCard', () => {
  it('테마·핏 라벨과 각 아이템 색 이름을 텍스트로 렌더한다', () => {
    render(<LookCard look={look} frame="straight" />);
    expect(screen.getByText('데일리')).toBeInTheDocument();
    expect(screen.getByText(/브라이트 코랄/)).toBeInTheDocument();
    expect(screen.getByText(/네이비/)).toBeInTheDocument();
    expect(screen.getByText(/클리어 골든 옐로/)).toBeInTheDocument();
    expect(screen.getByText(/I라인/)).toBeInTheDocument();
  });
  it('SVG에 aria-label이 있다(접근성)', () => {
    render(<LookCard look={look} frame="straight" />);
    expect(screen.getByRole('img')).toHaveAttribute('aria-label');
  });
});
