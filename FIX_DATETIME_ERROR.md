# 🔧 DATETIME 타입 에러 해결 (P3018)

`type "datetime" does not exist` 에러를 해결하는 방법입니다.

## 🐛 에러 원인

PostgreSQL은 `DATETIME` 타입을 지원하지 않습니다. PostgreSQL에서는 `TIMESTAMP` 또는 `TIMESTAMP(3)`를 사용해야 합니다.

에러가 발생하는 이유:
- 데이터베이스에 실패한 마이그레이션 기록이 남아있음
- 마이그레이션 파일은 이미 수정되었지만, 데이터베이스 상태가 맞지 않음

---

## ✅ 빠른 해결 방법

### 방법 1: 데이터베이스 완전 초기화 (가장 확실)

**Vercel Postgres:**
1. 대시보드 → Storage → 데이터베이스 선택
2. Settings → **Reset Database** 클릭
3. 확인 후 재배포

**Neon.tech:**
1. 대시보드 → 프로젝트 선택
2. Settings → **Reset Project** 클릭
3. 확인 후 재배포

이렇게 하면 모든 테이블과 마이그레이션 히스토리가 삭제되고, 처음부터 다시 시작합니다.

---

### 방법 2: SQL로 수동 정리

데이터베이스 SQL Editor에서 다음 SQL 실행:

```sql
-- 1. 부분적으로 생성된 테이블 삭제
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 2. 마이그레이션 히스토리 테이블 확인
SELECT * FROM "_prisma_migrations";

-- 3. 실패한 마이그레이션 기록 삭제
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251101221559_init';

-- 4. 또는 마이그레이션 히스토리 테이블 전체 삭제 (처음부터 시작)
DROP TABLE IF EXISTS "_prisma_migrations";
```

그 후 재배포하면 마이그레이션이 처음부터 다시 실행됩니다.

---

### 방법 3: 마이그레이션 파일 재생성 (고급)

만약 마이그레이션 파일에 문제가 있다면:

1. **마이그레이션 폴더 백업 후 삭제** (선택사항):
```bash
# Windows
move prisma\migrations prisma\migrations_backup

# Mac/Linux
mv prisma/migrations prisma/migrations_backup
```

2. **데이터베이스 초기화 후 새 마이그레이션 생성**:
```bash
# Prisma Client 재생성
npx prisma generate

# 새 마이그레이션 생성
npx prisma migrate dev --name init
```

3. **생성된 마이그레이션 파일 확인**:
   - `prisma/migrations/[timestamp]_init/migration.sql` 파일 열기
   - `TIMESTAMP(3)` 또는 `TIMESTAMP`로 되어 있는지 확인
   - `DATETIME`이 있으면 `TIMESTAMP(3)`로 수정

4. **커밋 및 푸시**:
```bash
git add prisma/migrations
git commit -m "fix: PostgreSQL 호환 마이그레이션 재생성"
git push
```

---

## 🔍 마이그레이션 파일 확인

현재 마이그레이션 파일(`prisma/migrations/20251101221559_init/migration.sql`)이 올바른지 확인:

✅ 올바른 형식:
```sql
"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
```

❌ 잘못된 형식:
```sql
"createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIM_TIMESTAMP
```

---

## 📋 해결 체크리스트

- [ ] 데이터베이스 초기화 또는 SQL로 정리 완료
- [ ] 마이그레이션 파일이 `TIMESTAMP(3)` 사용하는지 확인
- [ ] 재배포 완료
- [ ] 빌드 로그에서 성공 메시지 확인

---

## ⚠️ 중요 사항

1. **데이터 손실**: 데이터베이스를 초기화하면 모든 데이터가 삭제됩니다
2. **프로덕션 데이터**: 프로덕션 환경이라면 반드시 백업 후 작업하세요
3. **마이그레이션 순서**: 마이그레이션은 순서대로 실행되므로 실패한 마이그레이션 이후의 마이그레이션도 적용되지 않습니다

---

## 💡 예방

향후 이런 문제를 방지하려면:

1. **로컬에서 먼저 테스트**:
```bash
npx prisma migrate dev
```

2. **스키마 변경 후 확인**:
   - PostgreSQL을 사용할 때는 `DATETIME` 대신 `TIMESTAMP` 사용
   - Prisma의 `DateTime` 타입은 자동으로 `TIMESTAMP(3)`로 변환됨

