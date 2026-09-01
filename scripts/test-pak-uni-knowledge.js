const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function testPakistaniUniversities() {
  console.log('\n🧪 TESTING PAKISTANI UNIVERSITIES AI KNOWLEDGE...\n');

  const universities = await p.university.findMany({
    where: { 
      verificationStatus: 'verified',
      country: 'Pakistan'
    },
    include: {
      courses: { select: { name: true, degree: true, department: true, tuitionFee: true, currency: true } },
      departments: { select: { name: true, totalCourses: true } },
      campuses: { select: { name: true, city: true, isMain: true } },
      rankings: { select: { provider: true, year: true, position: true } },
    },
    take: 30,
  });

  console.log(`Testing ${universities.length} Pakistani universities...\n`);

  let perfect = 0;
  let good = 0;
  let issues = [];

  for (const uni of universities) {
    const issues_list = [];
    
    // Critical checks
    if (!uni.departments || uni.departments.length === 0) {
      issues_list.push('❌ NO DEPARTMENTS');
    }
    
    if (!uni.courses || uni.courses.length === 0) {
      issues_list.push('❌ NO COURSES');
    }
    
    // Important checks
    const coursesWithFees = uni.courses.filter(c => c.tuitionFee && c.tuitionFee > 0);
    if (uni.courses.length > 0 && coursesWithFees.length === 0) {
      issues_list.push('⚠️  NO FEE DATA');
    }
    
    if (!uni.campuses || uni.campuses.length === 0) {
      issues_list.push('⚠️  NO CAMPUSES');
    }

    if (issues_list.length === 0) {
      perfect++;
      console.log(`✅ ${uni.name} (${uni.city})`);
      console.log(`   ${uni.departments.length} depts, ${uni.courses.length} courses, ${uni.campuses.length} campuses, ${coursesWithFees.length} with fees`);
    } else if (!issues_list.some(i => i.includes('❌'))) {
      good++;
      console.log(`⚠️  ${uni.name} (${uni.city}) - Has depts & courses`);
      console.log(`   ${uni.departments.length} depts, ${uni.courses.length} courses${uni.campuses.length > 0 ? `, ${uni.campuses.length} campuses` : ''}`);
    } else {
      issues.push({ name: uni.name, city: uni.city, issues: issues_list });
      console.log(`❌ ${uni.name} (${uni.city})`);
      issues_list.forEach(i => console.log(`   ${i}`));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTS:`);
  console.log(`   ✅ Perfect (all data): ${perfect}/${universities.length}`);
  console.log(`   ⚠️  Good (has depts & courses): ${good}/${universities.length}`);
  console.log(`   ❌ Critical issues: ${issues.length}/${universities.length}`);
  
  if (issues.length > 0) {
    console.log('\n📝 UNIVERSITIES WITH CRITICAL ISSUES:');
    issues.forEach(u => {
      console.log(`\n   ${u.name} (${u.city}):`);
      u.issues.forEach(i => console.log(`      ${i}`));
    });
  }

  // Pakistan-specific stats
  const totalPakUnis = await p.university.count({ where: { verificationStatus: 'verified', country: 'Pakistan' } });
  const pakDepts = await p.department.count({ where: { university: { country: 'Pakistan' } } });
  const pakCourses = await p.course.count({ where: { university: { country: 'Pakistan' } } });
  const pakCoursesWithFees = await p.course.count({ where: { tuitionFee: { not: null }, university: { country: 'Pakistan' } } });

  console.log('\n📈 PAKISTAN DATABASE STATS:');
  console.log(`   Universities: ${totalPakUnis}`);
  console.log(`   Departments: ${pakDepts}`);
  console.log(`   Courses: ${pakCourses}`);
  console.log(`   Courses with Fees: ${pakCoursesWithFees} (${Math.round(pakCoursesWithFees/pakCourses*100)}%)`);

  await p.$disconnect();
}

testPakistaniUniversities().catch(console.error).finally(() => process.exit(0));
