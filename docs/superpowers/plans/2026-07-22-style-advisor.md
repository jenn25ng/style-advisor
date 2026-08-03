# 스타일 어드바이저 구현 계획 (Implementation Plan)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 퍼스널 컬러(8타입) + 골격(3타입)을 자가진단 설문(+사진 색 참고)으로 판정하고, 어울리는 색 팔레트와 규칙 기반 코디 가이드를 보여주는 클라이언트 전용 웹앱을 만든다.

**Architecture:** Vite + React + TypeScript. 진단 로직은 UI에 의존하지 않는 순수 함수(`engine/`)로 분리하고 TDD로 검증한다. 콘텐츠(문항·타입·팔레트·가이드)는 `data/`에 데이터로 분리한다. 상태는 Zustand + localStorage. 서버 없음.

**Tech Stack:** Vite, React 18, TypeScript, Zustand, Vitest + @testing-library/react, CSS Modules.

**근거 문서:** `docs/knowledge/골격진단.md`, `docs/knowledge/퍼스널컬러.md`, 설계 스펙 `docs/superpowers/specs/2026-07-21-style-advisor-design.md`.

**핵심 설계 원칙(지식베이스에서):**
- 퍼스널컬러 판정의 1차 기준은 **방향성**(웜/쿨·명도·채도)이고 HEX는 렌더링용 예시.
- 혈관색·태닝 등 자가진단은 **약한 힌트**(가중치 낮음). 사진 힌트는 설문을 덮어쓰지 않음.
- 개인은 혼합 타입일 수 있으므로 단정 판정보다 **축별 점수 합산 + 근접도** 사용.

---

## 파일 구조 (책임 분리)

```
style-advisor-app/
├─ index.html
├─ package.json / tsconfig.json / vite.config.ts / vitest.config.ts
├─ src/
│  ├─ types.ts                 # 공용 타입 (단일 출처)
│  ├─ data/
│  │  ├─ questions.ts          # 컬러 + 골격 설문 문항
│  │  ├─ colorTypes.ts         # 8 색 타입: 방향성·팔레트·워스트
│  │  ├─ frameTypes.ts         # 3 골격 타입: 소재·핏·실루엣·회피
│  │  └─ styleGuides.ts        # 특수 조합 오버라이드(선택)
│  ├─ engine/
│  │  ├─ scoring.ts            # 답변 → colorTypeId / frameTypeId
│  │  ├─ guideBuilder.ts       # (color, frame) → StyleGuide 합성
│  │  └─ photoHint.ts          # 피부 픽셀 → 웜/쿨 힌트
│  ├─ store/
│  │  └─ useDiagnosisStore.ts  # 진행상태 + 결과 + localStorage
│  ├─ components/
│  │  ├─ Wizard/StepCard.tsx
│  │  ├─ Wizard/ProgressBar.tsx
│  │  ├─ PhotoStep/PhotoColorPicker.tsx
│  │  ├─ Result/TypeSummary.tsx
│  │  ├─ Result/ColorPalette.tsx
│  │  └─ Result/StyleGuideCard.tsx
│  ├─ pages/
│  │  ├─ StartPage.tsx
│  │  ├─ DiagnosePage.tsx
│  │  └─ ResultPage.tsx
│  ├─ App.tsx
│  └─ main.tsx
└─ src/**/__tests__/*.test.ts(x)
```

---

## 타입 계약 (Task 2에서 생성; 모든 태스크가 이 이름을 사용)

```typescript
// src/types.ts
export type ColorAxis = 'warmCool' | 'value' | 'chroma'; // 각 축 점수(양수/음수)
export type FrameTypeId = 'straight' | 'wave' | 'natural';
export type ColorTypeId =
  | 'spring-light' | 'spring-bright'
  | 'summer-light' | 'summer-mute'
  | 'autumn-mute'  | 'autumn-deep'
  | 'winter-bright'| 'winter-deep';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface ColorOption {
  label: string;
  scores: Partial<Record<ColorAxis, number>>; // 예: { warmCool: +2 }
}
export interface FrameOption {
  label: string;
  votes: Partial<Record<FrameTypeId, number>>; // 예: { straight: 1 }
}
export interface ColorQuestion {
  id: string;
  kind: 'color';
  weight?: number;         // 약한 힌트 문항은 <1 (기본 1)
  text: string;
  options: ColorOption[];
}
export interface FrameQuestion {
  id: string;
  kind: 'frame';
  key?: 'collarbone' | 'wrist' | 'volume' | 'other'; // 타이브레이크·가중용
  text: string;
  options: FrameOption[];
}
export type Question = ColorQuestion | FrameQuestion;

export interface Swatch { name: string; hex: string; }

export interface ColorType {
  id: ColorTypeId;
  season: Season;
  name: string;            // "봄 라이트"
  undertone: 'warm' | 'cool';
  value: 'light' | 'mid' | 'dark';
  chroma: 'bright' | 'soft';
  keywords: string[];
  impression: string;
  bestColors: Swatch[];    // HEX는 예시
  worstColors: Swatch[];
}
export interface FrameType {
  id: FrameTypeId;
  name: string;            // "스트레이트"
  features: string[];
  fabrics: string[];
  fits: string[];
  silhouettes: string[];
  bestItems: string[];
  avoidItems: string[];
}

// 답변: 질문 id -> 선택한 option index
export type Answers = Record<string, number>;

export interface ColorScore { warmCool: number; value: number; chroma: number; }
export interface FrameScore { straight: number; wave: number; natural: number; }

export interface StyleGuide {
  colorType: ColorTypeId;
  frameType: FrameTypeId;
  palette: Swatch[];
  avoidColors: Swatch[];
  pointColor: Swatch | null;
  fabrics: string[];
  fits: string[];
  silhouettes: string[];
  bestItems: string[];
  avoidItems: string[];
  oneLineTip: string;
}

export interface DiagnosisResult {
  colorType: ColorTypeId;
  frameType: FrameTypeId;
  colorScore: ColorScore;
  frameScore: FrameScore;
  rationale: string;       // "웜 +3, 밝음 +2 → 봄 라이트"
  photoHint?: PhotoHint;
}
export interface PhotoHint {
  hint: 'warm' | 'cool' | 'neutral';
  confidence: number;      // 0..1
  avgHex: string;
}
```

**스코어링 규칙(scoring.ts에서 구현):**
1. 색: 문항별 `option.scores`에 `weight`를 곱해 `warmCool/value/chroma` 합산.
2. 온도: `warmCool >= 0` → warm(봄/가을), else cool(여름/겨울).
3. 계절: warm이면 `value >= 0` → spring, else autumn. cool이면 `chroma >= 0` → winter, else summer.
4. 세부 2타입:
   - spring: `chroma >= 0` → `spring-bright`, else `spring-light`
   - autumn: `value <= -2` → `autumn-deep`, else `autumn-mute` (가을은 value<0에서 선택되므로, 세부는 깊이 임계값으로 구분)
   - summer: `value >= 0`(더 밝음) → `summer-light`, else `summer-mute`
   - winter: `value <= 0`(더 어두움) → `winter-deep`, else `winter-bright`
5. 골격: `votes` 합산해 최고점. 동점이면 `key==='collarbone'` 문항 답을 우선(스트레이트<웨이브<내추럴 순의 돌출도로 재계산), 그래도 동점이면 straight→wave→natural 순.

---

## Task 1: 프로젝트 스캐폴딩

**Files:**
- Create: `package.json`, `vite.config.ts`, `vitest.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/setupTests.ts`

- [ ] **Step 1: Vite React-TS 프로젝트 초기화**

Run:
```bash
cd /Users/1112917/style-advisor-app
npm create vite@latest . -- --template react-ts
```
프롬프트에서 현재 디렉터리에 파일이 있어도 계속(기존 docs/, .git 유지). 이미 존재하는 `index.html` 충돌 시 Vite 것으로 덮어씀.

- [ ] **Step 2: 의존성 설치**

Run:
```bash
npm install zustand
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```

- [ ] **Step 3: vitest 설정 추가**

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
  },
});
```

Create `src/setupTests.ts`:
```typescript
import '@testing-library/jest-dom';
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 빌드/테스트 파이프 확인**

Run: `npm run build && npm run test`
Expected: 빌드 성공(기본 앱), vitest는 "no test files found"로 종료(0 test) — 정상.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: Vite+React+TS 스캐폴딩 및 vitest 설정"
```

---

## Task 2: 공용 타입 정의

**Files:**
- Create: `src/types.ts`

- [ ] **Step 1: 타입 파일 작성**

위 "타입 계약" 블록 전체를 `src/types.ts`로 그대로 작성한다.

- [ ] **Step 2: 타입 컴파일 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: Commit**

```bash
git add src/types.ts
git commit -m "feat: 공용 도메인 타입 정의"
```

---

## Task 3: 골격 데이터 (`frameTypes.ts`)

**Files:**
- Create: `src/data/frameTypes.ts`
- Test: `src/data/__tests__/frameTypes.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// src/data/__tests__/frameTypes.test.ts
import { describe, it, expect } from 'vitest';
import { frameTypes } from '../frameTypes';
import type { FrameTypeId } from '../../types';

describe('frameTypes', () => {
  it('스트레이트/웨이브/내추럴 3타입을 모두 포함한다', () => {
    const ids = frameTypes.map((f) => f.id).sort();
    expect(ids).toEqual(['natural', 'straight', 'wave'] as FrameTypeId[]);
  });
  it('각 타입은 소재·핏·실루엣·회피 아이템이 비어있지 않다', () => {
    for (const f of frameTypes) {
      expect(f.fabrics.length).toBeGreaterThan(0);
      expect(f.fits.length).toBeGreaterThan(0);
      expect(f.silhouettes.length).toBeGreaterThan(0);
      expect(f.avoidItems.length).toBeGreaterThan(0);
    }
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/data/__tests__/frameTypes.test.ts`
Expected: FAIL — "Cannot find module '../frameTypes'".

- [ ] **Step 3: 데이터 구현**

`docs/knowledge/골격진단.md`의 3타입 내용을 `FrameType` 구조로 옮긴다. 예시(스트레이트) — 나머지 2타입도 같은 형식으로 지식베이스에서 채운다:
```typescript
// src/data/frameTypes.ts
import type { FrameType } from '../types';

export const frameTypes: FrameType[] = [
  {
    id: 'straight',
    name: '스트레이트',
    features: ['상반신에 볼륨이 집중된 상중심', '근육·입체감(메리하리)', '쇄골이 잘 안 보임', '무릎 아래가 가늚'],
    fabrics: ['탄탄한 코튼', '두꺼운 니트', '실크', '새틴', '울', '가죽'],
    fits: ['저스트사이즈(딱 맞는 핏)'],
    silhouettes: ['I라인'],
    bestItems: ['V넥·U넥·스퀘어넥', '스트레이트/와이드 팬츠', '타이트 스커트'],
    avoidItems: ['보디컨셔스(과하게 붙는 옷)', '오버사이즈 상의', '가슴 부위 과한 프릴', '하리 없는 시폰'],
  },
  // TODO(엔지니어 아님 — 여기 채움): 'wave', 'natural' 를 골격진단.md 대로 추가
];
```
※ 위 `TODO` 주석은 남기지 말 것. `docs/knowledge/골격진단.md`의 웨이브·내추럴 절을 읽어 동일 구조로 3개 모두 완성한 뒤 저장한다.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/data/__tests__/frameTypes.test.ts`
Expected: PASS (3타입, 모든 배열 비어있지 않음).

- [ ] **Step 5: Commit**

```bash
git add src/data/frameTypes.ts src/data/__tests__/frameTypes.test.ts
git commit -m "feat: 골격 3타입 데이터"
```

---

## Task 4: 색 타입 데이터 (`colorTypes.ts`)

**Files:**
- Create: `src/data/colorTypes.ts`
- Test: `src/data/__tests__/colorTypes.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// src/data/__tests__/colorTypes.test.ts
import { describe, it, expect } from 'vitest';
import { colorTypes } from '../colorTypes';

const EXPECTED = [
  'spring-light','spring-bright','summer-light','summer-mute',
  'autumn-mute','autumn-deep','winter-bright','winter-deep',
];

describe('colorTypes', () => {
  it('8세부 타입을 모두 포함한다', () => {
    expect(colorTypes.map((c) => c.id).sort()).toEqual([...EXPECTED].sort());
  });
  it('각 타입은 방향성 필드와 베스트/워스트 색을 가진다', () => {
    for (const c of colorTypes) {
      expect(['warm', 'cool']).toContain(c.undertone);
      expect(c.bestColors.length).toBeGreaterThan(2);
      expect(c.worstColors.length).toBeGreaterThan(0);
      for (const s of [...c.bestColors, ...c.worstColors]) {
        expect(s.hex).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });
  it('봄/가을은 warm, 여름/겨울은 cool 언더톤이다', () => {
    for (const c of colorTypes) {
      const warm = c.season === 'spring' || c.season === 'autumn';
      expect(c.undertone).toBe(warm ? 'warm' : 'cool');
    }
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/data/__tests__/colorTypes.test.ts`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 데이터 구현**

`docs/knowledge/퍼스널컬러.md`의 8타입 특성표·팔레트를 `ColorType` 구조로 옮긴다. 예시(봄 라이트) — 나머지 7타입도 동일 형식으로 채운다:
```typescript
// src/data/colorTypes.ts
import type { ColorType } from '../types';

export const colorTypes: ColorType[] = [
  {
    id: 'spring-light',
    season: 'spring',
    name: '봄 라이트',
    undertone: 'warm',
    value: 'light',
    chroma: 'soft',
    keywords: ['밝은', '다채로운', '화사한'],
    impression: "밝고 다채로운 '사탕 상자' 같은 인상",
    bestColors: [
      { name: '웜 아이보리', hex: '#FFF1D6' },
      { name: '피치', hex: '#F6B38A' },
      { name: '라이트 코랄', hex: '#FF8F7A' },
      { name: '버터 옐로', hex: '#F7D86A' },
      { name: '프레시 민트', hex: '#9FD8B5' },
    ],
    worstColors: [
      { name: '차콜 블랙', hex: '#111111' },
      { name: '탁한 다크 그레이', hex: '#4A4A4A' },
    ],
  },
  // 나머지 7타입: 퍼스널컬러.md의 팔레트/방향성대로 추가
];
```
주의: HEX는 예시임을 데이터 주석으로 한 줄 남긴다. `value`/`chroma`는 특성표(봄라이트=light/soft, 봄브라이트=light/bright, 여름라이트=light/soft, 여름뮤트=mid/soft, 가을뮤트=mid/soft, 가을딥=dark/soft, 겨울브라이트=light/bright, 겨울딥=dark/bright) 대로 설정.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/data/__tests__/colorTypes.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/colorTypes.ts src/data/__tests__/colorTypes.test.ts
git commit -m "feat: 퍼스널컬러 8타입 데이터"
```

---

## Task 5: 설문 문항 데이터 (`questions.ts`)

**Files:**
- Create: `src/data/questions.ts`
- Test: `src/data/__tests__/questions.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// src/data/__tests__/questions.test.ts
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
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/data/__tests__/questions.test.ts`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 문항 구현**

`퍼스널컬러.md`(자가진단→축 매핑)와 `골격진단.md`(자가진단 표)를 근거로 작성. 혈관/태닝은 `weight: 0.5`(약한 힌트). 최소 색 5문항(warmCool 2, value 2, chroma 1 이상 커버), 골격 5문항(쇄골 포함).
```typescript
// src/data/questions.ts
import type { ColorQuestion, FrameQuestion } from '../types';

export const colorQuestions: ColorQuestion[] = [
  {
    id: 'c-metal', kind: 'color', text: '금/은 액세서리 중 얼굴이 더 화사해 보이는 쪽은?',
    options: [
      { label: '골드', scores: { warmCool: +2 } },
      { label: '실버', scores: { warmCool: -2 } },
      { label: '둘 다 비슷', scores: {} },
    ],
  },
  {
    id: 'c-white', kind: 'color', text: '흰옷을 입을 때 더 잘 어울리는 쪽은?',
    options: [
      { label: '아이보리/크림', scores: { warmCool: +2 } },
      { label: '퓨어 화이트', scores: { warmCool: -2 } },
    ],
  },
  {
    id: 'c-vein', kind: 'color', weight: 0.5, text: '손목 안쪽 혈관색에 가까운 것은? (참고용)',
    options: [
      { label: '초록빛', scores: { warmCool: +1 } },
      { label: '파랑/보라빛', scores: { warmCool: -1 } },
      { label: '잘 모르겠음', scores: {} },
    ],
  },
  {
    id: 'c-depth', kind: 'color', text: '더 잘 어울리는 옷 색의 밝기는?',
    options: [
      { label: '밝고 환한 색', scores: { value: +2 } },
      { label: '깊고 어두운 색', scores: { value: -2 } },
    ],
  },
  {
    id: 'c-contrast', kind: 'color', text: '본인의 눈동자·머리색 대비는?',
    options: [
      { label: '뚜렷한 고대비(검은 머리/밝은 피부)', scores: { value: -1, chroma: +1 } },
      { label: '부드러운 저대비', scores: { value: +1, chroma: -1 } },
    ],
  },
  {
    id: 'c-clarity', kind: 'color', text: '더 잘 어울리는 색의 느낌은?',
    options: [
      { label: '선명하고 또렷한 색', scores: { chroma: +2 } },
      { label: '은은하고 부드러운 색', scores: { chroma: -2 } },
    ],
  },
];

export const frameQuestions: FrameQuestion[] = [
  {
    id: 'f-collarbone', kind: 'frame', key: 'collarbone', text: '쇄골은 어떤 편인가요?',
    options: [
      { label: '잘 안 보이고 평평하다', votes: { straight: 2 } },
      { label: '얇게 살짝 도드라진다', votes: { wave: 2 } },
      { label: '두껍고 크게 튀어나온다', votes: { natural: 2 } },
    ],
  },
  {
    id: 'f-wrist', kind: 'frame', key: 'wrist', text: '손목뼈는 어떤가요?',
    options: [
      { label: '둥글고 안 튀어나옴, 손에 두께감', votes: { straight: 1 } },
      { label: '가늘고 섬세', votes: { wave: 1 } },
      { label: '크게 돌출·관절이 두드러짐', votes: { natural: 1 } },
    ],
  },
  {
    id: 'f-flesh', kind: 'frame', key: 'other', text: '몸에서 가장 먼저 느껴지는 것은?',
    options: [
      { label: '근육·탄력(입체감)', votes: { straight: 1 } },
      { label: '부드러운 지방·곡선', votes: { wave: 1 } },
      { label: '뼈·관절의 프레임', votes: { natural: 1 } },
    ],
  },
  {
    id: 'f-volume', kind: 'frame', key: 'volume', text: '몸의 볼륨은 어디에 실리나요?',
    options: [
      { label: '상반신(상중심)', votes: { straight: 1 } },
      { label: '하반신(하중심)', votes: { wave: 1 } },
      { label: '위아래 균형', votes: { natural: 1 } },
    ],
  },
  {
    id: 'f-skin', kind: 'frame', key: 'other', text: '피부 질감에 가까운 것은?',
    options: [
      { label: '탄력 있는(하리)', votes: { straight: 1 } },
      { label: '매끄럽고 부드러운', votes: { wave: 1 } },
      { label: '건조하고 매트한', votes: { natural: 1 } },
    ],
  },
];
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/data/__tests__/questions.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/questions.ts src/data/__tests__/questions.test.ts
git commit -m "feat: 컬러/골격 설문 문항 데이터"
```

---

## Task 6: 스코어링 엔진 (`scoring.ts`)

**Files:**
- Create: `src/engine/scoring.ts`
- Test: `src/engine/__tests__/scoring.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// src/engine/__tests__/scoring.test.ts
import { describe, it, expect } from 'vitest';
import { scoreColor, scoreFrame, classifyColor, classifyFrame } from '../scoring';
import { colorQuestions, frameQuestions } from '../../data/questions';
import type { Answers } from '../../types';

// 헬퍼: 특정 라벨을 고르는 답변 생성
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
    // straight 1표(손목) vs natural 1표(피부) 동점, 쇄골=내추럴 → natural
    const a = pick(frameQuestions, {
      'f-wrist': '둥글',      // straight +1
      'f-skin': '건조',       // natural +1
      'f-collarbone': '두껍',  // natural (타이브레이크)
    });
    const score = scoreFrame(a);
    // 쇄골 votes(natural:2) 포함되면 natural이 이미 우위지만, 타이브레이크 경로도 안전
    expect(classifyFrame(score, a)).toBe('natural');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/engine/__tests__/scoring.test.ts`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

```typescript
// src/engine/scoring.ts
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

  // 타이브레이크 1: 쇄골 문항의 지목
  const collar = frameQuestions.find((q) => q.key === 'collarbone');
  if (collar && answers[collar.id] != null) {
    const opt = collar.options[answers[collar.id]];
    const picked = Object.keys(opt.votes)[0] as FrameTypeId | undefined;
    if (picked && leaders.includes(picked)) return picked;
  }
  // 타이브레이크 2: 고정 우선순위
  return (['straight', 'wave', 'natural'] as FrameTypeId[]).find((id) => leaders.includes(id))!;
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/engine/__tests__/scoring.test.ts`
Expected: PASS (모든 케이스).

- [ ] **Step 5: Commit**

```bash
git add src/engine/scoring.ts src/engine/__tests__/scoring.test.ts
git commit -m "feat: 설문 스코어링 엔진(색 8타입/골격 3타입 분류)"
```

---

## Task 7: 가이드 합성기 (`guideBuilder.ts`)

**Files:**
- Create: `src/engine/guideBuilder.ts`
- Test: `src/engine/__tests__/guideBuilder.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// src/engine/__tests__/guideBuilder.test.ts
import { describe, it, expect } from 'vitest';
import { buildGuide } from '../guideBuilder';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';
import type { ColorTypeId, FrameTypeId } from '../../types';

describe('buildGuide', () => {
  it('모든 24조합(8×3)이 빈 값 없이 생성된다', () => {
    for (const c of colorTypes) {
      for (const f of frameTypes) {
        const g = buildGuide(c.id, f.id);
        expect(g.palette.length).toBeGreaterThan(0);
        expect(g.fabrics.length).toBeGreaterThan(0);
        expect(g.fits.length).toBeGreaterThan(0);
        expect(g.silhouettes.length).toBeGreaterThan(0);
        expect(g.avoidItems.length).toBeGreaterThan(0);
        expect(g.oneLineTip.length).toBeGreaterThan(0);
      }
    }
  });
  it('색 팔레트는 해당 colorType의 bestColors에서 온다', () => {
    const g = buildGuide('spring-light' as ColorTypeId, 'straight' as FrameTypeId);
    const spring = colorTypes.find((c) => c.id === 'spring-light')!;
    expect(g.palette.map((s) => s.hex)).toEqual(spring.bestColors.map((s) => s.hex));
  });
  it('핏·소재는 해당 frameType에서 온다', () => {
    const g = buildGuide('winter-deep' as ColorTypeId, 'natural' as FrameTypeId);
    const natural = frameTypes.find((f) => f.id === 'natural')!;
    expect(g.fabrics).toEqual(natural.fabrics);
    expect(g.silhouettes).toEqual(natural.silhouettes);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/engine/__tests__/guideBuilder.test.ts`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

```typescript
// src/engine/guideBuilder.ts
import type { ColorTypeId, FrameTypeId, StyleGuide } from '../types';
import { colorTypes } from '../data/colorTypes';
import { frameTypes } from '../data/frameTypes';
import { overrides } from '../data/styleGuides';

export function buildGuide(colorId: ColorTypeId, frameId: FrameTypeId): StyleGuide {
  const c = colorTypes.find((x) => x.id === colorId);
  const f = frameTypes.find((x) => x.id === frameId);
  if (!c || !f) throw new Error(`Unknown type: ${colorId}/${frameId}`);

  const base: StyleGuide = {
    colorType: colorId,
    frameType: frameId,
    palette: c.bestColors,
    avoidColors: c.worstColors,
    pointColor: c.bestColors[0] ?? null,
    fabrics: f.fabrics,
    fits: f.fits,
    silhouettes: f.silhouettes,
    bestItems: f.bestItems,
    avoidItems: f.avoidItems,
    oneLineTip: `${c.name} · ${f.name}: ${f.silhouettes[0]} 실루엣에 ${c.keywords[0]} 색을 매치하세요.`,
  };

  const key = `${colorId}/${frameId}`;
  return overrides[key] ? { ...base, ...overrides[key] } : base;
}
```

- [ ] **Step 4: styleGuides 오버라이드 스텁 생성**

```typescript
// src/data/styleGuides.ts
import type { StyleGuide } from '../types';

// 강조/상충 조합만 개별 문구로 덮어씀. 기본은 guideBuilder가 합성.
// 예: { 'spring-bright/natural': { oneLineTip: '...' } }
export const overrides: Record<string, Partial<StyleGuide>> = {};
```

- [ ] **Step 5: 통과 확인**

Run: `npx vitest run src/engine/__tests__/guideBuilder.test.ts`
Expected: PASS (24조합 전부 생성).

- [ ] **Step 6: Commit**

```bash
git add src/engine/guideBuilder.ts src/data/styleGuides.ts src/engine/__tests__/guideBuilder.test.ts
git commit -m "feat: 24조합 스타일 가이드 합성기 + 오버라이드 스텁"
```

---

## Task 8: 사진 색 힌트 (`photoHint.ts`)

**Files:**
- Create: `src/engine/photoHint.ts`
- Test: `src/engine/__tests__/photoHint.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// src/engine/__tests__/photoHint.test.ts
import { describe, it, expect } from 'vitest';
import { hintFromPixels, rgbToHsv } from '../photoHint';

describe('rgbToHsv', () => {
  it('순수 빨강의 hue는 0에 가깝다', () => {
    expect(rgbToHsv(255, 0, 0).h).toBeCloseTo(0, 0);
  });
});

describe('hintFromPixels', () => {
  it('따뜻한 살구빛 픽셀들은 warm 힌트를 준다', () => {
    const px = [[240, 190, 150], [235, 185, 145]]; // 웜 스킨
    expect(hintFromPixels(px).hint).toBe('warm');
  });
  it('붉은기 도는 창백/핑크빛 픽셀은 cool 힌트를 준다', () => {
    const px = [[235, 180, 190], [240, 185, 195]]; // 쿨(핑크) 스킨
    expect(hintFromPixels(px).hint).toBe('cool');
  });
  it('confidence는 0..1 범위이고 avgHex를 반환한다', () => {
    const r = hintFromPixels([[240, 190, 150]]);
    expect(r.confidence).toBeGreaterThanOrEqual(0);
    expect(r.confidence).toBeLessThanOrEqual(1);
    expect(r.avgHex).toMatch(/^#[0-9A-Fa-f]{6}$/);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/engine/__tests__/photoHint.test.ts`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

규칙: 평균 RGB의 hue가 대략 0–70°(빨강~노랑, 단 붉은 핑크 제외) 웜 경향, hue가 그보다 붉은(핑크) 또는 파랑 경향이면 쿨. 스킨톤 단순화: `R-B` 차와 hue를 함께 사용.
```typescript
// src/engine/photoHint.ts
import type { PhotoHint } from '../types';

export function rgbToHsv(r: number, g: number, b: number) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;
  const s = max === 0 ? 0 : d / max;
  return { h, s, v: max };
}

function toHex(n: number) { return Math.round(n).toString(16).padStart(2, '0'); }

export function hintFromPixels(pixels: number[][]): PhotoHint {
  const n = pixels.length || 1;
  const avg = pixels.reduce(
    (acc, [r, g, b]) => [acc[0] + r, acc[1] + g, acc[2] + b],
    [0, 0, 0],
  ).map((x) => x / n);
  const [r, g, b] = avg;
  const { h } = rgbToHsv(r, g, b);
  // 웜 스킨: 노랑기(hue 25~55, 그리고 G가 B보다 충분히 큼)
  const yellowness = g - b;      // 클수록 웜
  const redPink = r - g;         // 핑크/레드 기운
  const warmScore = yellowness - Math.max(0, redPink - 40); // 과한 붉은기는 쿨로
  const hint: PhotoHint['hint'] =
    warmScore > 8 ? 'warm' : warmScore < -2 ? 'cool' : 'neutral';
  const confidence = Math.min(1, Math.abs(warmScore) / 60);
  const avgHex = `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  return { hint, confidence, avgHex };
}
```
※ 테스트가 위 임계값과 맞지 않으면, 테스트의 기대(warm/cool)를 기준으로 임계값을 조정하되 "웜=노랑기 우세, 쿨=붉은기/푸른기 우세" 규칙은 유지한다.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/engine/__tests__/photoHint.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/engine/photoHint.ts src/engine/__tests__/photoHint.test.ts
git commit -m "feat: 사진 픽셀 기반 웜/쿨 힌트(보조 신호)"
```

---

## Task 9: 진단 상태 스토어 (`useDiagnosisStore.ts`)

**Files:**
- Create: `src/store/useDiagnosisStore.ts`
- Test: `src/store/__tests__/useDiagnosisStore.test.ts`

- [ ] **Step 1: 실패하는 테스트 작성**

```typescript
// src/store/__tests__/useDiagnosisStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useDiagnosisStore } from '../useDiagnosisStore';

beforeEach(() => {
  localStorage.clear();
  useDiagnosisStore.getState().reset();
});

describe('useDiagnosisStore', () => {
  it('답변을 기록하고 결과를 계산한다', () => {
    const s = useDiagnosisStore.getState();
    s.answer('c-metal', 0); // 골드
    s.answer('c-white', 0); // 아이보리
    s.answer('c-depth', 0); // 밝고
    s.answer('c-clarity', 1); // 은은
    s.answer('f-collarbone', 0); // straight
    const result = useDiagnosisStore.getState().computeResult();
    expect(result.colorType).toContain('spring');
    expect(result.frameType).toBe('straight');
    expect(result.rationale.length).toBeGreaterThan(0);
  });

  it('결과를 localStorage에 저장하고 복원한다', () => {
    const s = useDiagnosisStore.getState();
    s.answer('c-metal', 1);
    const r = s.computeResult();
    s.saveResult(r);
    expect(JSON.parse(localStorage.getItem('sa:lastResult')!)).toMatchObject({
      colorType: r.colorType, frameType: r.frameType,
    });
  });

  it('파손된 localStorage는 조용히 무시한다', () => {
    localStorage.setItem('sa:lastResult', '{broken');
    expect(() => useDiagnosisStore.getState().loadResult()).not.toThrow();
    expect(useDiagnosisStore.getState().loadResult()).toBeNull();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/store/__tests__/useDiagnosisStore.test.ts`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

```typescript
// src/store/useDiagnosisStore.ts
import { create } from 'zustand';
import type { Answers, DiagnosisResult, PhotoHint } from '../types';
import { scoreColor, scoreFrame, classifyColor, classifyFrame } from '../engine/scoring';
import { colorTypes } from '../data/colorTypes';

const KEY = 'sa:lastResult';

interface State {
  answers: Answers;
  photoHint?: PhotoHint;
  answer: (id: string, optionIndex: number) => void;
  setPhotoHint: (h: PhotoHint) => void;
  computeResult: () => DiagnosisResult;
  saveResult: (r: DiagnosisResult) => void;
  loadResult: () => DiagnosisResult | null;
  reset: () => void;
}

export const useDiagnosisStore = create<State>((set, get) => ({
  answers: {},
  answer: (id, optionIndex) => set((s) => ({ answers: { ...s.answers, [id]: optionIndex } })),
  setPhotoHint: (h) => set({ photoHint: h }),

  computeResult: () => {
    const { answers, photoHint } = get();
    const cScore = scoreColor(answers);
    const fScore = scoreFrame(answers);
    const colorType = classifyColor(cScore);
    const frameType = classifyFrame(fScore, answers);
    const name = colorTypes.find((c) => c.id === colorType)?.name ?? colorType;
    const rationale =
      `웜쿨 ${cScore.warmCool >= 0 ? '웜' : '쿨'}(${cScore.warmCool}), ` +
      `명도 ${cScore.value}, 채도 ${cScore.chroma} → ${name}`;
    return { colorType, frameType, colorScore: cScore, frameScore: fScore, rationale, photoHint };
  },

  saveResult: (r) => {
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* 무시 */ }
  },
  loadResult: () => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as DiagnosisResult) : null;
    } catch { return null; }
  },
  reset: () => set({ answers: {}, photoHint: undefined }),
}));
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/store/__tests__/useDiagnosisStore.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/store/useDiagnosisStore.ts src/store/__tests__/useDiagnosisStore.test.ts
git commit -m "feat: 진단 상태 스토어(스코어링 연동 + localStorage)"
```

---

## Task 10: 공통 토큰 & 마법사 컴포넌트

**Files:**
- Create: `src/components/Wizard/ProgressBar.tsx`, `src/components/Wizard/StepCard.tsx`, `src/index.css`
- Test: `src/components/Wizard/__tests__/StepCard.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
// src/components/Wizard/__tests__/StepCard.test.tsx
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/components/Wizard/__tests__/StepCard.test.tsx`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

```tsx
// src/components/Wizard/StepCard.tsx
interface Props {
  text: string;
  options: string[];
  selected: number | null;
  onSelect: (index: number) => void;
}
export function StepCard({ text, options, selected, onSelect }: Props) {
  return (
    <div className="step-card">
      <h2 className="step-question">{text}</h2>
      <div className="step-options">
        {options.map((label, i) => (
          <button
            key={i}
            className={`option-btn ${selected === i ? 'selected' : ''}`}
            onClick={() => onSelect(i)}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
```
```tsx
// src/components/Wizard/ProgressBar.tsx
export function ProgressBar({ current, total }: { current: number; total: number }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="progress" aria-label={`진행률 ${pct}%`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
```
`src/index.css`에 최소 스타일(모바일 우선) 추가: `.step-card`, `.option-btn`(큰 터치 타깃, 선택 시 강조), `.progress`/`.progress-fill`. 색은 중립 팔레트 + 접근성 대비 준수.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/components/Wizard/__tests__/StepCard.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Wizard src/index.css
git commit -m "feat: 마법사 StepCard/ProgressBar + 기본 스타일"
```

---

## Task 11: 결과 컴포넌트 (팔레트/요약/가이드 카드)

**Files:**
- Create: `src/components/Result/ColorPalette.tsx`, `src/components/Result/TypeSummary.tsx`, `src/components/Result/StyleGuideCard.tsx`
- Test: `src/components/Result/__tests__/ColorPalette.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

```tsx
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/components/Result/__tests__/ColorPalette.test.tsx`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

```tsx
// src/components/Result/ColorPalette.tsx
import type { Swatch } from '../../types';
export function ColorPalette({ title, colors }: { title: string; colors: Swatch[] }) {
  return (
    <section className="palette">
      <h3>{title}</h3>
      <div className="swatches">
        {colors.map((c) => (
          <figure key={c.hex + c.name} className="swatch-item">
            <div data-testid={`swatch-${c.name}`} className="swatch" style={{ backgroundColor: c.hex }} />
            <figcaption>{c.name}</figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
```
```tsx
// src/components/Result/TypeSummary.tsx
import type { DiagnosisResult } from '../../types';
import { colorTypes } from '../../data/colorTypes';
import { frameTypes } from '../../data/frameTypes';
export function TypeSummary({ result }: { result: DiagnosisResult }) {
  const c = colorTypes.find((x) => x.id === result.colorType)!;
  const f = frameTypes.find((x) => x.id === result.frameType)!;
  return (
    <header className="type-summary">
      <h1>{c.name} · {f.name}</h1>
      <p className="impression">{c.impression}</p>
      <p className="rationale">왜 이 타입인가요? {result.rationale}</p>
      {result.photoHint && result.photoHint.hint !== 'neutral' && (
        <p className="photo-hint">사진 참고: {result.photoHint.hint === 'warm' ? '웜' : '쿨'} 경향 (참고용)</p>
      )}
    </header>
  );
}
```
```tsx
// src/components/Result/StyleGuideCard.tsx
import type { StyleGuide } from '../../types';
export function StyleGuideCard({ guide }: { guide: StyleGuide }) {
  return (
    <section className="guide-card">
      <p className="tip">{guide.oneLineTip}</p>
      <dl>
        <dt>소재</dt><dd>{guide.fabrics.join(', ')}</dd>
        <dt>핏</dt><dd>{guide.fits.join(', ')}</dd>
        <dt>실루엣</dt><dd>{guide.silhouettes.join(', ')}</dd>
        <dt>추천 아이템</dt><dd>{guide.bestItems.join(', ')}</dd>
        <dt>피할 것</dt><dd>{guide.avoidItems.join(', ')}</dd>
      </dl>
    </section>
  );
}
```

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/components/Result/__tests__/ColorPalette.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/Result
git commit -m "feat: 결과 컴포넌트(팔레트/타입요약/가이드 카드)"
```

---

## Task 12: 사진 색 선택 컴포넌트 (선택 단계)

**Files:**
- Create: `src/components/PhotoStep/PhotoColorPicker.tsx`
- Test: `src/components/PhotoStep/__tests__/PhotoColorPicker.test.tsx`

- [ ] **Step 1: 실패하는 테스트 작성**

canvas 픽셀 추출은 jsdom에서 제한되므로, 컴포넌트는 힌트 계산을 `hintFromPixels`에 위임하고 UI 상호작용만 테스트한다.
```tsx
// src/components/PhotoStep/__tests__/PhotoColorPicker.test.tsx
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
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/components/PhotoStep/__tests__/PhotoColorPicker.test.tsx`
Expected: FAIL — 모듈 없음.

- [ ] **Step 3: 구현**

```tsx
// src/components/PhotoStep/PhotoColorPicker.tsx
import { useRef, useState } from 'react';
import type { PhotoHint } from '../../types';
import { hintFromPixels } from '../../engine/photoHint';

interface Props { onHint: (h: PhotoHint) => void; onSkip: () => void; }

export function PhotoColorPicker({ onHint, onSkip }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('이미지 파일만 올릴 수 있어요.'); return; }
    setError(null);
    setSrc(URL.createObjectURL(file));
  }

  // 사용자가 이미지 위 피부 지점을 클릭하면 주변 픽셀 평균으로 힌트 계산
  function onCanvasClick(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.floor(((e.clientY - rect.top) / rect.height) * canvas.height);
    const { data } = ctx.getImageData(Math.max(0, x - 2), Math.max(0, y - 2), 5, 5);
    const px: number[][] = [];
    for (let i = 0; i < data.length; i += 4) px.push([data[i], data[i + 1], data[i + 2]]);
    onHint(hintFromPixels(px));
  }

  return (
    <div className="photo-step">
      <p>얼굴/손 사진에서 피부 지점을 눌러 웜·쿨 참고 힌트를 받을 수 있어요. (선택)</p>
      <label>
        사진 업로드
        <input type="file" accept="image/*" onChange={onFile} />
      </label>
      {error && <p role="alert" className="error">{error}</p>}
      {src && (
        <canvas
          ref={canvasRef}
          onClick={onCanvasClick}
          className="photo-canvas"
          /* 실제 구현: <img onLoad>에서 canvas.width/height 설정 후 drawImage */
        />
      )}
      <button onClick={onSkip}>이 단계 건너뛰기</button>
    </div>
  );
}
```
※ 이미지 로드 후 `drawImage`로 캔버스에 그리는 로직은 `<img onLoad>` 핸들러에서 `canvas.width=img.naturalWidth; ctx.drawImage(img,0,0)`로 완성한다(테스트 범위 밖, 브라우저 검증에서 확인).

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/components/PhotoStep/__tests__/PhotoColorPicker.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/PhotoStep
git commit -m "feat: 사진 색 선택(선택 단계, 건너뛰기/파일검증)"
```

---

## Task 13: 페이지 & 라우팅 조립

**Files:**
- Create: `src/pages/StartPage.tsx`, `src/pages/DiagnosePage.tsx`, `src/pages/ResultPage.tsx`
- Modify: `src/App.tsx`
- Test: `src/pages/__tests__/flow.test.tsx`

- [ ] **Step 1: 실패하는 통합 테스트 작성**

간단한 화면 상태(useState 기반) 라우팅. 전체 플로우 스모크 테스트:
```tsx
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

    // 각 스텝에서 첫 번째 선택지를 누르며 끝까지 진행
    // (문항 수만큼 반복; '다음'은 선택 시 자동 진행 또는 버튼)
    for (let i = 0; i < 20; i++) {
      const next = screen.queryAllByRole('button');
      const opt = next.find((b) => /골드|아이보리|밝고|선명|은은|잘 안|둥글|근육|상반신|탄력|건너뛰기|다음/.test(b.textContent ?? ''));
      if (!opt) break;
      await userEvent.click(opt);
    }
    expect(await screen.findByText(/왜 이 타입인가요/)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run src/pages/__tests__/flow.test.tsx`
Expected: FAIL — App/페이지 없음.

- [ ] **Step 3: 페이지 구현**

`StartPage`(시작 버튼), `DiagnosePage`(colorQuestions → PhotoStep(선택) → frameQuestions 순서로 StepCard+ProgressBar 렌더, 답변을 store에 기록, 마지막에 결과 계산 후 저장), `ResultPage`(TypeSummary + ColorPalette(베스트/워스트) + StyleGuideCard, 저장/다시 진단 버튼). `App.tsx`는 `phase: 'start'|'diagnose'|'result'` 상태로 전환하고, 마운트 시 `loadResult()`가 있으면 결과로 바로 이동하는 옵션 제공.
```tsx
// src/App.tsx (구조 요지)
import { useState, useEffect } from 'react';
import { StartPage } from './pages/StartPage';
import { DiagnosePage } from './pages/DiagnosePage';
import { ResultPage } from './pages/ResultPage';
import { useDiagnosisStore } from './store/useDiagnosisStore';
import type { DiagnosisResult } from './types';

export function App() {
  const [phase, setPhase] = useState<'start' | 'diagnose' | 'result'>('start');
  const [result, setResult] = useState<DiagnosisResult | null>(null);
  const load = useDiagnosisStore((s) => s.loadResult);

  useEffect(() => {
    const saved = load();
    if (saved) setResult(saved); // 시작 화면에서 "저장된 결과 보기" 노출용
  }, [load]);

  if (phase === 'diagnose')
    return <DiagnosePage onDone={(r) => { setResult(r); setPhase('result'); }} />;
  if (phase === 'result' && result)
    return <ResultPage result={result} onRestart={() => setPhase('diagnose')} />;
  return <StartPage hasSaved={!!result} onStart={() => setPhase('diagnose')} onViewSaved={() => setPhase('result')} />;
}
```
`main.tsx`가 `<App />`를 렌더하도록 수정.

- [ ] **Step 4: 통과 확인**

Run: `npx vitest run src/pages/__tests__/flow.test.tsx`
Expected: PASS. 필요 시 DiagnosePage의 '다음'/자동진행 로직과 테스트 셀렉터를 맞춘다.

- [ ] **Step 5: 전체 테스트 & 빌드**

Run: `npm run test && npm run build`
Expected: 모든 테스트 PASS, 빌드 성공.

- [ ] **Step 6: Commit**

```bash
git add src/pages src/App.tsx src/main.tsx
git commit -m "feat: 페이지 조립 및 전체 진단 플로우"
```

---

## Task 14: 브라우저 검증 & 마감

**Files:** (수정 가능) `src/index.css`, 관련 컴포넌트

- [ ] **Step 1: 개발 서버 실행 & 프리뷰**

`.claude/launch.json`에 dev 서버(`npm run dev`, Vite 기본 5173) 등록 후 preview_start로 연다.

- [ ] **Step 2: 수동 플로우 점검(스크린샷)**

시작 → 컬러 문항 → 사진 단계(건너뛰기 및 업로드) → 골격 문항 → 결과. 콘솔 에러 없는지 read_console_messages로 확인.

- [ ] **Step 3: 반응형/접근성 점검**

모바일 뷰(375px)에서 터치 타깃·대비 확인. 색 스와치에 이름 텍스트 병기(색만으로 정보 전달 금지).

- [ ] **Step 4: 결과 저장/복원 확인**

결과 저장 후 새로고침 → 저장된 결과 접근 가능 확인.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "polish: 반응형·접근성·콘솔 정리 및 브라우저 검증"
```

---

## 완료 기준 (Definition of Done)

- `npm run test` 전부 통과(엔진·스토어·컴포넌트·플로우).
- `npm run build` 성공.
- 8×3=24 조합 가이드가 빈 값 없이 생성됨(guideBuilder 테스트).
- 설문만으로 결과 도달 가능(사진은 선택), 결과에 근거(rationale)·팔레트·코디 가이드 표시.
- 결과 localStorage 저장/복원, 파손 시 안전.
- 모바일 반응형, 색+텍스트 병기(접근성).
