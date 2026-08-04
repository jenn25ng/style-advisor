import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareResult } from '../ShareResult';
import type { DiagnosisResult } from '../../../types';

const result: DiagnosisResult = {
  colorType: 'spring-bright', frameType: 'straight',
  colorScore: { warmCool: 4, value: 1, chroma: 3 },
  frameScore: { straight: 6, wave: 0, natural: 0 }, rationale: 'x',
};

beforeEach(() => localStorage.clear());

describe('ShareResult', () => {
  it('폼 미설정이면 아무것도 렌더하지 않는다', () => {
    const { container } = render(
      <ShareResult result={result} configured={false} submit={vi.fn()} />,
    );
    expect(container).toBeEmptyDOMElement();
  });
  it('설정되면 버튼 노출, 클릭 시 submit 호출 후 완료 상태', async () => {
    const submit = vi.fn().mockResolvedValue(undefined);
    render(<ShareResult result={result} configured={true} submit={submit} />);
    const btn = screen.getByRole('button', { name: /결과 공유/ });
    await userEvent.click(btn);
    expect(submit).toHaveBeenCalledWith(result);
    expect(await screen.findByText(/공유 완료/)).toBeInTheDocument();
  });
  it('submit 실패 시 에러 안내와 재시도 버튼을 보인다', async () => {
    const submit = vi.fn().mockRejectedValue(new Error('net'));
    render(<ShareResult result={result} configured={true} submit={submit} />);
    await userEvent.click(screen.getByRole('button', { name: /결과 공유/ }));
    expect(await screen.findByText(/다시 시도/)).toBeInTheDocument();
  });
});
