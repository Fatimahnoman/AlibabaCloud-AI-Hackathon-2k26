/* eslint-disable */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('=== Cleaning up FAKE data from international universities ===\n');

  // Step 1: Delete all courses with PKR currency from non-Pakistan universities
  const deletedPKRCourses = await prisma.course.deleteMany({
    where: {
      currency: 'PKR',
      university: { country: { not: 'Pakistan' } },
    },
  });
  console.log(`Step 1: Deleted ${deletedPKRCourses.count} fake PKR courses from international universities`);

  // Step 2: Delete all courses with null currency but generic Pakistani department names from non-Pakistan universities
  const genericPakDepts = [
    'Department of Management Sciences',
    'Department of Computer Science & Engineering',
    'Department of Civil Engineering',
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Sciences',
    'Department of Social Sciences',
    'Department of Education',
    'Department of Languages & Literature',
    'Department of Law',
  ];

  const deletedGenericCourses = await prisma.course.deleteMany({
    where: {
      university: { country: { not: 'Pakistan' } },
      department: { in: genericPakDepts },
      // Only delete if the course doesn't have a real department match
      // (i.e., the department name is one of the generic Pakistani ones)
    },
  });
  console.log(`Step 2: Deleted ${deletedGenericCourses.count} courses with generic Pakistani department names`);

  // Step 3: Delete generic Pakistani-style departments from international universities
  const deletedGenericDepts = await prisma.department.deleteMany({
    where: {
      university: { country: { not: 'Pakistan' } },
      name: { in: genericPakDepts },
    },
  });
  console.log(`Step 3: Deleted ${deletedGenericDepts.count} generic Pakistani-style departments`);

  // Step 4: Delete remaining courses with no department and no fee at international unis
  // (these are likely orphaned generic data)
  const deletedOrphaned = await prisma.course.deleteMany({
    where: {
      university: { country: { not: 'Pakistan' } },
      department: null,
      tuitionFee: null,
      verificationStatus: 'unverified',
    },
  });
  console.log(`Step 4: Deleted ${deletedOrphaned.count} orphaned unverified courses`);

  // Step 5: Verify cleanup
  const remainingPKR = await prisma.course.count({
    where: {
      currency: 'PKR',
      university: { country: { not: 'Pakistan' } },
    },
  });
  console.log(`\nVerification: ${remainingPKR} PKR courses remaining at international unis (should be 0)`);

  // Show final counts
  const intlUnis = await prisma.university.findMany({
    where: { country: { not: 'Pakistan' } },
    include: { _count: { select: { courses: true, departments: true } } },
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  });

  console.log(`\nFinal international university data:`);
  for (const u of intlUnis) {
    console.log(`  ${u.name} (${u.city}, ${u.country}): ${u._count.departments} depts, ${u._count.courses} courses`);
  }

  console.log('\n=== Cleanup complete! ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
