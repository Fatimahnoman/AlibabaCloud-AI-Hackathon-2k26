import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const total = await prisma.university.count();
  const noWebsite = await prisma.university.count({ where: { website: null } });
  const withWebsite = await prisma.university.count({ where: { website: { not: null } } });
  console.log('Total universities:', total);
  console.log('With website:', withWebsite);
  console.log('Missing website:', noWebsite);

  const missing = await prisma.university.findMany({
    where: { website: null },
    select: { id: true, name: true, country: true, city: true },
    orderBy: { name: 'asc' },
  });
  console.log('\nAll missing websites:');
  for (const u of missing) {
    console.log(`  ${u.id}: ${u.name} (${u.city}, ${u.country})`);
  }

  await prisma.$disconnect();
}

main();
