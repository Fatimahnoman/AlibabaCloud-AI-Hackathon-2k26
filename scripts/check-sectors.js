const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSectors() {
  console.log('=== CHECKING SECTOR DISTRIBUTION ===\n');

  // Check what sector values exist
  const allUnis = await prisma.university.findMany({
    select: { name: true, sector: true, country: true }
  });

  const sectorValues = {};
  allUnis.forEach(u => {
    const sector = u.sector || 'NULL';
    sectorValues[sector] = (sectorValues[sector] || 0) + 1;
  });

  console.log('Sector values found:');
  Object.entries(sectorValues).forEach(([value, count]) => {
    console.log(`  "${value}": ${count} universities`);
  });

  // Check Pakistani universities specifically
  console.log('\n\nPakistani Universities by Sector:');
  const pakUnis = await prisma.university.findMany({
    where: { country: { contains: 'Pakistan' } },
    select: { name: true, sector: true }
  });

  const pakSectors = {};
  pakUnis.forEach(u => {
    const sector = u.sector || 'NULL';
    pakSectors[sector] = (pakSectors[sector] || 0) + 1;
  });

  Object.entries(pakSectors).forEach(([value, count]) => {
    console.log(`  "${value}": ${count} universities`);
  });

  // Sample some universities to see their sector values
  console.log('\n\nSample Universities:');
  const sample = await prisma.university.findMany({
    where: { country: { contains: 'Pakistan' } },
    select: { name: true, sector: true },
    take: 10
  });

  sample.forEach(u => {
    console.log(`  ${u.name}: sector="${u.sector}"`);
  });
}

checkSectors()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
