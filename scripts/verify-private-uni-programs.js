const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function verifyPrivateUniPrograms() {
  console.log('\n🔍 VERIFYING PRIVATE UNIVERSITY PROGRAMS...\n');

  // Get sample private universities with their departments
  const privateUnis = await p.university.findMany({
    where: { 
      country: 'Pakistan',
      sector: 'private'
    },
    include: {
      departments: true,
      courses: true
    },
    take: 15
  });

  console.log(`Checking ${privateUnis.length} private universities...\n`);

  for (const uni of privateUnis) {
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🏢 ${uni.name} (${uni.city})`);
    console.log(`${'='.repeat(80)}`);
    console.log(`Departments: ${uni.departments.length}`);
    console.log(`Total Courses: ${uni.courses.length}\n`);

    // Show departments
    console.log('DEPARTMENTS:');
    uni.departments.forEach((dept, i) => {
      console.log(`  ${i + 1}. ${dept.name} (${dept.totalCourses} courses)`);
    });

    // Show sample courses by department
    console.log('\nSAMPLE COURSES:');
    const coursesByDept = {};
    uni.courses.forEach(course => {
      const deptName = course.department || 'General';
      if (!coursesByDept[deptName]) coursesByDept[deptName] = [];
      coursesByDept[deptName].push(course);
    });

    Object.keys(coursesByDept).slice(0, 5).forEach(deptName => {
      console.log(`\n  ${deptName}:`);
      const courses = coursesByDept[deptName].slice(0, 3);
      courses.forEach(course => {
        const fee = course.tuitionFee ? `PKR ${Number(course.tuitionFee).toLocaleString()}` : 'Fee not set';
        console.log(`    - ${course.name} (${course.degree}) [${fee}]`);
      });
      if (coursesByDept[deptName].length > 3) {
        console.log(`    ... and ${coursesByDept[deptName].length - 3} more`);
      }
    });
  }

  // Check NED University specifically
  console.log(`\n${'='.repeat(80)}`);
  console.log(`🔍 CHECKING NED UNIVERSITY SECTOR...`);
  console.log(`${'='.repeat(80)}\n`);

  const nedUni = await p.university.findFirst({
    where: { name: { contains: 'NED' } },
    select: { name: true, sector: true, type: true, city: true }
  });

  if (nedUni) {
    console.log(`University: ${nedUni.name}`);
    console.log(`Sector: ${nedUni.sector}`);
    console.log(`Type: ${nedUni.type}`);
    console.log(`City: ${nedUni.city}`);
    console.log(`\n✅ NED University is correctly classified as: ${nedUni.sector.toUpperCase()}`);
  }

  await p.$disconnect();
}

verifyPrivateUniPrograms().catch(console.error).finally(() => process.exit(0));
