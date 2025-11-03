# 🔧 Prisma Query Engine 에러 해결

`Prisma Client could not locate the Query Engine for runtime "rhel-openssl-3.0.x"` 에러 해결 방법입니다.

---

## ✅ 해결 방법

### 1단계: 로컬에서 Prisma Client 재생성

```bash
# Prisma Client 재생성 (모든 binaryTargets 포함)
npx prisma generate
```

이 명령어는 로컬(`native`)과 Vercel(`rhel-openssl-3.0.x`) 모두에 맞는 Query Engine을 생성합니다.

### 2단계: 생성된 파일 확인

다음 경로에 Query Engine 파일이 생성되었는지 확인:

- `node_modules/.prisma/client/libquery_engine-rhel-openssl-3.0.x.so.node` (Linux)
- `node_modules/.prisma/client/query_engine-rhel-openssl-3.0.x.node` (기타)

### 3단계: 빌드 스크립트 확인

`package.json`에서 `build` 스크립트에 `prisma generate`가 포함되어 있는지 확인:

```json
{
  "scripts": {
    "build": "prisma generate && prisma migrate deploy && next build",
    "postinstall": "prisma generate"
  }
}
```

✅ 이미 올바르게 설정되어 있습니다.

### 4단계: Git에 커밋하고 푸시

변경사항을 커밋하고 푸시하면 Vercel이 재배포합니다:

```bash
git add .
git commit -m "fix: Prisma Client 재생성"
git push
```

---

## 🔍 추가 확인 사항

### schema.prisma 확인

`prisma/schema.prisma` 파일에서 `binaryTargets`가 올바르게 설정되어 있는지 확인:

```prisma
generator client {
  provider      = "prisma-client-js"
  binaryTargets = ["native", "rhel-openssl-3.0.x"]
}
```

✅ 이미 올바르게 설정되어 있습니다.

### Vercel 빌드 로그 확인

배포 후 빌드 로그에서 다음을 확인:

1. **`prisma generate` 실행 여부**:
   ```
   Prisma schema loaded from prisma/schema.prisma
   ```

2. **Query Engine 다운로드 여부**:
   ```
   Running generate...
   ```

3. **에러 없이 완료되는지 확인**

---

## 🐛 여전히 에러가 발생할 때

### 방법 1: 로컬에서 강제 재생성

```bash
# node_modules와 .prisma 폴더 삭제
rm -rf node_modules/.prisma
# Windows: rmdir /s /q node_modules\.prisma

# Prisma Client 재생성
npx prisma generate

# 커밋 및 푸시
git add .
git commit -m "fix: Prisma Query Engine 강제 재생성"
git push
```

### 방법 2: Vercel 빌드 설정 수정

Vercel 대시보드에서:
1. Settings → Build & Development Settings
2. Build Command 확인:
   ```
   npm install && npm run build
   ```
   
   또는 명시적으로:
   ```
   npm install && npx prisma generate && npm run build
   ```

### 방법 3: vercel.json 생성 (선택사항)

프로젝트 루트에 `vercel.json` 파일 생성:

```json
{
  "buildCommand": "prisma generate && prisma migrate deploy && next build",
  "installCommand": "npm install"
}
```

하지만 `package.json`에 이미 설정되어 있으므로 일반적으로 불필요합니다.

---

## ⚠️ 주의사항

- `.gitignore`에 `node_modules`가 무시되므로, Prisma 파일은 빌드 시 생성됩니다
- Vercel은 `postinstall` 스크립트를 자동으로 실행합니다
- 문제가 계속되면 빌드 로그를 확인하여 실제 에러 메시지를 확인하세요

---

## 📋 체크리스트

- [ ] `prisma/schema.prisma`에 `binaryTargets = ["native", "rhel-openssl-3.0.x"]` 포함 확인
- [ ] 로컬에서 `npx prisma generate` 실행
- [ ] `package.json`에 `postinstall: "prisma generate"` 확인
- [ ] 변경사항 커밋 및 푸시
- [ ] Vercel 빌드 로그에서 `prisma generate` 성공 확인
- [ ] 재배포 후 에러 해결 확인

