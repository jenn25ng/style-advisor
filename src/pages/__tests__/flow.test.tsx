// src/pages/__tests__/flow.test.tsx
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from '../../App';
import { useDiagnosisStore } from '../../store/useDiagnosisStore';

beforeEach(() => { localStorage.clear(); useDiagnosisStore.getState().reset(); });

describe('전체 플로우', () => {
  it('시작 → 모든 문항 응답 → 결과 페이지에 타입이 보인다', async () => {
    render(<App />);
    await userEvent.click(screen.getByRole('button', { name: /진단 시작/ }));

    for (let i = 0; i < 20; i++) {
      const next = screen.queryAllByRole('button');
      const opt = next.find((b) => /골드|아이보리|밝고|선명|은은|잘 안|둥글|근육|상반신|탄력|건너뛰기|다음/.test(b.textContent ?? ''));
      if (!opt) break;
      await userEvent.click(opt);
    }
    expect(await screen.findByText(/왜 이 타입인가요/)).toBeInTheDocument();
  });
});
