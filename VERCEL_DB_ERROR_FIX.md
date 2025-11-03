# 🔧 Vercel DB 에러 해결 가이드

Vercel에 배포했지만 데이터베이스 에러가 발생하는 경우, 다음 단계를 따라 해결하세요.

## 🔍 문제 진단

DB 에러의 주요 원인:
1. ❌ `DATABASE_URL` 환경 변수 미설정 또는 잘못된 값
2. ❌ Prisma 마이그레이션이 실행되지 않아 테이블이 생성되지 않음
3. ❌ PostgreSQL 데이터베이스가 준비되지 않음
4. ❌ Prisma Query Engine이 Vercel 서버리스 환경용으로 빌드되지 않음
   - 에러: `Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"`

---

## ✅ 해결 방법

### 1단계: PostgreSQL 데이터베이스 준비

#### 옵션 A: Vercel Postgres (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com 로그인
   - 프로젝트 선택

2. **Storage 탭에서 데이터베이스 생성**
   - 왼쪽 메뉴에서 "Storage" 클릭
   - "Create Database" → "Postgres" 선택
   - 데이터베이스 이름 입력 후 생성

3. **연결 문자열 복사**
   - 생성된 데이터베이스 클릭
   - ".env.local" 탭에서 `POSTGRES_PRISMA_URL` 또는 `POSTGRES_URL_NON_POOLING` 복사
   - 또는 "Settings" → "Connection String" 복사

#### 옵션 B: Neon.tech (무료 티어)

1. **Neon.tech 접속 및 계정 생성**
   - https://neon.tech 접속
   - GitHub로 로그인 (무료)

2. **프로젝트 생성**
   - "Create Project" 클릭
   - 프로젝트 이름 입력
   - 데이터베이스 이름 및 비밀번호 설정

3. **연결 문자열 복사**
   - 프로젝트 대시보드에서 "Connection Details" 클릭
   - "Connection String" 복사
   - 형식: `postgresql://user:password@host/dbname?sslmode=require`

---

### 2단계: Vercel 환경 변수 설정

1. **Vercel 대시보드에서 프로젝트 선택**

2. **Settings → Environment Variables 이동**

3. **필수 환경 변수 추가**:

   ```
   DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require
   ```

   ⚠️ **중요**: 
   - Vercel Postgres를 사용하는 경우 `POSTGRES_PRISMA_URL` 값을 `DATABASE_URL`로 설정
   - Neon.tech를 사용하는 경우 복사한 Connection String 그대로 사용
   - **Production, Preview, Development 모두에 설정**해야 함

4. **추가 환경 변수 확인**:

   ```
   NEXTAUTH_SECRET=<32자 이상의 랜덤 문자열>
   NEXTAUTH_URL=https://your-app-name.vercel.app
   ```

   - `NEXTAUTH_SECRET` 생성 방법:
     ```bash
     # PowerShell (Windows)
     [Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
     
     # 또는 온라인 생성기 사용
     # https://generate-secret.vercel.app/32
     ```

---

### 3단계: Prisma 스키마 설정 (Query Engine 에러 해결)

⚠️ **중요**: `Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"` 에러가 발생하는 경우:

1. **`prisma/schema.prisma` 파일 확인**:
   ```prisma
   generator client {
     provider      = "prisma-client-js"
     binaryTargets = ["native", "rhel-openssl-3.0.x"]
   }
   ```

   ✅ `binaryTargets`에 `"rhel-openssl-3.0.x"`가 포함되어 있어야 합니다.

2. **Prisma Client 재생성**:
   ```bash
   npx prisma generate
   ```

   이 명령어는 로컬(`native`)과 Vercel 서버리스 환경(`rhel-openssl-3.0.x`) 모두에 맞는 Query Engine을 생성합니다.

---

### 4단계: 빌드 설정 확인

1. **Vercel 대시보드 → 프로젝트 → Settings → Build & Development Settings**

2. **Build Command 확인**:
   ```
   npm run build
   ```
   
   또는 명시적으로:
   ```
   prisma generate && prisma migrate deploy && next build
   ```

   ✅ `package.json`의 `build` 스크립트가 이미 마이그레이션을 포함하도록 수정되었습니다.

3. **Install Command 확인**:
   ```
   npm install
   ```

---

### 5단계: 로컬에서 마이그레이션 확인

로컬에서 먼저 마이그레이션이 정상 작동하는지 확인:

1. **`.env.local` 파일 생성** (프로젝트 루트):
   ```env
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
   NEXTAUTH_SECRET="your-secret-here"
   NEXTAUTH_URL="http://localhost:3000"
   ```

2. **Prisma Client 재생성**:
   ```bash
   npx prisma generate
   ```

3. **마이그레이션 실행**:
   ```bash
   npx prisma migrate deploy
   ```
   
   또는 개발 모드:
   ```bash
   npx prisma migrate dev --name init_postgres
   ```

4. **스키마 확인**:
   ```bash
   npx prisma studio
   ```
   - 브라우저에서 데이터베이스 테이블 확인 가능

---

### 6단계: Vercel 재배포

1. **환경 변수 저장 후 "Redeploy" 클릭**
   - Vercel 대시보드 → 프로젝트 → Deployments
   - 최신 배포 옆 "..." 메뉴 → "Redeploy"

2. **또는 GitHub에 푸시하여 자동 재배포**:
   ```bash
   git add .
   git commit -m "fix: Vercel DB 에러 해결을 위한 빌드 스크립트 수정"
   git push origin master
   ```

3. **빌드 로그 확인**:
   - 배포 클릭 → "Build Logs" 확인
   - `prisma migrate deploy`가 성공적으로 실행되는지 확인
   - 에러가 있다면 로그 확인

---

## 🐛 문제 해결 체크리스트

### 빌드 실패 시

- [ ] `DATABASE_URL` 환경 변수가 올바르게 설정되었는지 확인
- [ ] PostgreSQL 연결 문자열 형식 확인 (`postgresql://...`)
- [ ] SSL 모드 확인 (`?sslmode=require` 포함)
- [ ] 빌드 로그에서 Prisma 에러 메시지 확인

### 런타임 에러 시

- [ ] 데이터베이스 테이블이 생성되었는지 확인 (`prisma studio` 사용)
- [ ] Vercel Function Logs에서 실제 에러 메시지 확인
- [ ] 데이터베이스 연결 제한 확인 (무료 티어의 경우 연결 수 제한 가능)

### Query Engine 에러 시

**에러 메시지**: `Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"`

**해결 방법**:
- [ ] `prisma/schema.prisma`의 `generator client`에 `binaryTargets = ["native", "rhel-openssl-3.0.x"]` 추가 확인
- [ ] 로컬에서 `npx prisma generate` 실행하여 변경사항 적용
- [ ] 변경사항을 커밋하고 GitHub에 푸시하여 재배포
- [ ] 빌드 로그에서 `prisma generate`가 성공적으로 실행되는지 확인

### 인증 에러 시

- [ ] `NEXTAUTH_SECRET` 환경 변수 확인
- [ ] `NEXTAUTH_URL`이 실제 배포 URL과 일치하는지 확인
- [ ] 환경 변수 변경 후 재배포 했는지 확인

---

## 📝 환경 변수 요약

| 변수명 | 설명 | 예시 |
|--------|------|------|
| `DATABASE_URL` | PostgreSQL 연결 문자열 (필수) | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXTAUTH_SECRET` | NextAuth 세션 암호화 키 (필수) | (32자 이상 랜덤 문자열) |
| `NEXTAUTH_URL` | 프로덕션 URL (필수) | `https://your-app.vercel.app` |

---

## ✅ 성공 확인

배포가 성공하면:

1. ✅ 빌드 로그에 `prisma migrate deploy` 성공 메시지 확인
2. ✅ 배포된 사이트 접속 시 DB 에러 없음
3. ✅ 회원가입/로그인 기능 정상 작동
4. ✅ 노트 생성/수정/삭제 기능 정상 작동

---

## 🔗 참고 자료

- [Vercel Postgres 문서](https://vercel.com/docs/storage/vercel-postgres)
- [Neon.tech 문서](https://neon.tech/docs)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)
- [NextAuth.js 설정](https://next-auth.js.org/configuration/options)

---

## 💡 추가 팁

1. **로컬 개발**: SQLite 사용 가능 (`.env.local`에 다른 `DATABASE_URL` 설정)
2. **프로덕션**: PostgreSQL 필수
3. **연결 풀링**: Vercel Postgres는 자동으로 연결 풀링 제공
4. **모니터링**: Vercel 대시보드에서 Function Logs로 실시간 에러 확인 가능

