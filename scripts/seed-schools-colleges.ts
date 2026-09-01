import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addDepts(uniId: string, name: string, deptNames: string[]) {
  const existing = await prisma.department.findMany({ where: { universityId: uniId }, select: { name: true } });
  const existingSet = new Set(existing.map((d: { name: string }) => d.name.toLowerCase()));
  let added = 0;
  for (const dn of deptNames) {
    if (!existingSet.has(dn.toLowerCase())) {
      await prisma.department.create({ data: { universityId: uniId, name: dn } });
      added++;
    }
  }
  console.log(`${name}: +${added} depts (total: ${existing.length + added})`);
}

async function addCourses(uniId: string, name: string, courses: { name: string; degree: string; duration: string; fee: number }[], defaultCurrency: string = 'GBP') {
  const existing = await prisma.course.findMany({ where: { universityId: uniId }, select: { name: true } });
  const existingSet = new Set(existing.map((c: { name: string }) => c.name.toLowerCase()));
  let added = 0;
  for (const c of courses) {
    if (!existingSet.has(c.name.toLowerCase())) {
      await prisma.course.create({ data: { universityId: uniId, name: c.name, degree: c.degree, duration: c.duration, tuitionFee: c.fee, currency: defaultCurrency, language: 'English' } });
      added++;
    }
  }
  console.log(`${name}: +${added} courses (total: ${existing.length + added})`);
}

async function main() {
  console.log('=== SEEDING SCHOOLS, COLLEGES & UNIVERSITY OF SOUTH ASIA ===\n');

  // ── UK SCHOOLS ──
  // Eton College
  await addDepts('sch-uk-002', 'Eton College', [
    'Mathematics', 'Sciences (Physics, Chemistry, Biology)', 'English Literature & Language',
    'History & Politics', 'Modern Languages (French, German, Spanish)', 'Classics (Latin, Greek)',
    'Computer Science', 'Art & Design', 'Music', 'Drama & Theatre Studies',
    'Geography', 'Religious Studies', 'Physical Education',
  ]);
  await addCourses('sch-uk-002', 'Eton College', [
    { name: 'GCSE Program (Year 10-11)', degree: 'secondary', duration: '2 years', fee: 44000 },
    { name: 'A-Level Program (Year 12-13)', degree: 'higher-secondary', duration: '2 years', fee: 47000 },
    { name: 'King\'s Scholarship (Scholarship Program)', degree: 'secondary', duration: '2 years', fee: 0 },
  ]);

  // Westminster School
  await addDepts('sch-uk-001', 'Westminster School', [
    'Mathematics', 'Sciences', 'English', 'Classics', 'Modern Languages',
    'History & Politics', 'Computer Science', 'Art', 'Music', 'Drama',
    'Theology & Philosophy', 'Physical Education',
  ]);
  await addCourses('sch-uk-001', 'Westminster School', [
    { name: 'GCSE Program', degree: 'secondary', duration: '2 years', fee: 42000 },
    { name: 'A-Level Program', degree: 'higher-secondary', duration: '2 years', fee: 45000 },
  ]);

  // City of London School
  await addDepts('sch-uk-004', 'City of London School', [
    'Mathematics', 'Sciences', 'English', 'Humanities', 'Modern Languages',
    'Computer Science', 'Art & Design', 'Music', 'Drama', 'Physical Education',
    'Business Studies', 'Economics',
  ]);
  await addCourses('sch-uk-004', 'City of London School', [
    { name: 'GCSE Program', degree: 'secondary', duration: '2 years', fee: 28000 },
    { name: 'A-Level Program', degree: 'higher-secondary', duration: '2 years', fee: 30000 },
  ]);

  // Hills Road Sixth Form College
  await addDepts('sch-uk-003', 'Hills Road Sixth Form College', [
    'Mathematics & Further Mathematics', 'Sciences (Biology, Chemistry, Physics)',
    'Computer Science', 'English Literature', 'Humanities & Social Sciences',
    'Modern Languages', 'Art & Design', 'Music', 'Economics & Business',
  ]);
  await addCourses('sch-uk-003', 'Hills Road Sixth Form College', [
    { name: 'A-Level Program (Academic)', degree: 'higher-secondary', duration: '2 years', fee: 0 },
    { name: 'BTEC Extended Diploma', degree: 'higher-secondary', duration: '2 years', fee: 0 },
    { name: 'Cambridge Technical Diploma', degree: 'higher-secondary', duration: '2 years', fee: 0 },
  ]);

  // ── US SCHOOLS ──
  // Stuyvesant High School
  await addDepts('sch-us-001', 'Stuyvesant High School', [
    'Mathematics', 'Sciences (Biology, Chemistry, Physics)', 'Computer Science & Engineering',
    'English Language Arts', 'Social Studies (History, Economics, Government)',
    'World Languages', 'Art & Music', 'Technology & Engineering', 'Physical Education & Health',
    'Research & Independent Study',
  ]);
  await addCourses('sch-us-001', 'Stuyvesant High School', [
    { name: 'Standard High School Diploma', degree: 'secondary', duration: '4 years', fee: 0 },
    { name: 'Advanced Placement (AP) Program', degree: 'secondary', duration: '4 years', fee: 0 },
    { name: 'Research Program', degree: 'secondary', duration: '1 year', fee: 0 },
  ]);

  // Phillips Academy Andover
  await addDepts('sch-us-002', 'Phillips Academy Andover', [
    'Mathematics', 'Sciences', 'Humanities & Social Sciences', 'Computer Science',
    'Classics', 'Modern Languages', 'Visual Arts', 'Music', 'Theatre & Dance',
    'Religion, Philosophy & Ethics', 'Physical Education & Athletics',
  ]);
  await addCourses('sch-us-002', 'Phillips Academy Andover', [
    { name: 'High School Diploma Program', degree: 'secondary', duration: '4 years', fee: 52000 },
    { name: 'AP & Honors Program', degree: 'secondary', duration: '4 years', fee: 0 },
    { name: 'Term Abroad Program', degree: 'secondary', duration: '1 term', fee: 15000 },
  ]);

  // Thomas Jefferson HS for Science & Technology
  await addDepts('sch-us-003', 'TJHSST', [
    'Advanced Mathematics', 'Advanced Sciences', 'Computer Systems & Engineering',
    'Biomedical Engineering', 'English', 'Social Sciences',
    'World Languages', 'Technology & Innovation', 'Arts', 'Physical Education',
  ]);
  await addCourses('sch-us-003', 'TJHSST', [
    { name: 'Advanced Studies Diploma', degree: 'secondary', duration: '4 years', fee: 0 },
    { name: 'Senior Research Project', degree: 'secondary', duration: '1 year', fee: 0 },
    { name: 'AP STEM Courses', degree: 'secondary', duration: '4 years', fee: 0 },
  ]);

  // ── AUSTRALIAN SCHOOLS ──
  // James Ruse Agricultural High School
  await addDepts('sch-au-001', 'James Ruse Agricultural High School', [
    'Mathematics', 'Sciences (Biology, Chemistry, Physics)', 'English',
    'Agricultural Sciences', 'Humanities & Social Studies', 'Modern Languages',
    'Computer Studies', 'Visual Arts', 'Personal Development & Health',
  ]);
  await addCourses('sch-au-001', 'James Ruse Agricultural High School', [
    { name: 'Higher School Certificate (HSC)', degree: 'higher-secondary', duration: '2 years', fee: 0 },
    { name: 'Agricultural Science Program', degree: 'higher-secondary', duration: '2 years', fee: 0 },
  ]);

  // Melbourne High School
  await addDepts('sch-au-002', 'Melbourne High School', [
    'Mathematics', 'Sciences', 'English', 'Humanities', 'Modern Languages',
    'Computer Science', 'Economics & Business', 'Music', 'Visual Arts & Media',
    'Physical Education', 'Japanese',
  ]);
  await addCourses('sch-au-002', 'Melbourne High School', [
    { name: 'Victorian Certificate of Education (VCE)', degree: 'higher-secondary', duration: '2 years', fee: 0 },
    { name: 'VCE Extended Program', degree: 'higher-secondary', duration: '2 years', fee: 0 },
  ]);

  // Sydney Grammar School
  await addDepts('sch-au-003', 'Sydney Grammar School', [
    'Mathematics', 'Sciences', 'English', 'Classics', 'Modern Languages',
    'History & Economics', 'Computer Science', 'Music', 'Visual Arts',
    'Drama', 'Physical Education', 'Philosophy',
  ]);
  await addCourses('sch-au-003', 'Sydney Grammar School', [
    { name: 'Higher School Certificate (HSC)', degree: 'higher-secondary', duration: '2 years', fee: 32000 },
    { name: 'International Baccalaureate (IB) Preparation', degree: 'higher-secondary', duration: '2 years', fee: 0 },
  ]);

  // ── GERMAN SCHOOLS ──
  // Max-Planck-Gymnasium Munich
  await addDepts('sch-de-001', 'Max-Planck-Gymnasium Munich', [
    'Mathematik', 'Naturwissenschaften (Physik, Chemie, Biologie)',
    'Deutsch', 'Fremdsprachen (Englisch, Französisch, Latein)',
    'Geschichte & Sozialkunde', 'Informatik', 'Kunst & Musik',
    'Religion & Ethik', 'Sport',
  ]);
  await addCourses('sch-de-001', 'Max-Planck-Gymnasium Munich', [
    { name: 'Abitur (Allgemeine Hochschulreife)', degree: 'higher-secondary', duration: '3 years', fee: 0 },
    { name: 'Naturwissenschaftliches Profil', degree: 'higher-secondary', duration: '2 years', fee: 0 },
    { name: 'Sprachliches Profil', degree: 'higher-secondary', duration: '2 years', fee: 0 },
  ]);

  // Leibniz-Gymnasium Hannover
  await addDepts('sch-de-002', 'Leibniz-Gymnasium Hannover', [
    'Mathematik', 'Naturwissenschaften', 'Deutsch',
    'Fremdsprachen (Englisch, Französisch, Spanisch)',
    'Geschichte & Politik', 'Informatik', 'Kunst & Musik',
    'Religion', 'Sport', 'Wirtschaft',
  ]);
  await addCourses('sch-de-002', 'Leibniz-Gymnasium Hannover', [
    { name: 'Abitur', degree: 'higher-secondary', duration: '3 years', fee: 0 },
    { name: 'MINT-Schwerpunkt (Mathematik, Informatik, Naturwissenschaft, Technik)', degree: 'higher-secondary', duration: '2 years', fee: 0 },
  ]);

  // ── CANADIAN SCHOOLS ──
  // Upper Canada College
  await addDepts('sch-ca-001', 'Upper Canada College', [
    'Mathematics', 'Sciences', 'English', 'Social Sciences', 'Modern Languages',
    'Classics', 'Computer Science', 'Visual Arts', 'Music', 'Drama',
    'Physical Education & Athletics', 'Religion & Philosophy',
  ]);
  await addCourses('sch-ca-001', 'Upper Canada College', [
    { name: 'Ontario Secondary School Diploma (OSSD)', degree: 'secondary', duration: '4 years', fee: 42000 },
    { name: 'IB Diploma Program', degree: 'higher-secondary', duration: '2 years', fee: 44000 },
  ]);

  // Collège de Montréal
  await addDepts('sch-ca-002', 'Collège de Montréal', [
    'Mathématiques', 'Sciences', 'Français', 'Histoire & Géographie',
    'Langues modernes (Anglais, Espagnol)', 'Informatique', 'Arts visuels',
    'Musique', 'Éducation physique', 'Philosophie', 'Éthique & Religion',
  ]);
  await addCourses('sch-ca-002', 'Collège de Montréal', [
    { name: 'Diplôme d\'études secondaires (DES)', degree: 'secondary', duration: '5 years', fee: 0 },
    { name: 'Programme d\'éducation intermédiaire (PEI/IB)', degree: 'secondary', duration: '4 years', fee: 0 },
  ]);

  // ── UNIVERSITY OF SOUTH ASIA (Pakistani university — needs expansion) ──
  await addDepts('uni-pk-035', 'University of South Asia', [
    'Department of Business Administration',
    'Department of English',
    'Department of Mathematics',
    'Department of Political Science',
    'Department of Islamic Studies',
    'Department of Pakistan Studies',
    'Department of Economics',
    'Department of Sociology',
  ]);
  await addCourses('uni-pk-035', 'University of South Asia', [
    { name: 'BS Business Administration', degree: 'bachelor', duration: '4 years', fee: 120000 },
    { name: 'BS English', degree: 'bachelor', duration: '4 years', fee: 80000 },
    { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years', fee: 80000 },
    { name: 'BS Political Science', degree: 'bachelor', duration: '4 years', fee: 70000 },
    { name: 'BS Economics', degree: 'bachelor', duration: '4 years', fee: 70000 },
    { name: 'BS Islamic Studies', degree: 'bachelor', duration: '4 years', fee: 60000 },
    { name: 'BS Pakistan Studies', degree: 'bachelor', duration: '4 years', fee: 60000 },
    { name: 'BS Sociology', degree: 'bachelor', duration: '4 years', fee: 70000 },
    { name: 'MS Business Administration', degree: 'master', duration: '2 years', fee: 180000 },
    { name: 'MS English', degree: 'master', duration: '2 years', fee: 120000 },
    { name: 'MS Mathematics', degree: 'master', duration: '2 years', fee: 120000 },
  ], 'PKR');

  console.log('\n=== DONE ===');
  await prisma.$disconnect();
}
main();
