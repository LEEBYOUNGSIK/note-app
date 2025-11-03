# PostgreSQL 마이그레이션 가이드

프로젝트를 SQLite에서 PostgreSQL로 성공적으로 변경했습니다.

## ✅ 완료된 작업

1. ✅ `prisma/schema.prisma` - provider를 `postgresql`로 변경
2. ✅ Prisma 스키마 포맷팅 완료

## 📋 다음 단계

### 1. PostgreSQL 데이터베이스 준비

#### 옵션 A: Vercel Postgres (권장)
1. Vercel 대시보드 → Storage → Create Database → Postgres
2. 연결 문자열 복사

#### 옵션 B: Neon.tech (무료)
1. https://neon.tech 접속
2. 새 프로젝트 생성
3. Connection String 복사

### 2. 로컬 환경 설정

`.env` 또는 `.env.local` 파일 생성:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

### 3. 마이그레이션 실행

로컬에서 PostgreSQL 데이터베이스에 마이그레이션:

```bash
# Prisma Client 재생성
npx prisma generate

# 새 마이그레이션 생성 및 적용
npx prisma migrate dev --name init_postgres
```

### 4. Vercel 배포 설정

Vercel 대시보드에서:
1. Environment Variables에 `DATABASE_URL` 추가 (PostgreSQL 연결 문자열)
2. Build Command는 `npm run build` 유지 또는 `npm run build:deploy` 사용
3. 재배포

## ⚠️ 주의사항

- 로컬 개발 시: `.env.local` 파일에 SQLite URL 사용 가능 (개발용)
- 프로덕션: PostgreSQL 필수
- 기존 SQLite 데이터가 있다면 마이그레이션 스크립트 필요

## 🔄 데이터 마이그레이션 (기존 데이터가 있는 경우)

SQLite에서 PostgreSQL로 데이터를 옮기려면 별도의 마이그레이션 스크립트가 필요합니다.

