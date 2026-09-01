const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Clear wrong data from international universities
  const intlUnis = await p.university.findMany({
    where: {
      country: { not: 'Pakistan' },
      closingMerit: { not: null },
    },
    select: { id: true, name: true, country: true },
  });

  console.log(`Clearing wrong data from ${intlUnis.length} international universities...`);
  for (const u of intlUnis) {
    await p.university.update({
      where: { id: u.id },
      data: {
        closingMerit: null,
        entryTestDetails: null,
        isOpenMerit: null,
        supplyPolicy: null,
        feeRange: null,
        admissionProcess: null,
        scholarshipsOffered: null,
      },
    });
    console.log(`  🗑️  Cleared: ${u.name} (${u.country})`);
  }

  const totalWithData = await p.university.count({ where: { closingMerit: { not: null } } });
  console.log(`\n=== DONE: ${totalWithData} universities with knowledge fields (all Pakistan) ===`);

  await p.$disconnect();
}

main();
