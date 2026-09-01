const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkUniversityTypes() {
  console.log('\n🔍 CHECKING UNIVERSITY TYPE CLASSIFICATION...\n');

  // Get all Pakistani universities
  const universities = await p.university.findMany({
    where: { country: 'Pakistan' },
    select: { 
      name: true, 
      type: true,
      sector: true,
      city: true,
      description: true
    },
    orderBy: { sector: 'asc' }
  });

  console.log(`Total Pakistani Universities: ${universities.length}\n`);

  // Separate by sector (public/private)
  const publicUnis = universities.filter(u => u.sector === 'public' || u.sector === 'government');
  const privateUnis = universities.filter(u => u.sector === 'private');

  console.log(`📊 CLASSIFICATION SUMMARY:`);
  console.log(`   Government/Public: ${publicUnis.length}`);
  console.log(`   Private: ${privateUnis.length}`);
  console.log(`   Other/Unknown: ${universities.length - publicUnis.length - privateUnis.length}\n`);

  console.log('=' .repeat(80));
  console.log('\n🏛️  GOVERNMENT/PUBLIC UNIVERSITIES:\n');
  publicUnis.forEach((u, i) => {
    console.log(`${i + 1}. ${u.name} (${u.city}) [${u.type}]`);
    if (u.description) {
      console.log(`   ${u.description.substring(0, 80)}...`);
    }
  });

  console.log('\n' + '='.repeat(80));
  console.log('\n🏢 PRIVATE UNIVERSITIES:\n');
  privateUnis.forEach((u, i) => {
    console.log(`${i + 1}. ${u.name} (${u.city}) [${u.type}]`);
    if (u.description) {
      console.log(`   ${u.description.substring(0, 80)}...`);
    }
  });

  // Check for potential misclassifications
  console.log('\n' + '='.repeat(80));
  console.log('\n⚠️  POTENTIAL MISCLASSIFICATIONS:\n');

  // Known government universities that should be public
  const knownGovtUnis = [
    'University of the Punjab',
    'University of Engineering and Technology',
    'GC University',
    'King Edward Medical University',
    'Fatima Jinnah Medical University',
    'University of Education',
    'Lahore College for Women University',
    'University of Karachi',
    'NED University',
    'Mehran University',
    'Sindh Agriculture University',
    'University of Peshawar',
    'University of Balochistan',
  ];

  // Known private universities
  const knownPrivateUnis = [
    'LUMS',
    'FAST',
    'COMSATS',
    'NUST',
    'GIKI',
    'Lahore University of Management Sciences',
    'Beaconhouse National University',
    'Superior University',
    'Minhaj University',
    'University of Central Punjab',
    'The University of Lahore',
  ];

  let issues = [];

  // Check if known govt universities are marked as public
  for (const name of knownGovtUnis) {
    const uni = universities.find(u => u.name.includes(name));
    if (uni && uni.sector !== 'public' && uni.sector !== 'government') {
      issues.push(`❌ ${uni.name} should be GOVERNMENT but marked as "${uni.sector}"`);
    }
  }

  // Check if known private universities are marked as private
  for (const name of knownPrivateUnis) {
    const uni = universities.find(u => u.name.includes(name));
    if (uni && uni.sector !== 'private') {
      issues.push(`❌ ${uni.name} should be PRIVATE but marked as "${uni.sector}"`);
    }
  }

  if (issues.length === 0) {
    console.log('✅ All universities correctly classified!');
  } else {
    console.log(`Found ${issues.length} potential issues:\n`);
    issues.forEach(issue => console.log(`   ${issue}`));
  }

  await p.$disconnect();
}

checkUniversityTypes().catch(console.error).finally(() => process.exit(0));
