import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get all Pakistan universities with their departments and courses
  const pakUnis = await prisma.university.findMany({
    where: { country: 'Pakistan' },
    include: {
      departments: { orderBy: { name: 'asc' } },
      courses: { orderBy: { name: 'asc' } },
    },
    orderBy: { name: 'asc' },
  });

  console.log(`Total Pakistan universities: ${pakUnis.length}\n`);

  // Show detailed breakdown for each university
  for (const u of pakUnis) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${u.name} (${u.city}) - Type: ${u.type}, Sector: ${u.sector}`);
    console.log(`Departments: ${u.departments.length}, Courses: ${u.courses.length}`);
    
    if (u.departments.length > 0) {
      console.log(`\nDepartments:`);
      for (const d of u.departments) {
        console.log(`  - ${d.name} (courses: ${d.totalCourses})`);
      }
    }
    
    if (u.courses.length > 0) {
      console.log(`\nCourses/Programs:`);
      for (const c of u.courses) {
        const fee = c.tuitionFee ? `${c.currency || 'PKR'} ${Number(c.tuitionFee).toLocaleString()}` : 'N/A';
        console.log(`  - ${c.name} (${c.degree}, ${c.duration || 'N/A'}, Fee: ${fee})${c.department ? ` [${c.department}]` : ''}`);
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
