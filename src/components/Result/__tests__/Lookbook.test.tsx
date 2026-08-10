import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Lookbook } from '../Lookbook';
import { frameFitTip } from '../../../config/shopConfig';
import type { DiagnosisResult } from '../../../types';

const result: DiagnosisResult = {
  colorType: 'spring-bright', frameType: 'natural',
  colorScore: { warmCool: 4, value: 1, chroma: 3 },
  frameScore: { straight: 0, wave: 0, natural: 5 }, rationale: 'x',
};

describe('Lookbook', () => {
  it('골격별 핏 포인트 문구를 노출한다', () => {
    render(<Lookbook result={result} />);
    expect(screen.getByText(new RegExp(frameFitTip.natural.slice(0, 10)))).toBeInTheDocument();
  });
});
