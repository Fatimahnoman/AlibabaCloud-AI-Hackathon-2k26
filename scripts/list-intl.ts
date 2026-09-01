import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  const unis = await p.university.findMany({
    where: { country: { not: 'Pakistan' } },
    include: { departments: true, courses: true },
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  });

  console.log(`Total international universities: ${unis.length}\n`);

  // Group by country
  const byCountry: Record<string, typeof unis> = {};
  for (const u of unis) {
    if (!byCountry[u.country]) byCountry[u.country] = [];
    byCountry[u.country].push(u);
  }

  for (const [country, unis] of Object.entries(byCountry)) {
    console.log(`\n=== ${country} (${unis.length} universities) ===`);
    for (const u of unis) {
      const deptNames = u.departments.map(d => d.name).join('; ');
      const hasGeneric = deptNames.includes('Department of Civil Engineering') && 
                         deptNames.includes('Department of Mechanical Engineering') &&
                         deptNames.includes('Department of Education');
      const flag = hasGeneric ? ' ⚠️ GENERIC' : '';
      console.log(`${u.id} | ${u.name} | ${u.departments.length} depts | ${u.courses.length} courses${flag}`);
      console.log(`  Website: ${u.website || '(none)'}`);
      console.log(`  Depts: ${deptNames || '(none)'}`);
    }
  }

  await p.$disconnect();
}
main();
