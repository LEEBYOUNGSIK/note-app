# 🚀 빠른 마이그레이션 에러 해결 (P3009)

배포 중 발생하는 **P3009 에러**를 빠르게 해결하는 방법입니다.

---

## ⚡ 가장 빠른 해결 방법 (권장)

### 방법 1: 데이터베이스 SQL Editor에서 직접 실행

**Vercel Postgres 또는 Neon.tech 대시보드에서:**

1. 데이터베이스 대시보드 접속
2. **SQL Editor** 또는 **Query Editor** 열기
3. 다음 SQL 실행:

```sql
-- 실패한 마이그레이션 기록 삭제
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251101221559_init' 
  AND finished_at IS NULL;

-- 부분적으로 생성된 테이블 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
```

4. **재배포**

---

### 방법 2: 데이터베이스 초기화 (가장 빠름, 데이터 손실)

**Vercel Postgres:**
- 대시보드 → Storage → 데이터베이스 선택 → Settings → **Reset Database**

**Neon.tech:**
- 대시보드 → 프로젝트 선택 → Settings → **Reset Project**

그 후 **재배포**

---

### 방법 3: 로컬 스크립트 실행

로컬에 `.env.local` 파일이 있고 `DATABASE_URL`이 설정되어 있다면:

```bash
node scripts/fix-migration.js
```

또는:

```bash
npx prisma migrate resolve --rolled-back 20251101221559_init
```

---

## 📋 단계별 해결 (상세)

### 1단계: 데이터베이스 연결 확인

데이터베이스 관리 도구 또는 SQL Editor 접속:
- **Vercel Postgres**: 대시보드 → Storage → 데이터베이스 → SQL Editor
- **Neon.tech**: 대시보드 → 프로젝트 → SQL Editor

### 2단계: 실패한 마이그레이션 확인

다음 SQL로 확인:

```sql
SELECT * FROM "_prisma_migrations" 
WHERE finished_at IS NULL;
```

### 3단계: 정리 실행

`scripts/reset-migration.sql` 파일의 SQL을 실행하거나, 다음 SQL 실행:

```sql
-- 1. 부분적으로 생성된 테이블 삭제
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. 실패한 마이그레이션 기록 삭제
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251101221559_init';
```

### 4단계: 재배포

Vercel에서 재배포하면 마이그레이션이 처음부터 다시 실행됩니다.

---

## 🔍 확인 방법

재배포 후 빌드 로그에서 확인:

✅ 성공:
```
Applying migration `20251101221559_init`
```

❌ 실패가 계속되면:
- 데이터베이스 연결 문자열 확인
- 환경 변수 `DATABASE_URL` 확인
- 빌드 로그의 전체 에러 메시지 확인

---

## 💡 예방 방법

향후 이런 문제를 방지하려면:

1. **로컬에서 먼저 테스트**:
```bash
npx prisma migrate deploy
```

2. **프로덕션 배포 전 확인**:
```bash
npx prisma migrate status
```

3. **데이터베이스를 초기 상태로 유지** (개발 단계):
- 개발 중에는 데이터 손실이 문제없다면 정기적으로 초기화

---

## 📝 참고

- 이 에러는 데이터베이스에 실패한 마이그레이션 기록이 남아있을 때 발생합니다
- Prisma는 데이터베이스 무결성을 보호하기 위해 실패한 마이그레이션이 있으면 새 마이그레이션을 적용하지 않습니다
- 실패한 기록을 삭제하거나 데이터베이스를 초기화하면 해결됩니다

