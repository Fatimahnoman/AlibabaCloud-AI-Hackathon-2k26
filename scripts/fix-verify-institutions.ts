import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const r = await prisma.freeInstitution.updateMany({ data: { verificationStatus: 'verified' } });
  console.log('Updated', r.count, 'institutions to verified');
  await prisma.$disconnect();
}
main();
