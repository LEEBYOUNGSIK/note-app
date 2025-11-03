# 🔄 데이터베이스 초기화 방법

데이터베이스를 완전히 초기화하는 방법입니다.

---

## 🔧 Vercel Postgres 초기화

### 방법 1: Reset Database (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com 로그인
   - 프로젝트 선택

2. **Storage 탭으로 이동**
   - 왼쪽 사이드바에서 **"Storage"** 클릭

3. **데이터베이스 선택**
   - 목록에서 PostgreSQL 데이터베이스 클릭

4. **Settings 선택**
   - 데이터베이스 상세 페이지에서 **"Settings"** 탭 클릭

5. **Reset Database**
   - 아래로 스크롤하여 **"Reset Database"** 섹션 찾기
   - **"Reset Database"** 버튼 클릭
   - 경고 메시지 확인 (모든 데이터가 삭제됨)
   - 데이터베이스 이름을 입력하여 확인
   - **"Reset Database"** 버튼 클릭

6. **완료**
   - 초기화가 완료되면 모든 테이블과 데이터가 삭제됩니다
   - 마이그레이션 히스토리도 함께 삭제됩니다

### 방법 2: 데이터베이스 삭제 후 재생성

1. **데이터베이스 삭제**
   - Storage → 데이터베이스 선택
   - Settings → "Delete Database" 클릭
   - 확인

2. **새 데이터베이스 생성**
   - Storage → "Create Database" → "Postgres" 선택
   - 이름 입력 후 생성

3. **환경 변수 업데이트** (필요시)
   - 새 데이터베이스의 연결 문자열 확인
   - Settings → Environment Variables → `DATABASE_URL` 업데이트

---

## 🔧 Neon.tech 초기화

### 방법 1: Reset Project (권장)

1. **Neon.tech 대시보드 접속**
   - https://neon.tech 로그인
   - 프로젝트 선택

2. **Settings 이동**
   - 왼쪽 사이드바에서 **"Settings"** 클릭

3. **Danger Zone 찾기**
   - 아래로 스크롤하여 **"Danger Zone"** 섹션 찾기

4. **Reset Project**
   - **"Reset Project"** 버튼 클릭
   - 경고 메시지 확인
   - 프로젝트 이름을 입력하여 확인
   - **"Reset Project"** 버튼 클릭

5. **완료**
   - 초기화가 완료되면 모든 데이터가 삭제됩니다

### 방법 2: SQL로 수동 초기화

SQL Editor에서 다음 SQL 실행:

```sql
-- 모든 테이블 삭제
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;

-- 모든 시퀀스 삭제 (있는 경우)
DROP SEQUENCE IF EXISTS "Note_id_seq" CASCADE;
DROP SEQUENCE IF EXISTS "User_id_seq" CASCADE;
```

---

## ⚠️ 주의사항

- **데이터 손실**: 초기화하면 모든 데이터가 영구적으로 삭제됩니다
- **복구 불가**: 삭제된 데이터는 복구할 수 없습니다
- **프로덕션 데이터**: 실제 사용 중인 데이터가 있다면 반드시 백업하세요

---

## ✅ 초기화 후 작업

초기화가 완료되면:

1. **재배포**
   - Vercel 대시보드 → Deployments → "Redeploy"
   - 또는 Git에 푸시하여 자동 재배포

2. **빌드 로그 확인**
   - 배포 후 빌드 로그에서 마이그레이션이 성공적으로 실행되는지 확인:
   ```
   Applying migration `20251101221559_init`
   ```

3. **테이블 생성 확인** (선택사항)
   - Prisma Studio: `npx prisma studio`
   - 또는 SQL Editor에서: `SELECT * FROM "_prisma_migrations";`

---

## 🔍 문제 해결

### Reset 버튼이 보이지 않을 때

- **권한 확인**: 프로젝트 관리자 권한이 필요할 수 있습니다
- **대안**: 데이터베이스 삭제 후 재생성

### 초기화 후에도 에러가 발생할 때

- **환경 변수 확인**: `DATABASE_URL`이 올바른지 확인
- **빌드 로그 확인**: 정확한 에러 메시지 확인
- **마이그레이션 파일 확인**: `TIMESTAMP(3)` 사용하는지 확인

