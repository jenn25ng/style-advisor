# 룩북 개편(v2) — 설계 스펙

- 작성일: 2026-08-04
- 상태: 설계 승인 (구현 계획 이전)
- 맥락: 기존 룩북(플랫레이 SVG 아이콘 + 데일리/포인트/모던 3룩)이 "테마 근거가 약하고 색 조합이 어색, 아이콘이 와닿지 않음"이라는 피드백. 개편.

## 1. 개요

룩북을 **색 조합 원리 기반 3룩** + **실제 상품 쇼핑 검색 링크**로 개편한다. 어색한 옷 아이콘 SVG는 제거하고, 색 칩 + 한 줄 근거 + 아이템별 "보러가기" 링크로 구성. 실제 상품 이미지는 저작권/링크깨짐 문제로 임베드하지 않고 **쇼핑몰 검색 결과로 연결**(항상 최신 실제 상품).

## 2. 3룩 프레임 (색 조합 원리)

각 룩은 명확한 근거(rationale)를 가진다. 중립색을 앵커로 써서 현실적인 코디를 만든다.

1. **기본 조합(basic)** — 팔레트 대표색 **상의** + **중립색 하의**. "실패 없는 데일리".
2. **톤 매치(tonal)** — 같은 팔레트 안 **동계열 2색**으로 상·하의. "통일감 있는 세련된 룩".
3. **포인트 컬러(point)** — **중립 상·하의 + 가장 선명한 포인트색**을 소품(가방/슈즈). "힘 준 룩".

## 3. 아이템 종류(골격 반영) & 검색어

- 상의: straight=셔츠 / wave=블라우스 / natural=니트
- 하의: straight=스트레이트 팬츠 / wave=플레어 스커트 / natural=와이드 팬츠
- 포인트: 가방(공통)
- 각 아이템 검색어 `query` = `"{색이름} {아이템종류}"` (예: `코랄 셔츠`).

## 4. 쇼핑 검색 링크

- 기본 검색처: **네이버 쇼핑** — `https://search.shopping.naver.com/search/all?query=<encoded>`.
- `shopConfig.ts`로 분리(검색 base URL + 골격별 아이템 종류 매핑) → 무신사/29cm/구글쇼핑 교체 용이.
- `shopSearchUrl(query)` = base + `encodeURIComponent(query)`.
- 링크는 새 탭(`target="_blank" rel="noopener noreferrer"`).

## 5. 타입 개편 (`src/types.ts`)

기존 `Look`/`LookItem`(SVG용)을 **교체**한다:
```typescript
export type LookKind = 'basic' | 'tonal' | 'point';
export type LookItemRole = 'top' | 'bottom' | 'point';
export interface LookItem {
  role: LookItemRole;
  name: string;      // 색 이름
  hex: string;
  itemType: string;  // 셔츠/플레어 스커트/가방 …
  query: string;     // 검색어 "코랄 셔츠"
}
export interface Look {
  kind: LookKind;
  title: string;       // "기본 조합"
  rationale: string;   // 한 줄 근거
  top: LookItem;
  bottom: LookItem;
  point: LookItem;
}
```

## 6. 파일 구조

```
src/config/shopConfig.ts          # 검색 base URL + 골격별 아이템 종류 + shopSearchUrl()
src/data/lookShapes.ts            # neutralBase 유지, frameSilhouette(SVG용) 제거
src/engine/lookBuilder.ts         # buildLooks 재작성(3원리)
src/components/Result/LookCard.tsx    # SVG 제거 → 색칩+근거+쇼핑링크
src/components/Result/Lookbook.tsx    # (거의 유지) 3룩 렌더
```
- `ResultPage`: 변경 없음(이미 `<Lookbook result>` 렌더). SVG 제거로 lookShapes의 frameSilhouette 참조가 사라짐 → 관련 테스트도 정리.

## 7. 엔진 (`lookBuilder.ts`) 규칙

`buildLooks(colorId, frameId): Look[]`(길이 3):
- `guide=buildGuide()`, `palette=guide.palette`, `point=guide.pointColor??palette[0]`, `undertone` 조회, `neutrals=neutralBase[undertone]`, `terms=frameItemTerms[frameId]`.
- **basic**: top=palette[0]+상의, bottom=중립(neutrals에서 하의색)+하의, point=중립 가방. rationale="실패 없는 데일리 — {top}에 {bottom}로 안정감."
- **tonal**: top=palette[0], bottom=palette[1]??중립(동계열), point=palette[2]??중립 가방. rationale="통일감 있는 톤 매치 — 같은 계열 색으로 세련되게."
- **point**: top=중립 상의, bottom=중립 하의, point=선명 포인트색 가방. rationale="차분한 베이스에 {point}로 포인트."
- 각 item에 itemType·query 채움. 팔레트 부족 시 중립으로 보정(빈 값 없음).

## 8. 화면 (`LookCard.tsx`)

- props `{ look: Look; frame: FrameTypeId }`(frame은 이제 itemType이 look에 포함되어 있으면 불필요 — look만으로 렌더).
- 구성:
  - 제목 `look.title`(강조) + `look.rationale`(한 줄, 회색)
  - 색 칩 3줄: 각 `[색점] {role라벨} · {name} — {itemType}` + **"보러가기 →"** 링크(`shopSearchUrl(item.query)`)
  - 색점은 `aria-hidden`, 색이름 텍스트 병기(접근성).
- 옷 아이콘 SVG 없음.

## 9. 테스트 (TDD)

- `shopConfig`: `shopSearchUrl('코랄 셔츠')`가 base+encode 형태, frameItemTerms 3골격 정의.
- `lookBuilder`: 24조합 전부 룩 3개(basic/tonal/point), 각 룩 title·rationale·3아이템(name/hex/itemType/query) 비어있지 않음, basic은 하의가 중립·point는 상·하의가 중립.
- `LookCard`: 제목·근거·색이름·아이템종류 텍스트 렌더, 각 아이템에 올바른 검색 URL의 링크(`role="link"`)와 `target=_blank`.
- 기존 SVG 기반 LookCard/lookShapes 테스트는 개편에 맞게 교체. 나머지(비룩북) 테스트 유지.

## 10. 완료 기준

- 모든 결과에서 근거 있는 3룩 + 아이템별 네이버쇼핑 검색 링크가 정상 동작.
- 색 이름 병기(접근성), 링크 새 탭·rel 보안속성.
- 전체 테스트/빌드 통과. 결과 페이지에 자연스럽게 통합.
