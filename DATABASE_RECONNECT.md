# 🔧 데이터베이스 재연결 가이드 (P1001 에러)

데이터베이스를 삭제한 후 발생하는 연결 에러를 해결하는 방법입니다.

## 🐛 에러 원인

**P1001 에러**: `Can't reach database server at db.prisma.io:5432`

데이터베이스를 삭제했지만, 환경 변수에 이전 데이터베이스의 연결 문자열이 남아있어 발생합니다.

---

## ✅ 해결 방법

### 1단계: 새로운 데이터베이스 생성

#### 옵션 A: Vercel Postgres (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com 로그인
   - 프로젝트 선택

2. **Storage에서 데이터베이스 생성**
   - 왼쪽 사이드바에서 "Storage" 클릭
   - "Create Database" → "Postgres" 선택
   - 데이터베이스 이름 입력 후 생성

3. **연결 문자열 복사**
   - 생성된 데이터베이스 클릭
   - ".env.local" 탭에서 다음 중 하나 복사:
     - `POSTGRES_PRISMA_URL` (Prisma 전용, 권장)
     - `POSTGRES_URL_NON_POOLING` (직접 연결)
   
   또는 Settings → "Connection String"에서 복사

#### 옵션 B: Neon.tech (무료)

1. **Neon.tech 접속**
   - https://neon.tech 접속
   - GitHub로 로그인

2. **새 프로젝트 생성**
   - "Create Project" 클릭
   - 프로젝트 이름 입력
   - 데이터베이스 이름 및 비밀번호 설정
   - 지역 선택 후 생성

3. **연결 문자열 복사**
   - 프로젝트 대시보드 → "Connection Details"
   - "Connection String" 복사
   - 형식: `postgresql://user:password@host/dbname?sslmode=require`

---

### 2단계: Vercel 환경 변수 업데이트

1. **Vercel 대시보드에서 프로젝트 선택**

2. **Settings → Environment Variables 이동**

3. **기존 DATABASE_URL 삭제 후 새로 추가**
   - 기존 `DATABASE_URL` 찾기
   - "⋯" 메뉴 → "Delete" 클릭
   
4. **새 DATABASE_URL 추가**
   - "Add New" 클릭
   - Name: `DATABASE_URL`
   - Value: 위에서 복사한 연결 문자열 (예: `postgresql://...`)
   - **✅ Production, ✅ Preview, ✅ Development 모두 체크**
   - "Save" 클릭

#### Vercel Postgres를 사용한 경우

Vercel Postgres를 사용하면 자동으로 환경 변수가 설정될 수도 있습니다. 하지만 확인은 필요합니다:

- `POSTGRES_PRISMA_URL`이 있다면 이를 `DATABASE_URL`로도 설정하거나
- `DATABASE_URL`에 직접 복사해서 사용

---

### 3단계: 환경 변수 확인 (로컬 개발용)

로컬에서 개발하는 경우 `.env.local` 파일 생성:

```env
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"
```

⚠️ **주의**: `.env.local` 파일은 Git에 커밋하지 마세요!

---

### 4단계: 재배포

환경 변수를 저장한 후:

1. **자동 재배포**: Git에 푸시하면 자동으로 재배포됩니다
2. **수동 재배포**: Vercel 대시보드 → Deployments → 최신 배포의 "Redeploy" 클릭

---

## 🔍 확인 방법

재배포 후 빌드 로그에서 확인:

✅ 성공:
```
Prisma schema loaded from prisma/schema.prisma
Datasource "db": PostgreSQL database "postgres"...
Applying migration `20251101221559_init`
```

❌ 여전히 에러가 발생하면:
- 환경 변수가 제대로 저장되었는지 확인
- 빌드 로그에서 실제 연결 문자열 확인
- 데이터베이스가 정상 작동하는지 확인 (SQL Editor에서 테스트)

---

## 📝 빠른 체크리스트

- [ ] 새로운 PostgreSQL 데이터베이스 생성 완료
- [ ] 연결 문자열 복사 완료
- [ ] Vercel 환경 변수에서 `DATABASE_URL` 업데이트 완료
- [ ] Production, Preview, Development 모두 설정 확인
- [ ] 재배포 완료

---

## ⚠️ 중요 사항

1. **환경 변수 적용 시간**: 환경 변수를 추가한 후 재배포가 필요합니다
2. **연결 문자열 형식**: `postgresql://`로 시작해야 합니다
3. **SSL 모드**: `?sslmode=require` 또는 `?ssl=true` 포함 (대부분의 클라우드 DB는 SSL 필수)
4. **로컬 개발**: 로컬에서 개발할 때는 `.env.local` 파일에 설정 필요

