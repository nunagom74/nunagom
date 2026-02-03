# 누나곰 (Nuna Gom) - 핸드메이드 뜨개 인형 스토어

Next.js 14, TypeScript, TailwindCSS, PostgreSQL (Prisma)로 구축된 감성적인 미니멀 이커머스 사이트입니다.

## 🚀 주요 기능 (Key Features)

### 1. 사용자 경험 (UX) & 디자인
- **감성적인 UI**: TailwindCSS와 Shadcn/ui를 활용한 미니멀하고 고급스러운 디자인.
- **반응형 웹**: 모바일, 태블릿, 데스크탑 완벽 지원.
- **다국어 지원 (i18n)**: 한국어(KO) 및 영어(EN) 지원 (쿠키 기반 언어 설정).

### 2. 스마트 문의 시스템 (Smart Inquiry System)
스팸과 봇으로부터 안전한 3중 보호 시스템을 구축했습니다.
1.  **1차 필터 (욕설/금지어)**: `lib/profanity.ts`에 등록된 키워드 즉시 차단 (비용 0).
2.  **2차 필터 (Google Gemini AI)**: 교묘한 광고나 스팸 메일 등을 AI(Gemini 1.5 Flash)가 문맥 파악 후 차단 (무료).
3.  **보안 장치**:
    *   **Rate Limiting**: 동일 IP에서 10분 내 3회 이상 과도한 요청 시 일시 차단.
    *   **Cloudflare Turnstile**: 사용자 친화적인 스마트 캡차로 봇 자동 차단.
    *   **Honeypot**: 봇이 숨겨진 필드를 작성하면 조용히 무시함.

### 3. 관리자 대시보드 (Admin)
- **상품 관리**: 상품 등록, 수정, 삭제, 이미지 업로드.
- **문의 관리**: 접수된 문의 확인 및 답변(이메일 발송 연동 가능), 불필요한 문의 삭제 기능.
- **주문 관리**: 주문 상태 변경 및 조회.
- **모바일 지원**: 관리자 페이지도 모바일에서 편하게 사용 가능.

---

## 🛠 기술 스택 (Tech Stack)

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS, Shadcn/ui, Lucide React
- **Database**: PostgreSQL (Neon Tech)
- **ORM**: Prisma
- **AI**: Google Generative AI SDK (Gemini 1.5 Flash)
- **Security**: Cloudflare Turnstile, Rate Limiting (Custom)
- **Deployment**: Vercel

---

## 🏁 시작하기 (Getting Started)

### 1. 환경 변수 설정 (.env)
`.env.example` 파일을 복사하여 `.env`를 생성하고 키를 채워주세요.
```bash
DATABASE_URL="postgresql://..."
ADMIN_EMAIL="admin@nunagom.com"
ADMIN_PASSWORD="비밀번호"
OPENAI_API_KEY="" # (사용 안함)
GEMINI_API_KEY="AIzaSy..." # Google AI Studio 키
NEXT_PUBLIC_TURNSTILE_SITE_KEY="1x000..."
TURNSTILE_SECRET_KEY="1x000..."
```

### 2. 설치 및 실행
```bash
# 패키지 설치
npm install

# 데이터베이스 마이그레이션
npx prisma migrate dev

# 개발 서버 실행
npm run dev
```

### 3. 관리자 접속
- 주소: `http://localhost:3000/admin`
- 계정: 설정한 `.env` 참조

---

## 📝 관리자 가이드

### 문의 삭제 방법
관리자 페이지 > 문의 목록에서 휴지통 아이콘을 클릭하면 삭제할 수 있습니다. (안전 확인 팝업 뜸)

### AI 필터 설정
`app/actions/inquiry.ts`에서 AI 모델 설정(`gemini-flash-latest` 등)을 변경할 수 있습니다. 기본적으로 무료 티어를 사용하므로 비용 걱정이 없습니다.

---

## License
MIT
