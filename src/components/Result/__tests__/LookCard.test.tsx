import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LookCard } from '../LookCard';
import type { Look } from '../../../types';

const look: Look = {
  kind: 'basic',
  title: '기본 조합',
  rationale: '실패 없는 데일리 — 안정적인 기본 조합.',
  top: { role: 'top', name: '코랄', hex: '#FF6F61', itemType: '셔츠', query: '코랄 셔츠' },
  bottom: { role: 'bottom', name: '네이비', hex: '#26324A', itemType: '스트레이트 팬츠', query: '네이비 스트레이트 팬츠' },
  point: { role: 'point', name: '골드', hex: '#F7C948', itemType: '가방', query: '골드 가방' },
};

describe('LookCard v2', () => {
  it('제목·근거·아이템 색이름/종류를 렌더한다', () => {
    render(<LookCard look={look} />);
    expect(screen.getByText('기본 조합')).toBeInTheDocument();
    expect(screen.getByText(/실패 없는 데일리/)).toBeInTheDocument();
    expect(screen.getByText(/코랄/)).toBeInTheDocument();
    expect(screen.getByText(/셔츠/)).toBeInTheDocument();
  });
  it('각 아이템에 네이버쇼핑 검색 링크(새 탭)를 건다', () => {
    render(<LookCard look={look} />);
    const links = screen.getAllByRole('link', { name: /보러가기/ });
    expect(links).toHaveLength(3);
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('google.com/search'));
    expect(links[0]).toHaveAttribute('href', expect.stringContaining(encodeURIComponent('코랄 셔츠')));
    expect(links[0]).toHaveAttribute('target', '_blank');
    expect(links[0]).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });
});
