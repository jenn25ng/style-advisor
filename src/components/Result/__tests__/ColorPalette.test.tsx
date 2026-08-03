// src/components/Result/__tests__/ColorPalette.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorPalette } from '../ColorPalette';

describe('ColorPalette', () => {
  it('색 스와치와 이름을 렌더한다', () => {
    render(<ColorPalette title="베스트 컬러" colors={[{ name: '피치', hex: '#F6B38A' }]} />);
    expect(screen.getByText('베스트 컬러')).toBeInTheDocument();
    expect(screen.getByText('피치')).toBeInTheDocument();
    const sw = screen.getByTestId('swatch-피치');
    expect(sw).toHaveStyle({ backgroundColor: '#F6B38A' });
  });
});
