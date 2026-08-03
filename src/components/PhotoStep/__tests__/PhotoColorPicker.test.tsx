import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhotoColorPicker } from '../PhotoColorPicker';

describe('PhotoColorPicker', () => {
  it('건너뛰기 버튼은 onSkip을 부른다', async () => {
    const onSkip = vi.fn();
    render(<PhotoColorPicker onHint={vi.fn()} onSkip={onSkip} />);
    await userEvent.click(screen.getByRole('button', { name: /건너뛰기/ }));
    expect(onSkip).toHaveBeenCalled();
  });
  it('이미지가 아닌 파일은 거부 메시지를 표시한다', async () => {
    render(<PhotoColorPicker onHint={vi.fn()} onSkip={vi.fn()} />);
    const input = screen.getByLabelText(/사진 업로드/) as HTMLInputElement;
    const bad = new File(['x'], 'a.txt', { type: 'text/plain' });
    await userEvent.upload(input, bad);
    expect(await screen.findByText(/이미지 파일/)).toBeInTheDocument();
  });
});
