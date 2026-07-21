# 스타일 어드바이저 웹앱 — 설계 스펙

- 작성일: 2026-07-21
- 상태: 설계 승인 (구현 계획 이전)

## 1. 개요

퍼스널 컬러와 체형(골격)을 진단해, 어울리는 색 팔레트와 옷 코디 가이드를 제공하는 웹앱.
핵심 컨셉은 **"전문가가 진단해 준다"** 는 경험이므로, 모든 진단 규칙·팔레트·코디 가이드는
확립된 이론에 근거해 구축한다(임의 생성 금지).

## 2. 범위 (v1)

- 퍼스널 컬러 **8타입**(4계절 × 세부 2) + 골격 **3타입**(스트레이트/웨이브/내추럴)
- 진단: **자가진단 설문(확정) + 사진 색 참고(선택·보조)**
- 결과물: **규칙 기반 스타일 가이드 + 색 팔레트(스와치)**
- 저장: 브라우저 **localStorage** (계정/서버 없음)
- 조합: 8 × 3 = **24개 스타일 가이드**

### 범위 밖 (추후)
- 사진 기반 AI 자동 진단(확정용), 룩북 이미지 세트, 내 옷장 등록/조합, 계정·다기기 동기화, 쇼핑 연동

## 3. 화면 흐름

```
[시작] → [STEP1 컬러 설문 5~6문항] → [STEP1.5 사진 색 참고(선택)]
      → [STEP2 골격 설문 5~6문항] → [결과 페이지] → (저장/다시 진단)
[재방문] 저장된 결과 있으면 결과 페이지 or 새 진단
```
- 모바일 우선 반응형, 카드형 1문항 마법사, 진행률 표시
- 사진 단계는 건너뛰기 가능(설문만으로 완결)

## 4. 진단 로직

**퍼스널 컬러 (3축 조합)**
- 웜↔쿨(언더톤), 밝음↔어두움(명도), 선명↔부드러움(채도)
- 웜/쿨 → 계절(봄=웜밝음, 여름=쿨부드러움, 가을=웜어두움, 겨울=쿨선명), 명도·채도로 세부 2타입 결정

**골격 (3타입)**
- 문항을 스트레이트/웨이브/내추럴 3버킷에 점수 투표 → 최고점, 동점 시 대표 문항(손목·쇄골) 가중 타이브레이크

**사진 보조(선택)**
- 업로드 사진 피부 픽셀 → HSV로 웜/쿨 **힌트만** 제공(설문 결과를 덮어쓰지 않음). 조명 편차로 확정 근거로는 미사용

**투명성**
- 결과에 "왜 이 타입인가" 근거 요약 표시(규칙 기반이므로 가능)

## 5. 데이터 모델 (콘텐츠는 코드와 분리)

- `questions`: `{ id, axis, text, options:[{label, scores}] }`
- `colorTypes`(8): `{ id, name, bestColors:[{name,hex}], worstColors, keywords, description }`
- `frameTypes`(3): `{ id, name, strengths, cautions, fabrics, fits, silhouettes }`
- `styleGuides`(24): `{ colorType, frameType, top, bottom, silhouette, pointColor, avoid, oneLineTip }`

**24조합 생성 전략:** 골격 규칙(핏·소재·실루엣) + 컬러 규칙(팔레트·포인트)을 **합성**해 기본 가이드를 만들고, 강조/상충 조합만 개별 문구로 덮어쓴다.

## 6. 기술 구조

- 스택: **Vite + React + TypeScript**, 경량 상태관리(Zustand 등), 서버 없음
- 폴더:
```
src/
  data/       questions, colorTypes, frameTypes, styleGuides
  engine/     scoring.ts, guideBuilder.ts, photoHint.ts  (순수 함수)
  components/  Wizard/, Result/, PhotoStep/
  pages/      Start, Diagnose, Result
  store/      useDiagnosisStore (localStorage 저장/복원)
```
- 데이터 흐름: 답변 → store 누적 → `scoring` 타입 산출 → `guideBuilder` 가이드 생성 → 렌더 → localStorage 저장
- 경계 원칙: `engine/`은 UI 비의존 순수 함수 → 단위 테스트 용이

## 7. 에러·엣지 처리

- 미응답 문항 → 다음 비활성 + 안내
- 사진: 비이미지/과대 이미지 → 축소·거부, **전부 클라이언트 처리(업로드 서버 없음, 프라이버시 안전)**
- 타입 동점 → 타이브레이크 규칙
- localStorage 없음/파손 → 무시하고 새 시작

## 8. 전문성(도메인 지식) 확보

- `docs/knowledge/`에 8 컬러타입 + 3 골격타입 상세와 출처를 문서화
- 팔레트는 실제 색 기준 HEX, 설문은 통용 자가진단 항목 기반
- 코드 작성 전에 **지식베이스 리서치 단계**를 선행(deep-research)

## 9. 테스트

- `scoring`: 대표 응답 → 기대 타입(경계·동점 포함)
- `guideBuilder`: 24조합 전부 빈 값 없이 생성
- `photoHint`: 알려진 색 → 웜/쿨 판정
- UI: 마법사 진행·결과 렌더 스모크 테스트

## 10. 산출 문서 & 진행 순서

```
① 기획문서 + 페르소나  →  ② 지식베이스 리서치  →  ③ 설계 스펙 확정
 →  ④ 구현 계획(writing-plans)  →  ⑤ 개발(엔진→UI)
```
- `docs/product/기획문서.md`, `docs/product/페르소나.md`
- `docs/knowledge/` (리서치 결과)
- 본 스펙: `docs/superpowers/specs/2026-07-21-style-advisor-design.md`
