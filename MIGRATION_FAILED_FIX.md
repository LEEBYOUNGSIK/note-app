# 🔧 마이그레이션 실패 해결 가이드 (P3009 에러)

## 🐛 에러 원인

**P3009 에러**: `20251101221559_init` 마이그레이션이 실패한 상태로 데이터베이스에 기록되어 있어, 새로운 마이그레이션을 적용할 수 없습니다.

Prisma는 데이터베이스 무결성을 보호하기 위해 실패한 마이그레이션이 있으면 작업을 중단합니다.

---

## ✅ 해결 방법

### 옵션 1: 실패한 마이그레이션 기록 삭제 (개발 환경, 데이터 손실 가능)

데이터베이스에 아직 중요한 데이터가 없다면, 실패한 마이그레이션 기록을 삭제하고 다시 시작할 수 있습니다.

#### Vercel Postgres / Neon.tech 대시보드에서:

1. **데이터베이스 연결 도구 사용** (psql, DBeaver, pgAdmin 등)

2. **다음 SQL 실행**:
```sql
-- 실패한 마이그레이션 기록 확인
SELECT * FROM "_prisma_migrations" WHERE migration_name = '20251101221559_init';

-- 실패한 마이그레이션 기록 삭제
DELETE FROM "_prisma_migrations" WHERE migration_name = '20251101221559_init';

-- 부분적으로 생성된 테이블이 있다면 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS "Note";
DROP TABLE IF EXISTS "User";
```

3. **Vercel 재배포** 또는 **로컬에서 마이그레이션 실행**:
```bash
npx prisma migrate deploy
```

---

### 옵션 2: 마이그레이션 상태를 수동으로 수정 (데이터 보존)

실패한 마이그레이션을 "성공" 상태로 변경하여 Prisma가 계속 작업할 수 있도록 합니다.

#### SQL 실행:
```sql
-- 마이그레이션 상태 확인
SELECT * FROM "_prisma_migrations";

-- 실패한 마이그레이션을 수동으로 성공 상태로 변경
UPDATE "_prisma_migrations" 
SET finished_at = NOW(),
    applied_steps_count = 1
WHERE migration_name = '20251101221559_init' 
  AND finished_at IS NULL;
```

**주의**: 이 방법은 마이그레이션이 실제로 완료되지 않았을 수 있으므로, 테이블이 올바르게 생성되었는지 확인해야 합니다.

---

### 옵션 3: 데이터베이스 초기화 (권장 - 개발 단계)

데이터베이스를 완전히 초기화하고 처음부터 시작:

#### Vercel Postgres:
1. Vercel 대시보드 → Storage → 데이터베이스 선택
2. Settings → "Reset Database" 또는 "Delete Database" 후 재생성

#### Neon.tech:
1. 대시보드 → 프로젝트 선택
2. Settings → "Reset Project" 또는 "Delete Project" 후 재생성

3. **환경 변수 업데이트** 후 재배포

---

### 옵션 4: 새 마이그레이션으로 우회 (프로덕션 권장)

기존 마이그레이션을 건너뛰고 새로운 마이그레이션 파일을 생성:

1. **로컬에서 새로운 마이그레이션 생성**:
```bash
# Prisma Client 재생성
npx prisma generate

# 현재 데이터베이스 상태를 기준으로 새 마이그레이션 생성
npx prisma migrate dev --name fix_failed_migration --create-only
```

2. **생성된 마이그레이션 파일 확인**:
   - `prisma/migrations/[timestamp]_fix_failed_migration/migration.sql`
   - 필요한 SQL 문만 포함되어야 함

3. **마이그레이션 적용**:
```bash
# 로컬에서 테스트
npx prisma migrate deploy

# 문제없으면 Git 커밋 후 배포
git add prisma/migrations
git commit -m "fix: 실패한 마이그레이션 해결을 위한 새 마이그레이션 추가"
git push
```

---

## 🔍 실행 후 확인

마이그레이션 실행 후:

1. **마이그레이션 상태 확인**:
```bash
npx prisma migrate status
```

2. **테이블 생성 확인**:
```sql
-- PostgreSQL에서
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE';
```

또는 Prisma Studio 사용:
```bash
npx prisma studio
```

---

## 📝 예방 방법

향후 이런 문제를 방지하기 위해:

1. **로컬에서 먼저 테스트**:
```bash
npx prisma migrate dev
```

2. **프로덕션 배포 전 마이그레이션 검증**:
```bash
npx prisma migrate deploy --preview-feature
```

3. **롤백 가능한 마이그레이션 작성** (DROP TABLE 전에 백업 등)

---

## ⚠️ 주의사항

- 프로덕션 데이터가 있다면 **반드시 백업** 후 작업
- 옵션 1, 3은 데이터 손실을 야기할 수 있음
- 옵션 4가 가장 안전하며 데이터를 보존할 수 있음

