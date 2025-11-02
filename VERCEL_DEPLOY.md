# Vercel 배포 가이드

이 프로젝트를 Vercel에 배포하는 방법을 안내합니다.

## 📋 배포 전 준비사항

### 1. 환경 변수 준비

배포에 필요한 환경 변수:
- `DATABASE_URL`: 데이터베이스 연결 문자열
- `NEXTAUTH_SECRET`: NextAuth 세션 암호화를 위한 시크릿 키
- `NEXTAUTH_URL`: 프로덕션 URL (배포 후 자동 설정)

### 2. NEXTAUTH_SECRET 생성

터미널에서 다음 명령어로 시크릿 생성:
```bash
openssl rand -base64 32
```

또는 온라인 생성기 사용: https://generate-secret.vercel.app/32

---

## 🚀 배포 방법

### 방법 1: Vercel 대시보드 사용 (권장)

#### 단계 1: Vercel 계정 생성
1. https://vercel.com 접속
2. GitHub 계정으로 로그인

#### 단계 2: 프로젝트 배포
1. Vercel 대시보드에서 "Add New..." → "Project" 클릭
2. GitHub 저장소 선택
3. 프로젝트 설정:
   - **Framework Preset**: Next.js (자동 감지)
   - **Build Command**: `npm run build` (자동 설정됨)
   - **Output Directory**: `.next` (자동 설정됨)
   - **Install Command**: `npm install` (자동 설정됨)

#### 단계 3: 데이터베이스 설정

**옵션 A: Vercel Postgres 사용 (권장)**

1. Vercel 대시보드에서 프로젝트 선택
2. "Storage" 탭 → "Create Database" → "Postgres" 선택
3. 데이터베이스 생성 후 연결 문자열 자동 설정됨

**옵션 B: Neon.tech 사용 (무료)**

1. https://neon.tech 접속 및 계정 생성
2. 새 프로젝트 생성
3. 연결 문자열 복사 (예: `postgresql://user:password@host/dbname`)

**옵션 C: 기타 PostgreSQL 호스팅**
- Supabase, Railway, Render 등에서 PostgreSQL 생성 후 연결 문자열 사용

#### 단계 4: Prisma 스키마 변경 (PostgreSQL 사용 시)

`prisma/schema.prisma` 파일 수정:
```prisma
datasource db {
  provider = "postgresql"  // sqlite에서 변경
  url      = env("DATABASE_URL")
}
```

그 다음 마이그레이션 생성:
```bash
npx prisma migrate dev --name init_postgres
```

#### 단계 5: 환경 변수 설정

Vercel 대시보드에서:
1. 프로젝트 → "Settings" → "Environment Variables"
2. 다음 변수 추가:

```
DATABASE_URL=postgresql://user:password@host/dbname
NEXTAUTH_SECRET=<생성한_시크릿>
NEXTAUTH_URL=https://your-app-name.vercel.app
```

> **참고**: `NEXTAUTH_URL`은 배포 후 자동 생성된 URL로 업데이트하세요.

#### 단계 6: 빌드 설정

**package.json**에 빌드 스크립트 확인:
```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

또는 Vercel 대시보드에서 Build Command를 다음으로 설정:
```
prisma generate && prisma migrate deploy && next build
```

#### 단계 7: 배포

1. "Deploy" 버튼 클릭
2. 배포 완료 후 URL 확인
3. `NEXTAUTH_URL` 환경 변수를 배포된 URL로 업데이트
4. 재배포 (환경 변수 변경 시)

---

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 배포
vercel

# 프로덕션 배포
vercel --prod
```

환경 변수는 대시보드에서 설정하거나 CLI로 추가:
```bash
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add NEXTAUTH_URL
```

---

## 📝 배포 후 확인사항

1. **데이터베이스 마이그레이션**
   - 배포 후 첫 로그인 시 자동으로 마이그레이션 실행됨
   - 또는 수동으로 Vercel CLI 사용:
     ```bash
     vercel env pull .env.local
     npx prisma migrate deploy
     ```

2. **애플리케이션 테스트**
   - 회원가입/로그인 테스트
   - 메모 생성/수정/삭제 테스트
   - 데이터베이스 연결 확인

3. **환경 변수 확인**
   - 프로덕션 환경 변수가 올바르게 설정되었는지 확인

---

## ⚠️ 중요 사항

### SQLite vs PostgreSQL

- **SQLite**: 로컬 개발용으로만 사용 (Vercel 서버리스 환경에서 권장하지 않음)
- **PostgreSQL**: 프로덕션 배포 권장

### 환경 변수 보안

- 절대 환경 변수를 GitHub에 커밋하지 마세요
- `.env` 파일은 `.gitignore`에 포함되어 있습니다
- Vercel 대시보드에서만 환경 변수를 관리하세요

### 빌드 최적화

- Prisma Client는 `postinstall` 스크립트에서 자동 생성됩니다
- 프로덕션에서는 `prisma migrate deploy`를 사용하여 마이그레이션을 실행합니다

---

## 🔧 문제 해결

### 빌드 실패
- Prisma Client 생성 확인: `prisma generate` 실행 확인
- 데이터베이스 연결 확인: `DATABASE_URL` 환경 변수 확인

### 마이그레이션 실패
- 프로덕션에서는 `prisma migrate deploy` 사용 (개발용 `migrate dev` 아님)
- 데이터베이스 권한 확인

### 인증 오류
- `NEXTAUTH_SECRET` 설정 확인
- `NEXTAUTH_URL`이 프로덕션 URL과 일치하는지 확인

### 데이터베이스 연결 오류
- PostgreSQL 연결 문자열 형식 확인
- 방화벽 및 네트워크 설정 확인

---

## 📚 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment/deployment-guides)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)

