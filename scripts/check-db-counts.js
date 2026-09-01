const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const u = await p.university.count();
  const d = await p.department.count();
  const c = await p.course.count();
  const s = await p.scholarship.count();
  const i = await p.internship.count();
  const cm = await p.cMProgram.count();
  const careers = await p.careerPath.count();
  const campuses = await p.campus.count();

  console.log('=== DB COUNTS ===');
  console.log('Universities:', u);
  console.log('Departments:', d);
  console.log('Courses:', c);
  console.log('Scholarships:', s);
  console.log('Internships:', i);
  console.log('CM Programs:', cm);
  console.log('Careers:', careers);
  console.log('Campuses:', campuses);

  const schols = await p.scholarship.findMany({ select: { name: true, deadline: true, country: true, category: true } });
  console.log('\n=== SCHOLARSHIPS (' + schols.length + ') ===');
  schols.forEach(x => console.log('-', x.name, '|', x.country, '|', x.category, '|', x.deadline ? new Date(x.deadline).toISOString().split('T')[0] : 'No deadline'));

  const interns = await p.internship.findMany({ select: { title: true, organization: true, country: true, type: true } });
  console.log('\n=== INTERNSHIPS (' + interns.length + ') ===');
  interns.forEach(x => console.log('-', x.title, '@', x.organization, '|', x.country, '|', x.type));

  const schemes = await p.cMProgram.findMany({ select: { name: true, province: true, status: true } });
  console.log('\n=== CM PROGRAMS (' + schemes.length + ') ===');
  schemes.forEach(x => console.log('-', x.name, '|', x.province, '|', x.status));

  await p.$disconnect();
}

main();
