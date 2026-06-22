const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Listing users in the database...");
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' }
    });
    console.log("Registered Users count:", users.length);
    users.forEach(u => {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Role: ${u.role} | Plan: ${u.plan}`);
    });
  } catch (error) {
    console.error("Error listing users:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
