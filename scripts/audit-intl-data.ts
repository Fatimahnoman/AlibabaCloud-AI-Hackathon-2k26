import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Get all international universities with their departments and courses
  const intlUnis = await prisma.university.findMany({
    where: { country: { not: 'Pakistan' } },
    include: {
      departments: { orderBy: { name: 'asc' } },
      courses: { orderBy: { name: 'asc' } },
    },
    orderBy: [{ country: 'asc' }, { name: 'asc' }],
  });

  console.log(`Total international universities: ${intlUnis.length}\n`);

  // Group by country
  const byCountry: Record<string, typeof intlUnis> = {};
  for (const u of intlUnis) {
    if (!byCountry[u.country]) byCountry[u.country] = [];
    byCountry[u.country].push(u);
  }

  for (const [country, unis] of Object.entries(byCountry)) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`${country} — ${unis.length} universities`);
    console.log('='.repeat(80));
    
    for (const u of unis) {
      console.log(`\n  ${u.name} (${u.city}) - Type: ${u.type}`);
      console.log(`  Departments: ${u.departments.length}, Courses: ${u.courses.length}`);
      
      if (u.departments.length > 0) {
        console.log('  Departments:');
        for (const d of u.departments) {
          console.log(`    - ${d.name} (courses: ${d.totalCourses})`);
        }
      }
      
      if (u.courses.length > 0) {
        console.log('  Courses:');
        for (const c of u.courses) {
          const fee = c.tuitionFee ? `${c.currency || 'USD'} ${Number(c.tuitionFee).toLocaleString()}` : 'N/A';
          console.log(`    - ${c.name} (${c.degree}, ${c.duration || 'N/A'}, Fee: ${fee})${c.department ? ` [${c.department}]` : ''}`);
        }
      }
    }
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
