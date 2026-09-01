const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeAllFees() {
  try {
    console.log('Removing all tuition fees from courses...\n');
    
    // Count courses with fees before
    const beforeCount = await prisma.course.count({
      where: { tuitionFee: { not: null } }
    });
    console.log(`Courses with fees BEFORE: ${beforeCount}`);
    
    // Update all courses to set tuitionFee and currency to null
    const result = await prisma.course.updateMany({
      data: {
        tuitionFee: null,
        currency: null
      }
    });
    
    console.log(`\nUpdated ${result.count} courses`);
    
    // Count courses with fees after
    const afterCount = await prisma.course.count({
      where: { tuitionFee: { not: null } }
    });
    console.log(`Courses with fees AFTER: ${afterCount}`);
    
    console.log('\n✅ All tuition fees removed successfully!');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

removeAllFees();
