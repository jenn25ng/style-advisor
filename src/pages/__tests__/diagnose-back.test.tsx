import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DiagnosePage } from '../DiagnosePage';
import { useDiagnosisStore } from '../../store/useDiagnosisStore';

beforeEach(() => { useDiagnosisStore.getState().reset(); });

describe('DiagnosePage 이전 버튼', () => {
  it('첫 문항에서는 이전 버튼이 없고, 한 스텝 진행 후 이전으로 돌아가면 첫 문항이 다시 보인다', async () => {
    render(<DiagnosePage onDone={vi.fn()} />);
    // 첫 문항 텍스트 확보
    const firstQuestion = document.querySelector('.step-question')?.textContent ?? '';
    expect(firstQuestion.length).toBeGreaterThan(0);
    expect(screen.queryByRole('button', { name: '이전' })).toBeNull();
    // 첫 문항의 첫 옵션 클릭 → 자동 진행
    const firstOption = screen.getAllByRole('button').find((b) => b.className.includes('option-btn'));
    await userEvent.click(firstOption!);
    // 이제 이전 버튼이 보이고, 클릭하면 첫 문항으로 복귀
    const back = await screen.findByRole('button', { name: '이전' });
    await userEvent.click(back);
    expect(document.querySelector('.step-question')?.textContent).toBe(firstQuestion);
  });
});
