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
