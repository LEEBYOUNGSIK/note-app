# ⚡ 빠른 데이터베이스 설정 (3분 가이드)

데이터베이스를 삭제했을 때 빠르게 재설정하는 방법입니다.

## 🚀 3단계로 해결

### 1️⃣ 새로운 데이터베이스 생성 (1분)

**Vercel Postgres 사용:**
1. Vercel 대시보드 → 프로젝트 선택
2. 왼쪽 메뉴 "Storage" 클릭
3. "Create Database" → "Postgres" 선택
4. 이름 입력 후 생성

### 2️⃣ 연결 문자열 복사 (30초)

생성된 데이터베이스 클릭:
- ".env.local" 탭 → `POSTGRES_PRISMA_URL` 복사
- 또는 Settings → "Connection String" 복사

### 3️⃣ 환경 변수 업데이트 (1분)

Vercel 대시보드:
1. Settings → Environment Variables
2. 기존 `DATABASE_URL` 삭제 (있다면)
3. "Add New":
   - Name: `DATABASE_URL`
   - Value: 2단계에서 복사한 연결 문자열
   - ✅ Production, ✅ Preview, ✅ Development 모두 체크
   - Save

### 4️⃣ 재배포

- 자동: Git에 푸시 또는 Vercel의 "Redeploy" 버튼 클릭

---

## ✅ 완료!

재배포 후 빌드가 성공하면 설정 완료입니다.

---

## 🔗 대안: Neon.tech 사용

Vercel Postgres 대신 Neon.tech를 사용할 수도 있습니다:

1. https://neon.tech 접속 및 로그인
2. "Create Project" 클릭
3. 연결 문자열 복사
4. 위의 3단계부터 동일하게 진행

