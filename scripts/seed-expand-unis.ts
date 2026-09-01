import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

// Add missing departments to universities that need them
// This only ADDS new departments - doesn't delete existing ones
async function addDepts(
  uniId: string,
  departments: { name: string; description: string; courses: { name: string; degree: string; duration: string; description: string }[] }[],
) {
  const existing = await p.department.findMany({ where: { universityId: uniId }, select: { name: true } });
  const existingNames = new Set(existing.map((d: { name: string }) => d.name));

  let added = 0;
  for (const dept of departments) {
    if (existingNames.has(dept.name)) continue;
    await p.department.create({
      data: { universityId: uniId, name: dept.name, head: '', description: dept.description, totalCourses: dept.courses.length },
    });
    for (const c of dept.courses) {
      await p.course.create({
        data: { universityId: uniId, name: c.name, degree: c.degree, department: dept.name, duration: c.duration, description: c.description },
      });
    }
    added++;
  }
  if (added > 0) console.log(`  +${added} new depts for ${uniId}`);
}

async function main() {
  console.log('=== Expanding University Departments ===\n');

  // LUMS - add Physics, Chemistry, Accounting
  console.log('LUMS:');
  await addDepts('uni-pk-006', [
    { name: 'Physics', description: 'Theoretical and experimental physics research.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Core physics with quantum mechanics and electrodynamics' },
      { name: 'MS Physics', degree: 'Master', duration: '2 years', description: 'Advanced physics research' },
    ]},
    { name: 'Chemistry', description: 'Organic, inorganic, and materials chemistry.', courses: [
      { name: 'BS Chemistry', degree: 'Bachelor', duration: '4 years', description: 'Core chemistry with lab work' },
      { name: 'MS Chemistry', degree: 'Master', duration: '2 years', description: 'Advanced chemistry research' },
    ]},
    { name: 'Accounting', description: 'Financial accounting and audit.', courses: [
      { name: 'BSc Accounting and Finance', degree: 'Bachelor', duration: '4 years', description: 'ACCA/CFAB aligned program' },
    ]},
  ]);

  // NUST - add more schools
  console.log('NUST:');
  await addDepts('uni-pk-071', [
    { name: 'School of Aerospace Engineering (SAE)', description: 'Aeronautics and astronautics.', courses: [
      { name: 'BS Aerospace Engineering', degree: 'Bachelor', duration: '4 years', description: 'Aerodynamics, propulsion, structures' },
      { name: 'MS Aerospace Engineering', degree: 'Master', duration: '2 years', description: 'Advanced aerospace' },
    ]},
    { name: 'Institute of Geographical Information Systems (IGIS)', description: 'GIS and remote sensing.', courses: [
      { name: 'BS Geomatics and GIS', degree: 'Bachelor', duration: '4 years', description: 'Geographic information systems and surveying' },
      { name: 'MS GIS', degree: 'Master', duration: '2 years', description: 'Advanced GIS and remote sensing' },
    ]},
    { name: 'School of Applied Biosciences (SCME)', description: 'Biological and agricultural sciences.', courses: [
      { name: 'BS Biotechnology', degree: 'Bachelor', duration: '4 years', description: 'Molecular biology and genetic engineering' },
    ]},
  ]);

  // FAST-NUCES - add more departments
  console.log('FAST:');
  await addDepts('uni-pk-088', [
    { name: 'Civil Engineering', description: 'Structural and environmental engineering.', courses: [
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Structural, geotechnical, water resources' },
    ]},
    { name: 'Data Science', description: 'Data analytics and machine learning.', courses: [
      { name: 'BS Data Science', degree: 'Bachelor', duration: '4 years', description: 'Big data, ML, statistical computing' },
      { name: 'MS Data Science', degree: 'Master', duration: '2 years', description: 'Advanced data science' },
    ]},
    { name: 'Cyber Security', description: 'Information security and cryptography.', courses: [
      { name: 'BS Cyber Security', degree: 'Bachelor', duration: '4 years', description: 'Network security, cryptography, ethical hacking' },
    ]},
  ]);

  // Aga Khan University - expand from 4 to 10
  console.log('Aga Khan University:');
  await addDepts('uni-pk-041', [
    { name: 'Faculty of Health Sciences', description: 'Medicine, nursing, and allied health.', courses: [
      { name: 'MBBS', degree: 'Bachelor', duration: '5 years', description: 'Medical degree' },
      { name: 'BS Nursing', degree: 'Bachelor', duration: '4 years', description: 'Nursing degree' },
    ]},
    { name: 'Faculty of Arts and Sciences', description: 'Liberal arts and sciences foundation.', courses: [
      { name: 'BA Liberal Arts', degree: 'Bachelor', duration: '4 years', description: 'Interdisciplinary arts and sciences' },
    ]},
    { name: 'Institute for Educational Development', description: 'Teacher training and education research.', courses: [
      { name: 'MEd (Master of Education)', degree: 'Master', duration: '2 years', description: 'Education leadership' },
    ]},
    { name: 'Institute of Business Management', description: 'Management and leadership studies.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Executive MBA' },
    ]},
    { name: 'Department of Biological and Biomedical Sciences', description: 'Biological sciences research.', courses: [
      { name: 'MS Biological Sciences', degree: 'Master', duration: '2 years', description: 'Molecular biology and biomedical research' },
      { name: 'PhD Biological Sciences', degree: 'PhD', duration: '4-5 years', description: 'Biomedical research' },
    ]},
    { name: 'Department of Pathology and Microbiology', description: 'Clinical pathology and microbiology.', courses: [
      { name: 'FCPS Pathology', degree: 'Master', duration: '4 years', description: 'Clinical pathology residency' },
    ]},
  ]);

  // Hamdard University - expand from 4 to 10
  console.log('Hamdard University:');
  await addDepts('uni-pk-044', [
    { name: 'Faculty of Engineering', description: 'Engineering programs.', courses: [
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Electrical and electronics engineering' },
      { name: 'BS Software Engineering', degree: 'Bachelor', duration: '4 years', description: 'Software development' },
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil and structural engineering' },
    ]},
    { name: 'Faculty of Education', description: 'Teacher training and education.', courses: [
      { name: 'BEd (Bachelor of Education)', degree: 'Bachelor', duration: '4 years', description: 'Teaching qualification' },
      { name: 'MEd (Master of Education)', degree: 'Master', duration: '2 years', description: 'Advanced education studies' },
    ]},
    { name: 'Faculty of Islamic Studies', description: 'Islamic theology and jurisprudence.', courses: [
      { name: 'BA Islamic Studies', degree: 'Bachelor', duration: '4 years', description: 'Islamic theology and law' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Psychology, sociology, political science.', courses: [
      { name: 'BS Psychology', degree: 'Bachelor', duration: '4 years', description: 'Clinical and cognitive psychology' },
      { name: 'BS Economics', degree: 'Bachelor', duration: '4 years', description: 'Micro and macro economics' },
    ]},
    { name: 'Faculty of Languages', description: 'English, Urdu, and Arabic.', courses: [
      { name: 'BA English Literature', degree: 'Bachelor', duration: '4 years', description: 'English language and literature' },
    ]},
    { name: 'Faculty of Fine Arts', description: 'Visual and performing arts.', courses: [
      { name: 'BFA (Bachelor of Fine Arts)', degree: 'Bachelor', duration: '4 years', description: 'Visual arts and design' },
    ]},
  ]);

  // Habib University - expand from 5 to 10
  console.log('Habib University:');
  await addDepts('uni-pk-058', [
    { name: 'Department of Electrical Engineering', description: 'Electrical and computer engineering.', courses: [
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Power, electronics, and communications' },
    ]},
    { name: 'Department of Civil Engineering', description: 'Civil and infrastructure engineering.', courses: [
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Structural and environmental engineering' },
    ]},
    { name: 'Department of Social and Cultural Analysis', description: 'Sociology, history, and cultural studies.', courses: [
      { name: 'BA Social and Cultural Analysis', degree: 'Bachelor', duration: '4 years', description: 'Interdisciplinary social sciences' },
    ]},
    { name: 'Department of Mathematical Sciences', description: 'Pure and applied mathematics.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Pure and applied mathematics' },
    ]},
  ]);

  // ITU (Information Technology University) - expand from 4 to 8
  console.log('ITU:');
  await addDepts('uni-pk-017', [
    { name: 'Department of Data Science', description: 'Data analytics and machine learning.', courses: [
      { name: 'BS Data Science', degree: 'Bachelor', duration: '4 years', description: 'Big data, ML, and statistical computing' },
    ]},
    { name: 'Department of Social Sciences', description: 'Humanities and social sciences.', courses: [
      { name: 'BA Social Sciences', degree: 'Bachelor', duration: '4 years', description: 'Sociology, psychology, economics' },
    ]},
    { name: 'Department of Design', description: 'Interaction and visual design.', courses: [
      { name: 'BDes (Bachelor of Design)', degree: 'Bachelor', duration: '4 years', description: 'Interaction design and visual communication' },
    ]},
    { name: 'Department of Business Analytics', description: 'Business intelligence and analytics.', courses: [
      { name: 'BS Business Analytics', degree: 'Bachelor', duration: '4 years', description: 'Business intelligence and data-driven decision making' },
    ]},
  ]);

  // IBA - expand departments
  console.log('IBA:');
  await addDepts('uni-pk-039', [
    { name: 'Department of Mathematics', description: 'Pure and applied mathematics.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Pure and applied mathematics' },
    ]},
    { name: 'Department of Social Sciences', description: 'Social sciences and humanities.', courses: [
      { name: 'BA Social Sciences', degree: 'Bachelor', duration: '4 years', description: 'Sociology, economics, political science' },
    ]},
    { name: 'Department of Media and Communication', description: 'Journalism and mass communication.', courses: [
      { name: 'BA Media and Communication', degree: 'Bachelor', duration: '4 years', description: 'Journalism, PR, and digital media' },
    ]},
  ]);

  // GIKI - expand departments
  console.log('GIKI:');
  await addDepts('uni-pk-158', [
    { name: 'Department of Biosciences', description: 'Biological sciences and biotechnology.', courses: [
      { name: 'BS Biosciences', degree: 'Bachelor', duration: '4 years', description: 'Molecular biology and biotechnology' },
    ]},
    { name: 'Department of Humanities', description: 'Humanities and social sciences.', courses: [
      { name: 'BA Humanities', degree: 'Bachelor', duration: '4 years', description: 'English, history, philosophy' },
    ]},
    { name: 'Department of Management Sciences', description: 'Business and management.', courses: [
      { name: 'BBA', degree: 'Bachelor', duration: '4 years', description: 'Business administration' },
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Master of Business Administration' },
    ]},
  ]);

  // COMSATS - expand departments
  console.log('COMSATS:');
  await addDepts('uni-pk-072', [
    { name: 'Department of Biosciences', description: 'Biological and biomedical sciences.', courses: [
      { name: 'BS Biotechnology', degree: 'Bachelor', duration: '4 years', description: 'Molecular biology and genetic engineering' },
      { name: 'BS Bioinformatics', degree: 'Bachelor', duration: '4 years', description: 'Computational biology' },
    ]},
    { name: 'Department of Physics', description: 'Theoretical and applied physics.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Core physics with modern applications' },
    ]},
    { name: 'Department of Humanities', description: 'English, Islamic studies, and social sciences.', courses: [
      { name: 'BA English', degree: 'Bachelor', duration: '4 years', description: 'English literature and linguistics' },
    ]},
    { name: 'Department of Management Sciences', description: 'Business administration.', courses: [
      { name: 'BBA', degree: 'Bachelor', duration: '4 years', description: 'Business administration' },
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Master of Business Administration' },
    ]},
  ]);

  // UET Lahore - expand departments
  console.log('UET Lahore:');
  await addDepts('uni-pk-007', [
    { name: 'Department of Computer Science', description: 'Computing and software.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Core CS and software engineering' },
      { name: 'BS Data Science', degree: 'Bachelor', duration: '4 years', description: 'Data analytics and ML' },
    ]},
    { name: 'Department of Basic Sciences', description: 'Mathematics, physics, chemistry.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Applied mathematics' },
    ]},
    { name: 'Department of Management Studies', description: 'Business and management.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Master of Business Administration' },
    ]},
    { name: 'Department of Architecture', description: 'Architecture and urban planning.', courses: [
      { name: 'B.Arch (Bachelor of Architecture)', degree: 'Bachelor', duration: '4 years', description: 'Architectural design and planning' },
    ]},
  ]);

  // Punjab University - expand departments
  console.log('Punjab University:');
  await addDepts('uni-pk-001', [
    { name: 'Department of Law', description: 'Legal studies.', courses: [
      { name: 'LLB (Bachelor of Laws)', degree: 'Bachelor', duration: '5 years', description: 'Professional law degree' },
    ]},
    { name: 'Department of Agriculture', description: 'Agricultural sciences.', courses: [
      { name: 'BS Agriculture', degree: 'Bachelor', duration: '4 years', description: 'Crop science and agronomy' },
    ]},
    { name: 'Department of Information Technology', description: 'IT and computing.', courses: [
      { name: 'BS Information Technology', degree: 'Bachelor', duration: '4 years', description: 'Software development and IT management' },
    ]},
  ]);

  // Karachi University - expand departments
  console.log('Karachi University:');
  await addDepts('uni-pk-037', [
    { name: 'Faculty of Islamic Studies', description: 'Islamic theology and jurisprudence.', courses: [
      { name: 'BA Islamic Studies', degree: 'Bachelor', duration: '4 years', description: 'Islamic theology, Quran, Hadith' },
    ]},
    { name: 'Faculty of Oriental Learning', description: 'Arabic, Persian, and Urdu.', courses: [
      { name: 'BA Arabic', degree: 'Bachelor', duration: '4 years', description: 'Arabic language and literature' },
    ]},
    { name: 'Department of Statistics', description: 'Statistics and actuarial science.', courses: [
      { name: 'BS Statistics', degree: 'Bachelor', duration: '4 years', description: 'Applied statistics and data analysis' },
    ]},
  ]);

  // Dow University - expand
  console.log('Dow University:');
  await addDepts('uni-pk-040', [
    { name: 'Faculty of Pharmacy', description: 'Pharmaceutical sciences.', courses: [
      { name: 'Pharm.D (Doctor of Pharmacy)', degree: 'Bachelor', duration: '5 years', description: 'Professional pharmacy degree' },
    ]},
    { name: 'Faculty of Allied Health Sciences', description: 'Medical technology and therapy.', courses: [
      { name: 'BS Medical Technology', degree: 'Bachelor', duration: '4 years', description: 'Clinical lab technology' },
      { name: 'BS Physiotherapy', degree: 'Bachelor', duration: '4 years', description: 'Physical therapy' },
      { name: 'BS Radiology', degree: 'Bachelor', duration: '4 years', description: 'Medical imaging technology' },
    ]},
    { name: 'Faculty of Dentistry', description: 'Dental surgery and oral health.', courses: [
      { name: 'BDS (Bachelor of Dental Surgery)', degree: 'Bachelor', duration: '5 years', description: 'Professional dental degree' },
    ]},
  ]);

  console.log('\n=== EXPANSION COMPLETE ===');
  await p.$disconnect();
}

main().catch(console.error);
