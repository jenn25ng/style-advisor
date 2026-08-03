import type { Answers, ColorScore, FrameScore, ColorTypeId, FrameTypeId, Season } from '../types';
import { colorQuestions, frameQuestions } from '../data/questions';

export function scoreColor(answers: Answers): ColorScore {
  const s: ColorScore = { warmCool: 0, value: 0, chroma: 0 };
  for (const q of colorQuestions) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    const w = q.weight ?? 1;
    for (const [axis, v] of Object.entries(opt.scores)) {
      s[axis as keyof ColorScore] += (v as number) * w;
    }
  }
  return s;
}

export function classifyColor(s: ColorScore): ColorTypeId {
  const warm = s.warmCool >= 0;
  let season: Season;
  if (warm) season = s.value >= 0 ? 'spring' : 'autumn';
  else season = s.chroma >= 0 ? 'winter' : 'summer';

  switch (season) {
    case 'spring': return s.chroma >= 0 ? 'spring-bright' : 'spring-light';
    case 'autumn': return s.value <= -2 ? 'autumn-deep' : 'autumn-mute';
    case 'summer': return s.value >= 0 ? 'summer-light' : 'summer-mute';
    case 'winter': return s.value <= 0 ? 'winter-deep' : 'winter-bright';
  }
}

export function scoreFrame(answers: Answers): FrameScore {
  const s: FrameScore = { straight: 0, wave: 0, natural: 0 };
  for (const q of frameQuestions) {
    const idx = answers[q.id];
    if (idx == null) continue;
    const opt = q.options[idx];
    if (!opt) continue;
    for (const [id, v] of Object.entries(opt.votes)) {
      s[id as keyof FrameScore] += v as number;
    }
  }
  return s;
}

export function classifyFrame(s: FrameScore, answers: Answers): FrameTypeId {
  const max = Math.max(s.straight, s.wave, s.natural);
  const leaders = (['straight', 'wave', 'natural'] as FrameTypeId[]).filter((id) => s[id] === max);
  if (leaders.length === 1) return leaders[0];

  const collar = frameQuestions.find((q) => q.key === 'collarbone');
  if (collar && answers[collar.id] != null) {
    const opt = collar.options[answers[collar.id]];
    const picked = Object.keys(opt.votes)[0] as FrameTypeId | undefined;
    if (picked && leaders.includes(picked)) return picked;
  }
  return (['straight', 'wave', 'natural'] as FrameTypeId[]).find((id) => leaders.includes(id))!;
}
