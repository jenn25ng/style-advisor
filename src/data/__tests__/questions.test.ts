import { describe, it, expect } from 'vitest';
import { colorQuestions, frameQuestions } from '../questions';

describe('questions', () => {
  it('색 문항은 3축(warmCool/value/chroma)을 모두 다룬다', () => {
    const axes = new Set<string>();
    colorQuestions.forEach((q) =>
      q.options.forEach((o) => Object.keys(o.scores).forEach((a) => axes.add(a))),
    );
    expect(axes).toEqual(new Set(['warmCool', 'value', 'chroma']));
  });
  it('골격 문항은 3타입 모두에 투표 가능하고 쇄골 문항이 존재한다', () => {
    const voted = new Set<string>();
    frameQuestions.forEach((q) =>
      q.options.forEach((o) => Object.keys(o.votes).forEach((v) => voted.add(v))),
    );
    expect(voted).toEqual(new Set(['straight', 'wave', 'natural']));
    expect(frameQuestions.some((q) => q.key === 'collarbone')).toBe(true);
  });
  it('모든 문항 id는 유일하다', () => {
    const ids = [...colorQuestions, ...frameQuestions].map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
  it('문항 개수: 색 10 + 골격 8 (판별 문항 보강)', () => {
    expect(colorQuestions.length).toBe(10);
    expect(frameQuestions.length).toBe(8);
  });
  it('판별 강화 문항이 포함된다(c-face 가중치2, f-gain votes2)', () => {
    const face = colorQuestions.find((q) => q.id === 'c-face');
    expect(face?.weight).toBe(2);
    const gain = frameQuestions.find((q) => q.id === 'f-gain');
    const maxVote = Math.max(
      ...gain!.options.flatMap((o) => Object.values(o.votes)),
    );
    expect(maxVote).toBe(2);
  });
});
