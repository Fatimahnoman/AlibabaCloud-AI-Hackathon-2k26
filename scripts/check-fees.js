const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkFees() {
  try {
    const coursesWithFees = await prisma.course.count({
      where: {
        tuitionFee: { not: null }
      }
    });
    
    const totalCourses = await prisma.course.count();
    
    console.log('Total courses:', totalCourses);
    console.log('Courses with fees:', coursesWithFees);
    console.log('Courses without fees:', totalCourses - coursesWithFees);
    
    // Sample some courses with fees
    const sampleCourses = await prisma.course.findMany({
      where: { tuitionFee: { not: null } },
      select: {
        name: true,
        degree: true,
        tuitionFee: true,
        currency: true,
        university: {
          select: { name: true }
        }
      },
      take: 10
    });
    
    console.log('\nSample courses with fees:');
    sampleCourses.forEach(c => {
      console.log(`${c.university.name} - ${c.name} (${c.degree}): ${c.currency} ${c.tuitionFee}`);
    });
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

checkFees();
