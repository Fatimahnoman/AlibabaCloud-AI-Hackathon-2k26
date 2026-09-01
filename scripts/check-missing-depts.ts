import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Find all universities with < 5 departments
  const unis = await prisma.university.findMany({
    include: {
      departments: { select: { id: true } },
      courses: { select: { id: true } },
    },
    orderBy: { name: 'asc' },
  });

  const sparse = unis.filter((u) => u.departments.length < 5);
  
  console.log(`Total institutions: ${unis.length}`);
  console.log(`\nInstitutions with < 5 departments: ${sparse.length}\n`);
  
  for (const u of sparse) {
    console.log(`  ${u.name} | ${u.city}, ${u.country} | Depts: ${u.departments.length} | Courses: ${u.courses.length}`);
  }

  // Specifically check Federal Urdu University
  const fuuast = unis.find((u) => u.name.includes('Federal Urdu'));
  if (fuuast) {
    console.log(`\n--- Federal Urdu University Details ---`);
    console.log(`Departments: ${fuuast.departments.length}`);
    console.log(`Courses: ${fuuast.courses.length}`);
    
    const depts = await prisma.department.findMany({
      where: { universityId: fuuast.id },
    });
    for (const d of depts) {
      console.log(`  ${d.name} — ${d.totalCourses} courses`);
    }
  }
}
main().finally(() => prisma.$disconnect());
