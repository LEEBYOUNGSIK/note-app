# 🚀 Vercel 배포 완전 가이드

## 📋 배포 전 체크리스트

- [ ] GitHub 저장소에 코드 푸시 완료
- [ ] PostgreSQL 데이터베이스 생성 완료
- [ ] 환경 변수 준비 완료 (DATABASE_URL, NEXTAUTH_SECRET)

---

## 🎯 방법 1: Vercel 대시보드에서 배포 (권장)

### 1단계: Vercel 계정 생성/로그인

1. **Vercel 접속**
   - https://vercel.com 접속
   - "Sign Up" 또는 "Log In" 클릭
   - **GitHub 계정으로 로그인** (권장)

### 2단계: 프로젝트 연결

1. **대시보드에서 "Add New..." 버튼 클릭**
2. **"Project" 선택**
3. **GitHub 저장소 선택**
   - "Import Git Repository" 클릭
   - GitHub 저장소 목록에서 `LEEBYOUNGSIK/my-own-note-app` 선택
   - 또는 GitHub 인증 후 저장소 검색

### 3단계: 프로젝트 설정

Vercel이 자동으로 감지하지만, 확인해야 할 항목:

**Framework Preset:**
- ✅ Next.js (자동 감지됨)

**Root Directory:**
- `./` (기본값, 프로젝트 루트)

**Build and Output Settings:**
- **Build Command**: `npm run build` (기본값)
- **Output Directory**: `.next` (기본값)
- **Install Command**: `npm install` (기본값)

⚠️ **중요**: PostgreSQL 사용 시 Build Command를 다음으로 변경:
```
prisma generate && prisma migrate deploy && next build
```
또는 package.json에 있는 `build:deploy` 스크립트 사용:
```
npm run build:deploy
```

### 4단계: 환경 변수 설정

**"Environment Variables" 섹션에서 추가:**

#### DATABASE_URL
```
Name: DATABASE_URL
Value: [PostgreSQL 연결 문자열]
☑ Production
☑ Preview
```

#### NEXTAUTH_SECRET
```
Name: NEXTAUTH_SECRET
Value: [생성한 시크릿 키]
☑ Production
☑ Preview
```

#### NEXTAUTH_URL
```
Name: NEXTAUTH_URL
Value: https://your-app-name.vercel.app
☑ Production
```
⚠️ **참고**: 배포 후 실제 URL로 업데이트 필요

**"Add" 버튼으로 각 변수 추가**

### 5단계: 배포 시작

1. 하단의 **"Deploy" 버튼** 클릭
2. 빌드 진행 상황 확인
   - 빌드 로그가 실시간으로 표시됨
   - 약 2-3분 소요

### 6단계: 배포 완료 확인

1. **배포 완료 후 URL 확인**
   - 예: `https://my-own-note-app.vercel.app`
   - "Visit" 버튼으로 사이트 접속

2. **NEXTAUTH_URL 업데이트**
   - Settings → Environment Variables
   - NEXTAUTH_URL을 실제 배포 URL로 수정
   - "Redeploy" 클릭하여 재배포

---

## 🛠️ 방법 2: Vercel CLI 사용

터미널에서 배포:

### 1단계: Vercel CLI 설치

```bash
npm i -g vercel
```

### 2단계: 로그인

```bash
vercel login
```
브라우저가 열리면 GitHub로 로그인

### 3단계: 프로젝트 배포

```bash
# 프로젝트 디렉토리에서
vercel
```

첫 배포 시 질문들:
- Set up and deploy? Yes
- Which scope? [계정 선택]
- Link to existing project? No
- What's your project's name? [프로젝트 이름]
- In which directory is your code located? ./
- Want to override settings? No

### 4단계: 환경 변수 추가

```bash
vercel env add DATABASE_URL production
# 프롬프트에 PostgreSQL 연결 문자열 입력

vercel env add NEXTAUTH_SECRET production
# 프롬프트에 시크릿 키 입력

vercel env add NEXTAUTH_URL production
# 프롬프트에 URL 입력 (나중에 업데이트 가능)
```

### 5단계: 프로덕션 배포

```bash
vercel --prod
```

---

## 📸 화면 가이드

### 첫 배포 화면 구조:

```
┌─────────────────────────────────────┐
│ Import Git Repository               │
├─────────────────────────────────────┤
│ 🔍 Search repositories...            │
│                                     │
│ ⬜ LEEBYOUNGSIK/my-own-note-app     │
│                                     │
│ [Import]                            │
└─────────────────────────────────────┘
```

### 프로젝트 설정 화면:

```
┌─────────────────────────────────────┐
│ Configure Project                    │
├─────────────────────────────────────┤
│ Framework Preset: Next.js ✓         │
│ Root Directory: ./                   │
│                                     │
│ Build Command: npm run build        │
│ Output Directory: .next              │
│ Install Command: npm install         │
│                                     │
│ Environment Variables:              │
│ + Add Variable                      │
│                                     │
│ [Cancel] [Deploy]                    │
└─────────────────────────────────────┘
```

---

## 🔄 자동 배포 설정

### GitHub 연결 시 자동 배포:

1. **기본 브랜치에 Push** → 자동 프로덕션 배포
2. **다른 브랜치에 Push** → 자동 프리뷰 배포
3. **Pull Request 생성** → 자동 프리뷰 배포

### 자동 배포 확인:

- Vercel 대시보드 → 프로젝트 → "Deployments" 탭
- 각 배포 상태 확인 가능

---

## ✅ 배포 후 확인 사항

### 1. 사이트 접속 테스트

```
https://your-app-name.vercel.app
```

### 2. 기능 테스트

- [ ] 회원가입 페이지 접속
- [ ] 새 계정 생성
- [ ] 로그인
- [ ] 노트 생성/수정/삭제
- [ ] 데이터베이스 연결 확인

### 3. 로그 확인 (문제 발생 시)

- Vercel 대시보드 → 프로젝트 → "Deployments"
- 배포 클릭 → "Function Logs" 탭
- 에러 메시지 확인

---

## 🐛 문제 해결

### 빌드 실패

**에러**: `prisma migrate deploy` 실패
**해결**: 
- Build Command를 `npm run build`로 변경
- 또는 환경 변수 `DATABASE_URL` 확인

**에러**: 의존성 충돌
**해결**: `.npmrc` 파일에 `legacy-peer-deps=true` 확인

### 배포는 성공했지만 앱이 작동 안 함

1. **환경 변수 확인**
   - Settings → Environment Variables
   - 모든 변수가 올바르게 설정되었는지 확인

2. **재배포**
   - Deployments → "Redeploy" 클릭

3. **로그 확인**
   - Function Logs에서 에러 메시지 확인

### 데이터베이스 연결 실패

1. **DATABASE_URL 형식 확인**
   - PostgreSQL 연결 문자열 형식: `postgresql://user:password@host/dbname?sslmode=require`

2. **데이터베이스 상태 확인**
   - Neon.tech 또는 Vercel Postgres 대시보드에서 확인

---

## 📝 배포 후 작업

### 1. 커스텀 도메인 설정 (선택사항)

1. Settings → Domains
2. 원하는 도메인 입력
3. DNS 설정 안내 따르기

### 2. 환경 변수 추가/수정

- Settings → Environment Variables
- 추가/수정 후 반드시 재배포

### 3. 빌드 최적화

- Settings → General
- Build & Development Settings에서 최적화

---

## 🎉 완료!

배포가 성공적으로 완료되면:
- ✅ 프로덕션 URL로 접속 가능
- ✅ 자동 배포 설정 완료
- ✅ 환경 변수 관리 가능

---

## 📚 추가 리소스

- [Vercel 공식 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [Prisma 배포 가이드](https://www.prisma.io/docs/guides/deployment)


