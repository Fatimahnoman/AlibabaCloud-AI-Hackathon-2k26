import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find international universities with PKR currency courses (should not exist)
  const intlWithPKR = await prisma.course.findMany({
    where: {
      currency: 'PKR',
      university: { country: { not: 'Pakistan' } },
    },
    include: {
      university: { select: { name: true, city: true, country: true } },
    },
  });

  console.log(`International courses with PKR currency: ${intlWithPKR.length}`);
  
  // Group by university
  const byUni: Record<string, typeof intlWithPKR> = {};
  for (const c of intlWithPKR) {
    const key = `${c.university.name} (${c.university.country})`;
    if (!byUni[key]) byUni[key] = [];
    byUni[key].push(c);
  }

  for (const [uni, courses] of Object.entries(byUni)) {
    console.log(`\n${uni}: ${courses.length} wrong PKR courses`);
    for (const c of courses.slice(0, 5)) {
      console.log(`  - ${c.name} (${c.degree}, Fee: PKR ${Number(c.tuitionFee).toLocaleString()}) [${c.department}]`);
    }
    if (courses.length > 5) console.log(`  ... and ${courses.length - 5} more`);
  }

  // Also check for courses with generic Pakistani department names at international unis
  const genericDepts = await prisma.course.findMany({
    where: {
      university: { country: { not: 'Pakistan' } },
      department: { contains: 'Department of Management Sciences' },
    },
    include: {
      university: { select: { name: true, city: true, country: true } },
    },
  });
  console.log(`\n\nInternational courses with 'Department of Management Sciences': ${genericDepts.length}`);
  for (const c of genericDepts.slice(0, 10)) {
    console.log(`  - ${c.university.name} (${c.university.country}): ${c.name}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
