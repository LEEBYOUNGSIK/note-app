# 🔧 마이그레이션 DATETIME 에러 해결 가이드

## ✅ 수정 완료

`prisma/migrations/20251101221559_init/migration.sql` 파일을 PostgreSQL 형식으로 수정했습니다:
- `DATETIME` → `TIMESTAMP(3)` 변경
- Note 테이블에 누락된 컬럼 추가 (`date`, `priority`, `status`)

## 🚀 다음 단계

### 상황 1: 아직 배포되지 않았거나 데이터베이스가 비어있는 경우

1. **변경사항 커밋 및 푸시**:
   ```bash
   git add prisma/migrations/20251101221559_init/migration.sql
   git commit -m "fix: PostgreSQL용 마이그레이션 파일 수정 (DATETIME → TIMESTAMP)"
   git push origin master
   ```

2. **Vercel 자동 재배포 확인**

### 상황 2: 이미 배포를 시도해서 마이그레이션이 부분적으로 적용된 경우

데이터베이스에 부분적으로 생성된 테이블이 있을 수 있습니다. 다음 중 하나를 선택하세요:

#### 옵션 A: 데이터베이스 초기화 (개발 단계, 데이터 손실 가능)

1. **Vercel Postgres 또는 Neon.tech 대시보드에서 데이터베이스 리셋**
   - Vercel Postgres: Settings → Reset Database
   - Neon.tech: Settings → Reset Project

2. **재배포**

#### 옵션 B: 마이그레이션 상태 수동 수정 (프로덕션, 데이터 보존)

1. **데이터베이스에서 실패한 마이그레이션 롤백**:
   ```sql
   -- 실패한 테이블이 있다면 삭제
   DROP TABLE IF EXISTS "Note";
   DROP TABLE IF EXISTS "User";
   ```

2. **마이그레이션 테이블 확인 및 초기화**:
   ```sql
   -- Prisma 마이그레이션 히스토리 확인
   SELECT * FROM "_prisma_migrations";
   
   -- 필요시 마이그레이션 히스토리 삭제
   DROP TABLE IF EXISTS "_prisma_migrations";
   ```

3. **재배포하여 마이그레이션 재실행**

#### 옵션 C: 새 마이그레이션 생성 (권장)

기존 마이그레이션을 건너뛰고 새로 생성:

1. **로컬에서 마이그레이션 상태 확인**:
   ```bash
   npx prisma migrate status
   ```

2. **새 마이그레이션 생성**:
   ```bash
   npx prisma migrate dev --name fix_postgresql_types
   ```

3. **생성된 마이그레이션 파일 확인**:
   - `prisma/migrations/[timestamp]_fix_postgresql_types/migration.sql`
   - 기존 테이블이 있다면 `ALTER TABLE` 문이 포함되어야 함

4. **커밋 및 푸시 후 재배포**

## 📝 변경 사항 요약

### 수정 전 (SQLite 형식):
```sql
"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
```

### 수정 후 (PostgreSQL 형식):
```sql
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
```

## ⚠️ 주의사항

- PostgreSQL은 `DATETIME` 타입을 지원하지 않습니다
- Prisma의 `DateTime` 타입은 PostgreSQL에서 `TIMESTAMP(3)`로 변환됩니다
- `TIMESTAMP(3)`는 밀리초 단위 정밀도를 제공합니다

## 🔍 확인 방법

배포 후 Vercel 빌드 로그에서 다음을 확인:
- ✅ `prisma migrate deploy` 성공 메시지
- ✅ 테이블 생성 성공 메시지
- ❌ `type "datetime" does not exist` 에러 없음

