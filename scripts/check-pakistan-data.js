const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkPakistanData() {
  console.log('=== OVERALL PAKISTAN UNIVERSITY DATA STATUS ===\n');

  // Total universities in Pakistan
  const totalUnis = await prisma.university.count({
    where: { country: { contains: 'Pakistan' } }
  });

  console.log(`Total Universities in Pakistan: ${totalUnis}`);

  // Universities with departments
  const unisWithDepts = await prisma.university.count({
    where: {
      country: { contains: 'Pakistan' },
      departments: { some: {} }
    }
  });

  console.log(`Universities with Departments: ${unisWithDepts}`);

  // Universities with courses
  const unisWithCourses = await prisma.university.count({
    where: {
      country: { contains: 'Pakistan' },
      courses: { some: {} }
    }
  });

  console.log(`Universities with Courses: ${unisWithCourses}`);

  // Total departments
  const totalDepts = await prisma.department.count({
    where: {
      university: { country: { contains: 'Pakistan' } }
    }
  });

  console.log(`\nTotal Departments: ${totalDepts}`);

  // Total courses
  const totalCourses = await prisma.course.count({
    where: {
      university: { country: { contains: 'Pakistan' } }
    }
  });

  console.log(`Total Courses: ${totalCourses}`);

  // Check UIT University
  console.log('\n\n=== UIT UNIVERSITY CHECK ===');
  const uit = await prisma.university.findFirst({
    where: { name: { contains: 'UIT' } }
  });

  if (uit) {
    console.log('Name:', uit.name);
    console.log('Website:', uit.website);
    console.log('Source URL:', uit.sourceUrl);
    console.log('City:', uit.city);
    console.log('Sector:', uit.sector);
  }

  // Check Federal Urdu University Civil Engineering
  console.log('\n\n=== FEDERAL URDU UNIVERSITY - CIVIL ENGINEERING CHECK ===');
  const fuuast = await prisma.university.findFirst({
    where: { name: { contains: 'Federal Urdu' } }
  });

  if (fuuast) {
    console.log('University:', fuuast.name);
    
    const civilEngCourses = await prisma.course.findMany({
      where: {
        universityId: fuuast.id,
        name: { contains: 'Civil Engineering' }
      }
    });

    if (civilEngCourses.length > 0) {
      console.log(`\n❌ ERROR: Found ${civilEngCourses.length} Civil Engineering programs:`);
      civilEngCourses.forEach(c => {
        console.log(`  - ${c.name} (${c.degree})`);
      });
      console.log('\nThis should be REMOVED as FUUAST does NOT offer Civil Engineering!');
    } else {
      console.log('\n✅ Correct: FUUAST does NOT have Civil Engineering programs');
    }
  }

  // Universities without departments
  console.log('\n\n=== UNIVERSITIES WITHOUT DEPARTMENTS ===');
  const unisWithoutDepts = await prisma.university.findMany({
    where: {
      country: { contains: 'Pakistan' },
      departments: { none: {} }
    },
    select: { name: true, city: true }
  });

  console.log(`Universities without departments: ${unisWithoutDepts.length}`);
  if (unisWithoutDepts.length > 0 && unisWithoutDepts.length <= 20) {
    unisWithoutDepts.forEach(u => {
      console.log(`  - ${u.name} (${u.city})`);
    });
  }

  // Universities without courses
  console.log('\n\n=== UNIVERSITIES WITHOUT COURSES ===');
  const unisWithoutCourses = await prisma.university.findMany({
    where: {
      country: { contains: 'Pakistan' },
      courses: { none: {} }
    },
    select: { name: true, city: true }
  });

  console.log(`Universities without courses: ${unisWithoutCourses.length}`);
  if (unisWithoutCourses.length > 0 && unisWithoutCourses.length <= 20) {
    unisWithoutCourses.slice(0, 20).forEach(u => {
      console.log(`  - ${u.name} (${u.city})`);
    });
  }

  await prisma.$disconnect();
}

checkPakistanData().catch(console.error);
