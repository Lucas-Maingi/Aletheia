const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = process.argv[2] || 'aletheia-live@proton.me';
  console.log(`Upgrading user ${email} to admin role...`);
  
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    console.log(`Success! User ${user.email} is now an admin (Role: ${user.role}).`);
  } catch (error) {
    console.error(`Error: User with email ${email} not found or update failed.`);
    console.log("Creating new admin user since it doesn't exist...");
    try {
      const newUser = await prisma.user.create({
        data: {
          email,
          role: 'admin',
          plan: 'lifetime'
        }
      });
      console.log(`Success! Created new admin user: ${newUser.email}`);
    } catch (createErr) {
      console.error("Failed to create admin user:", createErr);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
