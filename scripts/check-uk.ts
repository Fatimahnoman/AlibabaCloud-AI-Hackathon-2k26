import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  // Check Oxford and Cambridge departments
  const oxford = await p.university.findFirst({ where: { name: { contains: 'Oxford' } }, include: { departments: true } });
  const cambridge = await p.university.findFirst({ where: { name: { contains: 'Cambridge' } }, include: { departments: true } });

  console.log('=== OXFORD ===');
  if (oxford) {
    console.log(`ID: ${oxford.id}, Name: ${oxford.name}`);
    console.log(`Departments: ${oxford.departments.length}`);
    for (const d of oxford.departments) console.log(`  - ${d.name}`);
  }

  console.log('\n=== CAMBRIDGE ===');
  if (cambridge) {
    console.log(`ID: ${cambridge.id}, Name: ${cambridge.name}`);
    console.log(`Departments: ${cambridge.departments.length}`);
    for (const d of cambridge.departments) console.log(`  - ${d.name}`);
  }

  // Check if Lincoln exists
  const lincoln = await p.university.findFirst({ where: { name: { contains: 'Lincoln' } } });
  console.log(`\n=== LINCOLN ===`);
  console.log(lincoln ? `Found: ${lincoln.id} | ${lincoln.name}` : 'NOT FOUND');

  // Check top UK unis
  const ukUnis = await p.university.findMany({
    where: { country: 'United Kingdom' },
    select: { id: true, name: true, website: true },
  });
  console.log(`\n=== ALL UK UNIVERSITIES (${ukUnis.length}) ===`);
  for (const u of ukUnis) console.log(`${u.id} | ${u.name} | ${u.website || 'NO WEBSITE'}`);

  await p.$disconnect();
}
main();
