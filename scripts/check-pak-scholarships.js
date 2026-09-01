const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function checkPakScholarships() {
  const scholarships = await p.scholarship.findMany({
    where: { country: 'Pakistan' },
    select: { name: true, provider: true, amount: true, currency: true, amountFrequency: true, description: true, eligibilityCriteria: true, category: true }
  });

  console.log('Pakistani Scholarships:', scholarships.length);
  scholarships.forEach(x => {
    console.log('\n-', x.name);
    console.log('  Provider:', x.provider);
    console.log('  Category:', x.category);
    console.log('  Amount:', x.amount ? `${x.currency} ${x.amount}/${x.amountFrequency}` : 'N/A');
    console.log('  Description:', x.description ? x.description.substring(0, 100) + '...' : 'N/A');
    console.log('  Eligibility:', x.eligibilityCriteria ? x.eligibilityCriteria.substring(0, 100) + '...' : 'N/A');
  });

  await p.$disconnect();
}

checkPakScholarships().catch(console.error).finally(() => process.exit(0));
