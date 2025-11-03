/**
 * 빌드 전에 실패한 마이그레이션을 자동으로 해결하는 스크립트
 * package.json의 build 스크립트에서 사용
 */

const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function preBuildFix() {
  // Prisma Client가 생성되어 있는지 확인
  try {
    const prisma = new PrismaClient();
    
    // 실패한 마이그레이션이 있는지 확인
    try {
      const failedMigrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM "_prisma_migrations" 
        WHERE migration_name = '20251101221559_init' 
          AND finished_at IS NULL
      `;
      
      if (failedMigrations && failedMigrations.length > 0) {
        console.log('🔧 실패한 마이그레이션 발견. 정리 중...');
        
        // 부분적으로 생성된 테이블 삭제
        try {
          await prisma.$executeRaw`DROP TABLE IF EXISTS "Note" CASCADE`;
          await prisma.$executeRaw`DROP TABLE IF EXISTS "User" CASCADE`;
        } catch (e) {
          // 테이블이 없을 수도 있음
          console.log('⚠️ 테이블 삭제 시도 중 에러 (무시 가능):', e.message);
        }
        
        // 실패한 마이그레이션 기록 삭제
        await prisma.$executeRaw`
          DELETE FROM "_prisma_migrations" 
          WHERE migration_name = '20251101221559_init' 
            AND finished_at IS NULL
        `;
        
        console.log('✅ 실패한 마이그레이션 정리 완료');
      } else {
        console.log('✅ 실패한 마이그레이션 없음');
      }
    } catch (error) {
      // 마이그레이션 테이블이 아직 존재하지 않을 수도 있음 (처음 배포)
      if (error.message.includes('relation "_prisma_migrations" does not exist')) {
        console.log('ℹ️ 마이그레이션 테이블이 아직 없습니다 (정상)');
      } else {
        console.log('⚠️ 마이그레이션 확인 중 에러 (무시할 수 있음):', error.message);
      }
    }
    
    await prisma.$disconnect();
  } catch (error) {
    // Prisma Client가 아직 생성되지 않았을 수도 있음
    console.log('⚠️ Prisma Client 확인 중 에러 (빌드 중 정상):', error.message);
  }
}

// 스크립트로 직접 실행된 경우에만 실행
if (require.main === module) {
  preBuildFix().catch((error) => {
    console.error('❌ Pre-build fix 실패:', error);
    // 에러가 발생해도 빌드를 계속 진행
    process.exit(0);
  });
}

module.exports = { preBuildFix };

