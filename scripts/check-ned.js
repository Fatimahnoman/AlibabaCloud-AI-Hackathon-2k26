const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkNED() {
  try {
    const uni = await prisma.university.findFirst({
      where: { name: { contains: 'NED' } }
    });

    if (!uni) {
      console.log('NED University not found');
      return;
    }

    console.log('University:', uni.name);
    console.log('Sector:', uni.sector);
    console.log('City:', uni.city);
    console.log('Website:', uni.website);
    
    const courses = await prisma.course.findMany({
      where: { universityId: uni.id },
      orderBy: { name: 'asc' }
    });

    console.log(`\nTotal Courses: ${courses.length}`);
    console.log('\nPrograms by Department:');
    
    const departments = {};
    courses.forEach(c => {
      const dept = c.department || 'Unknown';
      if (!departments[dept]) departments[dept] = [];
      departments[dept].push(`${c.name} (${c.degree})`);
    });

    Object.keys(departments).sort().forEach(dept => {
      console.log(`\n${dept}:`);
      departments[dept].forEach(c => console.log(`  - ${c}`));
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNED();
