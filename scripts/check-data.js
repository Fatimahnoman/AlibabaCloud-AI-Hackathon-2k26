const { PrismaClient } = require('../node_modules/@prisma/client');
const p = new PrismaClient();

async function main() {
  // 1. Countries
  const countries = await p.university.findMany({
    select: { country: true }, distinct: ['country'], orderBy: { country: 'asc' }
  });
  console.log('=== COUNTRIES ===');
  console.log(JSON.stringify(countries.map(x => x.country)));

  // 2. Pakistan cities
  const cities = await p.university.findMany({
    where: { country: { contains: 'Pakistan' } },
    select: { city: true }, distinct: ['city'], orderBy: { city: 'asc' }
  });
  console.log('\n=== PAKISTAN CITIES ===');
  console.log(JSON.stringify(cities.map(x => x.city).filter(Boolean)));

  // 3. Sample courses (to see naming pattern)
  const courses = await p.course.findMany({
    select: { name: true, degree: true, universityId: true },
    take: 30, orderBy: { name: 'asc' }
  });
  console.log('\n=== SAMPLE COURSES ===');
  courses.forEach(c => console.log(`${c.name} [${c.degree}]`));

  // 4. Count courses per degree
  const degreeCounts = await p.course.groupBy({
    by: ['degree'], _count: { id: true }
  });
  console.log('\n=== DEGREE DISTRIBUTION ===');
  degreeCounts.forEach(d => console.log(`${d.degree}: ${d._count.id}`));

  // 5. Distinct course name patterns (extract "field" from names like "BS Computer Science")
  const allCourses = await p.course.findMany({ select: { name: true } });
  const fields = new Map();
  allCourses.forEach(c => {
    // Remove prefix like "BS ", "MS ", "PhD ", "MA ", "BSc " etc.
    const cleaned = c.name.replace(/^(BS|BSc|MS|MSc|PhD|MA|BA|BEd|MEd|LLB|LLM|BBA|MBA|B\.?A\.?|M\.?A\.?|Diploma|Certificate|Intermediate)\s+/i, '').trim();
    if (cleaned) {
      fields.set(cleaned, (fields.get(cleaned) || 0) + 1);
    }
  });
  console.log('\n=== DISTINCT FIELDS (after removing degree prefix) ===');
  const sortedFields = [...fields.entries()].sort((a, b) => b[1] - a[1]);
  sortedFields.forEach(([name, count]) => console.log(`${name}: ${count}`));

  // 6. Universities with course count
  const uniCourseCounts = await p.university.findMany({
    include: { _count: { select: { courses: true } } },
    orderBy: { name: 'asc' },
  });
  const withCourses = uniCourseCounts.filter(u => u._count.courses > 0);
  console.log(`\n=== UNIVERSITIES WITH COURSES (${withCourses.length}) ===`);
  withCourses.forEach(u => console.log(`${u.name} (${u.city}, ${u.country}): ${u._count.courses} courses`));

  await p.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
