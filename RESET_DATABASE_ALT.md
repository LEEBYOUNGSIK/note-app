# 🔄 데이터베이스 초기화 - 대안 방법

Reset Database 버튼이 없을 때 사용하는 방법입니다.

---

## ⚡ 방법 1: SQL Editor로 직접 초기화 (가장 빠름)

### Vercel Postgres:

1. **Storage → 데이터베이스 클릭**
2. **"SQL Editor" 또는 "Query" 탭 클릭**
3. **다음 SQL 복사하여 실행**:

```sql
-- 모든 테이블 삭제
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 마이그레이션 히스토리 테이블 삭제
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
```

4. **"Run" 또는 "Execute" 버튼 클릭**
5. **완료 확인**: "Query executed successfully" 메시지 확인

6. **재배포**: Vercel에서 재배포하면 마이그레이션이 처음부터 다시 실행됩니다

---

## ⚡ 방법 2: 데이터베이스 삭제 후 재생성

### Vercel Postgres:

1. **Storage → 데이터베이스 선택**
2. **Settings 탭에서 아래로 스크롤**
3. **"Delete Database" 또는 "Remove Database" 버튼 찾기**
   - 보통 "Danger Zone" 섹션에 있음
   - 또는 상단의 "⋯" 메뉴에 있을 수 있음

4. **삭제 확인**
5. **새 데이터베이스 생성**:
   - Storage → "Create Database" → "Postgres" 선택
   - 이름 입력 후 생성

6. **환경 변수 확인** (필요시):
   - 새 데이터베이스의 연결 문자열 확인
   - Settings → Environment Variables → `DATABASE_URL`이 자동으로 업데이트되었는지 확인
   - Vercel Postgres는 보통 자동으로 환경 변수를 설정합니다

7. **재배포**

---

## ⚡ 방법 3: Prisma 명령어로 초기화 (로컬에서)

로컬에 `.env.local` 파일이 있고 `DATABASE_URL`이 설정되어 있다면:

```bash
# Prisma 마이그레이션 상태 확인
npx prisma migrate status

# 마이그레이션 리셋 (데이터베이스 내용만 삭제)
npx prisma migrate reset

# 또는 직접 SQL 실행
npx prisma db execute --stdin
# 그 다음 SQL 입력:
# DROP TABLE IF EXISTS "Note" CASCADE;
# DROP TABLE IF EXISTS "User" CASCADE;
# DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
```

---

## 🔍 Vercel UI에서 찾을 수 있는 위치들

Reset/Drop 버튼이 있을 수 있는 위치:

1. **Settings 탭**
   - 아래쪽 "Danger Zone" 섹션
   - 또는 맨 아래

2. **상단 메뉴**
   - 데이터베이스 이름 옆 "⋯" (점 3개) 메뉴
   - "Delete" 또는 "Remove" 옵션

3. **개별 설정 페이지**
   - "Settings" → "General" 또는 "Configuration"에서 찾기

---

## ✅ 추천: 방법 1 (SQL Editor)

가장 빠르고 확실한 방법은 **SQL Editor에서 직접 SQL을 실행**하는 것입니다:

```sql
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
```

이렇게 하면:
- ✅ 모든 테이블 삭제
- ✅ 마이그레이션 히스토리 초기화
- ✅ 데이터베이스는 유지 (연결 문자열 변경 불필요)
- ✅ 재배포만 하면 됨

---

## 📝 단계별 가이드 (SQL Editor 사용)

1. **Vercel 대시보드 → Storage → 데이터베이스 클릭**
2. **"SQL Editor" 또는 "Query" 탭 찾기**
   - 탭이 보이지 않으면 "View" 또는 "Tools" 섹션 확인

3. **SQL 입력란에 다음 복사/붙여넣기**:
```sql
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
```

4. **"Run" 또는 "Execute" 버튼 클릭**

5. **성공 메시지 확인**

6. **Vercel에서 재배포**

---

## ⚠️ 문제 해결

### SQL Editor가 보이지 않을 때

- Vercel Postgres의 UI 버전에 따라 "Query Editor", "SQL", "Execute Query" 등으로 표시될 수 있습니다
- 또는 데이터베이스 상세 페이지의 다른 탭을 확인해보세요

### 대안

방법 2처럼 데이터베이스를 삭제하고 재생성하는 것도 좋은 방법입니다. 환경 변수는 Vercel이 자동으로 업데이트합니다.

