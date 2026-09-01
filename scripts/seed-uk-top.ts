import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addUniversity(
  id: string,
  name: string,
  country: string,
  city: string,
  website: string,
  departments: { name: string; head?: string; description: string; courses: { name: string; degree: string; duration: string; description: string }[] }[],
) {
  // Create/update university
  await prisma.university.upsert({
    where: { id },
    update: { name, country, city, website },
    create: { id, name, country, city, website, type: 'university', sector: 'private' },
  });

  // Delete old generic departments
  await prisma.department.deleteMany({ where: { universityId: id } });

  // Create real departments with courses
  for (const dept of departments) {
    await prisma.department.create({
      data: {
        universityId: id,
        name: dept.name,
        head: dept.head || '',
        description: dept.description,
        totalCourses: dept.courses.length,
      },
    });

    // Add courses
    for (const course of dept.courses) {
      await prisma.course.create({
        data: {
          universityId: id,
          name: course.name,
          degree: course.degree,
          department: dept.name,
          duration: course.duration,
          description: course.description,
        },
      });
    }
  }

  console.log(`✓ ${name} — ${departments.length} departments, ${departments.reduce((a, d) => a + d.courses.length, 0)} courses`);
}

async function main() {
  // ============================================================
  // 1. UNIVERSITY OF OXFORD
  // ============================================================
  await addUniversity('uni-uk-001', 'University of Oxford', 'United Kingdom', 'Oxford', 'https://www.ox.ac.uk', [
    {
      name: 'Department of Computer Science',
      description: 'One of the top CS departments in the world, known for algorithms, AI, and computational theory.',
      courses: [
        { name: 'MSc Computer Science', degree: 'Master', duration: '1 year', description: 'Advanced CS covering algorithms, cryptography, and machine learning' },
        { name: 'MSc Advanced Computer Science', degree: 'Master', duration: '1 year', description: 'Specialized study in AI, software engineering, and computational linguistics' },
        { name: 'DPhil Computer Science', degree: 'PhD', duration: '3-4 years', description: 'Original research in any area of computer science' },
        { name: 'BA Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Foundational degree covering programming, algorithms, and systems' },
      ],
    },
    {
      name: 'Department of Engineering Science',
      description: 'Oxford\'s engineering department covers civil, electrical, mechanical, and biomedical engineering.',
      courses: [
        { name: 'MEng Engineering Science', degree: 'Master', duration: '4 years', description: 'Integrated masters covering all engineering disciplines' },
        { name: 'DPhil Engineering Science', degree: 'PhD', duration: '3-4 years', description: 'Research in advanced engineering problems' },
        { name: 'MSc Biomedical Engineering', degree: 'Master', duration: '1 year', description: 'Engineering applications in medicine and biology' },
      ],
    },
    {
      name: 'Said Business School',
      description: 'Oxford\'s prestigious business school offering MBA, executive education, and finance programs.',
      courses: [
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'World-renowned one-year MBA program' },
        { name: 'MSc Financial Economics', degree: 'Master', duration: '1 year', description: 'Advanced study of financial markets and economic theory' },
        { name: 'MSc Major Programme Management', degree: 'Master', duration: '2 years', description: 'Part-time program for senior professionals' },
        { name: 'DPhil Management Studies', degree: 'PhD', duration: '3-4 years', description: 'Research in business and management' },
      ],
    },
    {
      name: 'Department of Mathematics',
      description: 'One of the largest and most prestigious math departments globally.',
      courses: [
        { name: 'MMath Mathematics', degree: 'Master', duration: '4 years', description: 'Integrated masters in pure and applied mathematics' },
        { name: 'MSc Mathematical Sciences', degree: 'Master', duration: '1 year', description: 'Advanced study across pure and applied math' },
        { name: 'DPhil Mathematics', degree: 'PhD', duration: '3-4 years', description: 'Research in pure or applied mathematics' },
      ],
    },
    {
      name: 'Department of Physics',
      description: 'Home to multiple Nobel laureates, Oxford Physics is world-leading in research.',
      courses: [
        { name: 'MPhysics Physics', degree: 'Master', duration: '4 years', description: 'Integrated masters with cutting-edge lab work' },
        { name: 'MSc Theoretical Physics', degree: 'Master', duration: '1 year', description: 'Advanced theoretical and mathematical physics' },
        { name: 'DPhil Physics', degree: 'PhD', duration: '3-4 years', description: 'Research in experimental or theoretical physics' },
      ],
    },
    {
      name: 'Department of Law',
      description: 'Oxford Law is consistently ranked among the top law schools worldwide.',
      courses: [
        { name: 'BA Jurisprudence', degree: 'Bachelor', duration: '3 years', description: 'The foundational Oxford law degree' },
        { name: 'BCL (Bachelor of Civil Law)', degree: 'Master', duration: '1 year', description: 'Postgraduate law degree for law graduates' },
        { name: 'Magister Juris (MJur)', degree: 'Master', duration: '1 year', description: 'Comparative law for non-common law graduates' },
        { name: 'DPhil Law', degree: 'PhD', duration: '3-4 years', description: 'Research in legal theory and practice' },
      ],
    },
    {
      name: 'Department of Medicine',
      description: 'Oxford Medical School is one of the oldest and most respected in the world.',
      courses: [
        { name: 'Medicine (A100)', degree: 'Bachelor', duration: '6 years', description: 'Clinical medicine degree with early patient contact' },
        { name: 'Graduate Medicine (A101)', degree: 'Bachelor', duration: '4 years', description: 'Accelerated medicine for graduate students' },
        { name: 'MSc Medical Sciences', degree: 'Master', duration: '1 year', description: 'Research-oriented medical sciences program' },
        { name: 'DPhil Clinical Neuroscience', degree: 'PhD', duration: '3-4 years', description: 'Research in brain sciences and clinical neurology' },
      ],
    },
    {
      name: 'Department of English',
      description: 'Oxford English is the oldest and one of the most prestigious English departments.',
      courses: [
        { name: 'BA English Language and Literature', degree: 'Bachelor', duration: '3 years', description: 'Study of literature from Old English to the present' },
        { name: 'MSt English (1900-Present)', degree: 'Master', duration: '1 year', description: 'Specialized study of modern and contemporary literature' },
        { name: 'DPhil English', degree: 'PhD', duration: '3-4 years', description: 'Research in any period or genre of English literature' },
      ],
    },
    {
      name: 'Department of Economics',
      description: 'One of the top economics departments in Europe, known for theoretical and empirical research.',
      courses: [
        { name: 'BA Economics and Management', degree: 'Bachelor', duration: '3 years', description: 'Combined economics and management degree' },
        { name: 'MPhil Economics', degree: 'Master', duration: '2 years', description: 'Advanced economic theory and econometrics' },
        { name: 'DPhil Economics', degree: 'PhD', duration: '3-4 years', description: 'Research in theoretical or applied economics' },
      ],
    },
    {
      name: 'Department of Political Science & International Relations',
      description: 'World-leading department for politics, philosophy, and international relations.',
      courses: [
        { name: 'PPE (Philosophy, Politics & Economics)', degree: 'Bachelor', duration: '3 years', description: 'Oxford\'s iconic interdisciplinary degree' },
        { name: 'MPhil Political Science', degree: 'Master', duration: '2 years', description: 'Research-focused political science program' },
        { name: 'MSc International Relations', degree: 'Master', duration: '1 year', description: 'Theory and practice of international politics' },
      ],
    },
    {
      name: 'Department of Chemistry',
      description: 'Oxford Chemistry is consistently ranked among the top 3 globally.',
      courses: [
        { name: 'MChem Chemistry', degree: 'Master', duration: '4 years', description: 'Integrated masters with advanced research project' },
        { name: 'MSc Chemistry', degree: 'Master', duration: '1 year', description: 'Taught postgraduate chemistry program' },
        { name: 'DPhil Chemistry', degree: 'PhD', duration: '3-4 years', description: 'Research in any area of chemistry' },
      ],
    },
    {
      name: 'Department of Biological Sciences',
      description: 'Broad department covering molecular biology, ecology, and evolution.',
      courses: [
        { name: 'MBiol Biological Sciences', degree: 'Master', duration: '4 years', description: 'Integrated masters in biological sciences' },
        { name: 'MSc Biodiversity, Conservation & Management', degree: 'Master', duration: '1 year', description: 'Conservation biology and natural resource management' },
        { name: 'DPhil Zoology', degree: 'PhD', duration: '3-4 years', description: 'Research in animal biology and evolution' },
      ],
    },
    {
      name: 'Department of Architecture',
      description: 'Oxford\'s architecture school combines design with historical and theoretical study.',
      courses: [
        { name: 'BA History of Art and Architecture', degree: 'Bachelor', duration: '3 years', description: 'Study of architecture and art from antiquity to present' },
        { name: 'MSt History of Art and Visual Culture', degree: 'Master', duration: '1 year', description: 'Advanced study of art history and visual culture' },
      ],
    },
  ]);

  // ============================================================
  // 2. UNIVERSITY OF CAMBRIDGE
  // ============================================================
  await addUniversity('uni-uk-002', 'University of Cambridge', 'United Kingdom', 'Cambridge', 'https://www.cam.ac.uk', [
    {
      name: 'Computer Laboratory',
      description: 'Cambridge\'s CS department — birthplace of the ARM processor and many computing innovations.',
      courses: [
        { name: 'BA Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive CS degree covering hardware to theory' },
        { name: 'MEng Computer Science', degree: 'Master', duration: '4 years', description: 'Integrated masters with advanced systems and AI' },
        { name: 'MPhil Computer Science', degree: 'Master', duration: '1 year', description: 'Research-oriented postgraduate CS program' },
        { name: 'PhD Computer Science', degree: 'PhD', duration: '3-4 years', description: 'Original research in any area of CS' },
      ],
    },
    {
      name: 'Department of Engineering',
      description: 'Cambridge Engineering is the largest department in the university, covering all engineering disciplines.',
      courses: [
        { name: 'BA Engineering', degree: 'Bachelor', duration: '3 years', description: 'Broad engineering foundation across all disciplines' },
        { name: 'MEng Engineering', degree: 'Master', duration: '4 years', description: 'Integrated masters with specialization options' },
        { name: 'MPhil Advanced Chemical Engineering', degree: 'Master', duration: '1 year', description: 'Advanced study in chemical engineering' },
        { name: 'PhD Engineering', degree: 'PhD', duration: '3-4 years', description: 'Research in any engineering discipline' },
      ],
    },
    {
      name: 'Judge Business School',
      description: 'Cambridge\'s world-ranked business school known for entrepreneurship and innovation.',
      courses: [
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Intensive one-year MBA with global perspective' },
        { name: 'Masters in Management (MiM)', degree: 'Master', duration: '1 year', description: 'Management program for recent graduates' },
        { name: 'MPhil Finance', degree: 'Master', duration: '1 year', description: 'Advanced finance theory and practice' },
        { name: 'MBA (Executive)', degree: 'Master', duration: '2 years', description: 'Part-time MBA for senior professionals' },
      ],
    },
    {
      name: 'Department of Mathematics',
      description: 'Cambridge Mathematics — where Newton, Hawking, and thousands of breakthroughs originated.',
      courses: [
        { name: 'BA Mathematics (Tripos)', degree: 'Bachelor', duration: '3 years', description: 'The legendary Cambridge math Tripos' },
        { name: 'MMath Mathematics', degree: 'Master', duration: '4 years', description: 'Extended mathematics degree with advanced topics' },
        { name: 'MPhil Mathematical Sciences', degree: 'Master', duration: '1 year', description: 'Taught postgraduate math program' },
        { name: 'PhD Mathematics', degree: 'PhD', duration: '3-4 years', description: 'Research in pure or applied mathematics' },
      ],
    },
    {
      name: 'Department of Physics',
      description: 'Cambridge Physics — home to Cavendish Laboratory and 30+ Nobel Prizes.',
      courses: [
        { name: 'BA Natural Sciences (Physics)', degree: 'Bachelor', duration: '3 years', description: 'Physics through the Natural Sciences Tripos' },
        { name: 'MSci Physics', degree: 'Master', duration: '4 years', description: 'Extended physics degree with research project' },
        { name: 'MPhil Physics', degree: 'Master', duration: '1 year', description: 'Advanced study in theoretical or experimental physics' },
        { name: 'PhD Physics', degree: 'PhD', duration: '3-4 years', description: 'Research at world-leading physics labs' },
      ],
    },
    {
      name: 'Faculty of Law',
      description: 'Cambridge Law is one of the oldest and most distinguished law faculties in the world.',
      courses: [
        { name: 'BA Law (Tripos)', degree: 'Bachelor', duration: '3 years', description: 'The Cambridge law degree' },
        { name: 'LLM (Master of Laws)', degree: 'Master', duration: '1 year', description: 'Postgraduate law specialization' },
        { name: 'PhD Law', degree: 'PhD', duration: '3-4 years', description: 'Research in legal scholarship' },
      ],
    },
    {
      name: 'School of Clinical Medicine',
      description: 'One of the largest clinical medical schools in the UK, attached to Addenbrooke\'s Hospital.',
      courses: [
        { name: 'Medicine (A100)', degree: 'Bachelor', duration: '6 years', description: 'Standard medicine degree with clinical training' },
        { name: 'Graduate Course in Medicine (A101)', degree: 'Bachelor', duration: '4 years', description: 'Accelerated medicine for graduates' },
        { name: 'MPhil Medical Sciences', degree: 'Master', duration: '1 year', description: 'Research-oriented medical sciences' },
      ],
    },
    {
      name: 'Faculty of English',
      description: 'Cambridge English is one of the largest and most celebrated in the world.',
      courses: [
        { name: 'BA English (Tripos)', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive English literature degree' },
        { name: 'MPhil Criticism and Culture', degree: 'Master', duration: '1 year', description: 'Advanced literary and cultural theory' },
        { name: 'PhD English', degree: 'PhD', duration: '3-4 years', description: 'Research in English literature and criticism' },
      ],
    },
    {
      name: 'Department of Economics',
      description: 'Cambridge Economics is one of the top economics departments globally.',
      courses: [
        { name: 'BA Economics (Tripos)', degree: 'Bachelor', duration: '3 years', description: 'The Cambridge economics degree' },
        { name: 'MPhil Economics', degree: 'Master', duration: '1 year', description: 'Advanced economic theory and policy' },
        { name: 'MPhil Finance and Economics', degree: 'Master', duration: '1 year', description: 'Specialized finance and economics program' },
        { name: 'PhD Economics', degree: 'PhD', duration: '3-4 years', description: 'Research in economics' },
      ],
    },
    {
      name: 'Department of Politics and International Studies (POLIS)',
      description: 'Cambridge\'s politics department covering political theory, IR, and comparative politics.',
      courses: [
        { name: 'BA Human, Social and Political Science', degree: 'Bachelor', duration: '3 years', description: 'Interdisciplinary social science degree' },
        { name: 'MPhil Politics and International Studies', degree: 'Master', duration: '1 year', description: 'Advanced study in politics and IR' },
        { name: 'PhD Politics', degree: 'PhD', duration: '3-4 years', description: 'Research in political science' },
      ],
    },
    {
      name: 'Department of Chemistry',
      description: 'Cambridge Chemistry — world-leading in synthesis, catalysis, and materials science.',
      courses: [
        { name: 'BA Chemistry (Natural Sciences Tripos)', degree: 'Bachelor', duration: '3 years', description: 'Chemistry through the Natural Sciences' },
        { name: 'MSci Chemistry', degree: 'Master', duration: '4 years', description: 'Extended chemistry with research project' },
        { name: 'MPhil Chemistry', degree: 'Master', duration: '1 year', description: 'Advanced chemistry research' },
        { name: 'PhD Chemistry', degree: 'PhD', duration: '3-4 years', description: 'Research in any area of chemistry' },
      ],
    },
    {
      name: 'Department of Architecture',
      description: 'Cambridge Architecture is one of the most prestigious in the UK.',
      courses: [
        { name: 'BA Architecture', degree: 'Bachelor', duration: '3 years', description: 'Architecture design and history' },
        { name: 'March Architecture', degree: 'Master', duration: '2 years', description: 'Professional architecture accreditation' },
        { name: 'MPhil Architecture and Urban Design', degree: 'Master', duration: '1 year', description: 'Advanced urban design and planning' },
      ],
    },
    {
      name: 'Department of Biological Sciences',
      description: 'Cambridge Biology covers everything from molecular biology to ecology.',
      courses: [
        { name: 'BA Biological Sciences (Natural Sciences)', degree: 'Bachelor', duration: '3 years', description: 'Biology through the Natural Sciences Tripos' },
        { name: 'MSci Biological Sciences', degree: 'Master', duration: '4 years', description: 'Extended biology with research project' },
        { name: 'MPhil Biology (Computational)', degree: 'Master', duration: '1 year', description: 'Computational approaches to biology' },
        { name: 'PhD Biological Sciences', degree: 'PhD', duration: '3-4 years', description: 'Research in any area of biology' },
      ],
    },
  ]);

  // ============================================================
  // 3. UNIVERSITY OF LINCOLN
  // ============================================================
  await addUniversity('uni-lincoln-001', 'University of Lincoln', 'United Kingdom', 'Lincoln', 'https://www.lincoln.ac.uk', [
    {
      name: 'School of Computer Science',
      description: 'Lincoln CS focuses on practical, industry-ready skills with strong placement opportunities.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive CS degree with optional placement year' },
        { name: 'BSc Software Engineering', degree: 'Bachelor', duration: '3 years', description: 'Focus on software development lifecycle and agile methods' },
        { name: 'MSc Computer Science', degree: 'Master', duration: '1 year', description: 'Advanced CS for career changers and graduates' },
        { name: 'MSc Artificial Intelligence', degree: 'Master', duration: '1 year', description: 'AI, machine learning, and deep learning applications' },
        { name: 'MSc Cybersecurity', degree: 'Master', duration: '1 year', description: 'Network security, ethical hacking, and digital forensics' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Big data analytics, visualization, and statistical modeling' },
      ],
    },
    {
      name: 'Lincoln School of Engineering',
      description: 'Engineering at Lincoln combines traditional knowledge with modern technology.',
      courses: [
        { name: 'BEng Mechanical Engineering', degree: 'Bachelor', duration: '3 years', description: 'Mechanical systems design and manufacturing' },
        { name: 'BEng Electrical and Electronic Engineering', degree: 'Bachelor', duration: '3 years', description: 'Circuit design, power systems, and electronics' },
        { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '4 years', description: 'Integrated masters with advanced projects' },
        { name: 'MSc Engineering Management', degree: 'Master', duration: '1 year', description: 'Management skills for engineering professionals' },
      ],
    },
    {
      name: 'Lincoln Business School',
      description: 'AACSB-accredited business school with strong industry connections.',
      courses: [
        { name: 'BA Business Management', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive business management degree' },
        { name: 'BSc Accounting and Finance', degree: 'Bachelor', duration: '3 years', description: 'Accounting, finance, and business analytics' },
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Executive MBA for working professionals' },
        { name: 'MSc International Business', degree: 'Master', duration: '1 year', description: 'Global business strategy and cross-cultural management' },
        { name: 'MSc Finance and Management', degree: 'Master', duration: '1 year', description: 'Finance with management applications' },
      ],
    },
    {
      name: 'School of Law',
      description: 'Lincoln Law is ranked among the top 10 in the UK for student satisfaction.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '3 years', description: 'Qualifying law degree (QLD)' },
        { name: 'LLB Law with Criminology', degree: 'Bachelor', duration: '3 years', description: 'Law combined with criminological study' },
        { name: 'LLM International Law', degree: 'Master', duration: '1 year', description: 'International legal frameworks and human rights' },
        { name: 'LLM Commercial Law', degree: 'Master', duration: '1 year', description: 'Business and commercial legal practice' },
      ],
    },
    {
      name: 'School of Architecture',
      description: 'Lincoln Architecture is known for sustainability and community-focused design.',
      courses: [
        { name: 'BA Architecture', degree: 'Bachelor', duration: '3 years', description: 'Architecture design and technology' },
        { name: 'March Architecture', degree: 'Master', duration: '2 years', description: 'Professional architecture qualification (RIBA Part 2)' },
        { name: 'MArch Architecture', degree: 'Master', duration: '2 years', description: 'Architecture with sustainability focus' },
      ],
    },
    {
      name: 'School of Life Sciences',
      description: 'Life Sciences at Lincoln covers biology, biomedical science, and environmental studies.',
      courses: [
        { name: 'BSc Biology', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive biology degree' },
        { name: 'BSc Biomedical Science', degree: 'Bachelor', duration: '3 years', description: 'Biomedical research and clinical applications' },
        { name: 'MSc Biotechnology', degree: 'Master', duration: '1 year', description: 'Applied biotechnology and genetic engineering' },
        { name: 'MSc Environmental Management', degree: 'Master', duration: '1 year', description: 'Environmental science and sustainability' },
      ],
    },
    {
      name: 'School of Media and Communication',
      description: 'Lincoln Media is top-ranked for student satisfaction in creative industries.',
      courses: [
        { name: 'BA Media Production', degree: 'Bachelor', duration: '3 years', description: 'Film, TV, and digital media production' },
        { name: 'BA Journalism', degree: 'Bachelor', duration: '3 years', description: 'Print, broadcast, and digital journalism' },
        { name: 'MA Digital Marketing', degree: 'Master', duration: '1 year', description: 'Social media, SEO, and digital strategy' },
        { name: 'MA Creative Writing', degree: 'Master', duration: '1 year', description: 'Fiction, poetry, and screenwriting' },
      ],
    },
    {
      name: 'School of Psychology',
      description: 'Psychology at Lincoln focuses on applied and clinical psychology.',
      courses: [
        { name: 'BSc Psychology', degree: 'Bachelor', duration: '3 years', description: 'BPS-accredited psychology degree' },
        { name: 'MSc Clinical Psychology', degree: 'Master', duration: '1 year', description: 'Clinical assessment and intervention techniques' },
        { name: 'MSc Forensic Psychology', degree: 'Master', duration: '1 year', description: 'Psychology in criminal justice settings' },
      ],
    },
    {
      name: 'School of Education',
      description: 'Education at Lincoln prepares teachers and educational leaders.',
      courses: [
        { name: 'BA Education Studies', degree: 'Bachelor', duration: '3 years', description: 'Educational theory, policy, and practice' },
        { name: 'PGCE Primary Education', degree: 'Master', duration: '1 year', description: 'Qualified Teacher Status (QTS) for primary teaching' },
        { name: 'MEd Education', degree: 'Master', duration: '1 year', description: 'Advanced study in education leadership' },
      ],
    },
    {
      name: 'School of Pharmacy',
      description: 'Lincoln Pharmacy provides GPhC-accredited pharmacy training.',
      courses: [
        { name: 'MPharm Pharmacy', degree: 'Master', duration: '4 years', description: 'Integrated pharmacy degree (GPhC-accredited)' },
        { name: 'MSc Pharmacy Practice', degree: 'Master', duration: '1 year', description: 'Advanced clinical pharmacy' },
      ],
    },
  ]);

  // ============================================================
  // 4. IMPERIAL COLLEGE LONDON
  // ============================================================
  await addUniversity('uni-uk-003', 'Imperial College London', 'United Kingdom', 'London', 'https://www.imperial.ac.uk', [
    {
      name: 'Department of Computing',
      description: 'Imperial Computing is consistently ranked top 5 in the UK and top 20 globally.',
      courses: [
        { name: 'BEng Computing', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive computing degree' },
        { name: 'MEng Computing', degree: 'Master', duration: '4 years', description: 'Integrated masters with advanced modules' },
        { name: 'MSc Computing', degree: 'Master', duration: '1 year', description: 'Advanced computing for non-CS graduates' },
        { name: 'MSc Artificial Intelligence', degree: 'Master', duration: '1 year', description: 'AI and machine learning' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Machine learning and big data' },
        { name: 'MSc Security and Resilience', degree: 'Master', duration: '1 year', description: 'Cybersecurity and system resilience' },
      ],
    },
    {
      name: 'Department of Electrical & Electronic Engineering',
      description: 'EEE at Imperial is one of the largest and most prestigious in the UK.',
      courses: [
        { name: 'MEng Electrical and Electronic Engineering', degree: 'Master', duration: '4 years', description: 'Comprehensive EEE program' },
        { name: 'MEng Electronics with AI', degree: 'Master', duration: '4 years', description: 'Electronics combined with artificial intelligence' },
        { name: 'MSc Communications and Signal Processing', degree: 'Master', duration: '1 year', description: 'Advanced signal processing and communications' },
      ],
    },
    {
      name: 'Department of Mechanical Engineering',
      description: 'Imperial ME is known for aerospace, automotive, and biomedical engineering.',
      courses: [
        { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '4 years', description: 'Comprehensive mechanical engineering program' },
        { name: 'MEng Design Engineering', degree: 'Master', duration: '4 years', description: 'Engineering design and innovation' },
        { name: 'MSc Advanced Mechanical Engineering', degree: 'Master', duration: '1 year', description: 'Specialized mechanical engineering study' },
      ],
    },
    {
      name: 'Business School',
      description: 'Imperial Business School — Triple-accredited, known for innovation and entrepreneurship.',
      courses: [
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Top-ranked MBA with tech focus' },
        { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Quantitative finance and financial engineering' },
        { name: 'MSc Innovation, Entrepreneurship & Management', degree: 'Master', duration: '1 year', description: 'Startup management and innovation' },
        { name: 'MSc International Management', degree: 'Master', duration: '1 year', description: 'Global business strategy' },
        { name: 'MSc Business Analytics', degree: 'Master', duration: '1 year', description: 'Data-driven business decision making' },
      ],
    },
    {
      name: 'Department of Mathematics',
      description: 'Imperial Mathematics is top-ranked in the UK for research impact.',
      courses: [
        { name: 'BSc Mathematics', degree: 'Bachelor', duration: '3 years', description: 'Pure and applied mathematics' },
        { name: 'MMath Mathematics', degree: 'Master', duration: '4 years', description: 'Extended mathematics degree' },
        { name: 'MSc Mathematics', degree: 'Master', duration: '1 year', description: 'Advanced mathematical study' },
        { name: 'MSc Applied Mathematics', degree: 'Master', duration: '1 year', description: 'Mathematical modeling and simulation' },
      ],
    },
    {
      name: 'Department of Physics',
      description: 'Imperial Physics — world-leading in condensed matter, quantum, and particle physics.',
      courses: [
        { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive physics degree' },
        { name: 'MSci Physics', degree: 'Master', duration: '4 years', description: 'Extended physics with research project' },
        { name: 'MSc Physics', degree: 'Master', duration: '1 year', description: 'Advanced physics specialization' },
        { name: 'MSc Quantum Engineering', degree: 'Master', duration: '1 year', description: 'Quantum computing and quantum technologies' },
      ],
    },
    {
      name: 'Department of Chemical Engineering',
      description: 'Imperial Chemical Engineering is the oldest and largest in the UK.',
      courses: [
        { name: 'MEng Chemical Engineering', degree: 'Master', duration: '4 years', description: 'Comprehensive chemical engineering program' },
        { name: 'MSc Advanced Chemical Engineering', degree: 'Master', duration: '1 year', description: 'Specialized chemical engineering study' },
      ],
    },
    {
      name: 'Department of Life Sciences',
      description: 'Imperial Life Sciences spans biology, medicine, and bioengineering.',
      courses: [
        { name: 'BSc Life Sciences', degree: 'Bachelor', duration: '3 years', description: 'Biology, biochemistry, and biotechnology' },
        { name: 'MSc Molecular Biology and Biotechnology', degree: 'Master', duration: '1 year', description: 'Advanced molecular biology' },
        { name: 'MSc Bioengineering', degree: 'Master', duration: '1 year', description: 'Engineering applications in biology' },
      ],
    },
    {
      name: 'School of Medicine',
      description: 'Imperial Medicine is attached to world-renowned NHS hospitals.',
      courses: [
        { name: 'MBBS Medicine', degree: 'Bachelor', duration: '6 years', description: 'Clinical medicine with early patient contact' },
        { name: 'BSc Medical Sciences', degree: 'Bachelor', duration: '3 years', description: 'Pre-clinical medical sciences' },
        { name: 'MSc Genomic Medicine', degree: 'Master', duration: '1 year', description: 'Genomics in clinical practice' },
      ],
    },
    {
      name: 'Department of Civil & Environmental Engineering',
      description: 'Imperial CEE covers structural, environmental, and geotechnical engineering.',
      courses: [
        { name: 'MEng Civil Engineering', degree: 'Master', duration: '4 years', description: 'Comprehensive civil engineering program' },
        { name: 'MEng Environmental Engineering', degree: 'Master', duration: '4 years', description: 'Sustainable environmental engineering' },
        { name: 'MSc Structural Engineering', degree: 'Master', duration: '1 year', description: 'Advanced structural analysis and design' },
      ],
    },
  ]);

  // ============================================================
  // 5. UNIVERSITY COLLEGE LONDON (UCL)
  // ============================================================
  await addUniversity('uni-uk-004', 'University College London (UCL)', 'United Kingdom', 'London', 'https://www.ucl.ac.uk', [
    {
      name: 'Department of Computer Science',
      description: 'UCL CS is one of the top departments in the UK, known for AI and machine learning.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Core CS with theoretical and practical focus' },
        { name: 'MEng Computer Science', degree: 'Master', duration: '4 years', description: 'Integrated masters with advanced study' },
        { name: 'MSc Machine Learning', degree: 'Master', duration: '1 year', description: 'One of the world\'s top ML programs' },
        { name: 'MSc Computer Science', degree: 'Master', duration: '1 year', description: 'Advanced CS for non-CS graduates' },
        { name: 'MSc Data Science and Machine Learning', degree: 'Master', duration: '1 year', description: 'Applied data science and ML' },
        { name: 'MSc Computational Statistics and Machine Learning', degree: 'Master', duration: '1 year', description: 'Statistical ML and AI' },
      ],
    },
    {
      name: 'Faculty of Laws',
      description: 'UCL Laws is one of the top law schools in the world.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '3 years', description: 'Qualifying law degree' },
        { name: 'LLM Law', degree: 'Master', duration: '1 year', description: 'Advanced legal study across specializations' },
        { name: 'LLM International Law', degree: 'Master', duration: '1 year', description: 'International legal systems' },
        { name: 'LLM Human Rights Law', degree: 'Master', duration: '1 year', description: 'International human rights' },
      ],
    },
    {
      name: 'UCL School of Management',
      description: 'UCL Management is known for technology management and innovation.',
      courses: [
        { name: 'MSc Management', degree: 'Master', duration: '1 year', description: 'Management for non-business graduates' },
        { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Quantitative finance and risk management' },
        { name: 'MSc Business Analytics', degree: 'Master', duration: '1 year', description: 'Data analytics for business' },
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'UCL\'s full-time MBA program' },
      ],
    },
    {
      name: 'Department of Mathematics',
      description: 'UCL Mathematics is one of the largest in the UK.',
      courses: [
        { name: 'BSc Mathematics', degree: 'Bachelor', duration: '3 years', description: 'Pure and applied mathematics' },
        { name: 'MSci Mathematics', degree: 'Master', duration: '4 years', description: 'Extended mathematics degree' },
        { name: 'MSc Mathematical Modelling', degree: 'Master', duration: '1 year', description: 'Applied mathematical modeling' },
      ],
    },
    {
      name: 'Department of Physics & Astronomy',
      description: 'UCL Physics is known for space science, condensed matter, and medical physics.',
      courses: [
        { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive physics degree' },
        { name: 'MSci Physics', degree: 'Master', duration: '4 years', description: 'Extended physics with research' },
        { name: 'MSc Space Science and Technology', degree: 'Master', duration: '1 year', description: 'Space systems and satellite technology' },
      ],
    },
    {
      name: 'UCL Medical School',
      description: 'One of the oldest medical schools in England, with clinical training across London hospitals.',
      courses: [
        { name: 'MBBS Medicine', degree: 'Bachelor', duration: '6 years', description: 'Standard medicine program' },
        { name: 'MBBS Graduate Entry Medicine', degree: 'Bachelor', duration: '4 years', description: 'Accelerated medicine for graduates' },
        { name: 'MSc Clinical Trials', degree: 'Master', duration: '1 year', description: 'Clinical research methodology' },
      ],
    },
    {
      name: 'Institute of Education (IOE)',
      description: 'UCL IOE is ranked #1 in the world for Education (QS Rankings).',
      courses: [
        { name: 'BA Education Studies', degree: 'Bachelor', duration: '3 years', description: 'Educational theory and policy' },
        { name: 'MA Education (Primary)', degree: 'Master', duration: '1 year', description: 'Primary education specialization' },
        { name: 'MA Education (Leadership)', degree: 'Master', duration: '1 year', description: 'Educational leadership and management' },
        { name: 'MEd Psychology of Education', degree: 'Master', duration: '1 year', description: 'Psychology applied to education' },
        { name: 'EdD Education', degree: 'PhD', duration: '3-4 years', description: 'Doctorate in education research' },
      ],
    },
    {
      name: 'School of Pharmacy',
      description: 'UCL Pharmacy is one of the top pharmacy schools in the UK.',
      courses: [
        { name: 'MPharm Pharmacy', degree: 'Master', duration: '4 years', description: 'GPhC-accredited pharmacy degree' },
        { name: 'MSc Clinical Pharmacy', degree: 'Master', duration: '1 year', description: 'Advanced clinical pharmacy practice' },
      ],
    },
    {
      name: 'Department of Architecture',
      description: 'UCL Bartlett School of Architecture is world-renowned for design innovation.',
      courses: [
        { name: 'BSc Architecture', degree: 'Bachelor', duration: '3 years', description: 'Architecture design and theory' },
        { name: 'March Architecture', degree: 'Master', duration: '2 years', description: 'Professional architecture qualification' },
        { name: 'MSc Architectural Computation', degree: 'Master', duration: '1 year', description: 'Computational design and fabrication' },
      ],
    },
  ]);

  // ============================================================
  // 6. UNIVERSITY OF EDINBURGH
  // ============================================================
  await addUniversity('uni-uk-005', 'University of Edinburgh', 'United Kingdom', 'Edinburgh', 'https://www.ed.ac.uk', [
    {
      name: 'School of Informatics',
      description: 'Edinburgh Informatics is the largest CS/AI school in the UK and one of the top globally.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '4 years', description: 'Scottish masters degree with broad CS foundation' },
        { name: 'MSc Artificial Intelligence', degree: 'Master', duration: '1 year', description: 'One of the world\'s first and best AI programs' },
        { name: 'MSc Computer Science', degree: 'Master', duration: '1 year', description: 'Advanced CS for non-CS graduates' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Big data and analytics' },
        { name: 'MSc Cybersecurity, Privacy and Trust', degree: 'Master', duration: '1 year', description: 'Security and privacy engineering' },
        { name: 'MSc Design Informatics', degree: 'Master', duration: '1 year', description: 'Creative computing and design' },
        { name: 'PhD Informatics', degree: 'PhD', duration: '3-4 years', description: 'Research in AI, NLP, robotics, and more' },
      ],
    },
    {
      name: 'School of Engineering',
      description: 'Edinburgh Engineering covers civil, mechanical, electrical, and biomedical engineering.',
      courses: [
        { name: 'MEng Engineering', degree: 'Master', duration: '5 years', description: 'Scottish integrated masters' },
        { name: 'MSc Structural Engineering', degree: 'Master', duration: '1 year', description: 'Advanced structural analysis' },
        { name: 'MSc Signal Processing and Communications', degree: 'Master', duration: '1 year', description: 'Advanced signal processing' },
      ],
    },
    {
      name: 'Edinburgh Business School',
      description: 'Edinburgh\'s business school known for finance, innovation, and entrepreneurship.',
      courses: [
        { name: 'MA Business Management', degree: 'Bachelor', duration: '4 years', description: 'Scottish degree in business management' },
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Full-time MBA' },
        { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Corporate finance and investments' },
        { name: 'MSc Marketing', degree: 'Master', duration: '1 year', description: 'Digital and strategic marketing' },
        { name: 'MSc Innovation Management and Entrepreneurship', degree: 'Master', duration: '1 year', description: 'Innovation and startup management' },
      ],
    },
    {
      name: 'School of Law',
      description: 'Edinburgh Law is one of the oldest in the English-speaking world.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '4 years', description: 'Scottish law degree (qualifying)' },
        { name: 'LLM Law', degree: 'Master', duration: '1 year', description: 'Advanced legal study' },
        { name: 'LLM International Law', degree: 'Master', duration: '1 year', description: 'International and comparative law' },
        { name: 'LLM Human Rights', degree: 'Master', duration: '1 year', description: 'International human rights law' },
      ],
    },
    {
      name: 'School of Medicine',
      description: 'Edinburgh Medical School is one of the oldest in the English-speaking world.',
      courses: [
        { name: 'MBChB Medicine', degree: 'Bachelor', duration: '6 years', description: 'Scottish medicine program' },
        { name: 'MBChB Graduate Entry Medicine', degree: 'Bachelor', duration: '4 years', description: 'Accelerated medicine for graduates' },
        { name: 'MSc Global Health', degree: 'Master', duration: '1 year', description: 'Global health policy and practice' },
      ],
    },
    {
      name: 'School of Mathematics',
      description: 'Edinburgh Mathematics is ranked among the top in the UK.',
      courses: [
        { name: 'MA Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Scottish degree in pure and applied math' },
        { name: 'MSc Mathematics', degree: 'Master', duration: '1 year', description: 'Advanced mathematical study' },
        { name: 'MSc Operational Research', degree: 'Master', duration: '1 year', description: 'Optimization and decision science' },
      ],
    },
    {
      name: 'School of Philosophy, Psychology & Language Sciences',
      description: 'Edinburgh PPLS is one of the largest in the UK.',
      courses: [
        { name: 'MA Philosophy', degree: 'Bachelor', duration: '4 years', description: 'Scottish philosophy degree' },
        { name: 'MSc Psychology', degree: 'Master', duration: '1 year', description: 'Conversion psychology degree' },
        { name: 'MA Linguistics', degree: 'Bachelor', duration: '4 years', description: 'Theoretical and applied linguistics' },
      ],
    },
    {
      name: 'School of Biological Sciences',
      description: 'Edinburgh Biology is one of the largest and most diverse in the UK.',
      courses: [
        { name: 'MA Biological Sciences', degree: 'Bachelor', duration: '4 years', description: 'Biology with Scottish degree structure' },
        { name: 'MSc Bioinformatics', degree: 'Master', duration: '1 year', description: 'Computational biology and data analysis' },
        { name: 'MSc Ecological Sustainability', degree: 'Master', duration: '1 year', description: 'Conservation and sustainability' },
      ],
    },
    {
      name: 'School of GeoSciences',
      description: 'Edinburgh Earth Sciences covers geology, geography, and environmental science.',
      courses: [
        { name: 'MA Geology', degree: 'Bachelor', duration: '4 years', description: 'Earth science and geology' },
        { name: 'MSc Earth Observation and Geoinformation Management', degree: 'Master', duration: '1 year', description: 'GIS and remote sensing' },
      ],
    },
  ]);

  // ============================================================
  // 7. UNIVERSITY OF MANCHESTER
  // ============================================================
  await addUniversity('uni-uk-006', 'University of Manchester', 'United Kingdom', 'Manchester', 'https://www.manchester.ac.uk', [
    {
      name: 'Department of Computer Science',
      description: 'Manchester CS — where the first modern computer was built. Home to Alan Turing legacy.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive CS degree' },
        { name: 'MEng Computer Science', degree: 'Master', duration: '4 years', description: 'Integrated masters' },
        { name: 'MSc ACS (Advanced Computer Science)', degree: 'Master', duration: '1 year', description: 'Top-ranked advanced CS program' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Data science and AI' },
        { name: 'MSc Cybersecurity', degree: 'Master', duration: '1 year', description: 'Cybersecurity and digital forensics' },
        { name: 'MSc Artificial Intelligence', degree: 'Master', duration: '1 year', description: 'AI and machine learning' },
      ],
    },
    {
      name: 'Department of Electrical & Electronic Engineering',
      description: 'Manchester EEE is one of the largest in the UK with strong industry links.',
      courses: [
        { name: 'MEng Electrical and Electronic Engineering', degree: 'Master', duration: '4 years', description: 'Comprehensive EEE program' },
        { name: 'MEng Mechatronic Engineering', degree: 'Master', duration: '4 years', description: 'Mechanical-electronic integration' },
        { name: 'MSc Electrical Power Systems', degree: 'Master', duration: '1 year', description: 'Power engineering and smart grids' },
      ],
    },
    {
      name: 'Alliance Manchester Business School',
      description: 'One of the largest and most prestigious business schools in the UK.',
      courses: [
        { name: 'BSc Management', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive management degree' },
        { name: 'MBA', degree: 'Master', duration: '18 months', description: 'Triple-accredited MBA' },
        { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Corporate finance and investments' },
        { name: 'MSc International Business and Management', degree: 'Master', duration: '1 year', description: 'Global business strategy' },
        { name: 'MSc Marketing', degree: 'Master', duration: '1 year', description: 'Strategic and digital marketing' },
        { name: 'MSc Business Analytics: Operational Research and Risk Analysis', degree: 'Master', duration: '1 year', description: 'Advanced analytics for business' },
      ],
    },
    {
      name: 'School of Law',
      description: 'Manchester Law is one of the top in the UK for research and teaching.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '3 years', description: 'Qualifying law degree' },
        { name: 'LLM International Commercial Law', degree: 'Master', duration: '1 year', description: 'International trade and commercial law' },
        { name: 'LLM Human Rights Law', degree: 'Master', duration: '1 year', description: 'International human rights' },
      ],
    },
    {
      name: 'Department of Mechanical, Aerospace & Civil Engineering',
      description: 'Manchester MACE covers three major engineering disciplines.',
      courses: [
        { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '4 years', description: 'Comprehensive mechanical engineering' },
        { name: 'MEng Aerospace Engineering', degree: 'Master', duration: '4 years', description: 'Aircraft and spacecraft design' },
        { name: 'MEng Civil Engineering', degree: 'Master', duration: '4 years', description: 'Structural and environmental engineering' },
      ],
    },
    {
      name: 'Faculty of Biology, Medicine & Health',
      description: 'Manchester医学 is one of the largest medical schools in the UK.',
      courses: [
        { name: 'MBChB Medicine', degree: 'Bachelor', duration: '5 years', description: 'Medicine with early clinical experience' },
        { name: 'MBChB Graduate Entry Medicine', degree: 'Bachelor', duration: '4 years', description: 'Accelerated medicine for graduates' },
        { name: 'MSc Biomedical Sciences', degree: 'Master', duration: '1 year', description: 'Molecular and cellular biology' },
        { name: 'MSc Genomic Medicine', degree: 'Master', duration: '1 year', description: 'Genomics in healthcare' },
      ],
    },
    {
      name: 'School of Physics & Astronomy',
      description: 'Manchester Physics is known for particle physics, astrophysics, and condensed matter.',
      courses: [
        { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive physics degree' },
        { name: 'MPhys Physics', degree: 'Master', duration: '4 years', description: 'Extended physics with research' },
        { name: 'MSc Nuclear Science and Technology', degree: 'Master', duration: '1 year', description: 'Nuclear physics and engineering' },
      ],
    },
    {
      name: 'School of Mathematics',
      description: 'Manchester Mathematics — one of the largest in the UK.',
      courses: [
        { name: 'BSc Mathematics', degree: 'Bachelor', duration: '3 years', description: 'Pure and applied mathematics' },
        { name: 'MMath Mathematics', degree: 'Master', duration: '4 years', description: 'Extended mathematics degree' },
        { name: 'MSc Applied Mathematics', degree: 'Master', duration: '1 year', description: 'Mathematical modeling' },
        { name: 'MSc Statistics', degree: 'Master', duration: '1 year', description: 'Statistical theory and practice' },
      ],
    },
  ]);

  // ============================================================
  // 8. UNIVERSITY OF BRISTOL
  // ============================================================
  await addUniversity('uni-uk-007', 'University of Bristol', 'United Kingdom', 'Bristol', 'https://www.bristol.ac.uk', [
    {
      name: 'Department of Computer Science',
      description: 'Bristol CS is known for AI, machine learning, and cybersecurity research.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Core CS with optional placement year' },
        { name: 'MEng Computer Science', degree: 'Master', duration: '4 years', description: 'Integrated masters' },
        { name: 'MSc Computer Science', degree: 'Master', duration: '1 year', description: 'Advanced CS specialization' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Applied data science and ML' },
        { name: 'MSc Cybersecurity', degree: 'Master', duration: '1 year', description: 'Network and application security' },
      ],
    },
    {
      name: 'Department of Engineering',
      description: 'Bristol Engineering is consistently ranked in the top 5 in the UK.',
      courses: [
        { name: 'MEng Aerospace Engineering', degree: 'Master', duration: '4 years', description: 'World-class aerospace program' },
        { name: 'MEng Civil Engineering', degree: 'Master', duration: '4 years', description: 'Structural and environmental engineering' },
        { name: 'MEng Electrical and Electronic Engineering', degree: 'Master', duration: '4 years', description: 'EEE with optional specialization' },
        { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '4 years', description: 'Mechanical systems and design' },
      ],
    },
    {
      name: 'School of Economics',
      description: 'Bristol Economics is one of the top in the UK for research.',
      courses: [
        { name: 'BSc Economics', degree: 'Bachelor', duration: '3 years', description: 'Core economics degree' },
        { name: 'BSc Economics and Finance', degree: 'Bachelor', duration: '3 years', description: 'Economics with financial focus' },
        { name: 'MSc Economics', degree: 'Master', duration: '1 year', description: 'Advanced economic theory and policy' },
        { name: 'MSc Finance and Investment', degree: 'Master', duration: '1 year', description: 'Corporate finance and portfolio management' },
      ],
    },
    {
      name: 'School of Law',
      description: 'Bristol Law is known for commercial and international law.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '3 years', description: 'Qualifying law degree' },
        { name: 'LLM International Commercial Law', degree: 'Master', duration: '1 year', description: 'International trade law' },
        { name: 'LLM Human Rights Law', degree: 'Master', duration: '1 year', description: 'International human rights' },
      ],
    },
    {
      name: 'School of Management',
      description: 'Bristol Management focuses on innovation and sustainable business.',
      courses: [
        { name: 'BSc Business Management', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive business degree' },
        { name: 'MSc Management', degree: 'Master', duration: '1 year', description: 'Management for non-business graduates' },
        { name: 'MSc Marketing', degree: 'Master', duration: '1 year', description: 'Strategic and digital marketing' },
        { name: 'MSc Accounting and Finance', degree: 'Master', duration: '1 year', description: 'Advanced accounting and finance' },
      ],
    },
    {
      name: 'School of Physics',
      description: 'Bristol Physics is known for quantum, photonics, and condensed matter.',
      courses: [
        { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive physics degree' },
        { name: 'MPhys Physics', degree: 'Master', duration: '4 years', description: 'Extended physics with research' },
        { name: 'MSc Quantum Engineering', degree: 'Master', duration: '1 year', description: 'Quantum technologies and computing' },
      ],
    },
    {
      name: 'School of Chemistry',
      description: 'Bristol Chemistry is known for synthesis and materials science.',
      courses: [
        { name: 'MChem Chemistry', degree: 'Master', duration: '4 years', description: 'Integrated masters in chemistry' },
        { name: 'MSc Drug Discovery', degree: 'Master', duration: '1 year', description: 'Pharmaceutical chemistry and drug design' },
      ],
    },
    {
      name: 'School of Biological Sciences',
      description: 'Bristol Biology covers molecular biology to ecology.',
      courses: [
        { name: 'BSc Biology', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive biology degree' },
        { name: 'MSci Biological Sciences', degree: 'Master', duration: '4 years', description: 'Extended biology with research' },
        { name: 'MSc Bioinformatics', degree: 'Master', duration: '1 year', description: 'Computational biology' },
      ],
    },
    {
      name: 'Bristol Medical School',
      description: 'Bristol Medical School with strong clinical training at NHS hospitals.',
      courses: [
        { name: 'MBChB Medicine', degree: 'Bachelor', duration: '5 years', description: 'Medicine with early clinical contact' },
        { name: 'BSc Medical Sciences', degree: 'Bachelor', duration: '3 years', description: 'Pre-clinical medical sciences' },
      ],
    },
  ]);

  // ============================================================
  // 9. UNIVERSITY OF GLASGOW
  // ============================================================
  await addUniversity('uni-uk-008', 'University of Glasgow', 'United Kingdom', 'Glasgow', 'https://www.gla.ac.uk', [
    {
      name: 'School of Computing Science',
      description: 'Glasgow CS is one of the oldest in the UK, known for AI and software engineering.',
      courses: [
        { name: 'BSc Computing Science', degree: 'Bachelor', duration: '4 years', description: 'Scottish degree in CS' },
        { name: 'MSc Computing Science', degree: 'Master', duration: '1 year', description: 'Advanced CS' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Applied data science' },
        { name: 'MSc Cybersecurity', degree: 'Master', duration: '1 year', description: 'Security engineering' },
        { name: 'MSc Software Development', degree: 'Master', duration: '1 year', description: 'Software engineering for non-CS graduates' },
      ],
    },
    {
      name: 'James Watt School of Engineering',
      description: 'Glasgow Engineering named after the inventor of the steam engine.',
      courses: [
        { name: 'MEng Aerospace Engineering', degree: 'Master', duration: '5 years', description: 'Scottish integrated masters' },
        { name: 'MEng Civil Engineering', degree: 'Master', duration: '5 years', description: 'Civil and environmental engineering' },
        { name: 'MEng Electrical and Electronic Engineering', degree: 'Master', duration: '5 years', description: 'EEE with specializations' },
        { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '5 years', description: 'Mechanical systems and design' },
      ],
    },
    {
      name: 'Adam Smith Business School',
      description: 'Named after the father of economics, Glasgow\'s business school is triple-accredited.',
      courses: [
        { name: 'MA Economics', degree: 'Bachelor', duration: '4 years', description: 'Scottish economics degree' },
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Full-time MBA' },
        { name: 'MSc Finance & Management', degree: 'Master', duration: '1 year', description: 'Finance combined with management' },
        { name: 'MSc International Business', degree: 'Master', duration: '1 year', description: 'Global business strategy' },
      ],
    },
    {
      name: 'School of Law',
      description: 'Glasgow Law is one of the oldest in Scotland.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '4 years', description: 'Scottish law degree' },
        { name: 'LLM International Law', degree: 'Master', duration: '1 year', description: 'International legal systems' },
        { name: 'LLM Commercial Law', degree: 'Master', duration: '1 year', description: 'Business and commercial law' },
      ],
    },
    {
      name: 'School of Medicine',
      description: 'Glasgow Medical School is one of the oldest in the English-speaking world.',
      courses: [
        { name: 'MBChB Medicine', degree: 'Bachelor', duration: '5 years', description: 'Medicine program' },
        { name: 'MBChB Graduate Entry Medicine', degree: 'Bachelor', duration: '4 years', description: 'Accelerated medicine' },
        { name: 'MSc Clinical Pharmacology', degree: 'Master', duration: '1 year', description: 'Drug development and pharmacology' },
      ],
    },
    {
      name: 'School of Physics & Astronomy',
      description: 'Glasgow Physics is known for gravitational wave detection and quantum optics.',
      courses: [
        { name: 'MA Physics', degree: 'Bachelor', duration: '4 years', description: 'Scottish physics degree' },
        { name: 'MSc Physics', degree: 'Master', duration: '1 year', description: 'Advanced physics study' },
        { name: 'MSc Nanoscience & Nanotechnology', degree: 'Master', duration: '1 year', description: 'Nanoscale science and engineering' },
      ],
    },
    {
      name: 'School of Mathematics & Statistics',
      description: 'Glasgow Mathematics has a rich history dating back to 1451.',
      courses: [
        { name: 'MA Mathematics', degree: 'Bachelor', duration: '4 years', description: 'Scottish mathematics degree' },
        { name: 'MSc Mathematics', degree: 'Master', duration: '1 year', description: 'Advanced mathematical study' },
        { name: 'MSc Statistics', degree: 'Master', duration: '1 year', description: 'Statistical modeling and analysis' },
      ],
    },
  ]);

  // ============================================================
  // 10. UNIVERSITY OF WARWICK
  // ============================================================
  await addUniversity('uni-uk-009', 'University of Warwick', 'United Kingdom', 'Coventry', 'https://warwick.ac.uk', [
    {
      name: 'Department of Computer Science',
      description: 'Warwick CS is known for theory, AI, and systems research.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Core CS with optional year in industry' },
        { name: 'MEng Computer Science', degree: 'Master', duration: '4 years', description: 'Integrated masters' },
        { name: 'MSc Computer Science', degree: 'Master', duration: '1 year', description: 'Advanced CS' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Applied data science and analytics' },
        { name: 'MSc Cybersecurity', degree: 'Master', duration: '1 year', description: 'Security engineering' },
      ],
    },
    {
      name: 'Warwick Manufacturing Group (WMG)',
      description: 'WMG is an academic department bridging engineering, business, and management.',
      courses: [
        { name: 'MEng Engineering', degree: 'Master', duration: '4 years', description: 'Engineering with management' },
        { name: 'MSc Engineering Business Management', degree: 'Master', duration: '1 year', description: 'Management for engineers' },
        { name: 'MSc Supply Chain and Logistics Management', degree: 'Master', duration: '1 year', description: 'Supply chain optimization' },
        { name: 'MSc Smart, Connected and Autonomous Vehicles', degree: 'Master', duration: '1 year', description: 'Automotive engineering' },
      ],
    },
    {
      name: 'Warwick Business School (WBS)',
      description: 'WBS is one of the top business schools in the UK, triple-accredited.',
      courses: [
        { name: 'BSc Management', degree: 'Bachelor', duration: '3 years', description: 'Management with optional year abroad' },
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Top-ranked UK MBA' },
        { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Corporate finance and markets' },
        { name: 'MSc Business Analytics', degree: 'Master', duration: '1 year', description: 'Analytics for business' },
        { name: 'MSc Marketing & Strategy', degree: 'Master', duration: '1 year', description: 'Marketing strategy and consumer behavior' },
        { name: 'MSc Management', degree: 'Master', duration: '1 year', description: 'Management for non-business graduates' },
      ],
    },
    {
      name: 'Warwick Law School',
      description: 'Warwick Law is known for critical legal studies and human rights.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '3 years', description: 'Qualifying law degree' },
        { name: 'LLM International Commercial Law', degree: 'Master', duration: '1 year', description: 'International trade law' },
        { name: 'LLM International Development Law & Human Rights', degree: 'Master', duration: '1 year', description: 'Human rights and development' },
      ],
    },
    {
      name: 'Department of Mathematics',
      description: 'Warwick Mathematics is one of the top in the UK.',
      courses: [
        { name: 'BSc Mathematics', degree: 'Bachelor', duration: '3 years', description: 'Pure and applied mathematics' },
        { name: 'MMath Mathematics', degree: 'Master', duration: '4 years', description: 'Extended mathematics' },
        { name: 'MSc Mathematics', degree: 'Master', duration: '1 year', description: 'Advanced mathematical study' },
        { name: 'MSc Statistics', degree: 'Master', duration: '1 year', description: 'Statistical methods and applications' },
      ],
    },
    {
      name: 'Department of Physics',
      description: 'Warwick Physics is known for cosmology, particle physics, and materials science.',
      courses: [
        { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive physics degree' },
        { name: 'MPhys Physics', degree: 'Master', duration: '4 years', description: 'Extended physics with research' },
        { name: 'MSc Quantum Technology', degree: 'Master', duration: '1 year', description: 'Quantum computing and sensors' },
      ],
    },
    {
      name: 'School of Life Sciences',
      description: 'Warwick Life Sciences covers biology, biomedical science, and chemistry.',
      courses: [
        { name: 'BSc Biomedical Science', degree: 'Bachelor', duration: '3 years', description: 'Biomedical research and applications' },
        { name: 'MSc Biotechnology', degree: 'Master', duration: '1 year', description: 'Applied biotechnology' },
        { name: 'MSc Analytical Science and Technology', degree: 'Master', duration: '1 year', description: 'Analytical chemistry and instrumentation' },
      ],
    },
    {
      name: 'Warwick Medical School',
      description: 'Warwick Medical School with graduate entry medicine program.',
      courses: [
        { name: 'MB ChB Graduate Entry Medicine', degree: 'Bachelor', duration: '4 years', description: 'Graduate entry medicine' },
        { name: 'MSc Health and Medical Sciences', degree: 'Master', duration: '1 year', description: 'Health sciences research' },
      ],
    },
  ]);

  // ============================================================
  // 11. DURHAM UNIVERSITY
  // ============================================================
  await addUniversity('uni-uk-010', 'Durham University', 'United Kingdom', 'Durham', 'https://www.durham.ac.uk', [
    {
      name: 'Department of Computer Science',
      description: 'Durham CS is known for AI, software engineering, and cybersecurity.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Core CS degree' },
        { name: 'MEng Computer Science', degree: 'Master', duration: '4 years', description: 'Integrated masters' },
        { name: 'MSc Advanced Computer Science', degree: 'Master', duration: '1 year', description: 'Advanced CS' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Data science and analytics' },
      ],
    },
    {
      name: 'Department of Engineering',
      description: 'Durham Engineering covers civil, electrical, and mechanical engineering.',
      courses: [
        { name: 'MEng Civil Engineering', degree: 'Master', duration: '4 years', description: 'Civil engineering' },
        { name: 'MEng Electrical Engineering', degree: 'Master', duration: '4 years', description: 'Electrical and electronic engineering' },
        { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '4 years', description: 'Mechanical engineering' },
      ],
    },
    {
      name: 'Durham University Business School',
      description: 'Durham Business School is triple-accredited and highly ranked.',
      courses: [
        { name: 'BSc Business Management', degree: 'Bachelor', duration: '3 years', description: 'Management degree' },
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Full-time MBA' },
        { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Corporate finance' },
        { name: 'MSc Management', degree: 'Master', duration: '1 year', description: 'Management for non-business graduates' },
      ],
    },
    {
      name: 'Durham Law School',
      description: 'Durham Law is ranked among the top in the UK.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '3 years', description: 'Qualifying law degree' },
        { name: 'LLM International Trade and Commercial Law', degree: 'Master', duration: '1 year', description: 'International commercial law' },
        { name: 'LLM European Trade and Commercial Law', degree: 'Master', duration: '1 year', description: 'European commercial law' },
      ],
    },
    {
      name: 'Department of Physics',
      description: 'Durham Physics is known for astronomy, cosmology, and materials science.',
      courses: [
        { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Comprehensive physics' },
        { name: 'MPhys Physics', degree: 'Master', duration: '4 years', description: 'Extended physics' },
        { name: 'MSc Cosmology and Gravitation', degree: 'Master', duration: '1 year', description: 'Cosmology and general relativity' },
      ],
    },
    {
      name: 'Department of Mathematics',
      description: 'Durham Mathematics is highly ranked for pure and applied math.',
      courses: [
        { name: 'BSc Mathematics', degree: 'Bachelor', duration: '3 years', description: 'Pure and applied mathematics' },
        { name: 'MMath Mathematics', degree: 'Master', duration: '4 years', description: 'Extended mathematics' },
        { name: 'MSc Mathematical Sciences', degree: 'Master', duration: '1 year', description: 'Advanced mathematical topics' },
      ],
    },
    {
      name: 'Durham Medical School',
      description: 'Durham Medical School with strong clinical training.',
      courses: [
        { name: 'MBBS Medicine', degree: 'Bachelor', duration: '5 years', description: 'Medicine program' },
        { name: 'BSc Medical Sciences', degree: 'Bachelor', duration: '3 years', description: 'Pre-clinical sciences' },
      ],
    },
  ]);

  // ============================================================
  // 12. KING'S COLLEGE LONDON (KCL)
  // ============================================================
  await addUniversity('uni-uk-011', "King's College London (KCL)", 'United Kingdom', 'London', 'https://www.kcl.ac.uk', [
    {
      name: 'Department of Informatics',
      description: 'KCL Informatics is one of the largest in the UK, known for AI and cybersecurity.',
      courses: [
        { name: 'BSc Computer Science', degree: 'Bachelor', duration: '3 years', description: 'Core CS degree' },
        { name: 'MEng Computer Science', degree: 'Master', duration: '4 years', description: 'Integrated masters' },
        { name: 'MSc Advanced Computing', degree: 'Master', duration: '1 year', description: 'Advanced computing' },
        { name: 'MSc Artificial Intelligence', degree: 'Master', duration: '1 year', description: 'AI and machine learning' },
        { name: 'MSc Cybersecurity', degree: 'Master', duration: '1 year', description: 'Security engineering' },
        { name: 'MSc Data Science', degree: 'Master', duration: '1 year', description: 'Big data analytics' },
      ],
    },
    {
      name: 'Dickson Poon School of Law',
      description: 'KCL Law is ranked among the top in the UK and internationally.',
      courses: [
        { name: 'LLB Law', degree: 'Bachelor', duration: '3 years', description: 'Qualifying law degree' },
        { name: 'LLM International Commercial Law', degree: 'Master', duration: '1 year', description: 'International trade law' },
        { name: 'LLM International Human Rights Law', degree: 'Master', duration: '1 year', description: 'International human rights' },
        { name: 'LLM European Law', degree: 'Master', duration: '1 year', description: 'European legal systems' },
      ],
    },
    {
      name: 'King\'s Business School',
      description: 'KCL Business School is one of the newest but fastest-growing in the UK.',
      courses: [
        { name: 'BSc Business Management', degree: 'Bachelor', duration: '3 years', description: 'Management degree' },
        { name: 'MBA', degree: 'Master', duration: '1 year', description: 'Full-time MBA' },
        { name: 'MSc Finance', degree: 'Master', duration: '1 year', description: 'Corporate finance and management' },
        { name: 'MSc International Management', degree: 'Master', duration: '1 year', description: 'Global management' },
        { name: 'MSc Digital Marketing', degree: 'Master', duration: '1 year', description: 'Digital marketing strategy' },
      ],
    },
    {
      name: 'Faculty of Natural, Mathematical & Engineering Sciences',
      description: 'KCL sciences — covering physics, chemistry, math, and engineering.',
      courses: [
        { name: 'MEng Mechanical Engineering', degree: 'Master', duration: '4 years', description: 'Mechanical engineering' },
        { name: 'MEng Electronic Engineering', degree: 'Master', duration: '4 years', description: 'Electronic and electrical engineering' },
        { name: 'BSc Physics', degree: 'Bachelor', duration: '3 years', description: 'Physics degree' },
        { name: 'MSc Mathematical Sciences', degree: 'Master', duration: '1 year', description: 'Advanced math' },
      ],
    },
    {
      name: 'Kings\'s College London Medical School',
      description: 'KCL Medical School — one of the largest in Europe.',
      courses: [
        { name: 'MBBS Medicine', degree: 'Bachelor', duration: '5 years', description: 'Medicine program' },
        { name: 'MBBS Graduate Entry Medicine', degree: 'Bachelor', duration: '4 years', description: 'Graduate entry medicine' },
        { name: 'MSc Clinical Neuroscience', degree: 'Master', duration: '1 year', description: 'Neurological sciences' },
        { name: 'MSc Global Mental Health', degree: 'Master', duration: '1 year', description: 'Mental health policy and practice' },
      ],
    },
    {
      name: 'Department of Digital Humanities',
      description: 'KCL unique department bridging computing and humanities.',
      courses: [
        { name: 'MA Digital Culture & Society', degree: 'Master', duration: '1 year', description: 'Digital culture and society' },
        { name: 'MA Digital Asset & Media Management', degree: 'Master', duration: '1 year', description: 'Digital media management' },
        { name: 'MA Big Data in Culture & Society', degree: 'Master', duration: '1 year', description: 'Big data in humanities and social science' },
      ],
    },
    {
      name: 'Florence Nightingale Faculty of Nursing & Midwifery',
      description: 'KCL Nursing — the oldest nursing school in the world.',
      courses: [
        { name: 'BSc Nursing', degree: 'Bachelor', duration: '3 years', description: 'Adult, child, or mental health nursing' },
        { name: 'MSc Advanced Clinical Practice', degree: 'Master', duration: '2 years', description: 'Advanced clinical practice' },
      ],
    },
  ]);

  console.log('\nDone! Top 12 UK universities seeded with real departments and programs.');
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
