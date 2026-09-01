import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  // Find universities with few courses
  const unis = await p.university.findMany({
    include: { courses: true, departments: true },
    orderBy: { name: 'asc' },
  });

  const sparse = unis.filter(u => u.courses.length <= 3).map(u => ({
    id: u.id,
    name: u.name,
    country: u.country,
    courses: u.courses.length,
    depts: u.departments.length,
    website: u.website,
  }));

  console.log(`Universities with <=3 courses: ${sparse.length}`);
  console.log(JSON.stringify(sparse, null, 2));

  await p.$disconnect();
}
main();
