import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const institutions = await prisma.freeInstitution.findMany({
    select: { id: true, name: true, type: true, province: true },
    orderBy: { name: 'asc' },
  });
  console.log(`Total: ${institutions.length}`);
  for (const i of institutions) {
    console.log(`${i.id} | ${i.name} | ${i.type} | ${i.province}`);
  }
  await prisma.$disconnect();
}

main();
