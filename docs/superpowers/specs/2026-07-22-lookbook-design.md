# 룩북(Lookbook) 기능 — 설계 스펙

- 작성일: 2026-07-22
- 상태: 설계 승인 (구현 계획 이전)
- 맥락: 기존 스타일 어드바이저 앱(퍼스널컬러 8 + 골격 3, 결과=팔레트+스타일가이드)에 **룩북 섹션** 추가. v1.5 기능.

## 1. 개요

진단 결과의 **팔레트 + 골격**을 규칙 기반으로 조합해, **코드로 그린 플랫레이(flat-lay) 룩 카드 3개**를 결과 페이지에 보여준다. 외부 이미지·API·저작권 이슈 없음(전부 인라인 SVG). 실사 화보가 아닌 **깔끔한 아이콘풍 실루엣**.

## 2. 범위

- 결과당 **룩 3개** 생성(테마: `데일리`, `포인트 룩`, `모던`).
- 각 룩 = 상의/하의/포인트의 **색 + 역할** 조합 + 골격 기반 핏 라벨.
- 플랫레이 SVG(골격별 아이템 모양) + 색 이름 텍스트 병기(접근성).
- 기존 서버리스·클라이언트 전용 구조 유지.

### 범위 밖
- 실사/스톡 사진, 사용자 옷장 연동, 룩 저장/공유(별도 기능).

## 3. 타입 추가 (`src/types.ts`)

```typescript
export type LookItemRole = 'top' | 'bottom' | 'point';
export interface LookItem { role: LookItemRole; name: string; hex: string; }
export interface Look {
  theme: string;      // '데일리' | '포인트 룩' | '모던'
  top: LookItem;
  bottom: LookItem;
  point: LookItem;
  fitLabel: string;   // 골격 기반 핏/실루엣 라벨
}
```

## 4. 데이터 (`src/data/lookShapes.ts`)

- 골격별 아이템 SVG path 3세트:
  ```typescript
  export const lookShapes: Record<FrameTypeId, { top: string; bottom: string; point: string }> = { ... };
  ```
  - straight: 박시 셔츠 + 스트레이트 팬츠(I라인)
  - wave: 핏 상의 + A라인/플레어 스커트
  - natural: 오버사이즈 상의 + 와이드/롱
- 언더톤별 중립 베이스색(팔레트가 부족할 때 하의/포인트 채움):
  ```typescript
  export const neutralBase: Record<'warm' | 'cool', Swatch[]> =
    { warm: [아이보리, 카멜, 차콜브라운], cool: [화이트, 그레이, 네이비] };
  ```
  HEX는 렌더링용 예시(퍼스널컬러 원칙 동일).

## 5. 엔진 (`src/engine/lookBuilder.ts`)

`buildLooks(colorId, frameId): Look[]` (순수 함수, 길이 3):
1. `guide = buildGuide(colorId, frameId)` 로 팔레트/포인트 확보, `colorTypes`에서 undertone 조회.
2. 테마 3개 고정. 각 룩의 **상의 색**은 팔레트에서 서로 다른 색을 순서대로 사용.
3. **하의 색**: 팔레트에 남은 색 또는 undertone 중립 베이스(top과 다르게).
4. **포인트 색**: `guide.pointColor`(가장 선명) 또는 팔레트 색 — 단, 한 룩 안에서 top/bottom/point는 **서로 다른 색**이 되도록 보정.
5. **fitLabel**: `frameTypes`의 `fits[0]`/`silhouettes[0]` 재사용(예: 스트레이트=`저스트사이즈·I라인`).
6. 팔레트가 3색 미만이어도 중립 베이스로 채워 **항상 3개 완성**.

## 6. 컴포넌트

- `src/components/Result/LookCard.tsx` — 단일 룩: `lookShapes[frame]` path에 `fill=색`을 주입한 인라인 SVG 플랫레이 + 각 아이템 **색 이름 텍스트**(`상의 · 브라이트 코랄`) + 테마·핏 라벨.
- `src/components/Result/Lookbook.tsx` — `buildLooks(...)` 결과 3개를 `LookCard`로 렌더. 섹션 제목 "이렇게 입어보세요".
- **반응형**: 모바일 세로 스택 / 데스크톱 가로. SVG `viewBox`+`max-width:100%`.
- **접근성**: 색만으로 정보 전달 금지 → 색 이름 병기, SVG에 `role="img"` + `aria-label`.

## 7. 배치

`ResultPage`에서 `StyleGuideCard` 아래에 `<Lookbook result={result} />` 추가. `App`/스토어/진단 플로우 변경 없음(결과 파생 렌더만 추가).

## 8. 테스트 (TDD)

- `lookBuilder`: 24조합 전부 룩 3개 생성 / 한 룩 내 top·bottom·point 색 중복 없음 / fitLabel 비어있지 않음 / 팔레트 부족 시 중립 베이스 채움.
- `LookCard`: 색 이름 텍스트가 렌더된다(예: `브라이트 코랄` 노출), SVG `aria-label` 존재.
- 기존 31개 테스트 유지.

## 9. 완료 기준

- 모든 진단 결과에서 룩 3개가 빈 값 없이 표시.
- 색 이름 병기·aria 라벨(접근성).
- `npm run test`/`build` 통과, 결과 페이지에 자연스럽게 통합.
