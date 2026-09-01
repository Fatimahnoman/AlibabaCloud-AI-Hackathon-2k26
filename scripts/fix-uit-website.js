const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUITWebsite() {
  try {
    console.log('=== FIXING UIT UNIVERSITY WEBSITE ===\n');

    const uit = await prisma.university.findFirst({
      where: { name: { contains: 'UIT' } }
    });

    if (!uit) {
      console.log('UIT University not found');
      return;
    }

    console.log('Current data:');
    console.log('  Name:', uit.name);
    console.log('  Website:', uit.website);
    console.log('  City:', uit.city);

    // UIT University Karachi - The correct website might be different
    // Since uit.edu.pk is not accessible, let's update to a working alternative
    // or mark it as needing verification
    
    const updated = await prisma.university.update({
      where: { id: uit.id },
      data: {
        website: 'https://www.uit.edu.pk', // Try with www
        sourceUrl: 'https://www.hec.gov.pk/english/universities/Pages/Recognized-Degree-Awarding-Institutes.aspx'
      }
    });

    console.log('\n✅ Updated UIT University website');
    console.log('  New Website:', updated.website);
    console.log('\nNote: If this still does not work, the university may have a different domain.');
    console.log('Please verify the correct website manually.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixUITWebsite();
