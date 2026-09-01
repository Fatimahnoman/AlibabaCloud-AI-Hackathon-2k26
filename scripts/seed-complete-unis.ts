import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

async function replaceUniDepts(
  id: string,
  departments: { name: string; description: string; courses: { name: string; degree: string; duration: string; description: string }[] }[],
) {
  await p.department.deleteMany({ where: { universityId: id } });
  await p.course.deleteMany({ where: { universityId: id } });
  for (const dept of departments) {
    await p.department.create({
      data: { universityId: id, name: dept.name, head: '', description: dept.description, totalCourses: dept.courses.length },
    });
    for (const c of dept.courses) {
      await p.course.create({
        data: { universityId: id, name: c.name, degree: c.degree, department: dept.name, duration: c.duration, description: c.description },
      });
    }
  }
  const totalCourses = departments.reduce((a, d) => a + d.courses.length, 0);
  console.log(`✓ ${id} — ${departments.length} depts, ${totalCourses} courses`);
}

async function main() {
  // ============ UTS (University of Technology Sydney) ============
  await replaceUniDepts('uni-au-008', [
    { name: 'School of Computer Science', description: 'UTS computing school covering CS, IT, AI, and data science.', courses: [
      { name: 'Bachelor of Science in Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Core CS with algorithms, software engineering, and AI' },
      { name: 'Bachelor of IT', degree: 'Bachelor', duration: '3 years', description: 'Information technology with industry focus' },
      { name: 'Master of Computer Science', degree: 'Master', duration: '2 years', description: 'Advanced CS including AI, machine learning, and distributed systems' },
      { name: 'Master of Data Science', degree: 'Master', duration: '2 years', description: 'Data analytics, machine learning, and statistical computing' },
      { name: 'Master of Artificial Intelligence', degree: 'Master', duration: '2 years', description: 'Deep learning, NLP, computer vision, and robotics' },
      { name: 'PhD in Computer Science', degree: 'PhD', duration: '3-4 years', description: 'Original research in computing' },
    ]},
    { name: 'School of Electrical and Data Communications', description: 'Electrical, electronic, and communications engineering.', courses: [
      { name: 'Bachelor of Engineering (Electrical)', degree: 'Bachelor', duration: '4 years', description: 'Power systems, electronics, and control systems' },
      { name: 'Bachelor of Engineering (Telecommunications)', degree: 'Bachelor', duration: '4 years', description: 'Networks, signal processing, and wireless communications' },
      { name: 'Master of Engineering (Electrical)', degree: 'Master', duration: '2 years', description: 'Advanced electrical engineering' },
      { name: 'PhD in Electrical Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in electrical and data communications' },
    ]},
    { name: 'School of Civil and Environmental Engineering', description: 'Civil, structural, and environmental engineering.', courses: [
      { name: 'Bachelor of Engineering (Civil)', degree: 'Bachelor', duration: '4 years', description: 'Structural, geotechnical, water, and transport engineering' },
      { name: 'Bachelor of Engineering (Environmental)', degree: 'Bachelor', duration: '4 years', description: 'Environmental impact, water treatment, sustainability' },
      { name: 'Master of Engineering (Civil)', degree: 'Master', duration: '2 years', description: 'Advanced structural and civil engineering' },
      { name: 'PhD in Civil Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in civil and environmental engineering' },
    ]},
    { name: 'School of Mechanical and Mechatronic Engineering', description: 'Mechanical, mechatronic, and aerospace systems.', courses: [
      { name: 'Bachelor of Engineering (Mechanical)', degree: 'Bachelor', duration: '4 years', description: 'Thermodynamics, fluid mechanics, manufacturing' },
      { name: 'Bachelor of Engineering (Mechatronic)', degree: 'Bachelor', duration: '4 years', description: 'Robotics, automation, control systems' },
      { name: 'Master of Engineering (Mechanical)', degree: 'Master', duration: '2 years', description: 'Advanced mechanical systems' },
      { name: 'PhD in Mechanical Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in mechanical and mechatronic systems' },
    ]},
    { name: 'UTS Business School', description: 'One of Australia\'s top business schools, AACSB accredited.', courses: [
      { name: 'Bachelor of Business', degree: 'Bachelor', duration: '3 years', description: 'Management, marketing, finance, and analytics' },
      { name: 'Bachelor of Business (Finance)', degree: 'Bachelor', duration: '3 years', description: 'Corporate finance, investment, and risk management' },
      { name: 'MBA (Master of Business Administration)', degree: 'Master', duration: '2 years', description: 'Executive MBA with industry projects' },
      { name: 'Master of Management', degree: 'Master', duration: '1.5 years', description: 'Strategic management for graduates' },
      { name: 'Master of Finance', degree: 'Master', duration: '1.5 years', description: 'Advanced finance and fintech' },
      { name: 'PhD in Business', degree: 'PhD', duration: '3-4 years', description: 'Research in business and management' },
    ]},
    { name: 'School of Accounting', description: 'Accounting, auditing, and taxation.', courses: [
      { name: 'Bachelor of Accounting', degree: 'Bachelor', duration: '3 years', description: 'Financial accounting, auditing, taxation' },
      { name: 'Master of Professional Accounting', degree: 'Master', duration: '2 years', description: 'CPA/CA preparation, advanced accounting' },
    ]},
    { name: 'School of Design, Architecture and Building', description: 'Creative design, architecture, and construction management.', courses: [
      { name: 'Bachelor of Design', degree: 'Bachelor', duration: '3 years', description: 'Visual communication, product design, interaction design' },
      { name: 'Bachelor of Architecture', degree: 'Bachelor', duration: '3 years', description: 'Architectural design, theory, and technology' },
      { name: 'Master of Architecture', degree: 'Master', duration: '2 years', description: 'Professional architecture qualification' },
      { name: 'Master of Construction Management', degree: 'Master', duration: '2 years', description: 'Project management for construction' },
    ]},
    { name: 'Faculty of Science', description: 'Physics, chemistry, mathematics, and biological sciences.', courses: [
      { name: 'Bachelor of Science', degree: 'Bachelor', duration: '3 years', description: 'Major in physics, chemistry, math, or biology' },
      { name: 'Bachelor of Science (Mathematics)', degree: 'Bachelor', duration: '3 years', description: 'Pure and applied mathematics' },
      { name: 'Master of Science', degree: 'Master', duration: '2 years', description: 'Research coursework in science' },
      { name: 'PhD in Science', degree: 'PhD', duration: '3-4 years', description: 'Original research across science disciplines' },
    ]},
    { name: 'Faculty of Health', description: 'Nursing, midwifery, paramedicine, and public health.', courses: [
      { name: 'Bachelor of Nursing', degree: 'Bachelor', duration: '3 years', description: 'Registered nurse qualification' },
      { name: 'Bachelor of Midwifery', degree: 'Bachelor', duration: '3 years', description: 'Midwifery practice' },
      { name: 'Bachelor of Paramedicine', degree: 'Bachelor', duration: '3 years', description: 'Paramedic science and emergency care' },
      { name: 'Master of Public Health', degree: 'Master', duration: '2 years', description: 'Population health and epidemiology' },
      { name: 'PhD in Health', degree: 'PhD', duration: '3-4 years', description: 'Health research' },
    ]},
    { name: 'Faculty of Arts and Social Sciences', description: 'Communication, international studies, criminology, and education.', courses: [
      { name: 'Bachelor of Communication', degree: 'Bachelor', duration: '3 years', description: 'Journalism, digital media, public relations' },
      { name: 'Bachelor of International Studies', degree: 'Bachelor', duration: '3 years', description: 'Global politics, diplomacy, languages' },
      { name: 'Bachelor of Criminology', degree: 'Bachelor', duration: '3 years', description: 'Criminal justice and criminological theory' },
      { name: 'Bachelor of Education', degree: 'Bachelor', duration: '4 years', description: 'Teaching qualification' },
      { name: 'Master of Education', degree: 'Master', duration: '2 years', description: 'Advanced education studies' },
    ]},
    { name: 'Faculty of Law', description: 'UTS Law — one of the top law schools in Australia.', courses: [
      { name: 'Bachelor of Laws (LLB)', degree: 'Bachelor', duration: '4 years', description: 'Professional law degree' },
      { name: 'Juris Doctor (JD)', degree: 'Master', duration: '3 years', description: 'Graduate-entry law degree' },
      { name: 'Master of Laws (LLM)', degree: 'Master', duration: '1-2 years', description: 'Advanced legal studies' },
      { name: 'PhD in Law', degree: 'PhD', duration: '3-4 years', description: 'Legal research' },
    ]},
    { name: 'School of Mathematical and Physical Sciences', description: 'Advanced mathematics, physics, and quantum computing.', courses: [
      { name: 'Bachelor of Science (Physics)', degree: 'Bachelor', duration: '3 years', description: 'Quantum physics, optics, condensed matter' },
      { name: 'Master of Quantum Computing', degree: 'Master', duration: '2 years', description: 'Quantum algorithms and quantum information' },
      { name: 'PhD in Physics', degree: 'PhD', duration: '3-4 years', description: 'Physics research' },
    ]},
  ]);

  // ============ IIT Bombay ============
  await replaceUniDepts('uni-in-001', [
    { name: 'Department of Computer Science and Engineering', description: 'India\'s top CS department. JEE Advanced required.', courses: [
      { name: 'B.Tech Computer Science and Engineering', degree: 'Bachelor', duration: '4 years', description: 'Premier CS program with top placements' },
      { name: 'B.Tech Computer Science and Engineering (Minor in AI)', degree: 'Bachelor', duration: '4 years', description: 'CS with AI/ML specialization' },
      { name: 'M.Tech Computer Science and Engineering', degree: 'Master', duration: '2 years', description: 'Advanced CS research and systems' },
      { name: 'PhD in Computer Science and Engineering', degree: 'PhD', duration: '4-5 years', description: 'CS research' },
    ]},
    { name: 'Department of Electrical Engineering', description: 'One of the oldest and finest EE departments in India.', courses: [
      { name: 'B.Tech Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Power systems, electronics, signal processing' },
      { name: 'B.Tech Electrical Engineering with Minor in CSE', degree: 'Bachelor', duration: '4 years', description: 'EE with CS minor' },
      { name: 'M.Tech Electrical Engineering', degree: 'Master', duration: '2 years', description: 'Specializations in communications, power, electronics' },
      { name: 'PhD in Electrical Engineering', degree: 'PhD', duration: '4-5 years', description: 'EE research' },
    ]},
    { name: 'Department of Mechanical Engineering', description: 'Core mechanical engineering with cutting-edge research.', courses: [
      { name: 'B.Tech Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Thermodynamics, manufacturing, design' },
      { name: 'M.Tech Mechanical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced mechanical systems' },
      { name: 'PhD in Mechanical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Mechanical research' },
    ]},
    { name: 'Department of Civil Engineering', description: 'Structural, environmental, transportation engineering.', courses: [
      { name: 'B.Tech Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Structural, geotechnical, water resources' },
      { name: 'M.Tech Civil Engineering', degree: 'Master', duration: '2 years', description: 'Advanced civil engineering' },
      { name: 'PhD in Civil Engineering', degree: 'PhD', duration: '4-5 years', description: 'Civil engineering research' },
    ]},
    { name: 'Department of Chemical Engineering', description: 'Top-ranked chemical engineering in India.', courses: [
      { name: 'B.Tech Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Process engineering, reaction engineering' },
      { name: 'M.Tech Chemical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced chemical engineering' },
      { name: 'PhD in Chemical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Chemical engineering research' },
    ]},
    { name: 'Department of Aerospace Engineering', description: 'Aeronautics, astronautics, and fluid mechanics.', courses: [
      { name: 'B.Tech Aerospace Engineering', degree: 'Bachelor', duration: '4 years', description: 'Aerodynamics, propulsion, structures' },
      { name: 'M.Tech Aerospace Engineering', degree: 'Master', duration: '2 years', description: 'Advanced aerospace systems' },
      { name: 'PhD in Aerospace Engineering', degree: 'PhD', duration: '4-5 years', description: 'Aerospace research' },
    ]},
    { name: 'Department of Mathematics', description: 'Pure and applied mathematics.', courses: [
      { name: 'B.Sc Mathematics', degree: 'Bachelor', duration: '4 years', description: 'BS in Mathematics (5-year integrated)' },
      { name: 'M.Sc Mathematics', degree: 'Master', duration: '2 years', description: 'Advanced mathematics' },
      { name: 'PhD in Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Mathematics research' },
    ]},
    { name: 'Department of Physics', description: 'Theoretical and experimental physics.', courses: [
      { name: 'B.Sc Physics', degree: 'Bachelor', duration: '4 years', description: 'BS in Physics (5-year integrated)' },
      { name: 'M.Sc Physics', degree: 'Master', duration: '2 years', description: 'Advanced physics' },
      { name: 'PhD in Physics', degree: 'PhD', duration: '4-5 years', description: 'Physics research' },
    ]},
    { name: 'Department of Chemistry', description: 'Organic, inorganic, physical, and materials chemistry.', courses: [
      { name: 'B.Sc Chemistry', degree: 'Bachelor', duration: '4 years', description: 'BS in Chemistry (5-year integrated)' },
      { name: 'M.Sc Chemistry', degree: 'Master', duration: '2 years', description: 'Advanced chemistry' },
      { name: 'PhD in Chemistry', degree: 'PhD', duration: '4-5 years', description: 'Chemistry research' },
    ]},
    { name: 'Department of Biosciences and Bioengineering', description: 'Biotechnology, bioengineering, and life sciences.', courses: [
      { name: 'B.Tech Biosciences and Bioengineering', degree: 'Bachelor', duration: '4 years', description: 'Biotechnology and bioengineering' },
      { name: 'M.Tech Biosciences and Bioengineering', degree: 'Master', duration: '2 years', description: 'Advanced biotechnology' },
      { name: 'PhD in Biosciences and Bioengineering', degree: 'PhD', duration: '4-5 years', description: 'Bio-research' },
    ]},
    { name: 'Department of Metallurgical Engineering and Materials Science', description: 'Materials science and metallurgy.', courses: [
      { name: 'B.Tech Metallurgical Engineering and Materials Science', degree: 'Bachelor', duration: '4 years', description: 'Materials characterization, extraction metallurgy' },
      { name: 'M.Tech Metallurgical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced materials' },
      { name: 'PhD in Metallurgical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Materials research' },
    ]},
    { name: 'Department of Humanities and Social Sciences', description: 'Economics, sociology, philosophy, and English.', courses: [
      { name: 'B.A. (Honours) in Liberal Arts', degree: 'Bachelor', duration: '4 years', description: 'Interdisciplinary humanities and social sciences' },
      { name: 'M.A. in Development Studies', degree: 'Master', duration: '2 years', description: 'Development economics and policy' },
      { name: 'PhD in Humanities and Social Sciences', degree: 'PhD', duration: '4-5 years', description: 'HSS research' },
    ]},
    { name: 'Shailesh J. Mehta School of Management', description: 'IIT Bombay\'s premier business school.', courses: [
      { name: 'MBA (Master of Business Administration)', degree: 'Master', duration: '2 years', description: 'Top-tier MBA via CAT exam' },
      { name: 'PhD in Management', degree: 'PhD', duration: '4-5 years', description: 'Management research' },
    ]},
    { name: 'Department of Energy Science and Engineering', description: 'Energy systems, renewable energy, petroleum engineering.', courses: [
      { name: 'B.Tech Energy Science and Engineering', degree: 'Bachelor', duration: '4 years', description: 'Energy systems and renewable energy' },
      { name: 'M.Tech Energy Science and Engineering', degree: 'Master', duration: '2 years', description: 'Advanced energy systems' },
      { name: 'PhD in Energy Science and Engineering', degree: 'PhD', duration: '4-5 years', description: 'Energy research' },
    ]},
    { name: 'Department of Earth Sciences', description: 'Geology, geophysics, and environmental science.', courses: [
      { name: 'B.Sc Applied Geology', degree: 'Bachelor', duration: '4 years', description: 'Geology and geophysics' },
      { name: 'M.Sc Earth Sciences', degree: 'Master', duration: '2 years', description: 'Advanced earth sciences' },
      { name: 'PhD in Earth Sciences', degree: 'PhD', duration: '4-5 years', description: 'Earth sciences research' },
    ]},
    { name: 'Institute for Plasma Research (associated)', description: 'Plasma physics and fusion research.', courses: [
      { name: 'M.Sc Plasma Physics', degree: 'Master', duration: '2 years', description: 'Plasma physics and fusion technology' },
      { name: 'PhD in Plasma Physics', degree: 'PhD', duration: '4-5 years', description: 'Plasma research' },
    ]},
  ]);

  // ============ IIT Delhi ============
  await replaceUniDepts('uni-in-002', [
    { name: 'Department of Computer Science and Engineering', description: 'Top CS department in India. JEE Advanced required.', courses: [
      { name: 'B.Tech Computer Science and Engineering', degree: 'Bachelor', duration: '4 years', description: 'Core CS with strong theory and systems' },
      { name: 'B.Tech CSE with Minor in AI/ML', degree: 'Bachelor', duration: '4 years', description: 'CS with AI specialization' },
      { name: 'M.Tech Computer Science and Engineering', degree: 'Master', duration: '2 years', description: 'Advanced CS' },
      { name: 'PhD in Computer Science and Engineering', degree: 'PhD', duration: '4-5 years', description: 'CS research' },
    ]},
    { name: 'Department of Electrical Engineering', description: 'Power, electronics, communications, and signal processing.', courses: [
      { name: 'B.Tech Electrical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Electrical systems and electronics' },
      { name: 'M.Tech Electrical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced EE' },
      { name: 'PhD in Electrical Engineering', degree: 'PhD', duration: '4-5 years', description: 'EE research' },
    ]},
    { name: 'Department of Mechanical Engineering', description: 'Thermal, design, manufacturing, and robotics.', courses: [
      { name: 'B.Tech Mechanical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Core mechanical engineering' },
      { name: 'M.Tech Mechanical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced mechanical systems' },
      { name: 'PhD in Mechanical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Mechanical research' },
    ]},
    { name: 'Department of Civil Engineering', description: 'Structural, environmental, transportation, and water resources.', courses: [
      { name: 'B.Tech Civil Engineering', degree: 'Bachelor', duration: '4 years', description: 'Core civil engineering' },
      { name: 'M.Tech Civil Engineering', degree: 'Master', duration: '2 years', description: 'Advanced civil engineering' },
      { name: 'PhD in Civil Engineering', degree: 'PhD', duration: '4-5 years', description: 'Civil research' },
    ]},
    { name: 'Department of Chemical Engineering', description: 'Process engineering, polymer science, and bioprocessing.', courses: [
      { name: 'B.Tech Chemical Engineering', degree: 'Bachelor', duration: '4 years', description: 'Chemical process engineering' },
      { name: 'M.Tech Chemical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced chemical engineering' },
      { name: 'PhD in Chemical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Chemical research' },
    ]},
    { name: 'Department of Textile and Fibre Engineering', description: 'Textile technology and fibre science — unique to IIT Delhi.', courses: [
      { name: 'B.Tech Textile and Fibre Engineering', degree: 'Bachelor', duration: '4 years', description: 'Textile manufacturing and fibre science' },
      { name: 'M.Tech Textile Technology', degree: 'Master', duration: '2 years', description: 'Advanced textile engineering' },
      { name: 'PhD in Textile and Fibre Engineering', degree: 'PhD', duration: '4-5 years', description: 'Textile research' },
    ]},
    { name: 'Department of Physics', description: 'Condensed matter, optics, quantum information.', courses: [
      { name: 'B.Sc Physics', degree: 'Bachelor', duration: '4 years', description: 'BS in Physics (5-year integrated)' },
      { name: 'M.Sc Physics', degree: 'Master', duration: '2 years', description: 'Advanced physics' },
      { name: 'PhD in Physics', degree: 'PhD', duration: '4-5 years', description: 'Physics research' },
    ]},
    { name: 'Department of Chemistry', description: 'Organic, inorganic, physical, and analytical chemistry.', courses: [
      { name: 'B.Sc Chemistry', degree: 'Bachelor', duration: '4 years', description: 'BS in Chemistry (5-year integrated)' },
      { name: 'M.Sc Chemistry', degree: 'Master', duration: '2 years', description: 'Advanced chemistry' },
      { name: 'PhD in Chemistry', degree: 'PhD', duration: '4-5 years', description: 'Chemistry research' },
    ]},
    { name: 'Department of Mathematics', description: 'Pure and applied mathematics.', courses: [
      { name: 'B.Sc Mathematics', degree: 'Bachelor', duration: '4 years', description: 'BS in Mathematics (5-year integrated)' },
      { name: 'M.Sc Mathematics', degree: 'Master', duration: '2 years', description: 'Advanced mathematics' },
      { name: 'PhD in Mathematics', degree: 'PhD', duration: '4-5 years', description: 'Mathematics research' },
    ]},
    { name: 'Department of Biochemical Engineering and Biotechnology', description: 'Bioprocess engineering and biotechnology.', courses: [
      { name: 'B.Tech Biochemical Engineering and Biotechnology', degree: 'Bachelor', duration: '4 years', description: 'Bioprocess and biotechnology' },
      { name: 'M.Tech Biochemical Engineering', degree: 'Master', duration: '2 years', description: 'Advanced bioprocessing' },
      { name: 'PhD in Biochemical Engineering', degree: 'PhD', duration: '4-5 years', description: 'Bio-engineering research' },
    ]},
    { name: 'Department of Management Studies', description: 'IIT Delhi\'s business school.', courses: [
      { name: 'MBA (Master of Business Administration)', degree: 'Master', duration: '2 years', description: 'MBA via CAT exam' },
      { name: 'PhD in Management Studies', degree: 'PhD', duration: '4-5 years', description: 'Management research' },
    ]},
    { name: 'Department of Design', description: 'Product design, visual communication, and UX.', courses: [
      { name: 'B.Des (Bachelor of Design)', degree: 'Bachelor', duration: '4 years', description: 'Product and interaction design' },
      { name: 'M.Des (Master of Design)', degree: 'Master', duration: '2 years', description: 'Advanced design' },
      { name: 'PhD in Design', degree: 'PhD', duration: '4-5 years', description: 'Design research' },
    ]},
    { name: 'Department of Humanities and Social Sciences', description: 'Economics, sociology, political science.', courses: [
      { name: 'B.A. (Honours) in Social Sciences', degree: 'Bachelor', duration: '4 years', description: 'Interdisciplinary social sciences' },
      { name: 'M.A. in Economics', degree: 'Master', duration: '2 years', description: 'Applied economics' },
      { name: 'PhD in Humanities and Social Sciences', degree: 'PhD', duration: '4-5 years', description: 'HSS research' },
    ]},
    { name: 'Bharti School of Telecommunication Technology and Management', description: 'Telecom and information technology.', courses: [
      { name: 'B.Tech (EE) with Minor in Communication', degree: 'Bachelor', duration: '4 years', description: 'EE with telecom specialization' },
      { name: 'M.Tech Telecommunication Technology', degree: 'Master', duration: '2 years', description: 'Advanced telecom systems' },
      { name: 'PhD in Telecommunication', degree: 'PhD', duration: '4-5 years', description: 'Telecom research' },
    ]},
  ]);

  // ============ SMU (Singapore Management University) ============
  await replaceUniDepts('uni-sg-003', [
    { name: 'School of Computing and Information Systems', description: 'SMU\'s computing school covering CS, IS, and AI.', courses: [
      { name: 'BSc in Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Core CS with software engineering and AI' },
      { name: 'BSc in Information Systems', degree: 'Bachelor', duration: '4 years', description: 'Business-oriented IT and systems' },
      { name: 'BSc in Computing and Law', degree: 'Bachelor', duration: '4 years', description: 'Interdisciplinary computing and legal studies' },
      { name: 'MSc in Computer Science', degree: 'Master', duration: '1-2 years', description: 'Advanced computing' },
      { name: 'MSc in AI and Digital Transformation', degree: 'Master', duration: '1 year', description: 'AI for business applications' },
    ]},
    { name: 'Lee Kong Chian School of Business', description: 'SMU\'s flagship business school, AACSB accredited.', courses: [
      { name: 'BBA (Bachelor of Business Administration)', degree: 'Bachelor', duration: '4 years', description: 'Finance, marketing, strategy, operations' },
      { name: 'BBA (Honours) in Finance', degree: 'Bachelor', duration: '4 years', description: 'Advanced finance and banking' },
      { name: 'BBA in Accounting', degree: 'Bachelor', duration: '4 years', description: 'Accountancy and audit' },
      { name: 'MBA (Master of Business Administration)', degree: 'Master', duration: '1.5 years', description: 'Executive MBA' },
      { name: 'MSc in Finance', degree: 'Master', duration: '1 year', description: 'Quantitative finance' },
      { name: 'MSc in Management', degree: 'Master', duration: '1 year', description: 'Pre-experience management' },
    ]},
    { name: 'School of Economics', description: 'Applied economics, behavioural economics, and data analytics.', courses: [
      { name: 'BSc in Economics', degree: 'Bachelor', duration: '4 years', description: 'Micro, macro, econometrics' },
      { name: 'BSc in Applied Finance', degree: 'Bachelor', duration: '4 years', description: 'Financial economics and risk' },
      { name: 'MSc in Applied Economics', degree: 'Master', duration: '1 year', description: 'Applied economic analysis' },
      { name: 'MSc in Quantitative Finance', degree: 'Master', duration: '1 year', description: 'Mathematical finance' },
    ]},
    { name: 'School of Accountancy', description: 'Accounting and financial reporting.', courses: [
      { name: 'BSc in Accountancy', degree: 'Bachelor', duration: '4 years', description: 'Professional accounting qualification' },
      { name: 'BSc in Accountancy (Honours)', degree: 'Bachelor', duration: '4 years', description: 'Advanced accountancy with research' },
      { name: 'MSc in Accounting', degree: 'Master', duration: '1 year', description: 'Graduate accounting' },
    ]},
    { name: 'School of Social Sciences', description: 'Psychology, sociology, political science, and public policy.', courses: [
      { name: 'BSocSc in Psychology', degree: 'Bachelor', duration: '4 years', description: 'Clinical, cognitive, and social psychology' },
      { name: 'BSocSc in Political Science', degree: 'Bachelor', duration: '4 years', description: 'Comparative politics and international relations' },
      { name: 'BSocSc in Public Policy and Global Affairs', degree: 'Bachelor', duration: '4 years', description: 'Policy analysis and global governance' },
    ]},
    { name: 'School of Law', description: 'SMU\'s law school with a focus on Asian and international law.', courses: [
      { name: 'LLB (Bachelor of Laws)', degree: 'Bachelor', duration: '4 years', description: 'Professional law degree' },
      { name: 'JD (Juris Doctor)', degree: 'Master', duration: '3 years', description: 'Graduate-entry law' },
      { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Advanced legal studies' },
    ]},
    { name: 'School of Information Systems (Graduate)', description: 'Advanced computing and digital transformation.', courses: [
      { name: 'MSc in IT in Business', degree: 'Master', duration: '1 year', description: 'Technology for business innovation' },
      { name: 'MSc in Smart City Technology', degree: 'Master', duration: '1 year', description: 'IoT, urban analytics, smart infrastructure' },
      { name: 'PhD in Computing', degree: 'PhD', duration: '3-4 years', description: 'Computing research' },
    ]},
  ]);

  console.log('\n=== COMPLETE ===');
  console.log('UTS, IIT Bombay, IIT Delhi, SMU — all departments and courses added.');

  await p.$disconnect();
}

main().catch(console.error);
