# 배포 가이드

이 프로젝트를 배포하는 방법을 안내합니다.

## 📋 배포 전 준비사항

### 1. 환경 변수 설정

프로젝트에 필요한 환경 변수들:
- `DATABASE_URL`: 데이터베이스 연결 문자열
- `NEXTAUTH_SECRET`: NextAuth 세션 암호화를 위한 시크릿 키
- `NEXTAUTH_URL`: 프로덕션 URL (예: `https://your-domain.com`)

### 2. NEXTAUTH_SECRET 생성

터미널에서 다음 명령어로 시크릿 생성:
```bash
openssl rand -base64 32
```

또는 온라인 생성기 사용: https://generate-secret.vercel.app/32

---

## 🚀 배포 옵션

### 옵션 1: Railway (권장 - SQLite 지원)

Railway는 SQLite를 지원하며 배포가 간단합니다.

#### 단계:
1. **Railway 계정 생성**
   - https://railway.app 접속 및 GitHub로 로그인

2. **프로젝트 배포**
   - "New Project" 클릭
   - "Deploy from GitHub repo" 선택
   - 저장소 선택 및 배포

3. **환경 변수 설정**
   - Railway 대시보드에서 프로젝트 선택
   - "Variables" 탭에서 다음 변수 추가:
     ```
     DATABASE_URL=file:./prisma/dev.db
     NEXTAUTH_SECRET=<생성한_시크릿>
     NEXTAUTH_URL=https://your-app-name.railway.app
     ```

4. **빌드 명령어 설정**
   - Settings → Build Command: `npm run build`
   - Start Command: `npm start`

5. **데이터베이스 마이그레이션**
   - Railway CLI 설치: `npm i -g @railway/cli`
   - 로그인: `railway login`
   - 프로젝트 연결: `railway link`
   - 마이그레이션 실행: `railway run npx prisma migrate deploy`

---

### 옵션 2: Render (SQLite 지원)

Render도 SQLite를 지원합니다.

#### 단계:
1. **Render 계정 생성**
   - https://render.com 접속 및 GitHub로 로그인

2. **웹 서비스 생성**
   - "New +" → "Web Service" 선택
   - 저장소 선택

3. **설정**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

4. **환경 변수 추가**
   ```
   DATABASE_URL=file:./prisma/dev.db
   NEXTAUTH_SECRET=<생성한_시크릿>
   NEXTAUTH_URL=https://your-app-name.onrender.com
   ```

5. **마이그레이션 스크립트 추가**
   - Build Command 수정:
     ```
     npm install && npx prisma migrate deploy && npm run build
     ```

---

### 옵션 3: Vercel + PostgreSQL (최적화)

Vercel은 SQLite를 권장하지 않으므로 PostgreSQL로 마이그레이션하는 것을 권장합니다.

#### 단계:
1. **PostgreSQL 데이터베이스 생성**
   - Vercel Postgres 또는 Neon.tech 사용
   - 연결 문자열 받기

2. **Prisma 스키마 변경**
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

3. **Vercel 배포**
   - https://vercel.com 접속
   - GitHub 저장소 연결
   - 환경 변수 설정:
     ```
     DATABASE_URL=<postgresql_연결_문자열>
     NEXTAUTH_SECRET=<생성한_시크릿>
     NEXTAUTH_URL=https://your-app-name.vercel.app
     ```

4. **빌드 설정**
   - Vercel은 자동으로 `postinstall` 스크립트 실행
   - 마이그레이션을 위해 Build Command에 추가:
     ```
     prisma migrate deploy && next build
     ```

---

## 🔧 로컬 빌드 테스트

배포 전 로컬에서 빌드 테스트:

```bash
# 프로덕션 빌드
npm run build

# 프로덕션 모드로 실행
npm start
```

---

## 📝 체크리스트

- [ ] 환경 변수 설정 완료
- [ ] NEXTAUTH_SECRET 생성 및 설정
- [ ] 로컬 빌드 테스트 통과
- [ ] 데이터베이스 마이그레이션 완료
- [ ] 프로덕션 URL 설정 확인

---

## ⚠️ 주의사항

1. **SQLite 제한사항**
   - 서버리스 환경에서는 각 인스턴스마다 별도의 파일 시스템
   - 데이터가 공유되지 않을 수 있음
   - 프로덕션에서는 PostgreSQL 권장

2. **보안**
   - 환경 변수는 절대 GitHub에 커밋하지 마세요
   - `.env` 파일은 `.gitignore`에 포함되어 있습니다

3. **데이터베이스 백업**
   - 정기적으로 데이터베이스 백업 권장

---

## 🆘 문제 해결

### 빌드 실패
- `prisma generate`가 실행되는지 확인
- `package.json`의 `postinstall` 스크립트 확인

### 데이터베이스 연결 실패
- `DATABASE_URL` 환경 변수 확인
- 파일 경로가 올바른지 확인

### 인증 오류
- `NEXTAUTH_SECRET` 설정 확인
- `NEXTAUTH_URL`이 프로덕션 URL과 일치하는지 확인

