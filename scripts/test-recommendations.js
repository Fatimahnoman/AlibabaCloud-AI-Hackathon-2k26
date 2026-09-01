const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRecommendations() {
  console.log('=== TESTING RECOMMENDATION SYSTEM ===\n');

  // Test Case 1: Civil Engineering in Karachi
  console.log('TEST 1: Civil Engineering in Karachi');
  console.log('-------------------------------------');
  
  const civilEngCourses = await prisma.course.findMany({
    where: {
      name: { contains: 'Civil Engineering' },
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true, sector: true } }
    }
  });

  console.log(`\nUniversities with BS Civil Engineering in Karachi: ${civilEngCourses.length}`);
  civilEngCourses.forEach(c => {
    console.log(`✅ ${c.university.name} - ${c.name} (${c.degree})`);
  });

  // Test Case 2: Computer Science in Karachi
  console.log('\n\nTEST 2: Computer Science in Karachi');
  console.log('-------------------------------------');
  
  const csCourses = await prisma.course.findMany({
    where: {
      name: { contains: 'Computer Science' },
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true, sector: true } }
    }
  });

  console.log(`\nUniversities with BS Computer Science in Karachi: ${csCourses.length}`);
  csCourses.slice(0, 10).forEach(c => {
    console.log(`✅ ${c.university.name} - ${c.name}`);
  });

  // Test Case 3: Business (BBA/MBA) in Karachi
  console.log('\n\nTEST 3: Business (BBA/MBA) in Karachi');
  console.log('-------------------------------------');
  
  const businessCourses = await prisma.course.findMany({
    where: {
      OR: [
        { name: { contains: 'BBA' } },
        { name: { contains: 'MBA' } }
      ],
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true, sector: true } }
    }
  });

  console.log(`\nUniversities with BBA/MBA in Karachi: ${businessCourses.length}`);
  businessCourses.slice(0, 10).forEach(c => {
    console.log(`✅ ${c.university.name} - ${c.name}`);
  });

  // Test Case 4: Law (LLB) in Karachi
  console.log('\n\nTEST 4: Law (LLB) in Karachi');
  console.log('-------------------------------------');
  
  const lawCourses = await prisma.course.findMany({
    where: {
      name: { contains: 'LLB' },
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true, sector: true } }
    }
  });

  console.log(`\nUniversities with LLB in Karachi: ${lawCourses.length}`);
  lawCourses.forEach(c => {
    console.log(`✅ ${c.university.name} - ${c.name}`);
  });

  // Test Case 5: Medical (MBBS) in Karachi
  console.log('\n\nTEST 5: Medical (MBBS) in Karachi');
  console.log('-------------------------------------');
  
  const medicalCourses = await prisma.course.findMany({
    where: {
      name: { contains: 'MBBS' },
      university: { city: { contains: 'Karachi' } }
    },
    include: {
      university: { select: { name: true, city: true, sector: true } }
    }
  });

  console.log(`\nUniversities with MBBS in Karachi: ${medicalCourses.length}`);
  medicalCourses.forEach(c => {
    console.log(`✅ ${c.university.name} - ${c.name}`);
  });

  // Summary
  console.log('\n\n=== SUMMARY ===');
  console.log(`Civil Engineering: ${civilEngCourses.length} universities`);
  console.log(`Computer Science: ${csCourses.length} universities`);
  console.log(`Business (BBA/MBA): ${businessCourses.length} universities`);
  console.log(`Law (LLB): ${lawCourses.length} universities`);
  console.log(`Medical (MBBS): ${medicalCourses.length} universities`);

  await prisma.$disconnect();
}

testRecommendations().catch(console.error);
