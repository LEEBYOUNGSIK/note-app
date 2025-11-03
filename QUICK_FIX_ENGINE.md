# ⚡ Prisma Query Engine 에러 빠른 해결

## 🎯 해결 방법 (3단계)

### 1단계: 로컬에서 Prisma Client 재생성

터미널에서 실행:

```bash
npx prisma generate
```

이 명령어는 Vercel 서버리스 환경(`rhel-openssl-3.0.x`)을 위한 Query Engine을 생성합니다.

### 2단계: 변경사항 커밋 및 푸시

```bash
git add .
git commit -m "fix: Prisma Query Engine 재생성"
git push
```

### 3단계: Vercel 재배포

Git에 푸시하면 자동으로 재배포되거나, Vercel 대시보드에서 수동으로 "Redeploy" 클릭

---

## ✅ 확인 사항

**이미 설정되어 있는 항목들:**

1. ✅ `prisma/schema.prisma`:
   ```prisma
   binaryTargets = ["native", "rhel-openssl-3.3.0.x"]
   ```

2. ✅ `package.json`:
   ```json
   "build": "prisma generate && prisma migrate deploy && next build",
   "postinstall": "prisma generate"
   ```

따라서 **로컬에서 `npx prisma generate`만 실행하고 커밋/푸시**하면 해결됩니다!

---

## 🔍 빌드 로그 확인

재배포 후 Vercel 빌드 로그에서 다음을 확인:

✅ 성공:
```
Prisma schema loaded from prisma/schema.prisma
Running generate...
```

❌ 실패 시:
- 빌드 로그의 전체 에러 메시지를 확인하세요
- `prisma generate`가 실행되는지 확인하세요

