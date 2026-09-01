const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function removeFuuastCivilEng() {
  try {
    console.log('=== REMOVING FUUAST CIVIL ENGINEERING ===\n');

    const fuuast = await prisma.university.findFirst({
      where: { name: { contains: 'Federal Urdu' } }
    });

    if (!fuuast) {
      console.log('FUUAST not found');
      return;
    }

    console.log('University:', fuuast.name);

    // Find Civil Engineering courses
    const civilEngCourses = await prisma.course.findMany({
      where: {
        universityId: fuuast.id,
        name: { contains: 'Civil Engineering' }
      }
    });

    if (civilEngCourses.length === 0) {
      console.log('No Civil Engineering courses found');
      return;
    }

    console.log(`\nFound ${civilEngCourses.length} Civil Engineering course(s) to remove:`);
    civilEngCourses.forEach(c => {
      console.log(`  - ${c.name} (${c.degree}) - ID: ${c.id}`);
    });

    // Delete the courses
    const deleted = await prisma.course.deleteMany({
      where: {
        id: { in: civilEngCourses.map(c => c.id) }
      }
    });

    console.log(`\n✅ Successfully removed ${deleted.count} Civil Engineering course(s) from FUUAST`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

removeFuuastCivilEng();
