const { PrismaClient } = require('@prisma/client');

async function grantAdmin() {
    const prisma = new PrismaClient();
    try {
        const lastUser = await prisma.user.findFirst({
            orderBy: { createdAt: 'desc' }
        });
        
        if (!lastUser) {
            console.error('No users found in database.');
            return;
        }

        const updated = await prisma.user.update({
            where: { id: lastUser.id },
            data: { role: 'admin' }
        });

        console.log(`Success: User ${updated.email} (${updated.id}) has been promoted to ADMIN.`);
    } catch (e) {
        console.error('Promotion failed:', e);
    } finally {
        await prisma.$disconnect();
    }
}

grantAdmin();
