# 구글폼 결과 수집 — 설계 스펙

- 작성일: 2026-08-04
- 상태: 설계 승인 (구현 계획 이전)
- 맥락: 스타일 어드바이저 앱(서버리스, 클라이언트 전용)에 **익명 결과 수집** 추가. 지인 테스트 시 여러 명 진단 결과를 구글폼→시트로 취합.

## 1. 개요

결과 페이지에서 사용자가 **버튼을 눌러 동의**하면, 진단 결과(익명)를 구글폼 `formResponse` 엔드포인트로 전송한다. 서버·백엔드 없이 구글폼/시트만으로 수집. 개인정보·사진·닉네임 없음.

## 2. 전송 항목 (익명, "B 표준")

- `colorType` (예: `spring-bright`), `frameType` (예: `straight`)
- `timestamp` (ISO 8601)
- 점수: `warmCool`, `value`, `chroma`, `straight`, `wave`, `natural`

## 3. 사용자 흐름 (버튼 동의)

- 결과 페이지 하단(룩북 아래)에 **"결과 공유하기 (익명)"** 버튼 + "익명으로 전송돼요" 안내 문구.
- 클릭 → 전송 → 버튼이 **"공유 완료 · 감사합니다"** 상태로 전환.
- 중복 전송 방지: 전송 성공 시 localStorage 플래그 `sa:shared:<timestamp>` 저장 → 해당 결과는 버튼 비활성/완료 표시.
- 자동 전송·옵트아웃 아님(자발적 동의만).

## 4. 에러/제약

- 구글폼은 CORS를 허용하지 않음 → `fetch(..., { mode: 'no-cors' })` **fire-and-forget**(응답 본문 읽기 불가).
- 성공 확인 불가 → **낙관적 UI**: 네트워크 예외(throw)만 실패로 간주, 그 외엔 성공 처리.
- 네트워크 오류 시 "잠시 후 다시 시도해 주세요" 안내 + 재시도 가능.
- **미설정 시 버튼 자체를 렌더하지 않음**(dormant).

## 5. 설정 분리 (`src/config/formConfig.ts`)

```typescript
export const formConfig = {
  actionUrl: '',   // https://docs.google.com/forms/d/e/<ID>/formResponse
  fields: {        // 각 문항의 entry.<id> 값
    colorType: '', frameType: '', timestamp: '',
    warmCool: '', value: '', chroma: '',
    straight: '', wave: '', natural: '',
  },
};
export const isFormConfigured = () =>
  formConfig.actionUrl !== '' && Object.values(formConfig.fields).every(Boolean);
```
- 지금은 빈 값으로 개발/테스트 완료. 이후 폼 생성 → URL·entry ID만 채우면 즉시 동작.

## 6. 파일 구조

```
src/config/formConfig.ts               # 폼 URL + entry ID 매핑 + isFormConfigured()
src/engine/formPayload.ts              # buildFormBody(result, config, nowISO): URLSearchParams (순수함수)
src/lib/submitResult.ts                # submitResult(result, {now, fetchImpl?}) — fetch no-cors 래퍼(주입가능)
src/components/Result/ShareResult.tsx  # 버튼 + 상태(hidden/idle/sending/done/error)
```
- `ResultPage`: `<Lookbook>` 아래에 `<ShareResult result={result} />` 추가.

## 7. 데이터 흐름

버튼 클릭 → `ShareResult`가 `submitResult(result)` 호출 → `formPayload.buildFormBody`로 `entry.<id>=값` 바디 생성 → `fetch(actionUrl, {method:'POST', mode:'no-cors', body})` → 예외 없으면 `done`, localStorage 플래그 기록. 예외면 `error`.

## 8. 테스트 (TDD)

- `formPayload.buildFormBody`: result → 각 `entry.<id>`에 올바른 값 매핑, 점수 문자열화, timestamp 반영. 설정된 필드만 포함.
- `isFormConfigured`: 빈 설정=false, 모두 채우면 true.
- `submitResult`: 주입한 fetch mock이 올바른 URL·body·`mode:'no-cors'`로 호출되는지 / 예외 시 실패 반환.
- `ShareResult`: 미설정 시 아무것도 렌더 안 함; 설정 시 버튼 노출 → 클릭 시 submit 호출·완료 상태 전환; 실패 시 에러 상태·재시도 가능; 이미 공유한 결과(localStorage 플래그)면 완료 상태로 시작.
- 기존 37 테스트 유지.

## 9. 프라이버시

- 익명·비개인정보만 전송. 버튼 옆 명시 문구("익명으로 전송돼요, 개인정보는 보내지 않아요").
- 전송은 사용자의 자발적 클릭에만 발생.

## 10. 완료 기준

- 미설정 상태에서 앱은 기존과 동일(버튼 숨김), 전체 테스트/빌드 통과.
- `formConfig`에 실제 값 채우면 버튼 노출·전송 동작.
- 사용자에게 만들 구글폼 문항 목록 안내 → 폼 URL·entry ID 확보 → config 연결(별도 후속 단계).
