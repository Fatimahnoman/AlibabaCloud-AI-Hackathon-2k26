import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  // Check duplicate Oxford/Cambridge
  const oxfords = await p.university.findMany({ where: { name: { contains: 'Oxford' } }, include: { courses: true, departments: true } });
  const cambridges = await p.university.findMany({ where: { name: { contains: 'Cambridge' } }, include: { courses: true, departments: true } });

  console.log('=== OXFORD DUPLICATES ===');
  for (const u of oxfords) {
    console.log(`${u.id} | ${u.name} | ${u.courses.length} courses | ${u.departments.length} depts`);
  }

  console.log('\n=== CAMBRIDGE DUPLICATES ===');
  for (const u of cambridges) {
    console.log(`${u.id} | ${u.name} | ${u.courses.length} courses | ${u.departments.length} depts`);
  }

  // Check other top unis coverage
  const topNames = ['Harvard', 'MIT', 'Stanford', 'Yale', 'Princeton', 'Columbia', 'Caltech', 'UC Berkeley', 'UCLA', 'UPenn', 'Duke', 'Toronto', 'McGill', 'UBC', 'Melbourne', 'Sydney', 'ANU', 'NUS', 'NTU', 'Tokyo', 'Kyoto', 'Seoul', 'KAIST', 'Tsinghua', 'Peking'];
  
  console.log('\n=== TOP INTERNATIONAL UNIVERSITIES ===');
  for (const name of topNames) {
    const unis = await p.university.findMany({ where: { name: { contains: name } }, include: { courses: true, departments: true } });
    for (const u of unis) {
      if (!u.id.startsWith('sch-')) {
        console.log(`${u.id} | ${u.name} | ${u.courses.length} courses | ${u.departments.length} depts`);
      }
    }
  }

  await p.$disconnect();
}
main();
