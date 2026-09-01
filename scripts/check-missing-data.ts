import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find universities with no departments
  const unisNoDepts = await prisma.university.findMany({
    where: { departments: { none: {} } },
    include: { _count: { select: { courses: true, departments: true, campuses: true } } },
  });

  console.log(`Universities with NO departments: ${unisNoDepts.length}`);
  console.log('Sample (first 10):');
  for (const u of unisNoDepts.slice(0, 10)) {
    console.log(`  ${u.name} (${u.city}, ${u.country}) - Courses: ${u._count.courses}, Campuses: ${u._count.campuses}`);
  }

  // Find universities with no courses
  const unisNoCourses = await prisma.university.findMany({
    where: { courses: { none: {} } },
    include: { _count: { select: { courses: true, departments: true, campuses: true } } },
  });

  console.log(`\nUniversities with NO courses: ${unisNoCourses.length}`);
  console.log('Sample (first 10):');
  for (const u of unisNoCourses.slice(0, 10)) {
    console.log(`  ${u.name} (${u.city}, ${u.country}) - Depts: ${u._count.departments}, Campuses: ${u._count.campuses}`);
  }

  // Check Pakistan universities specifically
  const pakUnis = await prisma.university.findMany({
    where: { country: 'Pakistan' },
    include: { _count: { select: { courses: true, departments: true, campuses: true } } },
    orderBy: { name: 'asc' },
  });

  console.log(`\nPakistan universities: ${pakUnis.length}`);
  const pakNoDepts = pakUnis.filter(u => u._count.departments === 0);
  const pakNoCourses = pakUnis.filter(u => u._count.courses === 0);
  console.log(`  With no departments: ${pakNoDepts.length}`);
  console.log(`  With no courses: ${pakNoCourses.length}`);

  if (pakNoDepts.length > 0) {
    console.log('\nPakistan universities missing departments:');
    for (const u of pakNoDepts.slice(0, 15)) {
      console.log(`  ${u.name} (${u.city}) - Courses: ${u._count.courses}`);
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
