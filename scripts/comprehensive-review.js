const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function comprehensiveReview() {
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
  const totalUsers = await prisma.user.count();
  
  console.log(`\nTotal Departments: ${totalDepts}`);
  console.log(`Total Courses: ${totalCourses}`);
  console.log(`Total Scholarships: ${totalScholarships}`);
  console.log(`Total Users: ${totalUsers}`);
  
  // Check for universities without courses
  const unisWithoutCourses = await prisma.university.count({
    where: {
      courses: { none: {} }
    }
  });
  
  console.log(`\n⚠️  Universities WITHOUT Courses: ${unisWithoutCourses}`);
  
  if (unisWithoutCourses > 0) {
    const sample = await prisma.university.findMany({
      where: { courses: { none: {} } },
      select: { name: true, city: true, country: true },
      take: 5
    });
    console.log('Sample:');
    sample.forEach(u => console.log(`  - ${u.name} (${u.city}, ${u.country})`));
  }

  // 2. PAKISTAN DATA QUALITY
  console.log('\n\n📊 2. PAKISTAN DATA QUALITY');
  console.log('---------------------------');
  
  const pakistaniUnisData = await prisma.university.findMany({
    where: { country: { contains: 'Pakistan' } },
    select: {
      name: true,
      city: true,
      sector: true,
      website: true,
      _count: { select: { courses: true, departments: true } }
    }
  });
  
  const withWebsite = pakistaniUnisData.filter(u => u.website && u.website.trim() !== '').length;
  const withCourses = pakistaniUnisData.filter(u => u._count.courses > 0).length;
  const withDepts = pakistaniUnisData.filter(u => u._count.departments > 0).length;
  
  console.log(`Pakistani Universities: ${pakistaniUnisData.length}`);
  console.log(`  - With Website: ${withWebsite} (${((withWebsite/pakistaniUnisData.length)*100).toFixed(1)}%)`);
  console.log(`  - With Courses: ${withCourses} (${((withCourses/pakistaniUnisData.length)*100).toFixed(1)}%)`);
  console.log(`  - With Departments: ${withDepts} (${((withDepts/pakistaniUnisData.length)*100).toFixed(1)}%)`);

  // 3. RECOMMENDATION SYSTEM TEST
  console.log('\n\n🧪 3. RECOMMENDATION SYSTEM TEST');
  console.log('---------------------------------');
  
  // Test Case 1: Civil Engineering in Karachi
  console.log('\nTest 1: Civil Engineering in Karachi');
  const civilEngCourses = await prisma.course.findMany({
    where: {
      name: { contains: 'Civil Engineering' },
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true } }
    }
  });
  
  console.log(`✅ Found ${civilEngCourses.length} Civil Engineering programs`);
  const civilEngUnis = new Set(civilEngCourses.map(c => c.university.name));
  console.log(`   Universities: ${civilEngUnis.size}`);
  console.log('   Top 5:');
  Array.from(civilEngUnis).slice(0, 5).forEach(name => {
    const course = civilEngCourses.find(c => c.university.name === name);
    console.log(`     - ${name}: ${course.name} (${course.degree})`);
  });

  // Test Case 2: Computer Science in Karachi
  console.log('\nTest 2: Computer Science in Karachi');
  const csCourses = await prisma.course.findMany({
    where: {
      name: { contains: 'Computer Science' },
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true } }
    }
  });
  
  console.log(`✅ Found ${csCourses.length} Computer Science programs`);
  const csUnis = new Set(csCourses.map(c => c.university.name));
  console.log(`   Universities: ${csUnis.size}`);

  // Test Case 3: Medicine/MBBS in Karachi
  console.log('\nTest 3: Medicine/MBBS in Karachi');
  const medicineCourses = await prisma.course.findMany({
    where: {
      OR: [
        { name: { contains: 'MBBS' } },
        { name: { contains: 'Medicine' } }
      ],
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true } }
    }
  });
  
  console.log(`✅ Found ${medicineCourses.length} Medicine/MBBS programs`);
  const medicineUnis = new Set(medicineCourses.map(c => c.university.name));
  console.log(`   Universities: ${medicineUnis.size}`);
  console.log('   Top 5:');
  Array.from(medicineUnis).slice(0, 5).forEach(name => {
    const course = medicineCourses.find(c => c.university.name === name);
    console.log(`     - ${name}: ${course.name} (${course.degree})`);
  });

  // 4. DATA INTEGRITY CHECKS
  console.log('\n\n🔍 4. DATA INTEGRITY CHECKS');
  console.log('-----------------------------');
  
  // Check for duplicate university names
  const allUnis = await prisma.university.findMany({
    select: { name: true, city: true, country: true }
  });
  
  const nameCount = {};
  allUnis.forEach(u => {
    const key = `${u.name}|${u.city}|${u.country}`;
    nameCount[key] = (nameCount[key] || 0) + 1;
  });
  
  const duplicates = Object.entries(nameCount).filter(([_, count]) => count > 1);
  console.log(`\nDuplicate Universities (same name+city+country): ${duplicates.length}`);
  if (duplicates.length > 0) {
    console.log('Duplicates:');
    duplicates.slice(0, 5).forEach(([key, count]) => {
      const [name, city, country] = key.split('|');
      console.log(`  - ${name} (${city}, ${country}) - ${count} times`);
    });
  }

  // Check for courses without universities
  const allCourses = await prisma.course.findMany({
    select: { id: true, universityId: true }
  });
  const orphanCourses = allCourses.filter(c => !c.universityId).length;
  console.log(`\nOrphan Courses (no university): ${orphanCourses}`);

  // Check for invalid websites
  const unisWithInvalidWebsites = await prisma.university.findMany({
    where: {
      website: { not: null }
    },
    select: { name: true, website: true }
  });
  
  const invalidWebsites = unisWithInvalidWebsites.filter(u => {
    const url = u.website || '';
    return !url.startsWith('http://') && !url.startsWith('https://');
  });
  
  console.log(`\nUniversities with Invalid Website URLs: ${invalidWebsites.length}`);
  if (invalidWebsites.length > 0) {
    console.log('Sample invalid URLs:');
    invalidWebsites.slice(0, 5).forEach(u => {
      console.log(`  - ${u.name}: ${u.website}`);
    });
  }

  // 5. SECTOR DISTRIBUTION
  console.log('\n\n📊 5. SECTOR DISTRIBUTION (Pakistan)');
  console.log('--------------------------------------');
  
  const publicUnis = await prisma.university.count({
    where: { country: { contains: 'Pakistan' }, sector: 'Public' }
  });
  
  const privateUnis = await prisma.university.count({
    where: { country: { contains: 'Pakistan' }, sector: 'Private' }
  });
  
  console.log(`Public Universities: ${publicUnis}`);
  console.log(`Private Universities: ${privateUnis}`);

  // 6. CITY DISTRIBUTION
  console.log('\n\n📊 6. CITY DISTRIBUTION (Top 10)');
  console.log('----------------------------------');
  
  const cityStats = await prisma.university.groupBy({
    by: ['city'],
    where: { country: { contains: 'Pakistan' } },
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' }
    },
    take: 10
  });
  
  cityStats.forEach(stat => {
    console.log(`${stat.city}: ${stat._count.id} universities`);
  });

  // 7. DEGREE LEVEL DISTRIBUTION
  console.log('\n\n📊 7. DEGREE LEVEL DISTRIBUTION');
  console.log('---------------------------------');
  
  const degreeStats = await prisma.course.groupBy({
    by: ['degree'],
    _count: { id: true },
    orderBy: {
      _count: { id: 'desc' }
    }
  });
  
  degreeStats.forEach(stat => {
    console.log(`${stat.degree}: ${stat._count.id} courses`);
  });

  console.log('\n\n=== REVIEW COMPLETE ===');
}

comprehensiveReview()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
