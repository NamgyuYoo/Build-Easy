# Build-Easy: 현장 정산 자동화 플랫폼

건설/인테리어 현장 소장님들을 위한 가장 쉬운 정산 관리 도구

## 🚀 주요 기능

- **📸 OCR 영수증 스캔**: 사진 찍으면 AI가 자동으로 금액, 거래처, 날짜, 분류 입력
- **👷 노무비 대장 자동화**: 달력에서 작업자 출근 체크, CSV로 세무서 제출용 내보내기
- **📊 현장별 손익계산서**: 예산 대비 지출 실시간 확인, 80% 초과 시 경고
- **📱 장갑 모드 UI**: 큰 버튼, 최소한의 입력 - 현장에서 바로 사용 가능

## 🛠 기술 스택

- **Framework**: Next.js 15+ (App Router)
- **Database**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS v4
- **UI Components**: Shadcn/UI
- **AI/OCR**: Vercel AI SDK + GPT-4o
- **Deployment**: Vercel

## 📦 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. Supabase 프로젝트 설정

1. [Supabase](https://supabase.com)에서 **New Project** 클릭
2. 조직명과 프로젝트명 입력 (예: Build-Easy)
3. 데이터베이스 비밀번호 설정 (안전한 곳에 저장!)
4. 리전 선택: **Seoul** (또는 Northeast Asia) 추천
5. 프로젝트 생성까지 1-2분 대기

### 3. 이메일 인증 활성화 (중요!)

회원가입/로그인이 작동하려면 이메일 인증을 활성화해야 합니다:

1. 생성된 프로젝트 Dashboard에서 **Authentication** → **Providers** 클릭
2. **Email** provider의 **가로 표시**를 확인
3. **Enable email provider** 토글 클릭
4. **Confirm** 클릭
5. 설정이 완료될 때까지 기다리세요 (약 30초)

### 4. API 키 복사

1. **Settings** → **API** 클릭
2. 다음 값을 복사해서 `.env.local` 파일에 붙여넣기:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI/OCR Configuration (선택사항 - 영수증 OCR 기능용)
OPENAI_API_KEY=sk-your-openai-api-key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 5. 환경 변수 파일 생성

프로젝트 루트에 `.env.local` 파일 생성:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
OPENAI_API_KEY=your-openai-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 6. 데이터베이스 스키마 적용

1. Supabase Dashboard에서 **SQL Editor** 클릭
2. **New query** 클릭
3. 프로젝트의 `supabase/migrations/001_initial_schema.sql` 내용 복사
4. **Run** 클릭으로 실행

### 7. Storage 버킷 생성 (영수증 업로드용)

1. **Storage** 클릭
2. **Create a new bucket** 클릭
3. 버킷 이름: `receipts`
4. **Public bucket** 체크
5. **Create bucket** 클릭

### 8. 개발 서버 실행

```bash
npm run dev
```

http://localhost:3000 접속

## 🔧 트러블슈팅

### 회원가입/로그인이 안 될 때

1. **Supabase Email Provider 활성화 확인**
   - Dashboard → Authentication → Providers → Email
   - "Enable email provider"가 켜져 있는지 확인

2. **환경 변수 확인**
   ```bash
   # .env.local 파일이 있는지 확인
   cat .env.local
   ```

3. **개발 서버 재시작**
   ```bash
   # Ctrl+C로 종료 후 다시 실행
   npm run dev
   ```

4. **브라우저 콘솔 확인**
   - 브라우저 개발자 도구 (F12) → Network 탭
   - signup/login 요청의 응답 확인

### 데이터가 저장되지 않을 때

1. **RLS 정책 확인**
   - SQL Editor에서 RLS 정책이 제대로 적용되었는지 확인
   - `SELECT * FROM pg_policies;` 쿼리로 확인

2. **로그인 상태 확인**
   - 개발자 도구 → Application → Cookies
   - `sb-xxx-auth-token` 쿠키가 있는지 확인

## 📱 사용 방법

### 1. 회원가입/로그인
- 이메일과 비밀번호로 간편 회원가입
- 회원가입 후 자동으로 대시보드로 이동

### 2. 현장 등록
- 대시보드에서 "새 현장" 클릭
- 현장명, 예산 입력

### 3. 영수증 등록 (OCR)
- "영수증 등록" 클릭
- 사진 촬영/선택
- AI가 자동으로 정보 추출
- 확인 후 저장

### 4. 작업자 관리
- 메뉴에서 작업자 클릭
- 작업자 이름, 일당, 연락처 입력

### 5. 노무 출근 체크
- 프로젝트 > 노무 관리 > 출근 체크
- 날짜 선택 후 작업자별 "1공수" 또는 "0.5공수" 클릭

### 6. CSV 내보내기
- 노무 관리 페이지 > "CSV 내보내기"
- 세무서 제출용 노무비 대장 다운로드

## 🏗 프로젝트 구조

```
src/
├── app/
│   ├── (auth)/
│   │   └── login/           # 로그인 페이지
│   ├── (dashboard)/
│   │   ├── dashboard/       # 대시보드
│   │   ├── projects/        # 현장 관리
│   │   ├── expenses/        # 지출/영수증 관리
│   │   └── workers/         # 작업자 관리
│   └── api/                # API Routes
├── components/
│   └── ui/                 # Shadcn UI 컴포넌트
├── lib/
│   ├── supabase.ts         # Supabase 클라이언트
│   └── utils.ts            # 유틸리티 함수
└── hooks/
    └── use-toast.ts        # Toast 훅
```

## 🔒 보안

- 모든 데이터는 Row Level Security (RLS)로 보호
- 사용자는 자신의 데이터만 조회/수정 가능
- API 키는 서버에서만 관리

## 🚀 배포

### Vercel 배포

1. GitHub에 코드 푸시
2. Vercel에서 프로젝트 import
3. Environment Variables 설정:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Deploy

### Supabase Migration 배포

```bash
# 개발 환경
supabase db push

# 프로덕션
supabase db push --linked
```

## 📄 라이선스

MIT
