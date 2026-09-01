const { PrismaClient } = require('@prisma/client');
const postgresPrisma = new PrismaClient();

async function clearDatabase() {
  console.log('=== CLEARING POSTGRESQL DATABASE ===\n');

  try {
    // Delete in reverse order to avoid foreign key constraints
    console.log('Deleting courses...');
    await postgresPrisma.course.deleteMany();
    
    console.log('Deleting departments...');
    await postgresPrisma.department.deleteMany();
    
    console.log('Deleting universities...');
    await postgresPrisma.university.deleteMany();
    
    console.log('Deleting countries...');
    await postgresPrisma.country.deleteMany();
    
    console.log('Deleting users...');
    await postgresPrisma.user.deleteMany();
    
    console.log('Deleting scholarships...');
    await postgresPrisma.scholarship.deleteMany();
    
    console.log('Deleting career paths...');
    await postgresPrisma.careerPath.deleteMany();
    
    console.log('\n✅ Database cleared successfully!\n');
  } catch (error) {
    console.error('\n❌ Error clearing database:', error.message);
  } finally {
    await postgresPrisma.$disconnect();
  }
}

clearDatabase();
