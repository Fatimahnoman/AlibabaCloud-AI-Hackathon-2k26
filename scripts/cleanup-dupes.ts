import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  // Step 1: Delete old duplicate entries (keep the newer ones with more data)
  const duplicates = ['uni-009', 'uni-010', 'uni-007', 'uni-008', 'uni-011', 'uni-012', 'uni-005', 'uni-006'];
  
  for (const id of duplicates) {
    const uni = await p.university.findUnique({ where: { id }, include: { courses: true, departments: true } });
    if (uni) {
      console.log(`Deleting duplicate: ${uni.name} (${id}) - ${uni.courses.length} courses, ${uni.departments.length} depts`);
      await p.course.deleteMany({ where: { universityId: id } });
      await p.department.deleteMany({ where: { universityId: id } });
      await p.university.delete({ where: { id } });
    }
  }

  // Step 2: Check remaining duplicates
  const remaining = await p.university.findMany({
    where: { name: { in: ['Massachusetts Institute of Technology (MIT)', 'Stanford University', 'University of Toronto', 'University of Melbourne', 'RWTH Aachen University', 'Technical University of Munich (TU Munich)'] } },
    select: { id: true, name: true },
  });
  console.log('\nRemaining entries:');
  for (const r of remaining) console.log(`  ${r.id} | ${r.name}`);

  // Count after cleanup
  const count = await p.university.count();
  console.log(`\nTotal universities after cleanup: ${count}`);

  await p.$disconnect();
}
main();
