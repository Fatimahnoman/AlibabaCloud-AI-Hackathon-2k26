const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function addNewportsADP() {
  try {
    const uni = await prisma.university.findFirst({
      where: { name: { contains: 'Newports' } }
    });

    if (!uni) {
      console.log('Newports not found');
      return;
    }

    console.log('Adding ADP programs to:', uni.name);

    const adpPrograms = [
      { name: 'ADP Computer Science', degree: 'associate', department: 'Department of Computer Science' },
      { name: 'ADP Business Administration', degree: 'associate', department: 'Department of Business Administration' },
      { name: 'ADP Digital Marketing', degree: 'associate', department: 'Department of Business Administration' },
      { name: 'ADP Business Analytics', degree: 'associate', department: 'Department of Business Administration' },
      { name: 'ADP Entrepreneurship', degree: 'associate', department: 'Department of Business Administration' },
      { name: 'ADP Database Management', degree: 'associate', department: 'Department of Computer Science' },
      { name: 'ADP Artificial Intelligence', degree: 'associate', department: 'Department of Computer Science' },
      { name: 'ADP Web Development', degree: 'associate', department: 'Department of Computer Science' },
    ];

    let added = 0;
    for (const program of adpPrograms) {
      try {
        await prisma.course.create({
          data: {
            universityId: uni.id,
            name: program.name,
            degree: program.degree,
            department: program.department,
          }
        });
        console.log(`✓ Added: ${program.name}`);
        added++;
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`⊘ Already exists: ${program.name}`);
        } else {
          console.error(`Error adding ${program.name}:`, error.message);
        }
      }
    }

    console.log(`\n✓ Added ${added} ADP programs`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addNewportsADP();
