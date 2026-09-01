const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function addMedicalPrograms() {
  console.log('\n🏥 ADDING MEDICAL PROGRAMS TO UNIVERSITIES...\n');

  // Medical universities that should have MBBS/BDS programs
  const medicalUnis = [
    'King Edward Medical University',
    'Fatima Jinnah Medical University',
    'Allama Iqbal Medical College',
    'Services Institute of Medical Sciences',
    'Nishtar Medical University',
    'Dow University of Health Sciences',
    'Jinnah Sindh Medical University',
    'Liaquat University of Medical and Health Sciences',
    'Pakistan Navy Officer Entry',
    'Army Medical College',
  ];

  const medicalPrograms = [
    { name: 'MBBS (Bachelor of Medicine, Bachelor of Surgery)', degree: 'bachelor_of_medicine', department: 'Faculty of Medicine', fee: 150000, duration: '5 years' },
    { name: 'BDS (Bachelor of Dental Surgery)', degree: 'bachelor_of_medicine', department: 'Faculty of Dentistry', fee: 180000, duration: '4 years' },
    { name: ' Pharm.D (Doctor of Pharmacy)', degree: 'bachelor', department: 'Faculty of Pharmacy', fee: 120000, duration: '5 years' },
    { name: 'BS Nursing', degree: 'bachelor', department: 'Faculty of Nursing', fee: 80000, duration: '4 years' },
    { name: 'BS Radiology', degree: 'bachelor', department: 'Faculty of Allied Health Sciences', fee: 90000, duration: '4 years' },
    { name: 'BS Medical Laboratory Technology', degree: 'bachelor', department: 'Faculty of Allied Health Sciences', fee: 85000, duration: '4 years' },
    { name: 'M.Phil Medicine', degree: 'master', department: 'Faculty of Medicine', fee: 200000, duration: '2 years' },
    { name: 'FCPS Medicine', degree: 'fellowship', department: 'Faculty of Medicine', fee: 250000, duration: '4 years' },
    { name: 'MD Internal Medicine', degree: 'doctorate', department: 'Faculty of Medicine', fee: 300000, duration: '3 years' },
  ];

  let added = 0;

  for (const uniName of medicalUnis) {
    const uni = await p.university.findFirst({
      where: { name: { contains: uniName } }
    });

    if (!uni) {
      console.log(`⚠️  University not found: ${uniName}`);
      continue;
    }

    console.log(`\n🏥 ${uni.name}:`);

    for (const program of medicalPrograms) {
      // Check if program already exists
      const existing = await p.course.findFirst({
        where: {
          universityId: uni.id,
          name: program.name
        }
      });

      if (!existing) {
        await p.course.create({
          data: {
            universityId: uni.id,
            name: program.name,
            degree: program.degree,
            department: program.department,
            tuitionFee: program.fee,
            currency: 'PKR',
            duration: program.duration,
            description: `${program.name} program at ${uni.name}. Duration: ${program.duration}.`,
          }
        });
        console.log(`  ✅ Added: ${program.name}`);
        added++;
      } else {
        console.log(`  ⏭️  Already exists: ${program.name}`);
      }
    }
  }

  console.log('\n' + '='.repeat(80));
  console.log(`\n📊 RESULTS:`);
  console.log(`   ✅ Added: ${added} medical programs`);

  await p.$disconnect();
}

addMedicalPrograms().catch(console.error).finally(() => process.exit(0));
