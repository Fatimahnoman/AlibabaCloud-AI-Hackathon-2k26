const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function testUniversityKnowledge() {
  console.log('\n🧪 TESTING UNIVERSITY AI KNOWLEDGE BASE...\n');

  // Get sample universities from different categories
  const universities = await p.university.findMany({
    where: { verificationStatus: 'verified' },
    include: {
      courses: { select: { name: true, degree: true, department: true, tuitionFee: true, currency: true } },
      departments: { select: { name: true, totalCourses: true } },
      campuses: { select: { name: true, city: true, isMain: true } },
      rankings: { select: { provider: true, year: true, position: true } },
    },
    take: 20, // Test 20 universities
  });

  console.log(`Testing ${universities.length} universities...\n`);

  let issues = [];
  let perfect = 0;

  for (const uni of universities) {
    const issues_list = [];
    
    // Check departments
    if (!uni.departments || uni.departments.length === 0) {
      issues_list.push('❌ NO DEPARTMENTS');
    }
    
    // Check courses
    if (!uni.courses || uni.courses.length === 0) {
      issues_list.push('❌ NO COURSES');
    }
    
    // Check if courses have fees
    const coursesWithFees = uni.courses.filter(c => c.tuitionFee && c.tuitionFee > 0);
    if (uni.courses.length > 0 && coursesWithFees.length === 0) {
      issues_list.push('⚠️  NO FEE DATA');
    }
    
    // Check campuses
    if (!uni.campuses || uni.campuses.length === 0) {
      issues_list.push('⚠️  NO CAMPUSES');
    }
    
    // Check rankings
    if (!uni.rankings || uni.rankings.length === 0) {
      issues_list.push('⚠️  NO RANKINGS');
    }

    if (issues_list.length === 0) {
      perfect++;
      console.log(`✅ ${uni.name} (${uni.city}, ${uni.country})`);
      console.log(`   ${uni.departments.length} depts, ${uni.courses.length} courses, ${uni.campuses.length} campuses, ${coursesWithFees.length} with fees`);
    } else {
      issues.push({ name: uni.name, city: uni.city, country: uni.country, issues: issues_list });
      console.log(`⚠️  ${uni.name} (${uni.city}, ${uni.country})`);
      issues_list.forEach(i => console.log(`   ${i}`));
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTS:`);
  console.log(`   ✅ Perfect: ${perfect}/${universities.length}`);
  console.log(`   ⚠️  Issues: ${issues.length}/${universities.length}`);
  
  if (issues.length > 0) {
    console.log('\n📝 UNIVERSITIES WITH ISSUES:');
    issues.forEach(u => {
      console.log(`\n   ${u.name} (${u.city}, ${u.country}):`);
      u.issues.forEach(i => console.log(`      ${i}`));
    });
  }

  console.log('\n' + '='.repeat(60));

  // Check total stats
  const totalUnis = await p.university.count({ where: { verificationStatus: 'verified' } });
  const totalDepts = await p.department.count();
  const totalCourses = await p.course.count();
  const totalCampuses = await p.campus.count();
  const coursesWithFees = await p.course.count({ where: { tuitionFee: { not: null } } });

  console.log('\n📈 OVERALL DATABASE STATS:');
  console.log(`   Universities: ${totalUnis}`);
  console.log(`   Departments: ${totalDepts}`);
  console.log(`   Courses: ${totalCourses}`);
  console.log(`   Campuses: ${totalCampuses}`);
  console.log(`   Courses with Fees: ${coursesWithFees} (${Math.round(coursesWithFees/totalCourses*100)}%)`);

  await p.$disconnect();
}

testUniversityKnowledge().catch(console.error).finally(() => process.exit(0));
