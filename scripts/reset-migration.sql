-- 실패한 Prisma 마이그레이션을 수정하는 SQL 스크립트
-- 데이터베이스 관리 도구(psql, DBeaver, pgAdmin 등)에서 실행하거나
-- Neon.tech/Vercel Postgres SQL Editor에서 실행

-- 1. 실패한 마이그레이션 기록 확인
SELECT * FROM "_prisma_migrations" 
WHERE migration_name = '20251101221559_init';

-- 2. 부분적으로 생성된 테이블 삭제 (데이터 손실 주의!)
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

-- 3. 실패한 마이그레이션 기록 삭제
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251101221559_init';

-- 4. 확인
SELECT * FROM "_prisma_migrations";

