import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = 'admin@eduguard.com';
  const password = 'EduGuard@Admin2024';
  const name = 'EduGuard Admin';

  const passwordHash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: 'admin', passwordHash, isActive: true },
    });
    console.log(`Updated existing user to admin: ${updated.email} (id: ${updated.id})`);
  } else {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        role: 'admin',
        emailVerified: new Date(),
        isActive: true,
        preferredLanguage: 'en',
      },
    });
    console.log(`Admin user created: ${user.email} (id: ${user.id})`);
  }

  console.log('\n--- Admin Login Credentials ---');
  console.log(`Email:    ${email}`);
  console.log(`Password: ${password}`);
  console.log('-------------------------------\n');

  await prisma.$disconnect();
}

createAdmin().catch((e) => {
  console.error('Failed to create admin user:', e);
  process.exit(1);
});
