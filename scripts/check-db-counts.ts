import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const [uniCount, deptCount, courseCount, campusCount] = await Promise.all([
    prisma.university.count(),
    prisma.department.count(),
    prisma.course.count(),
    prisma.campus.count(),
  ]);

  console.log('Database counts:');
  console.log('  Universities:', uniCount);
  console.log('  Departments:', deptCount);
  console.log('  Courses:', courseCount);
  console.log('  Campuses:', campusCount);

  // Check a few universities
  const sampleUnis = await prisma.university.findMany({
    take: 5,
    include: {
      _count: { select: { courses: true, departments: true, campuses: true } },
    },
  });

  console.log('\nSample universities:');
  for (const u of sampleUnis) {
    console.log(`  ${u.name} (${u.city}, ${u.country})`);
    console.log(`    Courses: ${u._count.courses}, Departments: ${u._count.departments}, Campuses: ${u._count.campuses}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
