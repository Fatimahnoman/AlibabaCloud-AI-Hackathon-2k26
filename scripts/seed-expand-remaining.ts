import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addDepts(uniId: string, uniName: string, deptNames: string[]) {
  const existing = await prisma.department.findMany({
    where: { universityId: uniId },
    select: { name: true },
  });
  const existingNames = new Set(existing.map((d: { name: string }) => d.name.toLowerCase()));
  let added = 0;
  for (const name of deptNames) {
    if (!existingNames.has(name.toLowerCase())) {
      await prisma.department.create({ data: { universityId: uniId, name } });
      added++;
    }
  }
  console.log(`${uniName}: +${added} departments (total now: ${existing.length + added})`);
}

async function main() {
  console.log('=== Expanding remaining comprehensive universities ===\n');

  // Institute of Business Management (IoBM) — currently 3 depts
  await addDepts('uni-pk-049', 'IoBM', [
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Civil Engineering',
    'Department of Mathematics',
    'Department of Social Sciences & Humanities',
    'Department of Artificial Intelligence',
  ]);

  // National Skills University Islamabad — currently 2 depts
  await addDepts('uni-pk-086', 'National Skills University', [
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Civil Engineering',
    'Department of Computer Science & IT',
    'Department of Applied Sciences',
    'Department of Humanities & Social Sciences',
    'Department of Business Administration',
    'Department of Artificial Intelligence & Cyber Security',
  ]);

  // Akhuwat FIRST University — currently 2 depts
  await addDepts('uni-pk-033', 'Akhuwat FIRST University', [
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Civil Engineering',
    'Department of Computer Science & IT',
    'Department of Mathematics',
    'Department of English & Humanities',
    'Department of Artificial Intelligence & Data Science',
  ]);

  // CECOS University Peshawar — currently 2 depts
  await addDepts('uni-pk-142', 'CECOS University', [
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Computer Science & IT',
    'Department of Civil Engineering',
    'Department of Mathematics',
    'Department of English & Social Sciences',
    'Department of Artificial Intelligence & Data Science',
  ]);

  // HITEC University Taxila — currently 3 depts
  await addDepts('uni-pk-096', 'HITEC University Taxila', [
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Civil Engineering',
    'Department of Computer Science & IT',
    'Department of Mathematics',
    'Department of Humanities & Social Sciences',
    'Department of Artificial Intelligence & Data Science',
  ]);

  // Beaconhouse National University — currently 3 depts
  await addDepts('uni-pk-022', 'Beaconhouse National University', [
    'Department of Mathematics',
    'Department of Natural Sciences',
    'Department of English & Linguistics',
    'Department of Social Sciences',
    'Department of Law',
    'Department of Fine Arts & Design',
    'Department of Media & Communication Studies',
  ]);

  // Lahore Garrison University — currently 3 depts
  await addDepts('uni-pk-024', 'Lahore Garrison University', [
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Civil Engineering',
    'Department of Mathematics',
    'Department of Natural Sciences',
    'Department of English & Humanities',
    'Department of Law',
  ]);

  // Federal Urdu University of Arts Sciences & Technology — currently 3 depts
  await addDepts('uni-pk-045', 'Federal Urdu University', [
    'Faculty of Engineering',
    'Department of Computer Science & IT',
    'Department of Mathematics',
    'Department of Business Administration',
    'Department of Law',
    'Department of Mass Communication',
    'Department of Urdu Literature',
  ]);

  // Newports Institute of Communications & Economics — currently 3 depts
  await addDepts('uni-pk-069', 'Newports Institute', [
    'Department of Computer Science & IT',
    'Department of Electrical Engineering',
    'Department of Mechanical Engineering',
    'Department of Mathematics',
    'Department of English & Social Sciences',
    'Department of Law',
  ]);

  // Institute of Management Sciences Peshawar — currently 3 depts
  await addDepts('uni-pk-141', 'IMS Peshawar', [
    'Department of Electrical Engineering',
    'Department of Computer Science & IT',
    'Department of Mathematics',
    'Department of Natural Sciences',
    'Department of English & Humanities',
    'Department of Law',
    'Department of Artificial Intelligence & Data Science',
  ]);

  console.log('\n=== Done! ===');
  await prisma.$disconnect();
}
main();
