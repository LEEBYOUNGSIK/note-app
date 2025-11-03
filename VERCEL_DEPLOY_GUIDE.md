# 🚀 Vercel 배포 가이드

이 문서는 현재 프로젝트를 Vercel에 배포하는 단계별 가이드를 제공합니다.

## ⚠️ 중요: 데이터베이스 마이그레이션 필요

현재 프로젝트는 **SQLite**를 사용하고 있지만, **Vercel은 서버리스 환경이므로 SQLite를 권장하지 않습니다**.  
프로덕션 배포를 위해서는 **PostgreSQL**로 마이그레이션이 필요합니다.

---

## 📋 배포 전 체크리스트

- [ ] PostgreSQL 데이터베이스 준비 (Vercel Postgres 또는 Neon.tech)
- [ ] Prisma 스키마를 PostgreSQL로 변경
- [ ] 환경 변수 준비
- [ ] GitHub 저장소에 코드 푸시 완료

---

## 🗄️ 1단계: PostgreSQL 데이터베이스 설정

### 옵션 A: Vercel Postgres (권장)

1. Vercel 대시보드 접속: https://vercel.com
2. 로그인 후 "Storage" 탭 클릭
3. "Create Database" → "Postgres" 선택
4. 데이터베이스 생성 후 **연결 문자열 복사**

### 옵션 B: Neon.tech (무료 티어 제공)

1. https://neon.tech 접속 및 계정 생성 (GitHub 로그인)
2. "Create Project" 클릭
3. 프로젝트 이름 입력 및 생성
4. "Connection Details"에서 **Connection String** 복사
   - 형식: `postgresql://user:password@host/dbname?sslmode=require`

---

## 🔧 2단계: Prisma 스키마 변경

`prisma/schema.prisma` 파일을 열고 다음처럼 변경:

```prisma
datasource db {
  provider = "postgresql"  // "sqlite"에서 변경
  url      = env("DATABASE_URL")
}
```

변경 후 로컬에서 테스트:

```bash
# Prisma Client 재생성
npx prisma generate

# 새 마이그레이션 생성
npx prisma migrate dev --name init_postgres
```

---

## 🔑 3단계: NEXTAUTH_SECRET 생성

터미널에서 다음 명령어 실행:

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))

# 또는 온라인 생성기 사용
# https://generate-secret.vercel.app/32
```

생성된 시크릿을 복사해두세요.

---

## 🌐 4단계: Vercel에 프로젝트 배포

### 방법 1: Vercel 대시보드 사용 (권장)

#### 4-1. 프로젝트 연결

1. https://vercel.com 접속 및 로그인
2. 대시보드에서 "Add New..." → "Project" 클릭
3. GitHub 저장소 선택 (my-own-note-app)
4. 프로젝트 설정 확인:
   - **Framework Preset**: Next.js (자동 감지)
   - **Root Directory**: `./` (기본값)
   - **Build Command**: `npm run build` 또는 비워두기 (자동)
   - **Output Directory**: `.next` (자동)
   - **Install Command**: `npm install` (자동)

#### 4-2. 환경 변수 설정

"Environment Variables" 섹션에서 다음 변수 추가:

```env
# Production
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
NEXTAUTH_SECRET=<생성한_시크릿_붙여넣기>
NEXTAUTH_URL=https://your-app-name.vercel.app
```

**⚠️ 주의**: `NEXTAUTH_URL`은 배포 완료 후 생성된 URL로 업데이트해야 합니다.

#### 4-3. 빌드 설정 확인

"Build and Development Settings"에서 확인:

- **Install Command**: `npm install` (기본값)
- **Build Command**: 다음 중 선택:
  ```
  prisma generate && prisma migrate deploy && next build
  ```
  또는 `package.json`의 build 스크립트가 이미 설정되어 있으므로 기본값 사용 가능

#### 4-4. 배포 시작

1. "Deploy" 버튼 클릭
2. 빌드 로그 확인
3. 배포 완료 후 URL 확인 (예: `https://my-own-note-app.vercel.app`)

#### 4-5. 환경 변수 업데이트

배포 완료 후:
1. Settings → Environment Variables
2. `NEXTAUTH_URL` 값을 실제 배포 URL로 업데이트
   ```
   NEXTAUTH_URL=https://my-own-note-app.vercel.app
   ```
3. "Redeploy" 클릭하여 재배포

---

### 방법 2: Vercel CLI 사용

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 프로젝트 배포 (프리뷰)
vercel

# 환경 변수 추가
vercel env add DATABASE_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add NEXTAUTH_URL production

# 프로덕션 배포
vercel --prod
```

---

## ✅ 5단계: 배포 확인

### 5-1. 배포 상태 확인

1. Vercel 대시보드에서 배포 상태 확인
2. "Visit" 버튼으로 배포된 사이트 접속

### 5-2. 기능 테스트

1. ✅ 회원가입 페이지 접속
2. ✅ 새 계정 생성
3. ✅ 로그인
4. ✅ 노트 생성/수정/삭제
5. ✅ 데이터베이스 연결 확인

### 5-3. 로그 확인

문제 발생 시:
- Vercel 대시보드 → 프로젝트 → "Deployments" → 배포 클릭 → "Function Logs" 확인

---

## 🔄 6단계: 지속적 배포 설정 (선택)

GitHub 저장소와 연결하면 자동 배포가 설정됩니다:

1. `main` 또는 `master` 브랜치에 푸시 시 자동 배포
2. Pull Request 생성 시 프리뷰 배포

---

## 🐛 문제 해결

### 빌드 실패

**문제**: `prisma generate` 실패  
**해결**:
- `package.json`의 `postinstall` 스크립트 확인
- 환경 변수 `DATABASE_URL` 확인

**문제**: `prisma migrate deploy` 실패  
**해결**:
- 데이터베이스 연결 문자열 확인
- 데이터베이스 권한 확인
- Build Command에 `prisma migrate deploy` 포함 확인

### 인증 오류

**문제**: 로그인 실패  
**해결**:
- `NEXTAUTH_SECRET` 환경 변수 확인
- `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인
- 환경 변수 변경 후 재배포 필요

### 데이터베이스 연결 오류

**문제**: 데이터베이스 연결 실패  
**해결**:
- `DATABASE_URL` 형식 확인 (PostgreSQL 연결 문자열)
- SSL 모드 확인 (`?sslmode=require` 포함)
- 데이터베이스 호스팅 서비스의 방화벽 설정 확인

### 환경 변수 미적용

**문제**: 환경 변수 변경 후 반영 안됨  
**해결**:
- 환경 변수 저장 후 "Redeploy" 클릭 필수
- Production, Preview, Development 환경별로 따로 설정 가능

---

## 📝 환경 변수 요약

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | NextAuth 세션 암호화 키 | (32자 이상의 랜덤 문자열) |
| `NEXTAUTH_URL` | 프로덕션 URL | `https://your-app.vercel.app` |

---

## 🎉 완료!

배포가 성공적으로 완료되면:

1. ✅ 프로덕션 URL로 접속 가능
2. ✅ 사용자 회원가입/로그인 가능
3. ✅ 노트 생성/관리 가능
4. ✅ 데이터는 PostgreSQL에 저장됨

---

## 📚 참고 자료

- [Vercel 공식 문서](https://vercel.com/docs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [NextAuth.js 설정](https://next-auth.js.org/configuration/options)

---

## 💡 팁

1. **로컬 개발**: SQLite 사용 가능
2. **프로덕션**: PostgreSQL 필수
3. **환경 분리**: 개발/프로덕션 환경 변수 분리 관리
4. **자동 배포**: GitHub와 연결하여 자동 배포 설정
5. **모니터링**: Vercel Analytics 활성화 (선택)


