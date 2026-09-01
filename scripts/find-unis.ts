import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Search for FAST with different terms
  const fastUnis = await prisma.university.findMany({
    where: { OR: [
      { name: { contains: 'FAST' } },
      { name: { contains: 'National University of Computer' } },
      { name: { contains: 'nuces' } },
      { name: { contains: 'Foundation' } },
    ]},
    select: { name: true, city: true, country: true },
  });
  console.log('FAST/NUCES search:');
  for (const u of fastUnis) {
    console.log(`  ${u.name} (${u.city}, ${u.country})`);
  }

  // Search for NUST
  const nustUnis = await prisma.university.findMany({
    where: { OR: [
      { name: { contains: 'National University of Sciences' } },
      { name: { contains: 'NUST' } },
      { name: { contains: 'sciences and technology' } },
    ]},
    select: { name: true, city: true, country: true },
  });
  console.log('\nNUST search:');
  for (const u of nustUnis) {
    console.log(`  ${u.name} (${u.city}, ${u.country})`);
  }

  // Show all Islamabad universities
  const isbUnis = await prisma.university.findMany({
    where: { city: 'Islamabad', country: 'Pakistan' },
    select: { name: true, city: true },
    orderBy: { name: 'asc' },
  });
  console.log('\nAll Islamabad universities:');
  for (const u of isbUnis) {
    console.log(`  ${u.name}`);
  }

  // Show all Lahore universities
  const lhrUnis = await prisma.university.findMany({
    where: { city: 'Lahore', country: 'Pakistan' },
    select: { name: true, city: true },
    orderBy: { name: 'asc' },
  });
  console.log('\nAll Lahore universities:');
  for (const u of lhrUnis) {
    console.log(`  ${u.name}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
