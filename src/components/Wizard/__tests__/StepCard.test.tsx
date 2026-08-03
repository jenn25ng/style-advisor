import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { StepCard } from '../StepCard';

describe('StepCard', () => {
  it('질문과 선택지를 렌더하고, 선택 시 콜백을 부른다', async () => {
    const onSelect = vi.fn();
    render(
      <StepCard
        text="금/은 중 어울리는 쪽은?"
        options={['골드', '실버']}
        selected={null}
        onSelect={onSelect}
      />,
    );
    expect(screen.getByText('금/은 중 어울리는 쪽은?')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: '골드' }));
    expect(onSelect).toHaveBeenCalledWith(0);
  });
});
