import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const unis = await p.university.findMany({
    include: { courses: true, departments: true },
    orderBy: { name: 'asc' },
  });

  const results = unis.map(u => ({
    id: u.id,
    name: u.name,
    country: u.country,
    courses: u.courses.length,
    depts: u.departments.length,
    website: u.website,
  })).sort((a, b) => a.courses - b.courses);

  console.log(`Total: ${results.length} institutions`);
  console.log(`\n<=3 courses: ${results.filter(r => r.courses <= 3).length}`);
  console.log(`4-5 courses: ${results.filter(r => r.courses >= 4 && r.courses <= 5).length}`);
  console.log(`6+ courses: ${results.filter(r => r.courses >= 6).length}`);

  // Show universities (not schools) with sparse courses
  const sparse = results.filter(r => r.courses <= 5 && !r.id.startsWith('sch-'));
  console.log(`\n=== UNIVERSITIES WITH <=5 COURSES (${sparse.length}) ===`);
  for (const s of sparse) {
    console.log(`  ${s.name} | ${s.country} | ${s.courses} courses | ${s.depts} depts | ${s.website || 'NO WEB'}`);
  }

  // UK universities
  const uk = results.filter(r => r.country === 'United Kingdom' && !r.id.startsWith('sch-'));
  console.log(`\n=== UK UNIVERSITIES (${uk.length}) ===`);
  for (const u of uk) {
    console.log(`  ${u.name} | ${u.courses} courses | ${u.depts} depts`);
  }

  await p.$disconnect();
}
main();
