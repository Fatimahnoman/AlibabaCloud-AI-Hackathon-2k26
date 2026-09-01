const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

(async () => {
  const unis = await p.university.findMany({
    include: {
      departments: { select: { name: true, head: true, totalCourses: true } },
      courses: { select: { name: true, department: true, degree: true, duration: true } }
    },
    orderBy: { country: 'asc' }
  });

  for (const u of unis) {
    const deptNames = u.departments.map((d: any) => d.name).join('; ') || '(none)';
    const courseDepts = [...new Set(u.courses.map((c: any) => c.department).filter(Boolean))].join('; ') || '(none)';
    const courseNames = u.courses.map((c: any) => c.name + ' [' + c.degree + ']').slice(0, 20).join(' || ') || '(none)';
    console.log('ID:' + u.id);
    console.log('NAME:' + u.name);
    console.log('COUNTRY:' + u.country + '|TYPE:' + u.type + '|SECTOR:' + (u.sector || ''));
    console.log('DEPTS:' + u.departments.length + '|' + deptNames);
    console.log('COURSES:' + u.courses.length + '|DEPT_FIELDS:' + courseDepts);
    console.log('COURSES_SAMPLE:' + courseNames);
    console.log('---');
  }

  await p.$disconnect();
})();
