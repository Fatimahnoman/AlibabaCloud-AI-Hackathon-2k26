const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  // Check colleges
  const colleges = await p.university.findMany({
    where: { type: 'college' },
    select: { 
      id: true, name: true, country: true, city: true, sector: true,
      closingMerit: true, entryTestDetails: true, isOpenMerit: true,
      supplyPolicy: true, feeRange: true, admissionProcess: true, scholarshipsOffered: true,
      _count: { select: { courses: true, departments: true } },
    },
    orderBy: { name: 'asc' },
  });

  console.log(`=== COLLEGES IN DATABASE: ${colleges.length} ===\n`);
  colleges.forEach(c => {
    const hasKnowledge = c.closingMerit || c.feeRange || c.admissionProcess;
    console.log(`${c.id} | ${c.name} | ${c.city || 'N/A'} | ${c.sector || 'N/A'} | Courses: ${c._count.courses} | Depts: ${c._count.departments} | Knowledge: ${hasKnowledge ? 'YES' : 'NO'}`);
  });

  // Also check schools
  const schools = await p.university.findMany({
    where: { type: 'school' },
    select: { id: true, name: true, country: true, city: true, _count: { select: { courses: true } } },
  });
  console.log(`\n=== SCHOOLS IN DATABASE: ${schools.length} ===`);
  schools.forEach(s => console.log(`${s.id} | ${s.name} | ${s.city || 'N/A'} | Courses: ${s._count.courses}`));

  // Check types breakdown
  const types = await p.university.groupBy({
    by: ['type'],
    _count: true,
  });
  console.log('\n=== TYPE BREAKDOWN ===');
  types.forEach(t => console.log(`${t.type}: ${t._count}`));

  await p.$disconnect();
}

main();
