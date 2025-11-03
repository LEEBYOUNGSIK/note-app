/**
 * 실패한 Prisma 마이그레이션을 수정하는 스크립트
 * 배포 전에 실행하거나, 데이터베이스에 직접 접근하여 SQL로 실행 가능
 */

const { PrismaClient } = require('@prisma/client');

async function fixMigration() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 실패한 마이그레이션 확인 중...');
    
    // 실패한 마이그레이션 확인
    const failedMigrations = await prisma.$queryRaw`
      SELECT * FROM "_prisma_migrations" 
      WHERE migration_name = '20251101221559_init' 
        AND finished_at IS NULL
    `;
    
    if (failedMigrations.length === 0) {
      console.log('✅ 실패한 마이그레이션이 없습니다.');
      return;
    }
    
    console.log(`❌ 실패한 마이그레이션 발견: ${failedMigrations.length}개`);
    
    // 부분적으로 생성된 테이블 삭제
    console.log('🧹 부분적으로 생성된 테이블 정리 중...');
    await prisma.$executeRaw`DROP TABLE IF EXISTS "Note" CASCADE`;
    await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE`;
    
    // 실패한 마이그레이션 기록 삭제
    console.log('🗑️ 실패한 마이그레이션 기록 삭제 중...');
    await prisma.$executeRaw`
      DELETE FROM "_prisma_migrations" 
      WHERE migration_name = '20251101221559_init'
    `;
    
    console.log('✅ 마이그레이션 정리 완료! 이제 재배포할 수 있습니다.');
    
  } catch (error) {
    console.error('❌ 에러 발생:', error.message);
    console.log('\n💡 수동으로 데이터베이스에 접근하여 다음 SQL을 실행하세요:');
    console.log(`
-- 실패한 마이그레이션 기록 삭제
DELETE FROM "_prisma_migrations" 
WHERE migration_name = '20251101221559_init';

-- 부분적으로 생성된 테이블 삭제
DROP TABLE IF EXISTS "Note" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;
    `);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

fixMigration();

