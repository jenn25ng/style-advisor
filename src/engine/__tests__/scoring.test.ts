import { describe, it, expect } from 'vitest';
import { scoreColor, scoreFrame, classifyColor, classifyFrame } from '../scoring';
import { colorQuestions, frameQuestions } from '../../data/questions';
import type { Answers } from '../../types';

function pick(questions: { id: string; options: { label: string }[] }[], byLabel: Record<string, string>): Answers {
  const a: Answers = {};
  for (const q of questions) {
    const wanted = byLabel[q.id];
    if (wanted == null) continue;
    const idx = q.options.findIndex((o) => o.label.startsWith(wanted));
    if (idx >= 0) a[q.id] = idx;
  }
  return a;
}

describe('scoreColor', () => {
  it('웜·밝음·부드러움 답변은 spring-light로 분류된다', () => {
    const answers = pick(colorQuestions, {
      'c-metal': '골드', 'c-white': '아이보리', 'c-vein': '초록',
      'c-depth': '밝고', 'c-contrast': '부드러운', 'c-clarity': '은은',
    });
    const score = scoreColor(answers);
    expect(score.warmCool).toBeGreaterThan(0);
    expect(score.value).toBeGreaterThan(0);
    expect(classifyColor(score)).toBe('spring-light');
  });

  it('쿨·어두움·선명 답변은 winter-deep로 분류된다', () => {
    const answers = pick(colorQuestions, {
      'c-metal': '실버', 'c-white': '퓨어', 'c-vein': '파랑',
      'c-depth': '깊고', 'c-contrast': '뚜렷', 'c-clarity': '선명',
    });
    const score = scoreColor(answers);
    expect(score.warmCool).toBeLessThan(0);
    expect(score.value).toBeLessThan(0);
    expect(classifyColor(score)).toBe('winter-deep');
  });

  it('혈관 문항(weight 0.5)은 금속 문항보다 영향이 작다', () => {
    const onlyVeinWarm = scoreColor(pick(colorQuestions, { 'c-vein': '초록' }));
    const onlyMetalWarm = scoreColor(pick(colorQuestions, { 'c-metal': '골드' }));
    expect(Math.abs(onlyVeinWarm.warmCool)).toBeLessThan(Math.abs(onlyMetalWarm.warmCool));
  });
});

describe('scoreFrame', () => {
  it('스트레이트 위주 답변은 straight로 분류된다', () => {
    const a = pick(frameQuestions, {
      'f-collarbone': '잘 안', 'f-wrist': '둥글', 'f-flesh': '근육',
      'f-volume': '상반신', 'f-skin': '탄력',
    });
    expect(classifyFrame(scoreFrame(a), a)).toBe('straight');
  });

  it('동점이면 쇄골 문항으로 타이브레이크된다', () => {
    const a = pick(frameQuestions, {
      'f-wrist': '둥글',
      'f-skin': '건조',
      'f-collarbone': '두껍',
    });
    const score = scoreFrame(a);
    expect(classifyFrame(score, a)).toBe('natural');
  });
});
