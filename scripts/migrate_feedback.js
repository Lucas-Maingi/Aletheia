const { PrismaClient } = require('@prisma/client');

async function migrate() {
    console.log('Deploying Feedback Schema Upgrade via Raw SQL...');
    const prisma = new PrismaClient();
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'pending';`);
        console.log('Added feedback status column');
    } catch (e) { console.error(e.message); }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "replyContent" TEXT;`);
        console.log('Added feedback replyContent column');
    } catch (e) { console.error(e.message); }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "adminId" TEXT;`);
        console.log('Added feedback adminId column');
    } catch (e) { console.error(e.message); }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "feedback" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`);
        console.log('Added feedback updatedAt column');
    } catch (e) { console.error(e.message); }
    
    console.log('Migration operations concluded.');
    await prisma.$disconnect();
}

migrate().catch(console.error);
