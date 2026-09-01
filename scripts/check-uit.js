const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUIT() {
  try {
    const uni = await prisma.university.findFirst({
      where: { name: { contains: 'UIT' } }
    });

    if (!uni) {
      console.log('UIT University not found');
      return;
    }

    console.log('University:', uni.name);
    console.log('Sector:', uni.sector);
    console.log('City:', uni.city);
    console.log('Website:', uni.website);
    console.log('Source URL:', uni.sourceUrl);
    
    const courses = await prisma.course.findMany({
      where: { universityId: uni.id },
      orderBy: { name: 'asc' }
    });

    console.log(`\nTotal Courses: ${courses.length}`);
    console.log('\nPrograms:');
    courses.forEach(c => {
      console.log(`  - ${c.name} (${c.degree})${c.department ? ` [${c.department}]` : ''}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUIT();
