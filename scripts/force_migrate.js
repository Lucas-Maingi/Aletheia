const { PrismaClient } = require('@prisma/client');

async function migrate() {
    console.log('Deploying schema over active pooler via Raw SQL...');
    const prisma = new PrismaClient();
    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN "gumroadCustomerId" TEXT UNIQUE;`);
        console.log('Added gumroadCustomerId');
    } catch (e) {
        if (e.message.includes('already exists')) console.log('gumroadCustomerId already exists');
        else console.error(e.message);
    }

    try {
        await prisma.$executeRawUnsafe(`ALTER TABLE "users" ADD COLUMN "gumroadSubscriptionId" TEXT UNIQUE;`);
        console.log('Added gumroadSubscriptionId');
    } catch (e) {
        if (e.message.includes('already exists')) console.log('gumroadSubscriptionId already exists');
        else console.error(e.message);
    }
    
    console.log('Migration operations concluded.');
    await prisma.$disconnect();
}

migrate().catch(console.error);
