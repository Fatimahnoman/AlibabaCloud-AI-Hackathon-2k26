const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function comprehensiveProjectReview() {
  console.log('=== COMPREHENSIVE PROJECT REVIEW ===\n');
  console.log('Date:', new Date().toISOString());
  console.log('=====================================\n');

  // 1. DATABASE OVERVIEW
  console.log('📊 1. DATABASE OVERVIEW');
  console.log('------------------------');
  
  const totalUnis = await prisma.university.count();
  const pakistaniUnis = await prisma.university.count({ where: { country: { contains: 'Pakistan' } } });
  const internationalUnis = totalUnis - pakistaniUnis;
  
  console.log(`Total Universities: ${totalUnis}`);
  console.log(`  - Pakistani: ${pakistaniUnis}`);
  console.log(`  - International: ${internationalUnis}`);
  
  const totalDepts = await prisma.department.count();
  const totalCourses = await prisma.course.count();
  const totalScholarships = await prisma.scholarship.count();
  const totalInternships = await prisma.internship.count();
  const totalCareerPaths = await prisma.careerPath.count();
  
  console.log(`\nTotal Departments: ${totalDepts}`);
  console.log(`Total Courses: ${totalCourses}`);
  console.log(`Total Scholarships: ${totalScholarships}`);
  console.log(`Total Internships: ${totalInternships}`);
  console.log(`Total Career Paths: ${totalCareerPaths}`);

  // 2. DATA COMPLETENESS
  console.log('\n\n📋 2. DATA COMPLETENESS');
  console.log('------------------------');
  
  const unisWithDepts = await prisma.university.count({ where: { departments: { some: {} } } });
  const unisWithCourses = await prisma.university.count({ where: { courses: { some: {} } } });
  const unisWithWebsites = await prisma.university.count({ where: { website: { not: null } } });
  
  console.log(`Universities with Departments: ${unisWithDepts}/${totalUnis} (${((unisWithDepts/totalUnis)*100).toFixed(1)}%)`);
  console.log(`Universities with Courses: ${unisWithCourses}/${totalUnis} (${((unisWithCourses/totalUnis)*100).toFixed(1)}%)`);
  console.log(`Universities with Websites: ${unisWithWebsites}/${totalUnis} (${((unisWithWebsites/totalUnis)*100).toFixed(1)}%)`);

  // 3. PAKISTAN-SPECIFIC DATA
  console.log('\n\n🇵🇰 3. PAKISTAN-SPECIFIC DATA');
  console.log('-----------------------------');
  
  const pakDepts = await prisma.department.count({ where: { university: { country: { contains: 'Pakistan' } } } });
  const pakCourses = await prisma.course.count({ where: { university: { country: { contains: 'Pakistan' } } } });
  
  console.log(`Pakistani Universities: ${pakistaniUnis}`);
  console.log(`Pakistani Departments: ${pakDepts}`);
  console.log(`Pakistani Courses: ${pakCourses}`);

  // 4. KARACHI-SPECIFIC DATA
  console.log('\n\n🏙️  4. KARACHI-SPECIFIC DATA');
  console.log('-----------------------------');
  
  const karachiUnis = await prisma.university.count({ where: { city: { contains: 'Karachi' } } });
  const karachiDepts = await prisma.department.count({ where: { university: { city: { contains: 'Karachi' } } } });
  const karachiCourses = await prisma.course.count({ where: { university: { city: { contains: 'Karachi' } } } });
  
  console.log(`Karachi Universities: ${karachiUnis}`);
  console.log(`Karachi Departments: ${karachiDepts}`);
  console.log(`Karachi Courses: ${karachiCourses}`);

  // 5. KEY PROGRAMS IN KARACHI
  console.log('\n\n🎓 5. KEY PROGRAMS IN KARACHI');
  console.log('-----------------------------');
  
  const civilEng = await prisma.course.count({ where: { name: { contains: 'Civil Engineering' }, university: { city: { contains: 'Karachi' } } } });
  const cs = await prisma.course.count({ where: { name: { contains: 'Computer Science' }, university: { city: { contains: 'Karachi' } } } });
  const bba = await prisma.course.count({ where: { name: { contains: 'BBA' }, university: { city: { contains: 'Karachi' } } } });
  const llb = await prisma.course.count({ where: { name: { contains: 'LLB' }, university: { city: { contains: 'Karachi' } } } });
  const mbbs = await prisma.course.count({ where: { name: { contains: 'MBBS' }, university: { city: { contains: 'Karachi' } } } });
  
  console.log(`Civil Engineering: ${civilEng} programs`);
  console.log(`Computer Science: ${cs} programs`);
  console.log(`Business (BBA): ${bba} programs`);
  console.log(`Law (LLB): ${llb} programs`);
  console.log(`Medical (MBBS): ${mbbs} programs`);

  // 6. SCHOLARSHIPS & FINANCIAL AID
  console.log('\n\n💰 6. SCHOLARSHIPS & FINANCIAL AID');
  console.log('-----------------------------------');
  
  const scholarshipsWithAmount = await prisma.scholarship.count({ where: { amount: { not: null } } });
  const scholarshipsWithDeadline = await prisma.scholarship.count({ where: { deadline: { not: null } } });
  const scholarshipsWithUrl = await prisma.scholarship.count({ where: { sourceUrl: { not: null } } });
  
  console.log(`Total Scholarships: ${totalScholarships}`);
  console.log(`With Amount: ${scholarshipsWithAmount}`);
  console.log(`With Deadline: ${scholarshipsWithDeadline}`);
  console.log(`With Source URL: ${scholarshipsWithUrl}`);

  // 7. COURSE FEE DATA
  console.log('\n\n💵 7. COURSE FEE DATA');
  console.log('----------------------');
  
  const coursesWithFees = await prisma.course.count({ where: { tuitionFee: { not: null } } });
  const avgFee = await prisma.course.aggregate({ where: { tuitionFee: { not: null } }, _avg: { tuitionFee: true } });
  
  console.log(`Courses with Fee Data: ${coursesWithFees}/${totalCourses} (${((coursesWithFees/totalCourses)*100).toFixed(1)}%)`);
  console.log(`Average Tuition Fee: ${avgFee._avg.tuitionFee ? `PKR ${Math.round(avgFee._avg.tuitionFee).toLocaleString()}` : 'N/A'}`);

  // 8. SECTOR DISTRIBUTION
  console.log('\n\n🏛️  8. SECTOR DISTRIBUTION');
  console.log('---------------------------');
  
  const publicUnis = await prisma.university.count({ where: { sector: { in: ['public', 'government', 'federal'] } } });
  const privateUnis = await prisma.university.count({ where: { sector: 'private' } });
  
  console.log(`Public/Government: ${publicUnis} (${((publicUnis/totalUnis)*100).toFixed(1)}%)`);
  console.log(`Private: ${privateUnis} (${((privateUnis/totalUnis)*100).toFixed(1)}%)`);

  // 9. ISSUES CHECK
  console.log('\n\n⚠️  9. ISSUES CHECK');
  console.log('---------------------');
  
  const unisWithoutDepts = await prisma.university.count({ where: { departments: { none: {} } } });
  const unisWithoutCourses = await prisma.university.count({ where: { courses: { none: {} } } });
  const unisWithoutWebsites = totalUnis - unisWithWebsites;
  
  console.log(`Universities without Departments: ${unisWithoutDepts} ${unisWithoutDepts === 0 ? '✅' : '❌'}`);
  console.log(`Universities without Courses: ${unisWithoutCourses} ${unisWithoutCourses === 0 ? '✅' : '❌'}`);
  console.log(`Universities without Websites: ${unisWithoutWebsites} ${unisWithoutWebsites === 0 ? '✅' : '⚠️'}`);

  // 10. FINAL SCORE
  console.log('\n\n🏆 10. FINAL SCORE');
  console.log('------------------');
  
  const completenessScore = ((unisWithDepts + unisWithCourses) / (totalUnis * 2) * 100).toFixed(1);
  const dataQualityScore = ((coursesWithFees / totalCourses) * 100).toFixed(1);
  
  console.log(`Data Completeness: ${completenessScore}%`);
  console.log(`Fee Data Coverage: ${dataQualityScore}%`);
  console.log(`Overall Health: ${completenessScore > 95 ? '✅ EXCELLENT' : completenessScore > 80 ? '✅ GOOD' : '⚠️ NEEDS IMPROVEMENT'}`);

  console.log('\n\n=====================================');
  console.log('Review Complete!');
  console.log('=====================================\n');

  await prisma.$disconnect();
}

comprehensiveProjectReview().catch(console.error);
