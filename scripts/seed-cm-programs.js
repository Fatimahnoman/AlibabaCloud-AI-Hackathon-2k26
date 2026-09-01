const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const cmPrograms = [
  // ===== PUNJAB =====
  { name: 'Chief Minister Youth Internship Program', province: 'Punjab', category: 'internship', description: 'Paid internship for fresh graduates in government departments. Monthly stipend provided.', eligibility: 'Punjab domicile, 16 years education, age 21-28, unemployed', benefits: 'PKR 25,000-40,000/month stipend, government experience, skill development', howToApply: 'Apply online at Punjab Skills Development Fund (PSDF) portal. Submit CNIC, educational certificates, domicile.', targetAudience: 'fresh graduates', status: 'active' },
  { name: 'Ehsaas Undergraduate Scholarship Program', province: 'Punjab', category: 'scholarship', description: 'Need-based scholarship covering full tuition for undergraduate students in public universities.', eligibility: 'Punjab/Sindh/KPK/Balochistan domicile, family income < PKR 45,000/month, admission in public university', benefits: 'Full tuition coverage, monthly stipend PKR 10,000, book allowance', howToApply: 'Apply through HEC portal when announced. Submit income certificate, CNIC, admission letter.', targetAudience: 'undergraduate students', status: 'active' },
  { name: 'Punjab Rozgar Scheme', province: 'Punjab', category: 'financial_aid', description: 'Interest-free loans up to PKR 1 million for youth to start businesses.', eligibility: 'Punjab domicile, age 21-45, CNIC holder, business plan required', benefits: 'Interest-free loan up to PKR 1 million, 2-year repayment period, business mentorship', howToApply: 'Apply online at Punjab Rozgar Scheme portal. Submit business plan, CNIC, bank statements.', targetAudience: 'youth entrepreneurs', status: 'active' },
  { name: 'Punjab Skills Development Fund (PSDF)', province: 'Punjab', category: 'skill', description: 'Free technical and vocational training programs across Punjab.', eligibility: 'Punjab domicile, age 15-45, matric pass minimum', benefits: 'Free training in 100+ trades, monthly stipend during training, job placement assistance', howToApply: 'Register at PSDF center or online portal. Choose trade and schedule.', targetAudience: 'youth seeking skills', status: 'active' },
  { name: 'PITB Digital Skills Program', province: 'Punjab', category: 'skill', description: 'Free IT training programs by PITB including Freelancing, Graphic Design, SEO, E-Commerce, WordPress.', eligibility: 'Punjab domicile, age 18-35, intermediate pass minimum', benefits: 'Free IT training, PITB certification, freelancing mentorship, PSDF stipend', howToApply: 'Register online at psdf.org.pk or pitb.gov.pk. Choose course and schedule.', targetAudience: 'youth seeking IT skills', status: 'active' },
  { name: 'CM Laptop Scheme Punjab', province: 'Punjab', category: 'laptop', description: 'Free laptops for meritorious students in public universities.', eligibility: 'Punjab domicile, enrolled in public university, minimum CGPA 3.0', benefits: 'Free laptop, digital literacy, academic improvement', howToApply: 'Apply through university administration when announced. Merit-based selection.', targetAudience: 'university students', status: 'active' },

  // ===== SINDH =====
  { name: 'Sindh Youth Fellowship Program', province: 'Sindh', category: 'internship', description: 'Fellowship for young professionals in Sindh government departments.', eligibility: 'Sindh domicile, 16 years education, age 22-30', benefits: 'PKR 30,000/month stipend, government experience, networking', howToApply: 'Apply through Sindh Human Resource Commission portal.', targetAudience: 'young professionals', status: 'active' },
  { name: 'Sindh Scholarship Program (Benazir)', province: 'Sindh', category: 'scholarship', description: 'Need-based scholarship for Sindh students in universities.', eligibility: 'Sindh domicile, family income < PKR 40,000/month', benefits: 'Full tuition, monthly stipend, book allowance', howToApply: 'Apply through Sindh Higher Education Commission portal.', targetAudience: 'students from low-income families', status: 'active' },
  { name: 'Sindh Skills Development Program', province: 'Sindh', category: 'skill', description: 'TVET (Technical and Vocational Education) training programs.', eligibility: 'Sindh domicile, age 15-45', benefits: 'Free technical training, certification, job placement', howToApply: 'Register at nearest TEVTA center in Sindh.', targetAudience: 'youth seeking vocational training', status: 'active' },
  { name: 'Sindh IT Board Digital Skills', province: 'Sindh', category: 'skill', description: 'Free IT and digital skills training: Web Dev, Mobile Apps, Digital Marketing, Graphic Design.', eligibility: 'Sindh domicile, age 16-35, intermediate pass minimum', benefits: 'Free IT training, certification, job placement assistance', howToApply: 'Register online at sitb.gos.pk or visit nearest training center.', targetAudience: 'youth seeking IT skills', status: 'active' },

  // ===== KPK =====
  { name: 'KPK Youth Employment Program', province: 'KPK', category: 'internship', description: 'Government internship program for KPK youth in various departments.', eligibility: 'KPK domicile, 14+ years education, age 18-30', benefits: 'PKR 20,000-30,000/month stipend, experience, skill development', howToApply: 'Apply online at KPK E-Governance portal.', targetAudience: 'educated youth', status: 'active' },
  { name: 'KPK Education Scholarship', province: 'KPK', category: 'scholarship', description: 'Merit and need-based scholarships for KPK students.', eligibility: 'KPK domicile, enrolled in recognized institution', benefits: 'Tuition coverage, monthly stipend', howToApply: 'Apply through Higher Education Department KPK.', targetAudience: 'students', status: 'active' },
  { name: 'Sehat Sahulat Card (Health Card)', province: 'KPK', category: 'health', description: 'Free health insurance up to PKR 1 million per family per year.', eligibility: 'All KPK residents (CNIC holder)', benefits: 'Free treatment at empaneled hospitals, cashless healthcare', howToApply: 'Auto-enrolled via CNIC. Visit any empaneled hospital with CNIC.', targetAudience: 'all residents', status: 'active' },

  // ===== BALOCHISTAN =====
  { name: 'Balochistan Youth Internship', province: 'Balochistan', category: 'internship', description: 'Paid internship for Balochistan youth in government departments.', eligibility: 'Balochistan domicile, 14+ years education, age 18-30', benefits: 'PKR 15,000-25,000/month, government experience', howToApply: 'Apply through Balochistan Civil Services Commission.', targetAudience: 'youth', status: 'active' },
  { name: 'Balochistan Scholarship Program', province: 'Balochistan', category: 'scholarship', description: 'Need-based scholarships for Balochistan students.', eligibility: 'Balochistan domicile, financial need', benefits: 'Full/partial tuition, monthly stipend', howToApply: 'Apply through Education Department Balochistan.', targetAudience: 'students', status: 'active' },

  // ===== ISLAMABAD =====
  { name: 'HEC Need-Based Scholarship (Federal)', province: 'Islamabad', category: 'scholarship', description: 'HEC need-based scholarship for students in federal universities.', eligibility: 'Pakistan domicile, family income < PKR 45,000/month', benefits: 'Full tuition, monthly stipend, book allowance', howToApply: 'Apply through HEC E portal when announced.', targetAudience: 'students in federal universities', status: 'active' },
];

async function main() {
  console.log('=== Seeding CM Programs ===');
  let count = 0;
  for (const c of cmPrograms) {
    await p.cMProgram.upsert({
      where: { id: `cm-${count + 1}` },
      update: c,
      create: { id: `cm-${count + 1}`, ...c },
    });
    count++;
  }
  console.log(`  ${count} CM programs seeded`);
  
  const total = await p.cMProgram.count();
  console.log(`\nTotal CM programs in DB: ${total}`);
  
  await p.$disconnect();
}

main();
