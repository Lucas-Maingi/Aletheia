import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- DATABASE DIAGNOSTIC ---');
    
    // Check recent investigations
    const investigations = await prisma.investigation.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5
    });

    for (const inv of investigations) {
        const evidenceCount = await prisma.evidence.count({ where: { investigationId: inv.id } });
        const entityCount = await prisma.entity.count({ where: { investigationId: inv.id } });
        const logCount = await prisma.searchLog.count({ where: { investigationId: inv.id } });
        
        console.log(`Investigation [${inv.id}]:`);
        console.log(` - Title: ${inv.title}`);
        console.log(` - Status: ${inv.status}`);
        console.log(` - Evidence: ${evidenceCount}`);
        console.log(` - Entities: ${entityCount}`);
        console.log(` - Logs: ${logCount}`);
        console.log('---------------------------');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
