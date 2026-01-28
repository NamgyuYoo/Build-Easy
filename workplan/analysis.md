# 프로젝트 분석 및 기능 검증 보고서

## 1. 프로젝트 개요
**Build-Easy**는 현장 소장님들을 위한 모바일 중심의 정산 관리 도구입니다.

- **기술 스택**: Next.js 15+ (App Router), Supabase, Tailwind CSS v4, Shadcn/UI, Vercel AI SDK (OCR).
- **주요 기능**: 현장 관리, 노무 출근 체크, 영수증 OCR 등록, 예산 관리.

## 2. 기능 상세 분석 및 정성적 검증

### A. 대시보드 및 현장 관리
- **기능**: 전체 현장 목록, 총 지출/예산 요약, 예산 초과 경고(80% 이상).
- **현황**: 정상 작동. 예산 대비 지출 그래프 및 경고 아이콘 등 시각적 요소가 잘 구현됨.
- **개선점**: 현장이 많아질 경우 페이징 처리가 필요할 수 있음.

### B. 노무 관리 (출근 체크)
- **기능**: 달력 기반 출근 체크, 1공수/0.5공수 설정, 일괄 체크, 더블 클릭 단축키.
- **정성적 이슈 (UX/Logic)**:
  1. **전역 로딩 상태 (Global Saving State)**: 작업자 한 명을 체크할 때 `saving` 상태가 전체 버튼을 비활성화함. 여러 명을 빠르게 체크하려 할 때 UX 경험이 저하됨. (개별 로딩 상태로 변경 필요)
  2. **시간대(Timezone) 처리**: 날짜 처리에 `date-fns`와 `new Date()`를 사용하는데, 클라이언트와 서버의 시간대가 다를 경우 날짜가 하루 밀릴 가능성이 있음.
  3. **데이터 로딩 최적화**: 프로젝트 진입 시 해당 프로젝트의 *모든* 노무 기록을 불러옴. 데이터가 쌓이면 페이지 로딩 속도가 느려질 수 있음(월별 로딩으로 개선 권장).

### C. 지출 및 영수증 관리
- **기능**: 카메라 촬영/업로드, AI(OCR)를 통한 금액/날짜/거래처 자동 추출, 카테고리 분류, 손익계산 반영.
- **현황**: 등록 프로세스(`expenses/new`)는 매우 잘 구현됨 (칩 UI, 자동 입력 등).
- **치명적 누락 (Missing Feature)**:
  - **지출 내역 전체 보기 페이지 부재**: `projects/[id]/page.tsx`에서 최근 5건만 보여주고, "전체 보기" 버튼이나 페이지(`projects/[id]/expenses`)가 없음. 사용자는 지난 지출 내역을 확인할 방법이 없음.
  - **수정/삭제 기능 부재**: 지출을 잘못 등록했을 때 수정하거나 삭제할 기능이 UI에 없음.

## 3. 누락된 기능 목록 (Workplan)

다음 기능들은 프로젝트 완성도를 위해 추가 개발이 필요합니다.

### [Priority 1: 필수] 지출 관리 기능 보완
- **지출 내역 목록 페이지 구현 (`/projects/[id]/expenses/page.tsx`)**
  - 월별/카테고리별 필터링 기능 포함.
  - 지출 합계 요약 카드 표시.
- **지출 상세/수정/삭제 기능**
  - 목록에서 클릭 시 상세 정보 모달 또는 페이지 이동.
  - 잘못된 금액이나 분류 수정 기능.

### [Priority 2: 개선] 노무 체크 UX 개선
- **개별 로딩 상태 적용**: `saving` 상태를 전역 변수가 아닌 `CheckInButton` 컴포넌트 내부나 `Map<workerID, boolean>`으로 관리.
- **월별 데이터 페칭**: 전체 기간이 아닌 선택된 월(Month)의 데이터만 가져오도록 API 및 쿼리 최적화.

### [Priority 3: 안정성] 시간대 및 에러 핸들링
- **날짜 포맷 통일**: UTC 기준으로 날짜 저장 및 조회 로직 명확화.
- **에러 피드백 강화**: 네트워크 오류 시 사용자에게 재시도 옵션 제공.

## 4. 제안하는 폴더 구조 수정

현재 `/projects/[id]/expenses` 폴더는 비어있습니다. 다음과 같이 파일을 생성해야 합니다.

```
src/app/(dashboard)/projects/[id]/expenses/
├── page.tsx        # 지출 목록 (필터링, 전체 리스트)
├── loading.tsx     # 로딩 UI
└── [expenseId]/    # (선택사항) 지출 상세/수정 페이지
```

## 5. 추가 발견사항: 보안 및 코드 품질 분석

### 5.1 보안 취약점 (Security)

#### [CRITICAL] 민감 정보 노출
- **위치**: `src/app/(auth)/login/page.tsx:177-192`, `src/app/api/auth/signup/route.ts:26-27,41`
- **이슈**: 개발 모드 정보 및 콘솔 로그에 이메일, 설정 정보 등 민감 데이터 노출
- **위험**: 프로덕션 환경에서 정보 유출 가능성
- **대응**: 콘솔 로그 제거, 개발 환경 전용 디버깅 기능 분리

#### [HIGH] 속도 제한(Rate Limiting) 미구현
- **위치**: 모든 API 라우트 (`/api/**`)
- **이슈**: 인증 엔드포인트에 속도 제한이 없음
- **위험**: 무차별 대입 공격(Brute Force), DoS 공격 가능성
- **대응**: Vercel Edge Config 또는 Supabase Edge Functions와 함께 rate limiting 구현

#### [HIGH] CSRF 보호 미구현
- **위치**: `src/app/auth/callback/route.ts`
- **이슈**: OAuth 콜백 시 CSRF 토큰 검증 없음
- **위험**: CSRF 공격 가능성
- **대응**: Next.js CSRF 토큰 미들웨어 추가

#### [MEDIUM] 디버그 엔드포인트 노출
- **위치**: `src/app/api/debug/supabase/route.ts`
- **이슈**: 프로덕션에서 디버그 엔드포인트 접근 가능
- **대응**: 디버그 엔드포인트 삭제 또는 인증 보호

#### [MEDIUM] 보안 헤더 미설정
- **위치**: `next.config.ts`
- **이슈**: CSP, X-Frame-Options 등 보안 헤더 없음
- **위험**: XSS, 클릭재킹 공격 가능성
- **대응**: `next.config.ts`에 security headers 추가

#### [MEDIUM] 파일 업로드 검증 부족
- **위치**: `src/app/api/ocr/receipt/route.ts:8-16`
- **이슈**: 파일 타입/사이즈 검증이 미흡함
- **위험**: 악성 파일 업로드 가능성
- **대응**: 파일 타입, 사이즈, 내용 검증 강화

### 5.2 에러 핸들링 (Error Handling)

#### [MEDIUM] 일관되지 않은 에러 처리
- **위치**: 모든 API 라우트
- **이슈**: 유사한 try-catch 블록 반복, 에러 메시지가 내부 정보 노출
- **대응**: 중앙화된 에러 처리 유틸리티 생성 (`src/lib/api-error.ts`)

#### [MEDIUM] React Error Boundary 미구현
- **위치**: 모든 클라이언트 컴포넌트
- **이슈**: 컴포넌트 에러시 애플리케이션 전체 크래시 가능성
- **대응**: 주요 컴포넌트에 Error Boundary 추가

### 5.3 접근성 (Accessibility)

#### [MEDIUM] ARIA 라벨 미지정
- **위치**: 모든 UI 컴포넌트
- **이슈**: 스크린 리더 지원 부족
- **대응**: Shadcn/UI 컴포넌트에 적절한 ARIA 라벨 추가

#### [MEDIUM] 키보드 네비게이션 미지원
- **위치**: 인터랙티브 컴포넌트
- **이슈**: 키보드만 사용하는 사용자 접근 불가
- **대응**: 키보드 이벤트 핸들러 및 포커스 관리 구현

### 5.4 성능 (Performance)

#### [MEDIUM] 프론트엔드 연산 최적화 필요
- **위치**: `src/app/(dashboard)/dashboard/page.tsx:86-93`
- **이슈**: 대량 데이터 처리 시 프론트엔드 부하 가능성
- **대응**: 연산을 DB 쿼리로 이동하거나 클라이언트 캐싱 구현

#### [LOW] 불필요한 리렌더링
- **위치**: `src/app/(dashboard)/expenses/new/page.tsx`
- **이슈**: 복잡한 상태 관리로 인한 과도한 리렌더링 가능성
- **대응**: React.memo, useMemo 활용

### 5.5 코드 품질 (Code Quality)

#### [HIGH] TypeScript 타입 안정성 부족
- **위치**: 다수 파일에서 `any` 타입 사용
- **이슈**: TypeScript 장점 상실, 런타임 에러 위험
- **대응**: 적절한 인터페이스 정의 및 `any` 타입 제거

#### [MEDIUM] 하드코딩된 값
- **위치**: `src/app/api/upload/image/route.ts:29`
- **이슈**: 파일 크기 제한(10MB) 하드코딩
- **대응**: 환경 변수로 이동

#### [MEDIUM] 환경 변수 검증 부족
- **위치**: `process.env` 접근하는 모든 파일
- **이슈**: 필수 환경 변수 누락 시 런타임 에러
- **대응**: 시작 시 환경 변수 검증 유틸리티 추가

---

## 6. 개선 우선순위 (Priority Matrix)

### 즉시 조치 (Critical - 1주 이내)
1. **콘솔 로그 제거**: 프로덕션 코드에서 모든 console.log 제거
2. **보안 헤더 추가**: `next.config.ts`에 CSP, X-Frame-Options 등 추가
3. **디버그 엔드포인트 제거**: `/api/debug/*` 라우트 삭제 또는 보호

### 높은 우선순위 (High - 2주 이내)
1. **지출 내역 페이지 구현**: `/projects/[id]/expenses/page.tsx`
2. **지출 수정/삭제 기능**: UI 및 API 추가
3. **Rate Limiting 구현**: 인증 엔드포인트 보호
4. **TypeScript 타입 안정성**: `any` 타입 제거

### 중간 우선순위 (Medium - 1개월 이내)
1. **노무 체크 UX 개선**: 개별 로딩 상태, 월별 데이터 로딩
2. **CSRF 보호**: 상태 변경 오퍼레이션에 토큰 검증
3. **에러 핸들링 중앙화**: 공통 에러 처리 유틸리티
4. **접근성 개선**: ARIA 라벨, 키보드 네비게이션

### 낮은 우선순위 (Low - 2개월 이내)
1. **파일 업로드 검증 강화**: OCR 라우트 보안 강화
2. **에러 Boundary 구현**: React Error Boundary 추가
3. **성능 최적화**: 불필요한 리렌더링 제거
4. **문서화 개선**: README, API 문서 업데이트

---

## 7. 제안하는 추가 폴더 구조

```
src/
├── lib/
│   ├── api-error.ts      # 중앙화된 에러 처리
│   ├── env-validation.ts # 환경 변수 검증
│   └── rate-limit.ts     # Rate limiting 유틸리티
├── components/
│   ├── error-boundary.tsx # React Error Boundary
│   └── loading/           # 로딩 컴포넌트들
└── app/(dashboard)/
    └── projects/[id]/
        └── expenses/
            ├── page.tsx   # 지출 목록 (필수)
            └── [expenseId]/
                ├── page.tsx  # 지출 상세/수정
                └── delete/   # 삭제 액션
```
