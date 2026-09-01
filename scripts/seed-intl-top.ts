import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUniWithDepts(
  id: string, name: string, country: string, city: string, website: string,
  departments: { name: string; description: string; courses: { name: string; degree: string; duration: string; description: string }[] }[],
) {
  await prisma.university.upsert({
    where: { id },
    update: {},
    create: { id, name, country, city, website, type: 'university' },
  });
  await prisma.department.deleteMany({ where: { universityId: id } });
  for (const dept of departments) {
    await prisma.department.create({
      data: {
        universityId: id, name: dept.name, head: '', description: dept.description, totalCourses: dept.courses.length,
      },
    });
    for (const c of dept.courses) {
      await prisma.course.create({
        data: { universityId: id, name: c.name, degree: c.degree, department: dept.name, duration: c.duration, description: c.description },
      });
    }
  }
  console.log(`✓ ${name} — ${departments.length} depts, ${departments.reduce((a, d) => a + d.courses.length, 0)} courses`);
}

async function main() {
  // HARVARD
  await addUniWithDepts('uni-us-003', 'Harvard University', 'United States', 'Cambridge, MA', 'https://www.harvard.edu', [
    { name: 'John A. Paulson School of Engineering and Applied Sciences (SEAS)', description: 'Harvard\'s engineering school, known for CS, bioengineering, and applied math.', courses: [
      { name: 'AB Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Foundations of CS with theoretical focus' },
      { name: 'SB Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Science-focused CS degree' },
      { name: 'SM Computer Science', degree: 'Master', duration: '1-2 years', description: 'Research-oriented CS' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-5 years', description: 'Original research in CS' },
      { name: 'AB Engineering Sciences', degree: 'Bachelor', duration: '4 years', description: 'Applied sciences' },
      { name: 'SM Data Science', degree: 'Master', duration: '1 year', description: 'Applied data science' },
    ]},
    { name: 'Harvard Business School (HBS)', description: 'World\'s most prestigious business school, known for case method teaching.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Case-method MBA program' },
      { name: 'PhD Business Administration', degree: 'PhD', duration: '5 years', description: 'Research in business' },
      { name: 'DBA (Doctor of Business Administration)', degree: 'PhD', duration: '4-5 years', description: 'Practice-oriented doctorate' },
    ]},
    { name: 'Harvard Law School', description: 'One of the most prestigious law schools in the world.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Postgraduate law for international graduates' },
      { name: 'SJD (Doctor of Juridical Science)', degree: 'PhD', duration: '3-4 years', description: 'Doctoral research in law' },
    ]},
    { name: 'Harvard Medical School', description: 'One of the oldest and most prestigious medical schools.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree' },
      { name: 'MMSc (Master of Medical Sciences)', degree: 'Master', duration: '2 years', description: 'Research medical sciences' },
      { name: 'PhD in Biological Sciences in Public Health', degree: 'PhD', duration: '5-6 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Economics', description: 'Harvard Economics — one of the top economics departments globally.', courses: [
      { name: 'AB Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'AM Economics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5-6 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics', description: 'Harvard Mathematics is one of the strongest in the world.', courses: [
      { name: 'AB Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Pure and applied mathematics' },
      { name: 'AM Mathematics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral mathematics' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in mathematics' },
    ]},
    { name: 'Department of Physics', description: 'Harvard Physics — home to many Nobel laureates.', courses: [
      { name: 'AB Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'AM Physics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '5-6 years', description: 'Research in physics' },
    ]},
    { name: 'Department of Government', description: 'Harvard Government — top political science department.', courses: [
      { name: 'AB Government', degree: 'Bachelor', duration: '4 years', description: 'Political science degree' },
      { name: 'AM Government', degree: 'Master', duration: '2 years', description: 'Pre-doctoral political science' },
      { name: 'PhD Government', degree: 'PhD', duration: '5-6 years', description: 'Research in government' },
    ]},
    { name: 'Department of Psychology', description: 'Harvard Psychology — leading research in cognitive and social psychology.', courses: [
      { name: 'AB Psychology', degree: 'Bachelor', duration: '4 years', description: 'Psychology degree' },
      { name: 'PhD Psychology', degree: 'PhD', duration: '5-6 years', description: 'Research in psychology' },
    ]},
    { name: 'Harvard Kennedy School', description: 'Top school for public policy, government, and international affairs.', courses: [
      { name: 'MPP (Master in Public Policy)', degree: 'Master', duration: '2 years', description: 'Public policy analysis' },
      { name: 'MPA (Master in Public Administration)', degree: 'Master', duration: '1 year', description: 'Mid-career public administration' },
      { name: 'MC/MPA (Master in Public Administration/International Development)', degree: 'Master', duration: '2 years', description: 'International development' },
      { name: 'PhD in Public Policy', degree: 'PhD', duration: '5-6 years', description: 'Research in public policy' },
    ]},
    { name: 'Harvard Graduate School of Education', description: 'Top education school in the world.', courses: [
      { name: 'EdM (Master of Education)', degree: 'Master', duration: '1 year', description: 'Education leadership and policy' },
      { name: 'EdLD (Doctor of Education Leadership)', degree: 'PhD', duration: '3 years', description: 'Education leadership practice' },
      { name: 'PhD in Education', degree: 'PhD', duration: '5-6 years', description: 'Research in education' },
    ]},
    { name: 'Department of Chemistry & Chemical Biology', description: 'Harvard Chemistry — world-leading in synthesis and chemical biology.', courses: [
      { name: 'AB Chemistry', degree: 'Bachelor', duration: '4 years', description: 'Chemistry degree' },
      { name: 'PhD Chemistry', degree: 'PhD', duration: '5-6 years', description: 'Research in chemistry' },
    ]},
    { name: 'Department of Biological Sciences', description: 'Harvard Biology — molecular, cellular, and organismal biology.', courses: [
      { name: 'AB Biology', degree: 'Bachelor', duration: '4 years', description: 'Biology degree' },
      { name: 'PhD Biological Sciences', degree: 'PhD', duration: '5-6 years', description: 'Research in biology' },
    ]},
  ]);

  // MIT
  await addUniWithDepts('uni-us-001', 'Massachusetts Institute of Technology (MIT)', 'United States', 'Cambridge, MA', 'https://www.mit.edu', [
    { name: 'EECS (Electrical Engineering & Computer Science)', description: 'MIT EECS — the birthplace of many computing innovations.', courses: [
      { name: 'SB Computer Science and Engineering', degree: 'Bachelor', duration: '4 years', description: 'Comprehensive CSE degree' },
      { name: 'SB Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Electrical engineering' },
      { name: 'MEng EECS', degree: 'Master', duration: '1 year', description: 'Industry-focused engineering masters' },
      { name: 'SM EECS', degree: 'Master', duration: '2 years', description: 'Research-oriented masters' },
      { name: 'PhD EECS', degree: 'PhD', duration: '4-5 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Mechanical Engineering', description: 'MIT ME — one of the top mechanical engineering departments.', courses: [
      { name: 'SB Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'SM Mechanical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced ME' },
      { name: 'PhD Mechanical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in ME' },
    ]},
    { name: 'Department of Mathematics', description: 'MIT Mathematics — known for pure and applied math.', courses: [
      { name: 'SB Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'SM Mathematics', degree: 'Master', duration: '2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'MIT Physics — world-leading in condensed matter and particle physics.', courses: [
      { name: 'SB Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'SM Physics', degree: 'Master', duration: '2 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '4-5 years', description: 'Research in physics' },
    ]},
    { name: 'MIT Sloan School of Management', description: 'MIT Sloan — known for innovation, entrepreneurship, and technology management.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Technology-focused MBA' },
      { name: 'MS Finance', degree: 'Master', duration: '1 year', description: 'Quantitative finance' },
      { name: 'MS Business Analytics', degree: 'Master', duration: '1 year', description: 'Analytics for business' },
      { name: 'MS Management Studies', degree: 'Master', duration: '1 year', description: 'Management for STEM graduates' },
      { name: 'PhD Management', degree: 'PhD', duration: '4-5 years', description: 'Research in management' },
    ]},
    { name: 'Department of Chemical Engineering', description: 'MIT ChE — pioneering chemical engineering research.', courses: [
      { name: 'SB Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'SM Chemical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced ChE' },
      { name: 'PhD Chemical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in ChE' },
    ]},
    { name: 'Department of Biological Engineering', description: 'MIT BioE — engineering approaches to biology.', courses: [
      { name: 'SB Biological Engineering', degree: 'Bachelor', duration: '4 years', description: 'Bioengineering degree' },
      { name: 'SM Biological Engineering', degree: 'Master', duration: '2 years', description: 'Advanced bioengineering' },
      { name: 'PhD Biological Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in bioengineering' },
    ]},
    { name: 'Department of Brain and Cognitive Sciences', description: 'MIT BCS — world-leading in neuroscience and AI.', courses: [
      { name: 'SB Brain and Cognitive Sciences', degree: 'Bachelor', duration: '4 years', description: 'Neuroscience degree' },
      { name: 'SM Neuroscience', degree: 'Master', duration: '2 years', description: 'Neuroscience research' },
      { name: 'PhD Neuroscience', degree: 'PhD', duration: '4-5 years', description: 'Research in neuroscience' },
    ]},
    { name: 'Department of Aeronautics and Astronautics', description: 'MIT AeroAstro — top aerospace engineering program.', courses: [
      { name: 'SB Aerospace Engineering', degree: 'Bachelor', duration: '4 years', description: 'Aerospace degree' },
      { name: 'SM Aerospace Engineering', degree: 'Master', duration: '2 years', description: 'Advanced aerospace' },
      { name: 'PhD Aerospace Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in aerospace' },
    ]},
    { name: 'MIT Media Lab', description: 'MIT Media Lab — interdisciplinary research in technology and design.', courses: [
      { name: 'MS Media Arts and Sciences', degree: 'Master', duration: '2 years', description: 'Interdisciplinary media research' },
      { name: 'PhD Media Arts and Sciences', degree: 'PhD', duration: '4-5 years', description: 'Research in media technology' },
    ]},
  ]);

  // STANFORD
  await addUniWithDepts('uni-us-002', 'Stanford University', 'United States', 'Stanford, CA', 'https://www.stanford.edu', [
    { name: 'Department of Computer Science', description: 'Stanford CS — birthplace of Silicon Valley, top CS department in the world.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Comprehensive CS degree' },
      { name: 'MS Computer Science', degree: 'Master', duration: '1.5-2 years', description: 'Research or industry track' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-6 years', description: 'Research doctorate' },
      { name: 'MS Artificial Intelligence', degree: 'Master', duration: '1-2 years', description: 'Specialized AI program' },
      { name: 'MS Data Science', degree: 'Master', duration: '1-2 years', description: 'Applied data science' },
    ]},
    { name: 'Stanford Graduate School of Business', description: 'Stanford GSB — one of the top business schools globally.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Transformative MBA' },
      { name: 'MSx (Master of Science in Management)', degree: 'Master', duration: '1 year', description: 'Experienced leaders program' },
      { name: 'PhD Business', degree: 'PhD', duration: '5 years', description: 'Research in business' },
    ]},
    { name: 'Stanford Law School', description: 'Stanford Law — known for technology law and IP.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
      { name: 'JSD (Doctor of the Science of Law)', degree: 'PhD', duration: '3-4 years', description: 'Doctoral research in law' },
    ]},
    { name: 'Stanford School of Medicine', description: 'Stanford Medicine — known for biomedical research and clinical innovation.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree' },
      { name: 'MS Biomedical Informatics', degree: 'Master', duration: '2 years', description: 'Computational biology' },
      { name: 'PhD Bioengineering', degree: 'PhD', duration: '5-6 years', description: 'Research in bioengineering' },
    ]},
    { name: 'Department of Electrical Engineering', description: 'Stanford EE — world-leading in electronics and signal processing.', courses: [
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'MS Electrical Engineering', degree: 'Master', duration: '1.5-2 years', description: 'Advanced EE' },
      { name: 'PhD Electrical Engineering', degree: 'PhD', duration: '4-6 years', description: 'Research in EE' },
    ]},
    { name: 'Department of Mechanical Engineering', description: 'Stanford ME — known for design and biomechanics.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'MS Mechanical Engineering', degree: 'Master', duration: '1.5-2 years', description: 'Advanced ME' },
      { name: 'PhD Mechanical Engineering', degree: 'PhD', duration: '4-6 years', description: 'Research in ME' },
    ]},
    { name: 'Department of Mathematics', description: 'Stanford Math — strong in pure and applied mathematics.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'MS Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-6 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'Stanford Physics — known for particle physics at SLAC.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'MS Physics', degree: 'Master', duration: '1-2 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '4-6 years', description: 'Research in physics' },
    ]},
    { name: 'Department of Economics', description: 'Stanford Economics — top economics department.', courses: [
      { name: 'BA Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'MS Economics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5-6 years', description: 'Research in economics' },
    ]},
    { name: 'Stanford School of Engineering', description: 'Stanford Engineering — broad engineering school.', courses: [
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Chemical engineering' },
      { name: 'MS Chemical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced ChemE' },
      { name: 'PhD Chemical Engineering', degree: 'PhD', duration: '4-6 years', description: 'Research in ChemE' },
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'MS Environmental Engineering', degree: 'Master', duration: '2 years', description: 'Environmental engineering' },
    ]},
  ]);

  // YALE
  await addUniWithDepts('uni-us-006', 'Yale University', 'United States', 'New Haven, CT', 'https://www.yale.edu', [
    { name: 'Department of Computer Science', description: 'Yale CS — known for AI, systems, and theory.', courses: [
      { name: 'BA Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Science-focused CS' },
      { name: 'MS Computer Science', degree: 'Master', duration: '1-2 years', description: 'Advanced CS' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-5 years', description: 'Research in CS' },
    ]},
    { name: 'Yale School of Management', description: 'Yale SOM — known for non-profit management and social impact.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'MS in Management Studies', degree: 'Master', duration: '1 year', description: 'Pre-experience management' },
      { name: 'PhD in Management', degree: 'PhD', duration: '5 years', description: 'Research in management' },
    ]},
    { name: 'Yale Law School', description: 'Yale Law — the most selective law school in the US.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
      { name: 'JSD (Doctor of the Science of Law)', degree: 'PhD', duration: '3-4 years', description: 'Doctoral research in law' },
    ]},
    { name: 'Yale School of Medicine', description: 'Yale Medical School — known for clinical research.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree' },
      { name: 'PhD in Biological and Biomedical Sciences', degree: 'PhD', duration: '5-6 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Economics', description: 'Yale Economics — strong in macro and econometrics.', courses: [
      { name: 'BA Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5-6 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics', description: 'Yale Math — known for analysis and algebra.', courses: [
      { name: 'BA Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'Yale Physics — strong in condensed matter and particle physics.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'PhD Physics', degree: 'PhD', duration: '5-6 years', description: 'Research in physics' },
    ]},
    { name: 'Department of Political Science', description: 'Yale Political Science — top-ranked.', courses: [
      { name: 'BA Political Science', degree: 'Bachelor', duration: '4 years', description: 'Political science degree' },
      { name: 'PhD Political Science', degree: 'PhD', duration: '5-6 years', description: 'Research in political science' },
    ]},
    { name: 'Yale School of the Environment', description: 'Top environmental school in the world.', courses: [
      { name: 'MEM (Master of Environmental Management)', degree: 'Master', duration: '2 years', description: 'Environmental management' },
      { name: 'MESc (Master of Environmental Science)', degree: 'Master', duration: '2 years', description: 'Environmental science' },
      { name: 'PhD in Environmental Science and Policy', degree: 'PhD', duration: '5-6 years', description: 'Research in environment' },
    ]},
  ]);

  // PRINCETON
  await addUniWithDepts('uni-us-007', 'Princeton University', 'United States', 'Princeton, NJ', 'https://www.princeton.edu', [
    { name: 'Department of Computer Science', description: 'Princeton CS — known for algorithms and theoretical CS.', courses: [
      { name: 'AB Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'BA Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Liberal arts CS' },
      { name: 'MSE Computer Science', degree: 'Master', duration: '2 years', description: 'Research masters' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-5 years', description: 'Research in CS' },
    ]},
    { name: 'Department of Economics', description: 'Princeton Economics — one of the top globally.', courses: [
      { name: 'AB Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5-6 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics', description: 'Princeton Math — one of the strongest in the world.', courses: [
      { name: 'AB Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in mathematics' },
    ]},
    { name: 'Department of Physics', description: 'Princeton Physics — known for theoretical physics.', courses: [
      { name: 'AB Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'PhD Physics', degree: 'PhD', duration: '4-5 years', description: 'Research in physics' },
    ]},
    { name: 'School of Public and International Affairs', description: 'Princeton SPIA — top public policy school.', courses: [
      { name: 'MPA (Master in Public Affairs)', degree: 'Master', duration: '1-2 years', description: 'Public affairs' },
      { name: 'PhD in Politics', degree: 'PhD', duration: '5-6 years', description: 'Research in politics' },
    ]},
    { name: 'Department of Electrical and Computer Engineering', description: 'Princeton ECE — strong in electronics and systems.', courses: [
      { name: 'BSE Electrical and Computer Engineering', degree: 'Bachelor', duration: '4 years', description: 'ECE degree' },
      { name: 'MSE Electrical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced EE' },
      { name: 'PhD Electrical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in EE' },
    ]},
    { name: 'Department of Mechanical and Aerospace Engineering', description: 'Princeton MAE — aerospace and mechanical engineering.', courses: [
      { name: 'BSE Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'MSE Mechanical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced ME' },
      { name: 'PhD Mechanical and Aerospace Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in MAE' },
    ]},
    { name: 'Department of Political Science', description: 'Princeton Political Science — top-ranked.', courses: [
      { name: 'AB Political Science', degree: 'Bachelor', duration: '4 years', description: 'Political science' },
      { name: 'PhD Political Science', degree: 'PhD', duration: '5-6 years', description: 'Research in political science' },
    ]},
  ]);

  // CALTECH
  await addUniWithDepts('uni-us-004', 'California Institute of Technology (Caltech)', 'United States', 'Pasadena, CA', 'https://www.caltech.edu', [
    { name: 'Computing and Mathematical Sciences', description: 'Caltech CMS — small but extremely strong CS department.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree with strong math focus' },
      { name: 'MS Computer Science', degree: 'Master', duration: '1-2 years', description: 'Research-oriented CS' },
      { name: 'PhD Computing and Mathematical Sciences', degree: 'PhD', duration: '4-5 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Electrical Engineering', description: 'Caltech EE — known for photonics and quantum electronics.', courses: [
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'PhD Electrical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in EE' },
    ]},
    { name: 'Department of Mechanical and Civil Engineering', description: 'Caltech MCE — mechanical and civil engineering.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'PhD Mechanical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in ME' },
    ]},
    { name: 'Division of Physics, Mathematics and Astronomy', description: 'Caltech PMA — known for physics and astrophysics.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'PhD Physics', degree: 'PhD', duration: '4-5 years', description: 'Research in physics' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in math' },
    ]},
    { name: 'Division of Chemistry and Chemical Engineering', description: 'Caltech CCE — known for catalysis and molecular synthesis.', courses: [
      { name: 'BS Chemistry', degree: 'Bachelor', duration: '4 years', description: 'Chemistry degree' },
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Chemical engineering' },
      { name: 'PhD Chemistry', degree: 'PhD', duration: '4-5 years', description: 'Research in chemistry' },
      { name: 'PhD Chemical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in ChemE' },
    ]},
    { name: 'Division of Biology and Biological Engineering', description: 'Caltech BBEE — biology and bioengineering.', courses: [
      { name: 'BS Biology', degree: 'Bachelor', duration: '4 years', description: 'Biology degree' },
      { name: 'PhD Biology', degree: 'PhD', duration: '4-5 years', description: 'Research in biology' },
      { name: 'PhD Bioengineering', degree: 'PhD', duration: '4-5 years', description: 'Research in bioengineering' },
    ]},
    { name: 'Department of Applied and Computational Mathematics', description: 'Caltech ACM — applied math and computational science.', courses: [
      { name: 'BS Applied and Computational Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Applied math degree' },
      { name: 'PhD ACM', degree: 'PhD', duration: '4-5 years', description: 'Research in applied math' },
    ]},
    { name: 'Division of the Humanities and Social Sciences', description: 'Caltech HSS — small but unique humanities division.', courses: [
      { name: 'BS Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree with math focus' },
      { name: 'PhD Economics', degree: 'PhD', duration: '4-5 years', description: 'Research in economics' },
    ]},
  ]);

  // COLUMBIA
  await addUniWithDepts('uni-us-005', 'Columbia University', 'United States', 'New York, NY', 'https://www.columbia.edu', [
    { name: 'Department of Computer Science', description: 'Columbia CS — known for NLP, vision, and theory.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'MS Computer Science', degree: 'Master', duration: '1.5-2 years', description: 'Advanced CS' },
      { name: 'MS Data Science', degree: 'Master', duration: '1-2 years', description: 'Applied data science' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-5 years', description: 'Research in CS' },
    ]},
    { name: 'Columbia Business School', description: 'Columbia CBS — known for value investing and finance.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'MS Finance', degree: 'Master', duration: '1 year', description: 'Finance specialization' },
      { name: 'PhD Business', degree: 'PhD', duration: '5 years', description: 'Research in business' },
    ]},
    { name: 'Columbia Law School', description: 'Columbia Law — known for corporate and international law.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
      { name: 'JSD (Doctor of Juridical Science)', degree: 'PhD', duration: '3-4 years', description: 'Doctoral research in law' },
    ]},
    { name: 'Columbia College of Physicians and Surgeons', description: 'Columbia Medical — one of the oldest in the US.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree' },
      { name: 'PhD in Biomedical Sciences', degree: 'PhD', duration: '5-6 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Economics', description: 'Columbia Economics — top department.', courses: [
      { name: 'BA Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'MA Economics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5-6 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics', description: 'Columbia Math — strong in analysis and algebra.', courses: [
      { name: 'BA Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'MA Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'Columbia Physics — strong in condensed matter and astrophysics.', courses: [
      { name: 'BA Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'MA Physics', degree: 'Master', duration: '1-2 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '5-6 years', description: 'Research in physics' },
    ]},
    { name: 'Fu Foundation School of Engineering and Applied Science', description: 'Columbia Engineering — broad engineering school.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'MS Mechanical Engineering', degree: 'Master', duration: '1.5-2 years', description: 'Advanced ME' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in engineering' },
    ]},
    { name: 'Columbia Journalism School', description: 'Top journalism school in the world.', courses: [
      { name: 'MS Journalism', degree: 'Master', duration: '1 year', description: 'Broadcast and digital journalism' },
      { name: 'MS Data Journalism', degree: 'Master', duration: '1 year', description: 'Data-driven journalism' },
    ]},
    { name: 'School of International and Public Affairs (SIPA)', description: 'Columbia SIPA — top public policy school.', courses: [
      { name: 'MPA (Master of Public Administration)', degree: 'Master', duration: '2 years', description: 'Public administration' },
      { name: 'MPA-ESP (Environmental Science and Policy)', degree: 'Master', duration: '2 years', description: 'Environmental policy' },
      { name: 'MIA (Master of International Affairs)', degree: 'Master', duration: '2 years', description: 'International affairs' },
      { name: 'PhD in Sustainable Development', degree: 'PhD', duration: '5-6 years', description: 'Research in sustainable dev' },
    ]},
  ]);

  // UC BERKELEY
  await addUniWithDepts('uni-us-011', 'UC Berkeley', 'United States', 'Berkeley, CA', 'https://www.berkeley.edu', [
    { name: 'Electrical Engineering & Computer Sciences (EECS)', description: 'Berkeley EECS — one of the top CS departments in the world.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'BS Electrical Engineering and Computer Sciences', degree: 'Bachelor', duration: '4 years', description: 'EECS degree' },
      { name: 'MS Computer Science', degree: 'Master', duration: '1-2 years', description: 'Research or MEng' },
      { name: 'MEng EECS', degree: 'Master', duration: '1 year', description: 'Industry-focused masters' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-6 years', description: 'Research in CS' },
    ]},
    { name: 'Haas School of Business', description: 'Berkeley Haas — known for entrepreneurship and innovation.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'MEng Management of Technology', degree: 'Master', duration: '1 year', description: 'Technology management' },
      { name: 'PhD Business Administration', degree: 'PhD', duration: '5 years', description: 'Research in business' },
    ]},
    { name: 'UC Berkeley School of Law', description: 'Berkeley Law — known for tech law and public interest law.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
      { name: 'JSD (Doctor of Juridical Science)', degree: 'PhD', duration: '3-4 years', description: 'Doctoral research in law' },
    ]},
    { name: 'UCSF School of Medicine (Joint)', description: 'UCSF/Berkeley joint medical programs.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree through UCSF' },
      { name: 'PhD in Bioengineering', degree: 'PhD', duration: '5-6 years', description: 'Joint bioengineering research' },
    ]},
    { name: 'Department of Economics', description: 'Berkeley Economics — top public economics department.', courses: [
      { name: 'BA Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'MA Economics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5-6 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics', description: 'Berkeley Math — one of the strongest in the world.', courses: [
      { name: 'BA Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'MA Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-6 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'Berkeley Physics — known for particle physics and cosmology.', courses: [
      { name: 'BA Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'PhD Physics', degree: 'PhD', duration: '5-6 years', description: 'Research in physics' },
    ]},
    { name: 'Department of Mechanical Engineering', description: 'Berkeley ME — strong in energy and biomechanics.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'MS Mechanical Engineering', degree: 'Master', duration: '1-2 years', description: 'Advanced ME' },
      { name: 'PhD Mechanical Engineering', degree: 'PhD', duration: '4-6 years', description: 'Research in ME' },
    ]},
    { name: 'Department of Civil and Environmental Engineering', description: 'Berkeley CEE — known for structural and environmental engineering.', courses: [
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'MS Civil Engineering', degree: 'Master', duration: '1-2 years', description: 'Advanced civil' },
      { name: 'PhD Civil Engineering', degree: 'PhD', duration: '4-6 years', description: 'Research in civil' },
    ]},
    { name: 'Department of Chemical Engineering', description: 'Berkeley ChE — strong in energy and materials.', courses: [
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'MS Chemical Engineering', degree: 'Master', duration: '1-2 years', description: 'Advanced ChemE' },
      { name: 'PhD Chemical Engineering', degree: 'PhD', duration: '4-6 years', description: 'Research in ChemE' },
    ]},
    { name: 'School of Information', description: 'Berkeley I School — information science and data science.', courses: [
      { name: 'MIDS (Master of Information and Data Science)', degree: 'Master', duration: '1-2 years', description: 'Data science' },
      { name: 'MPS in Information', degree: 'Master', duration: '1 year', description: 'Information management' },
      { name: 'PhD in Information', degree: 'PhD', duration: '4-6 years', description: 'Research in information science' },
    ]},
  ]);

  // UCLA
  await addUniWithDepts('uni-us-010', 'UCLA', 'United States', 'Los Angeles, CA', 'https://www.ucla.edu', [
    { name: 'Department of Computer Science', description: 'UCLA CS — known for AI, networking, and systems.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'MS Computer Science', degree: 'Master', duration: '1-2 years', description: 'Advanced CS' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-6 years', description: 'Research in CS' },
    ]},
    { name: 'UCLA Anderson School of Management', description: 'UCLA Anderson — known for entertainment and technology management.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'MS in Finance', degree: 'Master', duration: '1 year', description: 'Finance specialization' },
      { name: 'MS in Business Analytics', degree: 'Master', duration: '1 year', description: 'Business analytics' },
      { name: 'PhD in Management', degree: 'PhD', duration: '5 years', description: 'Research in management' },
    ]},
    { name: 'UCLA School of Law', description: 'UCLA Law — known for entertainment law and public interest.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
    ]},
    { name: 'David Geffen School of Medicine', description: 'UCLA Medical — top medical school on the West Coast.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree' },
      { name: 'MS in Clinical Research', degree: 'Master', duration: '2 years', description: 'Clinical research methods' },
      { name: 'PhD in Biomedical Sciences', degree: 'PhD', duration: '5-6 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Economics', description: 'UCLA Economics — strong in macro and international.', courses: [
      { name: 'BA Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'MA Economics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5-6 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics', description: 'UCLA Math — strong across all areas.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'MS Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-6 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics and Astronomy', description: 'UCLA Physics — known for astrophysics.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'MS Physics', degree: 'Master', duration: '1-2 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '5-6 years', description: 'Research in physics' },
    ]},
    { name: 'Henry Samueli School of Engineering', description: 'UCLA Engineering — broad engineering school.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'MS Mechanical Engineering', degree: 'Master', duration: '1-2 years', description: 'Advanced ME' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '4-6 years', description: 'Research in engineering' },
    ]},
  ]);

  // UNIVERSITY OF TORONTO
  await addUniWithDepts('uni-ca-001', 'University of Toronto', 'Canada', 'Toronto', 'https://www.utoronto.ca', [
    { name: 'Department of Computer Science', description: 'UofT CS — one of the top in Canada, known for AI (Hinton was here).', courses: [
      { name: 'HBSc Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'MSc Computer Science', degree: 'Master', duration: '1-2 years', description: 'Research or professional masters' },
      { name: 'MEng Electrical and Computer Engineering', degree: 'Master', duration: '1-2 years', description: 'Industry-focused' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-5 years', description: 'Research in CS' },
    ]},
    { name: 'Rotman School of Management', description: 'UofT Rotman — known for integrative thinking.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'Master of Finance', degree: 'Master', duration: '1 year', description: 'Finance specialization' },
      { name: 'PhD in Management', degree: 'PhD', duration: '5 years', description: 'Research in management' },
    ]},
    { name: 'Faculty of Law', description: 'UofT Law — top law school in Canada.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
      { name: 'SJD (Doctor of Juridical Science)', degree: 'PhD', duration: '3-4 years', description: 'Doctoral research in law' },
    ]},
    { name: 'Faculty of Medicine', description: 'UofT Medicine — largest medical school in Canada.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree' },
      { name: 'MSc Biomedical Sciences', degree: 'Master', duration: '2 years', description: 'Biomedical research' },
      { name: 'PhD in Medical Sciences', degree: 'PhD', duration: '4-5 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Economics', description: 'UofT Economics — top in Canada.', courses: [
      { name: 'HBSc Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'MA Economics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics', description: 'UofT Math — one of the strongest in Canada.', courses: [
      { name: 'HBSc Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics degree' },
      { name: 'MSc Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'UofT Physics — strong in condensed matter and astro.', courses: [
      { name: 'HBSc Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics degree' },
      { name: 'MSc Physics', degree: 'Master', duration: '1-2 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '4-5 years', description: 'Research in physics' },
    ]},
    { name: 'Faculty of Engineering', description: 'UofT Engineering — broad engineering faculty.', courses: [
      { name: 'BASc Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Chemical engineering' },
      { name: 'BASc Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Mechanical engineering' },
      { name: 'BASc Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Electrical engineering' },
      { name: 'BASc Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '1-2 years', description: 'Advanced ME' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in engineering' },
    ]},
    { name: 'Leslie Dan Faculty of Pharmacy', description: 'UofT Pharmacy — top in Canada.', courses: [
      { name: 'PharmB (Bachelor of Pharmacy)', degree: 'Master', duration: '4 years', description: 'Pharmacy degree' },
      { name: 'MSc Pharmaceutical Sciences', degree: 'Master', duration: '2 years', description: 'Pharmaceutical research' },
    ]},
  ]);

  // MCGILL
  await addUniWithDepts('uni-ca-002', 'McGill University', 'Canada', 'Montreal', 'https://www.mcgill.ca', [
    { name: 'School of Computer Science', description: 'McGill CS — known for AI, graphics, and theory.', courses: [
      { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'CS degree' },
      { name: 'MSc Computer Science', degree: 'Master', duration: '2 years', description: 'Research masters' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '4-5 years', description: 'Research in CS' },
    ]},
    { name: 'Desautels Faculty of Management', description: 'McGill Desautels — known for international business.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'MSc Finance', degree: 'Master', duration: '1-2 years', description: 'Finance' },
      { name: 'PhD Management', degree: 'PhD', duration: '5 years', description: 'Research in management' },
    ]},
    { name: 'Faculty of Law', description: 'McGill Law — unique bilingual civil/common law program.', courses: [
      { name: 'BCL/LLB (Bach Civil Law/LLB)', degree: 'Bachelor', duration: '4 years', description: 'Bilingual law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1-2 years', description: 'Advanced legal study' },
      { name: 'DCL (Doctor of Civil Law)', degree: 'PhD', duration: '3-4 years', description: 'Doctoral research in law' },
    ]},
    { name: 'Faculty of Medicine and Health Sciences', description: 'McGill Medicine — one of the oldest in Canada.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree' },
      { name: 'MSc Biomedical Sciences', degree: 'Master', duration: '2 years', description: 'Biomedical research' },
      { name: 'PhD in Biomedical Sciences', degree: 'PhD', duration: '4-5 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Economics', description: 'McGill Economics — strong in theory and development.', courses: [
      { name: 'BA Economics', degree: 'Bachelor', duration: '3 years', description: 'Economics degree' },
      { name: 'MA Economics', degree: 'Master', duration: '1-2 years', description: 'Pre-doctoral economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '5 years', description: 'Research in economics' },
    ]},
    { name: 'Department of Mathematics and Statistics', description: 'McGill Math — strong across all areas.', courses: [
      { name: 'BSc Mathematics', degree: 'Bachelor', duration: '3 years', description: 'Mathematics degree' },
      { name: 'MSc Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'McGill Physics — strong in high energy and condensed matter.', courses: [
      { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Physics degree' },
      { name: 'MSc Physics', degree: 'Master', duration: '1-2 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '4-5 years', description: 'Research in physics' },
    ]},
    { name: 'Faculty of Engineering', description: 'McGill Engineering — broad engineering faculty.', courses: [
      { name: 'BEng Mechanical Engineering', degree: 'Bachelor', duration: '3 years', description: 'ME degree' },
      { name: 'BEng Electrical Engineering', degree: 'Bachelor', duration: '3 years', description: 'EE degree' },
      { name: 'BEng Chemical Engineering', degree: 'Bachelor', duration: '3 years', description: 'ChemE degree' },
      { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '1-2 years', description: 'Advanced ME' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in engineering' },
    ]},
  ]);

  // UNIVERSITY OF MELBOURNE
  await addUniWithDepts('uni-au-002', 'University of Melbourne', 'Australia', 'Melbourne', 'https://www.unimelb.edu.au', [
    { name: 'School of Computing and Information Systems', description: 'Melbourne CIS — known for AI and data science.', courses: [
      { name: 'Bachelor of Science (Computing and Software Systems)', degree: 'Bachelor', duration: '3 years', description: 'CS degree' },
      { name: 'Master of IT', degree: 'Master', duration: '2 years', description: 'IT specialization' },
      { name: 'Master of Data Science', degree: 'Master', duration: '2 years', description: 'Data science' },
      { name: 'PhD Computing', degree: 'PhD', duration: '3-4 years', description: 'Research in CS' },
    ]},
    { name: 'Melbourne Business School', description: 'Melbourne Business School — top in Australia.', courses: [
      { name: 'MBA', degree: 'Master', duration: '1-2 years', description: 'Full-time MBA' },
      { name: 'Master of Finance', degree: 'Master', duration: '1.5-2 years', description: 'Finance' },
      { name: 'Master of Management', degree: 'Master', duration: '1-2 years', description: 'Management' },
      { name: 'PhD in Management', degree: 'PhD', duration: '4-5 years', description: 'Research in management' },
    ]},
    { name: 'Melbourne Law School', description: 'Melbourne Law — top in Australia.', courses: [
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
      { name: 'PhD in Law', degree: 'PhD', duration: '3-4 years', description: 'Research in law' },
    ]},
    { name: 'Melbourne Medical School', description: 'Melbourne Medicine — oldest in Australia.', courses: [
      { name: 'MD (Doctor of Medicine)', degree: 'Master', duration: '4 years', description: 'Medical degree (graduate entry)' },
      { name: 'Master of Clinical Research', degree: 'Master', duration: '2 years', description: 'Clinical research' },
      { name: 'PhD in Medical Science', degree: 'PhD', duration: '3-4 years', description: 'Research doctorate' },
    ]},
    { name: 'School of Engineering', description: 'Melbourne Engineering — broad engineering school.', courses: [
      { name: 'Master of Engineering (Mechanical)', degree: 'Master', duration: '2-3 years', description: 'Mechanical engineering' },
      { name: 'Master of Engineering (Electrical)', degree: 'Master', duration: '2-3 years', description: 'Electrical engineering' },
      { name: 'Master of Engineering (Civil)', degree: 'Master', duration: '2-3 years', description: 'Civil engineering' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in engineering' },
    ]},
    { name: 'School of Mathematics and Statistics', description: 'Melbourne Math — strong across all areas.', courses: [
      { name: 'Bachelor of Science (Mathematics)', degree: 'Bachelor', duration: '3 years', description: 'Mathematics degree' },
      { name: 'Master of Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD in Mathematics', degree: 'PhD', duration: '3-4 years', description: 'Research in math' },
    ]},
    { name: 'School of Physics', description: 'Melbourne Physics — known for photonics and condensed matter.', courses: [
      { name: 'Bachelor of Science (Physics)', degree: 'Bachelor', duration: '3 years', description: 'Physics degree' },
      { name: 'Master of Physics', degree: 'Master', duration: '1-2 years', description: 'Advanced physics' },
      { name: 'PhD in Physics', degree: 'PhD', duration: '3-4 years', description: 'Research in physics' },
    ]},
    { name: 'Faculty of Science', description: 'Melbourne Science — broad science faculty.', courses: [
      { name: 'Bachelor of Science', degree: 'Bachelor', duration: '3 years', description: 'General science degree' },
      { name: 'Master of Science', degree: 'Master', duration: '1-2 years', description: 'Advanced science' },
      { name: 'PhD in Science', degree: 'PhD', duration: '3-4 years', description: 'Research in science' },
    ]},
  ]);

  // NATIONAL UNIVERSITY OF SINGAPORE (NUS)
  await addUniWithDepts('uni-sg-001', 'National University of Singapore (NUS)', 'Singapore', 'Singapore', 'https://www.nus.edu.sg', [
    { name: 'School of Computing', description: 'NUS Computing — top in Asia, known for AI and databases.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'BS Information Systems', degree: 'Bachelor', duration: '4 years', description: 'IS degree' },
      { name: 'MComp (Master of Computing)', degree: 'Master', duration: '1.5-2 years', description: 'Computing specialization' },
      { name: 'PhD Computing', degree: 'PhD', duration: '4-5 years', description: 'Research in CS' },
    ]},
    { name: 'NUS Business School', description: 'NUS Business — top in Asia.', courses: [
      { name: 'BBA (Bachelor of Business Administration)', degree: 'Bachelor', duration: '4 years', description: 'Business administration' },
      { name: 'MBA', degree: 'Master', duration: '1-2 years', description: 'Full-time MBA' },
      { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Finance' },
      { name: 'PhD Business', degree: 'PhD', duration: '4-5 years', description: 'Research in business' },
    ]},
    { name: 'NUS Law School', description: 'NUS Law — top in Asia.', courses: [
      { name: 'LLB (Bachelor of Laws)', degree: 'Bachelor', duration: '4 years', description: 'Law degree' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Professional law degree' },
    ]},
    { name: 'Yong Loo Lin School of Medicine', description: 'NUS Medicine — top in Singapore.', courses: [
      { name: 'MBBS (Bachelor of Medicine and Surgery)', degree: 'Master', duration: '5 years', description: 'Medical degree' },
      { name: 'MSc Biomedical Informatics', degree: 'Master', duration: '1-2 years', description: 'Biomedical informatics' },
      { name: 'PhD in Medicine', degree: 'PhD', duration: '4-5 years', description: 'Research doctorate' },
    ]},
    { name: 'Faculty of Engineering', description: 'NUS Engineering — top in Asia.', courses: [
      { name: 'BEng Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'BEng Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'BEng Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'BEng Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'MEng', degree: 'Master', duration: '1-2 years', description: 'Engineering specialization' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '4-5 years', description: 'Research in engineering' },
    ]},
    { name: 'Faculty of Science', description: 'NUS Science — broad science faculty.', courses: [
      { name: 'BSc Mathematics', degree: 'Bachelor', duration: '3-4 years', description: 'Mathematics' },
      { name: 'BSc Physics', degree: 'Bachelor', duration: '3-4 years', description: 'Physics' },
      { name: 'BSc Chemistry', degree: 'Bachelor', duration: '3-4 years', description: 'Chemistry' },
      { name: 'BSc Biology', degree: 'Bachelor', duration: '3-4 years', description: 'Biology' },
      { name: 'MSc Mathematics', degree: 'Master', duration: '1-2 years', description: 'Advanced math' },
      { name: 'PhD Science', degree: 'PhD', duration: '4-5 years', description: 'Research in science' },
    ]},
    { name: 'School of Design and Environment', description: 'NUS SDE — architecture and real estate.', courses: [
      { name: 'Bachelor of Architecture', degree: 'Bachelor', duration: '5 years', description: 'Architecture degree' },
      { name: 'Master of Architecture', degree: 'Master', duration: '2 years', description: 'Advanced architecture' },
      { name: 'Master of Urban Planning', degree: 'Master', duration: '2 years', description: 'Urban planning' },
    ]},
    { name: 'Lee Kuan Yew School of Public Policy', description: 'NUS LKY — top public policy school in Asia.', courses: [
      { name: 'Master in Public Policy', degree: 'Master', duration: '1-2 years', description: 'Public policy' },
      { name: 'Master in Public Administration', degree: 'Master', duration: '1-2 years', description: 'Public administration' },
      { name: 'PhD in Public Policy', degree: 'PhD', duration: '4-5 years', description: 'Research in public policy' },
    ]},
  ]);

  // KYOTO UNIVERSITY
  await addUniWithDepts('uni-jp-002', 'Kyoto University', 'Japan', 'Kyoto', 'https://www.kyoto-u.ac.jp', [
    { name: 'Graduate School of Informatics', description: 'Kyoto Informatics — known for AI and social informatics.', courses: [
      { name: 'BS Informatics', degree: 'Bachelor', duration: '4 years', description: 'Informatics degree' },
      { name: 'MS Informatics', degree: 'Master', duration: '2 years', description: 'Advanced informatics' },
      { name: 'PhD Informatics', degree: 'PhD', duration: '3 years', description: 'Research in informatics' },
    ]},
    { name: 'Graduate School of Engineering', description: 'Kyoto Engineering — one of the top in Japan.', courses: [
      { name: 'BS Engineering', degree: 'Bachelor', duration: '4 years', description: 'Engineering degree' },
      { name: 'MS Engineering', degree: 'Master', duration: '2 years', description: 'Advanced engineering' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '3 years', description: 'Research in engineering' },
    ]},
    { name: 'Graduate School of Economics', description: 'Kyoto Economics — known for heterodox economics.', courses: [
      { name: 'BS Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'MS Economics', degree: 'Master', duration: '2 years', description: 'Advanced economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '3 years', description: 'Research in economics' },
    ]},
    { name: 'Graduate School of Law', description: 'Kyoto Law — one of the top in Japan.', courses: [
      { name: 'LLB Law', degree: 'Bachelor', duration: '4 years', description: 'Law degree' },
      { name: 'LLM Law', degree: 'Master', duration: '2 years', description: 'Advanced law' },
      { name: 'PhD Law', degree: 'PhD', duration: '3 years', description: 'Research in law' },
    ]},
    { name: 'Graduate School of Medicine', description: 'Kyoto Medicine — one of the oldest in Japan.', courses: [
      { name: 'MD Medicine', degree: 'Bachelor', duration: '6 years', description: 'Medical degree' },
      { name: 'PhD Medical Sciences', degree: 'PhD', duration: '3-4 years', description: 'Research doctorate' },
    ]},
    { name: 'Graduate School of Science', description: 'Kyoto Science — known for physics and mathematics.', courses: [
      { name: 'BS Science', degree: 'Bachelor', duration: '4 years', description: 'Science degree' },
      { name: 'MS Science', degree: 'Master', duration: '2 years', description: 'Advanced science' },
      { name: 'PhD Science', degree: 'PhD', duration: '3 years', description: 'Research in science' },
    ]},
    { name: 'Graduate School of Agriculture', description: 'Kyoto Agriculture — one of the top in Japan.', courses: [
      { name: 'BS Agriculture', degree: 'Bachelor', duration: '4 years', description: 'Agriculture degree' },
      { name: 'MS Agriculture', degree: 'Master', duration: '2 years', description: 'Advanced agriculture' },
      { name: 'PhD Agriculture', degree: 'PhD', duration: '3 years', description: 'Research in agriculture' },
    ]},
  ]);

  // SEOUL NATIONAL UNIVERSITY
  await addUniWithDepts('uni-kr-001', 'Seoul National University (SNU)', 'South Korea', 'Seoul', 'https://www.snu.ac.kr', [
    { name: 'Department of Computer Science and Engineering', description: 'SNU CS — top in South Korea, known for AI and systems.', courses: [
      { name: 'BS Computer Science and Engineering', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'MS Computer Science and Engineering', degree: 'Master', duration: '2 years', description: 'Advanced CS' },
      { name: 'PhD Computer Science and Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in CS' },
    ]},
    { name: 'Graduate School of Business', description: 'SNU Business — top in South Korea.', courses: [
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'PhD Business Administration', degree: 'PhD', duration: '4 years', description: 'Research in business' },
    ]},
    { name: 'College of Law', description: 'SNU Law — top law school in South Korea.', courses: [
      { name: 'LLB Law', degree: 'Bachelor', duration: '4 years', description: 'Law degree' },
      { name: 'LLM Law', degree: 'Master', duration: '1-2 years', description: 'Advanced law' },
      { name: 'PhD Law', degree: 'PhD', duration: '3-4 years', description: 'Research in law' },
    ]},
    { name: 'College of Medicine', description: 'SNU Medicine — top medical school in South Korea.', courses: [
      { name: 'MD Medicine', degree: 'Bachelor', duration: '6 years', description: 'Medical degree' },
      { name: 'PhD Medical Sciences', degree: 'PhD', duration: '3-4 years', description: 'Research doctorate' },
    ]},
    { name: 'College of Engineering', description: 'SNU Engineering — broad engineering college.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'MS Engineering', degree: 'Master', duration: '2 years', description: 'Advanced engineering' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in engineering' },
    ]},
    { name: 'College of Natural Sciences', description: 'SNU Sciences — strong across all areas.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics' },
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics' },
      { name: 'BS Chemistry', degree: 'Bachelor', duration: '4 years', description: 'Chemistry' },
      { name: 'BS Biology', degree: 'Bachelor', duration: '4 years', description: 'Biology' },
      { name: 'MS Science', degree: 'Master', duration: '2 years', description: 'Advanced science' },
      { name: 'PhD Science', degree: 'PhD', duration: '3-4 years', description: 'Research in science' },
    ]},
    { name: 'College of Economics', description: 'SNU Economics — top in South Korea.', courses: [
      { name: 'BS Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics degree' },
      { name: 'MS Economics', degree: 'Master', duration: '2 years', description: 'Advanced economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '3-4 years', description: 'Research in economics' },
    ]},
  ]);

  // KAIST
  await addUniWithDepts('uni-kr-002', 'Korea Advanced Institute of Science and Technology (KAIST)', 'South Korea', 'Daejeon', 'https://www.kaist.ac.kr', [
    { name: 'School of Computing', description: 'KAIST Computing — top CS school in South Korea.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'MS Computer Science', degree: 'Master', duration: '2 years', description: 'Advanced CS' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '3-4 years', description: 'Research in CS' },
    ]},
    { name: 'School of Electrical Engineering', description: 'KAIST EE — top EE school.', courses: [
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'MS Electrical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced EE' },
      { name: 'PhD Electrical Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in EE' },
    ]},
    { name: 'School of Mechanical Engineering', description: 'KAIST ME — known for robotics and manufacturing.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'MS Mechanical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced ME' },
      { name: 'PhD Mechanical Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in ME' },
    ]},
    { name: 'School of Chemical and Biomolecular Engineering', description: 'KAIST ChE — nanotechnology and bioengineering.', courses: [
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'MS Chemical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced ChemE' },
      { name: 'PhD Chemical Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in ChemE' },
    ]},
    { name: 'School of Business and Technology Management', description: 'KAIST Business — technology management.', courses: [
      { name: 'MS Technology and Management', degree: 'Master', duration: '1-2 years', description: 'Tech management' },
      { name: 'PhD Business and Technology Management', degree: 'PhD', duration: '3-4 years', description: 'Research in tech management' },
    ]},
    { name: 'School of Civil and Environmental Engineering', description: 'KAIST CEE — infrastructure and environment.', courses: [
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'MS Civil Engineering', degree: 'Master', duration: '2 years', description: 'Advanced civil' },
      { name: 'PhD Civil Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in civil' },
    ]},
    { name: 'Department of Mathematical Sciences', description: 'KAIST Math — applied and pure math.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics' },
      { name: 'MS Mathematics', degree: 'Master', duration: '2 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '3-4 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'KAIST Physics — quantum and condensed matter.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics' },
      { name: 'MS Physics', degree: 'Master', duration: '2 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '3-4 years', description: 'Research in physics' },
    ]},
  ]);

  // TSINGHUA
  await addUniWithDepts('uni-cn-001', 'Tsinghua University', 'China', 'Beijing', 'https://www.tsinghua.edu.cn', [
    { name: 'Department of Computer Science and Technology', description: 'Tsinghua CS — top in China, one of the best globally.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'MS Computer Science', degree: 'Master', duration: '2-3 years', description: 'Advanced CS' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '3-4 years', description: 'Research in CS' },
    ]},
    { name: 'School of Economics and Management', description: 'Tsinghua SEM — top business school in China.', courses: [
      { name: 'BBA (Bachelor of Business Administration)', degree: 'Bachelor', duration: '4 years', description: 'Business administration' },
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'Master of Finance', degree: 'Master', duration: '2 years', description: 'Finance' },
      { name: 'PhD in Management', degree: 'PhD', duration: '3-4 years', description: 'Research in management' },
    ]},
    { name: 'Law School', description: 'Tsinghua Law — top in China.', courses: [
      { name: 'LLB Law', degree: 'Bachelor', duration: '4 years', description: 'Law degree' },
      { name: 'LLM Law', degree: 'Master', duration: '2-3 years', description: 'Advanced law' },
      { name: 'PhD Law', degree: 'PhD', duration: '3-4 years', description: 'Research in law' },
    ]},
    { name: 'School of Medicine', description: 'Tsinghua Medicine — newer but fast-growing.', courses: [
      { name: 'MD Medicine', degree: 'Bachelor', duration: '8 years', description: 'Medical degree (8-year program)' },
      { name: 'PhD Medical Sciences', degree: 'PhD', duration: '3-4 years', description: 'Research doctorate' },
    ]},
    { name: 'Department of Engineering', description: 'Tsinghua Engineering — one of the top engineering schools globally.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'BS Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ChemE degree' },
      { name: 'MS Engineering', degree: 'Master', duration: '2-3 years', description: 'Advanced engineering' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in engineering' },
    ]},
    { name: 'Department of Mathematical Sciences', description: 'Tsinghua Math — top in China.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics' },
      { name: 'MS Mathematics', degree: 'Master', duration: '2-3 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '3-4 years', description: 'Research in math' },
    ]},
    { name: 'Department of Physics', description: 'Tsinghua Physics — strong in condensed matter.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics' },
      { name: 'MS Physics', degree: 'Master', duration: '2-3 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '3-4 years', description: 'Research in physics' },
    ]},
    { name: 'School of Software Engineering', description: 'Tsinghua Software — dedicated software school.', courses: [
      { name: 'BS Software Engineering', degree: 'Bachelor', duration: '4 years', description: 'Software engineering' },
      { name: 'MS Software Engineering', degree: 'Master', duration: '2-3 years', description: 'Advanced software' },
      { name: 'PhD Software Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in software' },
    ]},
    { name: 'School of Vehicle and Mobility', description: 'Tsinghua Vehicle — automotive engineering.', courses: [
      { name: 'BS Automotive Engineering', degree: 'Bachelor', duration: '4 years', description: 'Automotive engineering' },
      { name: 'MS Automotive Engineering', degree: 'Master', duration: '2-3 years', description: 'Advanced automotive' },
    ]},
  ]);

  // PEKING UNIVERSITY
  await addUniWithDepts('uni-cn-002', 'Peking University', 'China', 'Beijing', 'https://www.pku.edu.cn', [
    { name: 'School of EECS', description: 'Peking EECS — top CS school in China.', courses: [
      { name: 'BS Computer Science', degree: 'Bachelor', duration: '4 years', description: 'CS degree' },
      { name: 'MS Computer Science', degree: 'Master', duration: '2-3 years', description: 'Advanced CS' },
      { name: 'PhD Computer Science', degree: 'PhD', duration: '3-4 years', description: 'Research in CS' },
    ]},
    { name: 'Guanghua School of Management', description: 'Peking Guanghua — top business school in China.', courses: [
      { name: 'BBA', degree: 'Bachelor', duration: '4 years', description: 'Business administration' },
      { name: 'MBA', degree: 'Master', duration: '2 years', description: 'Full-time MBA' },
      { name: 'Master of Finance', degree: 'Master', duration: '2 years', description: 'Finance' },
      { name: 'PhD in Management', degree: 'PhD', duration: '4 years', description: 'Research in management' },
    ]},
    { name: 'Peking University Law School', description: 'PKU Law — top in China.', courses: [
      { name: 'LLB Law', degree: 'Bachelor', duration: '4 years', description: 'Law degree' },
      { name: 'LLM Law', degree: 'Master', duration: '2-3 years', description: 'Advanced law' },
      { name: 'PhD Law', degree: 'PhD', duration: '3-4 years', description: 'Research in law' },
    ]},
    { name: 'Peking University Health Science Center', description: 'PKU Medical — one of the oldest in China.', courses: [
      { name: 'MD Medicine', degree: 'Bachelor', duration: '8 years', description: 'Medical degree (8-year program)' },
      { name: 'PhD Medical Sciences', degree: 'PhD', duration: '3-4 years', description: 'Research doctorate' },
    ]},
    { name: 'College of Engineering', description: 'PKU Engineering — broad engineering.', courses: [
      { name: 'BS Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'ME degree' },
      { name: 'BS Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'EE degree' },
      { name: 'BS Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Civil engineering' },
      { name: 'MS Engineering', degree: 'Master', duration: '2-3 years', description: 'Advanced engineering' },
      { name: 'PhD Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in engineering' },
    ]},
    { name: 'School of Mathematical Sciences', description: 'PKU Math — top in China.', courses: [
      { name: 'BS Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Mathematics' },
      { name: 'MS Mathematics', degree: 'Master', duration: '2-3 years', description: 'Advanced math' },
      { name: 'PhD Mathematics', degree: 'PhD', duration: '3-4 years', description: 'Research in math' },
    ]},
    { name: 'School of Physics', description: 'PKU Physics — strong in particle and condensed matter.', courses: [
      { name: 'BS Physics', degree: 'Bachelor', duration: '4 years', description: 'Physics' },
      { name: 'MS Physics', degree: 'Master', duration: '2-3 years', description: 'Advanced physics' },
      { name: 'PhD Physics', degree: 'PhD', duration: '3-4 years', description: 'Research in physics' },
    ]},
    { name: 'School of Economics', description: 'PKU Economics — top in China.', courses: [
      { name: 'BS Economics', degree: 'Bachelor', duration: '4 years', description: 'Economics' },
      { name: 'MS Economics', degree: 'Master', duration: '2-3 years', description: 'Advanced economics' },
      { name: 'PhD Economics', degree: 'PhD', duration: '3-4 years', description: 'Research in economics' },
    ]},
    { name: 'School of International Studies', description: 'PKU SIS — top international relations school in China.', courses: [
      { name: 'BA International Relations', degree: 'Bachelor', duration: '4 years', description: 'IR degree' },
      { name: 'MA International Relations', degree: 'Master', duration: '2-3 years', description: 'Advanced IR' },
      { name: 'PhD International Relations', degree: 'PhD', duration: '3-4 years', description: 'Research in IR' },
    ]},
  ]);

  console.log('\nDone! Top international universities seeded.');
  const count = await prisma.university.count();
  console.log(`Total universities: ${count}`);
  await prisma.$disconnect();
}

main().catch((e) => { console.error(e); process.exit(1); });
