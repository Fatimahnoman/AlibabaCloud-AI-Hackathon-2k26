import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils';
import { requireAuth } from '@/lib/auth-middleware';
import { getAIProvider, isAIConfigured, SYSTEM_PROMPTS } from '@/services/ai';

interface RoadmapStep {
  step: number;
  title: string;
  description: string;
  timeframe: string;
  tasks: string[];
  milestone: string;
}

function getDegreeSpecificTasks(targetDegree: string, fieldLabel: string): { entranceTests: string[]; prepTasks: string[]; careerTasks: string[] } {
  const td = targetDegree.toLowerCase();
  
  // Medical (MBBS, BDS)
  if (td.includes('mbbs') || td.includes('bds') || td.includes('medicine') || td.includes('medical')) {
    return {
      entranceTests: ['Register and prepare for MDCAT (Medical College Admission Test)', 'Take NMDCAT practice tests — aim for 85%+ score', 'Prepare Biology, Chemistry, Physics, English sections'],
      prepTasks: ['Shadow a doctor at a hospital for 1-2 weeks to confirm your interest', 'Review FSc Pre-Medical subjects thoroughly — they are your foundation', 'Read about current medical research in your field of interest'],
      careerTasks: ['Register with PMDC/PMC after enrollment', 'Plan house job rotations for clinical exposure'],
    };
  }
  // Pharmacy (Pharm-D)
  if (td.includes('pharm') || td.includes('pharmacy')) {
    return {
      entranceTests: ['Check if target university requires entry test (most Pharm-D programs do)', 'Prepare Chemistry and Biology sections thoroughly', 'Take practice tests for pharmacy aptitude'],
      prepTasks: ['Visit a pharmacy or pharmaceutical company to understand the field', 'Review FSc Pre-Medical or ICS subjects — especially Chemistry', 'Research Pharm-D licensing requirements by Pharmacy Council of Pakistan'],
      careerTasks: ['Plan for pharmacy internship during final year', 'Research drug regulatory authority (DRAP) licensing process'],
    };
  }
  // Engineering (BSc/BS Engineering)
  if (td.includes('engineering') || td.includes('bsc')) {
    return {
      entranceTests: ['Register for ECAT (Engineering College Admission Test)', 'Prepare Mathematics, Physics, Chemistry/CS for ECAT', 'Take 5+ full-length ECAT mock tests under timed conditions'],
      prepTasks: ['Review FSc Pre-Engineering subjects — Mathematics is critical', 'Learn basic programming (Python/MATLAB) before classes start', 'Research which engineering discipline suits your strengths'],
      careerTasks: ['Plan summer internships at engineering firms', 'Join Pakistan Engineering Council (PEC) after graduation'],
    };
  }
  // Computer Science / IT
  if (td.includes('computer') || td.includes('it') || td.includes('software') || td.includes('data') || td.includes('ai')) {
    return {
      entranceTests: ['Check university-specific entry tests (FAST, NUST, COMSATS each have their own)', 'Prepare Mathematics and logical reasoning sections', 'Some universities require NTS/GAT — check requirements'],
      prepTasks: ['Start learning Python or Java — build 2-3 small projects', 'Create a GitHub account and push your first project', 'Study discrete mathematics basics — it is foundational for CS'],
      careerTasks: ['Build a portfolio of 5+ coding projects on GitHub', 'Participate in programming contests (ICPC, Hackerrank)', 'Plan internships at tech companies from 3rd semester onwards'],
    };
  }
  // Business (BBA, MBA)
  if (td.includes('bba') || td.includes('mba') || td.includes('business')) {
    return {
      entranceTests: ['Prepare for university entry tests (IBA, NUST, LUMS each have their own)', 'Practice quantitative aptitude and verbal sections', 'For MBA: prepare for GMAT if targeting international programs'],
      prepTasks: ['Read business news daily (Dawn Business, Bloomberg, Economist)', 'Take a free online course in accounting or finance fundamentals', 'Develop Excel skills — they are essential for business programs'],
      careerTasks: ['Plan summer internships at companies in your field of interest', 'Build a professional LinkedIn profile', 'Join business case competition teams'],
    };
  }
  // Law (LLB)
  if (td.includes('llb') || td.includes('law')) {
    return {
      entranceTests: ['Prepare for LAT (Law Admission Test) by HEC', 'Practice legal reasoning, English, and general knowledge sections', 'Review current affairs and Pakistan studies'],
      prepTasks: ['Read Pakistani constitution and basic legal frameworks', 'Follow major legal news and Supreme Court decisions', 'Practice analytical writing and argumentation'],
      careerTasks: ['Plan to join a law chamber for apprenticeship during studies', 'Prepare for bar council examination after LLB'],
    };
  }
  // PhD
  if (td.includes('phd') || td.includes('doctorate')) {
    return {
      entranceTests: ['Prepare research proposal in your specific area of interest', 'Contact potential supervisors at target universities — email them your CV and proposal', 'Prepare for GRE if required (most PhD programs abroad require it)'],
      prepTasks: ['Publish at least 1-2 research papers in recognized journals', 'Read 20+ recent papers in your research area', 'Identify 3-5 potential supervisors and study their recent work'],
      careerTasks: ['Apply for HEC Indigenous/Overseas PhD scholarships', 'Plan for postdoctoral opportunities if targeting academia'],
    };
  }
  // MPhil / MS
  if (td.includes('mphil') || td.includes('ms') || td.includes('master')) {
    return {
      entranceTests: ['Check if GAT (Graduate Assessment Test) is required by target programs', 'Prepare for university-specific entry tests', 'For international: prepare GRE/IELTS as needed'],
      prepTasks: ['Identify your research interests and read recent literature', 'Contact potential thesis supervisors before applying', 'Review your BS/undergraduate final year project — it may lead to thesis topic'],
      careerTasks: ['Plan to publish at least 1 research paper during your program', 'Consider whether you want to continue to PhD after this'],
    };
  }
  // Default
  return {
    entranceTests: ['Check entry test requirements for each target program', 'Register for required tests well before deadlines', 'Take practice tests and aim to exceed minimum requirements'],
    prepTasks: [`Review foundational subjects relevant to ${fieldLabel}`, 'Connect with current students or alumni for insider tips', 'Research career paths after this degree'],
    careerTasks: ['Plan internships or practical experience during the program', 'Build a professional network in your field'],
  };
}

function getDegreeDuration(targetDegree: string): { years: number; type: string } {
  const td = targetDegree.toLowerCase();

  // === Intermediate (2 years) ===
  if (td.includes('fsc') || td.includes('ics') || td.includes('i.com') || td === 'fa' || td.startsWith('fa ')) {
    return { years: 2, type: 'intermediate' };
  }
  if (td.includes('dae')) return { years: 3, type: 'dae' };

  // === Medical ===
  if (td.includes('mbbs')) return { years: 6, type: 'medical' }; // 5 yrs + 1 yr house job
  if (td.includes('bds')) return { years: 4, type: 'dental' };
  if (td.includes('dpt') || td.includes('physical therapy')) return { years: 5, type: 'dpt' };
  if (td.includes('fcps') || td.includes('mcps')) return { years: 5, type: 'fcps' };
  if (td.includes('md') && !td.includes('pharm')) return { years: 5, type: 'md' };

  // === Pharmacy ===
  if (td.includes('pharm')) return { years: 5, type: 'pharmacy' };

  // === Law ===
  if (td.includes('llb') || td.includes('law')) return { years: 5, type: 'law' };
  if (td.includes('llm')) return { years: 2, type: 'masters' };

  // === Architecture / Planning ===
  if (td.includes('barch') || td.includes('architecture')) return { years: 5, type: 'barch' };
  if (td.includes('bpl') || td.includes('planning')) return { years: 4, type: 'bachelors' };

  // === Education / Design ===
  if (td.includes('bed') || td.includes('med') || td.includes('mdes')) return { years: 2, type: 'masters' };
  if (td.includes('bdes') || td.includes('design')) return { years: 4, type: 'bachelors' };

  // === Short degrees ===
  if (td.includes('adp') || td.includes('associate')) return { years: 2, type: 'diploma' };
  if ((td.includes('ba') && td.includes('bsc')) || td.includes('bcom')) return { years: 2, type: 'bachelors_short' };

  // === Postgraduate ===
  if (td.includes('phd') || td.includes('doctorate')) return { years: 4, type: 'phd' };
  if (td.includes('postdoc')) return { years: 2, type: 'postdoc' };
  if (td.includes('mphil') || td.includes('ms') || td.includes('master') || td.includes('mba') || td.includes('mcom')) {
    return { years: 2, type: 'masters' };
  }

  // === Professional ===
  if (td.includes('diploma')) return { years: 1, type: 'diploma' };
  if (td.includes('certificate')) return { years: 1, type: 'certificate' };

  // === Default: BS/BBA/Engineering = 4 years ===
  return { years: 4, type: 'bachelors' };
}

function getSemesterCourses(type: string, year: number, _fieldLabel: string): { courses: string[]; skills: string[]; milestone: string } {
  const courseMap: Record<string, Record<number, { courses: string[]; skills: string[]; milestone: string }>> = {
    bachelors: {
      1: { courses: ['Programming Fundamentals', 'Calculus & Analytical Geometry', 'Discrete Mathematics', 'English Composition', 'Introduction to Computing'], skills: ['Learn Git & GitHub basics', 'Build first CLI project', 'Join coding communities'], milestone: 'GPA ≥ 3.0 with solid programming fundamentals' },
      2: { courses: ['Data Structures & Algorithms', 'Object-Oriented Programming', 'Digital Logic Design', 'Linear Algebra', 'Probability & Statistics'], skills: ['Solve 100+ LeetCode problems', 'Build a web application', 'Participate in first hackathon'], milestone: 'Strong DSA skills + first project on GitHub' },
      3: { courses: ['Database Systems', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'Technical Writing'], skills: ['Build a full-stack project with database', 'Learn Docker basics', 'Apply for first summer internship'], milestone: 'Internship secured + 3+ projects on GitHub' },
      4: { courses: ['Artificial Intelligence', 'Web Development', 'Mobile App Development', 'Information Security', 'Professional Practices'], skills: ['Contribute to open source', 'Build portfolio website', 'Prepare for job interviews'], milestone: 'Internship completed + job-ready portfolio' },
    },
    medical: {
      1: { courses: ['Human Anatomy', 'Human Physiology', 'Biochemistry', 'Medical Ethics', 'Community Health'], skills: ['Hospital observation visits', 'Clinical note-taking', 'Basic patient interaction'], milestone: 'Pass all 5 subjects with ≥ 70%' },
      2: { courses: ['Pathology', 'Pharmacology', 'Microbiology', 'Forensic Medicine', 'Behavioral Sciences'], skills: ['Lab rotation practice', 'Case study analysis', 'Research methodology basics'], milestone: 'Pass all subjects + first clinical exposure' },
      3: { courses: ['Internal Medicine', 'General Surgery', 'Pediatrics', 'Obstetrics & Gynecology', 'Cardiology Basics'], skills: ['Ward rounds participation', 'Patient history taking', 'Basic clinical procedures'], milestone: 'Clinical rotations completed successfully' },
      4: { courses: ['Advanced Medicine', 'Advanced Surgery', 'Orthopedics', 'Dermatology', 'Radiology'], skills: ['Assist in minor procedures', 'Case presentation skills', 'Research paper writing'], milestone: 'Pass all clinical subjects + research paper submitted' },
      5: { courses: ['Elective Rotations', 'Advanced Pediatrics', 'Psychiatry', 'ENT', 'Ophthalmology'], skills: ['Independent patient management', 'Final year project defense', 'PMDC/PMC registration prep'], milestone: 'MBBS degree awarded + PMDC registration' },
    },
    pharmacy: {
      1: { courses: ['Pharmaceutical Chemistry', 'Human Anatomy', 'Pharmaceutics Basics', 'Mathematics for Pharmacy', 'Introduction to Pharmacy'], skills: ['Lab safety protocols', 'Basic compounding', 'Drug classification basics'], milestone: 'Pass all Prof-I subjects' },
      2: { courses: ['Pharmacology', 'Medicinal Chemistry', 'Pharmaceutical Microbiology', 'Biopharmaceutics', 'Clinical Pharmacy'], skills: ['Drug interaction analysis', 'Prescription review', 'Hospital pharmacy visit'], milestone: 'Pass all Prof-II subjects' },
      3: { courses: ['Advanced Pharmacology', 'Pharmaceutical Technology', 'Pharmacognosy', 'Biochemistry', 'Hospital Pharmacy Practice'], skills: ['Research methodology', 'Drug formulation basics', 'Industry internship'], milestone: 'Summer internship at pharmaceutical company' },
      4: { courses: ['Clinical Pharmacokinetics', 'Drug Regulatory Affairs', 'Pharmacy Management', 'Therapeutics', 'Pharmaceutical Biotechnology'], skills: ['DRAP licensing prep', 'Thesis research', 'Industry project'], milestone: 'Pass all Prof-IV subjects + thesis submitted' },
      5: { courses: ['Advanced Therapeutics', 'Community Pharmacy Practice', 'Pharmaceutical Economics', 'Clinical Rotations', 'Final Year Project'], skills: ['Independent prescription handling', 'Patient counseling', 'DRAP registration'], milestone: 'Pharm-D degree awarded + DRAP registration' },
    },
    law: {
      1: { courses: ['Legal Methods', 'Law of Contract', 'English Legal Writing', 'Pakistan Studies', 'Introduction to Law'], skills: ['Legal research basics', 'Case analysis', 'Moot court participation'], milestone: 'Pass all Year 1 subjects with ≥ 60%' },
      2: { courses: ['Constitutional Law', 'Criminal Law', 'Law of Torts', 'Islamic Law', 'Legal Research Methods'], skills: ['Draft legal documents', 'Court visits', 'Moot court competitions'], milestone: 'First moot court competition participated' },
      3: { courses: ['Civil Procedure Code', 'Criminal Procedure Code', 'Law of Evidence', 'Family Law', 'Property Law'], skills: ['Case filing practice', 'Legal argumentation', 'Internship at law chamber'], milestone: 'Law chamber internship completed' },
      4: { courses: ['Corporate Law', 'Tax Law', 'Environmental Law', 'International Law', 'Human Rights Law'], skills: ['Legal drafting advanced', 'Client counseling', 'Bar council prep'], milestone: 'All professional subjects passed' },
      5: { courses: ['Equity & Trusts', 'Administrative Law', 'Banking Law', 'Clinical Legal Education', 'Final Dissertation'], skills: ['Bar council exam prep', 'Independent case handling', 'Law chamber apprenticeship'], milestone: 'LLB degree awarded + Bar Council enrollment' },
    },
    masters: {
      1: { courses: ['Advanced Research Methods', 'Core Subject Seminar', 'Elective 1', 'Elective 2', 'Research Methodology'], skills: ['Literature review', 'Research proposal writing', 'Data analysis tools'], milestone: 'Thesis proposal approved' },
      2: { courses: ['Thesis Research', 'Advanced Seminar', 'Elective 3', 'Academic Writing', 'Defense Preparation'], skills: ['Data collection & analysis', 'Paper writing', 'Conference presentation'], milestone: 'Thesis defended + degree awarded' },
    },
    phd: {
      1: { courses: ['Advanced Research Methodology', 'Literature Review Seminar', 'Teaching Assistantship', 'Elective Coursework'], skills: ['Research gap identification', 'Publication writing', 'Conference submission'], milestone: 'Comprehensive exam passed + proposal defended' },
      2: { courses: ['Doctoral Research', 'Data Collection', 'Research Paper Writing', 'Conference Presentations'], skills: ['Independent research', 'Peer review', 'Grant writing'], milestone: '2 research papers published in HEC-recognized journals' },
      3: { courses: ['Doctoral Research Continuation', 'Advanced Data Analysis', 'Thesis Writing'], skills: ['Thesis chapter writing', 'Academic networking', 'Job market preparation'], milestone: 'Thesis chapters drafted + 3rd paper submitted' },
      4: { courses: ['Final Thesis Writing', 'Defense Preparation', 'Academic Job Applications'], skills: ['Thesis defense presentation', 'Postdoc applications', 'Career planning'], milestone: 'PhD awarded + academic position secured' },
    },
    diploma: {
      1: { courses: ['Foundation Course', 'Core Subject 1', 'Core Subject 2', 'Practical Lab', 'Communication Skills'], skills: ['Basic industry tools', 'Project work', 'Portfolio building'], milestone: 'Pass Semester 1 with ≥ 65%' },
      2: { courses: ['Advanced Subject', 'Core Subject 3', 'Industry Project', 'Internship', 'Final Presentation'], skills: ['Industry-ready skills', 'Job interview prep', 'Portfolio completion'], milestone: 'Diploma awarded + internship certificate' },
    },
    certificate: {
      1: { courses: ['Core Module 1', 'Core Module 2', 'Practical Assignment', 'Industry Project', 'Final Assessment'], skills: ['Hands-on practice', 'Portfolio piece', 'Certification prep'], milestone: 'Certificate awarded with distinction' },
    },
    intermediate: {
      1: { courses: ['English', 'Urdu', 'Islamic Studies / Ethics', 'Computer Science (Programming Fundamentals, C/C++)', 'Mathematics'], skills: ['Build strong study habits', 'Practice past papers', 'Learn basic programming on your own'], milestone: 'Pass 1st year with ≥ 60% marks' },
      2: { courses: ['English', 'Urdu', 'Pakistan Studies', 'Computer Science (Data Structures, OOP)', 'Mathematics / Statistics'], skills: ['Entry test preparation for university admission', 'University research and shortlisting', 'Career path selection and counseling'], milestone: 'Pass 2nd year + entry test registration for BS/University' },
    },
    dental: {
      1: { courses: ['Human Anatomy', 'Human Physiology', 'Biochemistry', 'Dental Anatomy', 'Introduction to Dentistry'], skills: ['Lab work basics', 'Mannequin practice', 'Hospital visits'], milestone: 'Pass Year 1 with ≥ 65%' },
      2: { courses: ['Oral Pathology', 'Dental Materials', 'Pharmacology', 'Microbiology', 'Community Dentistry'], skills: ['Clinical observation', 'Basic dental procedures practice', 'Research methodology'], milestone: 'Pass Year 2 + clinical rotations begin' },
      3: { courses: ['Operative Dentistry', 'Prosthodontics', 'Oral Surgery Basics', 'Periodontology', 'Orthodontics Basics'], skills: ['Patient handling', 'Clinical procedures', 'Case presentations'], milestone: 'Pass Year 3 + internship rotations' },
      4: { courses: ['Advanced Prosthodontics', 'Pediatric Dentistry', 'Oral Medicine', 'Forensic Dentistry', 'Final Clinical Rotation'], skills: ['Independent patient management', 'Final year project', 'PMDC registration prep'], milestone: 'BDS degree awarded + PMDC registration' },
    },
    dpt: {
      1: { courses: ['Functional Anatomy', 'Exercise Physiology', 'Biomechanics', 'Introduction to Physiotherapy', 'Rehabilitation Basics'], skills: ['Patient interaction basics', 'Manual therapy fundamentals', 'Clinical observation'], milestone: 'Pass Year 1 with ≥ 60%' },
      2: { courses: ['Therapeutic Exercise', 'Electrotherapy', 'Neurophysiology', 'Orthopedics', 'Research Methods'], skills: ['Treatment planning', 'Clinical assessment', 'Evidence-based practice'], milestone: 'Pass Year 2 + clinical internship begins' },
      3: { courses: ['Sports Physiotherapy', 'Pediatric Physiotherapy', 'Cardiopulmonary PT', 'Geriatric Rehabilitation', 'Community-Based Rehabilitation'], skills: ['Advanced clinical skills', 'Research project', 'Specialized technique training'], milestone: 'Pass Year 3 + specialized rotation complete' },
      4: { courses: ['Advanced Orthopedics', 'Women’s Health PT', 'Occupational Health', 'Professional Ethics', 'Clinical Internship'], skills: ['Independent practice readiness', 'Final year research', 'Job placement prep'], milestone: 'Pass Year 4 + clinical competency assessed' },
      5: { courses: ['Advanced Clinical Practice', 'Final Year Project', 'Comprehensive Internship', 'Professional Development', 'DPT Defense'], skills: ['Independent patient management', 'Research presentation', 'PMDC/registration'], milestone: 'DPT degree awarded + professional registration' },
    },
    barch: {
      1: { courses: ['Design Studio 1', 'Architectural History', 'Mathematics for Architecture', 'Visual Communication', 'Introduction to Structures'], skills: ['Sketching & drafting', 'AutoCAD basics', 'Design thinking'], milestone: 'Pass Studio 1 + design portfolio started' },
      2: { courses: ['Design Studio 2', 'Building Materials', 'Environmental Studies', 'Structural Mechanics', 'History of Architecture II'], skills: ['3D modeling (SketchUp/Revit)', 'Site visits', 'Design competition'], milestone: 'Pass Year 2 + portfolio with 5+ projects' },
      3: { courses: ['Design Studio 3', 'Building Services', 'Architectural Technology', 'Urban Design Basics', 'Professional Practice'], skills: ['Advanced BIM modeling', 'Internship at architecture firm', 'Sustainable design'], milestone: 'Summer internship completed + design award' },
      4: { courses: ['Design Studio 4', 'Advanced Structures', 'Landscape Architecture', 'Building Economics', 'Energy-Efficient Design'], skills: ['Complex project design', 'Competition entries', 'Research paper'], milestone: 'Pass Year 4 + thesis topic approved' },
      5: { courses: ['Design Thesis Studio', 'Advanced Urban Design', 'Professional Practice II', 'Final Design Project', 'Thesis Defense'], skills: ['Independent design practice', 'Thesis publication', 'PCATP registration prep'], milestone: 'BArch degree awarded + thesis published' },
    },
    dae: {
      1: { courses: ['Applied Physics', 'Applied Mathematics', 'Applied Chemistry', 'Technical Drawing', 'Workshop Practice'], skills: ['Technical tools handling', 'Safety protocols', 'Basic workshop skills'], milestone: 'Pass Semester 1 with ≥ 60%' },
      2: { courses: ['Core Technical Subject 1', 'Core Technical Subject 2', 'Electrical/Electronics Basics', 'Computer Applications', 'Lab Work'], skills: ['Industry-standard tools', 'Project work', 'Technical documentation'], milestone: 'Pass Year 1 + lab competency assessed' },
      3: { courses: ['Advanced Technical Subject', 'Industrial Training', 'Final Year Project', 'Professional Practices', 'Comprehensive Viva'], skills: ['Industry internship', 'Project defense', 'Job placement prep'], milestone: 'DAE awarded + internship certificate' },
    },
    bachelors_short: {
      1: { courses: ['English', 'Core Subject 1', 'Core Subject 2', 'Elective 1', 'Computer Basics'], skills: ['Build study habits', 'Join academic societies', 'Basic research skills'], milestone: 'Pass Year 1 with ≥ 55%' },
      2: { courses: ['Core Subject 3', 'Core Subject 4', 'Elective 2', 'Research Project', 'Career Preparation'], skills: ['Internship or job prep', 'Final project', 'Professional networking'], milestone: 'Degree awarded + career placement' },
    },
    md: {
      1: { courses: ['Advanced Clinical Medicine', 'Medical Research Methods', 'Specialty Rotation 1', 'Teaching Practice', 'Medical Ethics'], skills: ['Independent clinical decision-making', 'Research methodology', 'Teaching juniors'], milestone: 'Pass Year 1 + research topic approved' },
      2: { courses: ['Specialty Rotation 2', 'Advanced Diagnostics', 'Clinical Audit', 'Case Presentations', 'Thesis Work'], skills: ['Advanced procedures', 'Publication writing', 'Conference presentation'], milestone: 'Pass Year 2 + first paper submitted' },
      3: { courses: ['Specialty Rotation 3', 'Advanced Therapeutics', 'Clinical Teaching', 'Research Paper Writing', 'Thesis Progress'], skills: ['Leadership in clinical team', 'Peer review', 'Grant applications'], milestone: 'Pass Year 3 + thesis chapters drafted' },
      4: { courses: ['Final Specialty Rotation', 'Advanced Clinical Practice', 'Thesis Completion', 'Defense Preparation', 'Career Planning'], skills: ['Independent practice', 'Thesis defense', 'Fellowship applications'], milestone: 'Pass Year 4 + MD thesis defended' },
      5: { courses: ['Clinical Fellowship', 'Advanced Research', 'Final Thesis Submission', 'Board Preparation', 'Professional Development'], skills: ['Board exam preparation', 'Publication completion', 'Career establishment'], milestone: 'MD degree awarded + specialist registration' },
    },
    fcps: {
      1: { courses: ['Foundation Module', 'Basic Medical Sciences Review', 'Clinical Skills Assessment', 'Research Methodology', 'Ethics & Professionalism'], skills: ['FCPS Part 1 prep', 'Logbook maintenance', 'Clinical audit'], milestone: 'FCPS Part 1 passed' },
      2: { courses: ['Specialty Training Year 1', 'Clinical Rotations', 'Research Project', 'Teaching Responsibilities', 'Case Logs'], skills: ['Specialized clinical skills', 'Supervised practice', 'Research writing'], milestone: 'Training Year 1 completed + 50 cases logged' },
      3: { courses: ['Specialty Training Year 2', 'Advanced Clinical Practice', 'Research Continuation', 'Teaching & Supervision', 'Conference Participation'], skills: ['Independent specialty practice', 'Paper publication', 'Mentoring juniors'], milestone: 'Training Year 2 completed + paper published' },
      4: { courses: ['Specialty Training Year 3', 'Sub-specialty Rotation', 'Advanced Research', 'Quality Improvement Project', 'FCPS Part 2 Prep'], skills: ['Sub-specialty expertise', 'Quality assurance', 'FCPS Part 2 preparation'], milestone: 'FCPS Part 2 written passed' },
      5: { courses: ['Final Specialty Year', 'Sub-specialty Fellowship', 'Thesis Submission', 'FCPS Part 2 Clinical', 'Professional Practice'], skills: ['Independent practice', 'Thesis defense', 'Specialist registration'], milestone: 'FCPS awarded + specialist registration with PMDC' },
    },
    postdoc: {
      1: { courses: ['Advanced Research Project', 'Clinical or Academic Fellowship', 'Publication Writing', 'Grant Applications', 'Conference Keynote'], skills: ['Independent research leadership', 'Mentoring PhD students', 'International collaboration'], milestone: 'Research project completed + 2 papers published' },
      2: { courses: ['Research Continuation', 'Academic Leadership', 'Advanced Publication', 'Career Transition Planning', 'Final Report'], skills: ['Faculty position applications', 'Research group leadership', 'Professional network expansion'], milestone: 'Postdoc fellowship completed + academic position secured' },
    },
  };

  const degreeCourses = courseMap[type] || courseMap.bachelors;
  return degreeCourses[year] || { courses: [`Year ${year} core courses`], skills: ['Build relevant projects', 'Maintain strong GPA'], milestone: `Pass Year ${year} with strong grades` };
}

function buildFallbackRoadmap(currentEducation: string, targetDegree: string, field?: string | null, country?: string | null): RoadmapStep[] {
  const fieldLabel = field || 'your chosen field';
  const isInternational = !!country && country.trim().length > 0;
  const specific = getDegreeSpecificTasks(targetDegree, fieldLabel);
  const degreeInfoEarly = getDegreeDuration(targetDegree);
  const isIntermediate = degreeInfoEarly.type === 'intermediate';

  // For intermediate programs (ICS, FSc, FA, ICom), use a simplified roadmap
  if (isIntermediate) {
    const steps: RoadmapStep[] = [
      {
        step: 1,
        title: 'College Admission & Enrollment',
        description: `Secure admission in a good college for ${targetDegree}. Focus on merit-based entry and choosing a college with strong ${fieldLabel} results.`,
        timeframe: 'Month 1-2',
        tasks: [
          `Research and shortlist 3-5 colleges offering ${targetDegree} in ${country || 'your area'}`,
          'Check admission merit requirements and deadlines',
          'Submit admission forms with Matric marks and documents',
          'Attend counseling if required',
        ],
        milestone: `Admission confirmed in a college for ${targetDegree}`,
      },
      {
        step: 2,
        title: 'Year 1 — Foundation Studies',
        description: `First year of ${targetDegree}. Build strong fundamentals in core subjects. Keep your GPA high from the start — it matters for university admissions later.`,
        timeframe: 'Year 1 (Months 3-14)',
        tasks: [
          ...getSemesterCourses('intermediate', 1, fieldLabel).courses.map(c => `Study and pass: ${c}`),
          ...getSemesterCourses('intermediate', 1, fieldLabel).skills,
        ],
        milestone: getSemesterCourses('intermediate', 1, fieldLabel).milestone,
      },
      {
        step: 3,
        title: 'Year 2 — Advanced Studies & University Prep',
        description: `Second year of ${targetDegree}. Maintain strong grades while preparing for university entry tests. This is your launchpad for BS/University admission.`,
        timeframe: 'Year 2 (Months 15-26)',
        tasks: [
          ...getSemesterCourses('intermediate', 2, fieldLabel).courses.map(c => `Study and pass: ${c}`),
          ...getSemesterCourses('intermediate', 2, fieldLabel).skills,
          'Research universities and entry test requirements (ECAT, NTS, SAT)',
        ],
        milestone: getSemesterCourses('intermediate', 2, fieldLabel).milestone,
      },
      {
        step: 4,
        title: 'Next Step — University Admission or Career',
        description: `With your ${targetDegree} complete, apply for BS/University programs or explore career options. Your intermediate marks and entry test scores determine your university options.`,
        timeframe: 'Months 27-30',
        tasks: [
          'Apply to universities for BS/Bachelor programs',
          'Prepare and take university entry tests',
          'Explore scholarship opportunities for BS programs',
          ...(fieldLabel !== 'your chosen field' ? [`Focus on ${fieldLabel} programs at top universities`] : []),
        ],
        milestone: 'University admission confirmed or career path started',
      },
    ];
    return steps;
  }

  const baseSteps: RoadmapStep[] = [
    {
      step: 1,
      title: 'Audit Your Foundation',
      description: `You're moving from ${currentEducation} to a ${targetDegree} in ${fieldLabel}. Before anything else, be honest about where you stand. What do you already know? What's missing? This audit will save you months of wasted effort.`,
      timeframe: 'Week 1-2',
      tasks: [
        `List all courses/subjects from your ${currentEducation} and map them to ${targetDegree} prerequisites`,
        'Identify 3-5 skill gaps that need addressing before applications',
        'Research entry requirements for 5+ target programs',
        'Talk to 2-3 people who are already in a similar program',
        ...specific.prepTasks.slice(0, 1),
      ],
      milestone: 'A written gap analysis document with clear strengths and weaknesses',
    },
    {
      step: 2,
      title: 'Shortlist Programs Like a Pro',
      description: `Don't apply everywhere — that's a waste of money and energy. Pick 5-8 programs that actually match your goals, budget, and profile. Research each one deeply. Curriculum, faculty, placement rates, alumni network — all of it matters.`,
      timeframe: 'Week 3-6',
      tasks: [
        'Create a comparison spreadsheet with 5-8 programs (tuition, ranking, deadline, requirements)',
        'Attend virtual open days or contact admissions offices directly',
        'Check program accreditation and HEC recognition (for Pakistan)',
        'Review alumni career outcomes and placement statistics',
      ],
      milestone: 'A ranked shortlist of 5-8 programs with application deadlines marked on your calendar',
    },
    {
      step: 3,
      title: 'Crush the Entrance Tests',
      description: `This is where most students lose. Don't be one of them. Register early, prepare smart, and aim to finish all tests well before deadlines.`,
      timeframe: 'Month 2-4',
      tasks: [
        ...specific.entranceTests,
        'Take a diagnostic test to identify your baseline score',
        'Create a daily study plan (2-3 hours) for test prep',
        'Complete 3-5 full mock tests under timed conditions',
        ...(isInternational ? ['Register for IELTS/TOEFL at least 2 months before target test date'] : []),
      ],
      milestone: 'Official test scores that meet or exceed your target program requirements',
    },
    {
      step: 4,
      title: 'Build Application Documents That Stand Out',
      description: `Your transcript gets you in the door. Your personal statement gets you admitted. Your recommendation letters seal the deal. Don't rush these — start drafts early, get feedback, revise multiple times.`,
      timeframe: 'Month 3-5',
      tasks: [
        'Request official transcripts and degree certificates from your institution',
        'Write 3 drafts of your personal statement — get feedback from mentors after each',
        'Approach 2-3 professors/employers for recommendation letters (give them 4+ weeks notice)',
        'Update your CV/resume with quantifiable achievements',
        ...specific.prepTasks.slice(1),
      ],
      milestone: 'Final versions of all application documents reviewed by at least 2 people',
    },
    {
      step: 5,
      title: 'Submit Flawless Applications',
      description: `Each application is a sales pitch. Tailor every personal statement to the specific program. Double-check every document. Missing one thing can cost you an admission. Submit early — don't wait until the last day.`,
      timeframe: 'Month 4-6',
      tasks: [
        'Submit applications to all shortlisted programs (aim for 2+ weeks before deadline)',
        'Verify each application has all required documents attached',
        'Track submission status in your spreadsheet',
        'Save confirmation emails and application IDs in one folder',
      ],
      milestone: 'All applications submitted with confirmation receipts saved',
    },
    {
      step: 6,
      title: 'Hunt for Funding & Scholarships',
      description: `Don't wait for offers to think about money. Apply for scholarships NOW — most deadlines are close to or before admission deadlines. Merit-based, need-based, government, private — cast a wide net.`,
      timeframe: 'Month 4-6 (parallel with applications)',
      tasks: [
        'Research and list 10+ scholarships you qualify for (HEC, university-specific, international)',
        'Apply for at least 5 scholarships with tailored applications',
        'Explore education loan options (HBL, Bank Alfalah, government schemes)',
        ...(targetDegree.toLowerCase().includes('phd') ? ['Apply for HEC Overseas Scholarship / Indigenous Scholarship', 'Contact potential supervisors about funded research positions'] : []),
        ...(!targetDegree.toLowerCase().includes('phd') ? ['Look into merit-based fee waivers from target universities'] : []),
      ],
      milestone: 'At least 5 scholarship applications submitted',
    },
    {
      step: 7,
      title: 'Evaluate Offers & Commit',
      description: `When offers come in, don't just pick the most prestigious one. Compare total cost, program quality, location, career outcomes, and gut feeling. This decision shapes your next 2-5 years. Choose wisely.`,
      timeframe: 'Month 6-7',
      tasks: [
        'Compare offers side by side (cost, location, program ranking, career outcomes)',
        'Calculate total cost including living expenses, not just tuition',
        'Accept the best offer and pay any confirmation deposit before the deadline',
        'Decline other offers politely and on time',
      ],
      milestone: 'Offer accepted, deposit paid, enrollment confirmed',
    },
  ];

  if (isInternational) {
    baseSteps.push(
      {
        step: 8,
        title: 'Visa & Immigration — No Mistakes Allowed',
        description: `Visa rejection means all your hard work goes to waste. Prepare a flawless application. Financial proof, acceptance letter, SOP — everything must be airtight. Start early. Embassies take weeks.`,
        timeframe: 'Month 7-8',
        tasks: [
          'Gather all visa documents (acceptance letter, financial proof, passport, photos)',
          'Write a clear Statement of Purpose for the visa interview',
          'Book and attend biometrics/interview appointment',
          'Prepare for common visa interview questions',
        ],
        milestone: 'Student visa approved and passport stamped',
      },
      {
        step: 9,
        title: 'Pre-Departure Logistics',
        description: `Don't show up unprepared. Book flights early, secure housing before you land, arrange health insurance, and connect with seniors or alumni from your program. The first week sets the tone for your entire experience.`,
        timeframe: 'Month 8-9',
        tasks: [
          'Book flights at least 4-6 weeks before your program starts',
          'Secure accommodation (university housing or private — research both)',
          'Arrange health insurance and international SIM card',
          'Connect with current students or alumni for on-ground tips',
        ],
        milestone: 'Flights booked, accommodation confirmed, health insurance active',
      },
    );
  }

  // === FULL DEGREE PROGRAM PHASES ===
  const degreeInfo = getDegreeDuration(targetDegree);
  const degreeType = degreeInfo.type;
  const totalYears = degreeInfo.years;
  const admissionPhaseCount = baseSteps.length;

  // Pre-enrollment phase
  baseSteps.push({
    step: admissionPhaseCount + 1,
    title: 'Enrollment & Orientation',
    description: `Finalize enrollment, pay tuition, and register with the university. Complete orientation, get your student ID, and set up all academic accounts.`,
    timeframe: isInternational ? 'Month 9-10' : 'Month 7-8',
    tasks: [
      `Accept your offer and pay the enrollment deposit`,
      'Upload all required documents (transcripts, CNIC/B-form, photos)',
      'Complete university orientation and join your department society',
      'Set up university email, LMS, and library access',
      ...specific.careerTasks.slice(0, 1),
    ],
    milestone: 'Official enrollment confirmed with student ID',
  });

  // Degree program phases — one per year
  for (let year = 1; year <= totalYears; year++) {
    const semData = getSemesterCourses(degreeType, year, fieldLabel);
    const startMonth = (year - 1) * 12 + 1;
    const endMonth = year * 12;
    const isFinalYear = year === totalYears;

    const tasks = [
      ...semData.courses.map(c => `Study and pass: ${c}`),
      ...semData.skills.slice(0, 2),
    ];

    if (isFinalYear) {
      tasks.push('Complete final year project / thesis', 'Prepare for job applications and interviews');
    } else if (year === 2 || year === 3) {
      tasks.push('Apply for summer internship in your field');
    }

    baseSteps.push({
      step: baseSteps.length + 1,
      title: `Year ${year}${getOrdinalSuffix(year)} — ${getYearTitle(degreeType, year, totalYears)}`,
      description: `${isFinalYear ? 'Final year of your ' + targetDegree + ' program. Focus on your final project/thesis and career launch.' : `Year ${year} of your ${targetDegree}. Build on previous year's foundation with advanced ${fieldLabel} coursework.`}`,
      timeframe: `Year ${year} (Months ${startMonth}-${endMonth})`,
      tasks: tasks.slice(0, 5),
      milestone: semData.milestone,
    });
  }

  // Career launch phase
  baseSteps.push({
    step: baseSteps.length + 1,
    title: 'Career Launch & Professional Growth',
    description: `Your ${targetDegree} is complete! Now transition into your career. Whether it's a job, further studies, or entrepreneurship — this is your launchpad.`,
    timeframe: `Months ${totalYears * 12 + 1}-${totalYears * 12 + 3}`,
    tasks: [
      'Update your CV/LinkedIn with your degree and final project',
      'Apply to 10+ jobs or graduate programs in your field',
      'Attend job fairs and networking events',
      ...specific.careerTasks.slice(1),
    ],
    milestone: 'Job offer received or graduate program admission confirmed',
  });

  return baseSteps.map((s) => s);
}

function getOrdinalSuffix(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function getYearTitle(type: string, year: number, total: number): string {
  if (year === total) return 'Final Year & Career Launch Prep';
  const titles: Record<string, Record<number, string>> = {
    bachelors: { 1: 'Foundation & Core Fundamentals', 2: 'Advanced Core & Skill Building', 3: 'Specialization & Industry Exposure' },
    medical: { 1: 'Pre-Clinical Foundation', 2: 'Para-Clinical Sciences', 3: 'Clinical Rotations Begin', 4: 'Advanced Clinical Practice', 5: 'House Job / Internship Year' },
    dental: { 1: 'Pre-Clinical Foundation', 2: 'Para-Clinical & Dental Sciences', 3: 'Clinical Dentistry Begins' },
    dpt: { 1: 'Foundation & Anatomy', 2: 'Therapeutic Sciences', 3: 'Specialized Physiotherapy', 4: 'Advanced Clinical Practice' },
    pharmacy: { 1: 'Foundation Sciences', 2: 'Pharmaceutical Sciences', 3: 'Clinical Pharmacy & Research', 4: 'Advanced Therapeutics' },
    law: { 1: 'Legal Foundation', 2: 'Substantive Law', 3: 'Procedural Law & Practice', 4: 'Advanced Legal Studies' },
    barch: { 1: 'Design Foundation', 2: 'Building Technology & Design', 3: 'Urban Design & Internship', 4: 'Advanced Design & Research' },
    dae: { 1: 'Applied Sciences Foundation', 2: 'Core Technical Training' },
    masters: { 1: 'Coursework & Research Proposal', 2: 'Thesis Research & Defense' },
    phd: { 1: 'Coursework & Comprehensive Exam', 2: 'Research & Publications', 3: 'Advanced Research & Thesis Writing' },
    md: { 1: 'Clinical Specialization Begins', 2: 'Advanced Diagnostics & Research', 3: 'Therapeutics & Teaching', 4: 'Final Clinical Year' },
    fcps: { 1: 'Foundation & Part 1 Prep', 2: 'Specialty Training Year 1', 3: 'Specialty Training Year 2', 4: 'Sub-specialty & Part 2 Prep' },
    diploma: { 1: 'Foundation Semester', 2: 'Advanced Studies & Industry Project' },
    bachelors_short: { 1: 'Foundation Year' },
    postdoc: { 1: 'Research Leadership' },
    certificate: { 1: 'Intensive Program' },
    intermediate: { 1: 'First Year (HSSC-I)', 2: 'Second Year (HSSC-II)' },
  };
  return (titles[type] || titles.bachelors)[year] || `Core Studies`;
}

function extractJsonArray(content: string): unknown[] | null {
  let text = content.trim();
  text = text.replace(/```(?:json)?/gi, '');
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function normalizeSteps(raw: unknown[]): RoadmapStep[] {
  return raw
    .map((item, index) => {
      if (typeof item !== 'object' || item === null) return null;
      const obj = item as Record<string, unknown>;
      const title = typeof obj.title === 'string' ? obj.title.trim() : '';
      const description = typeof obj.description === 'string' ? obj.description.trim() : '';
      if (!title || !description) return null;
      const stepNumber =
        typeof obj.step === 'number' && Number.isFinite(obj.step) ? Math.floor(obj.step) : index + 1;
      const timeframe = typeof obj.timeframe === 'string' ? obj.timeframe.trim() : '';
      const tasks = Array.isArray(obj.tasks) ? obj.tasks.filter((t): t is string => typeof t === 'string' && t.trim().length > 0).map((t) => t.trim()) : [];
      const milestone = typeof obj.milestone === 'string' ? obj.milestone.trim() : '';
      return { step: stepNumber, title, description, timeframe, tasks, milestone };
    })
    .filter((s): s is RoadmapStep => s !== null);
}

export async function GET(request: NextRequest) {
  try {
    const authResult = requireAuth(request);
    if ('error' in authResult) return authResult.error;

    const { searchParams } = new URL(request.url);
    const currentEducation = searchParams.get('currentEducation');
    const targetDegree = searchParams.get('targetDegree');
    const field = searchParams.get('field');
    const country = searchParams.get('country');

    if (!currentEducation || !targetDegree) {
      return errorResponse('currentEducation and targetDegree are required', 'VALIDATION_ERROR', 400);
    }

    let roadmap: RoadmapStep[] = [];

    if (isAIConfigured()) {
      try {
        const provider = getAIProvider();
        const userPrompt = [
          `Generate an education roadmap as a strict JSON array only, no extra text.`,
          `Each element must be an object with:`,
          `  "step" (integer), "title" (string), "description" (string, 2-3 sentences),`,
          `  "timeframe" (string, e.g. "Month 1-2" or "Year 2, Semester 1 (Months 13-18)"),`,
          `  "tasks" (array of 3-5 specific action strings),`,
          `  "milestone" (string — the one deliverable that proves this phase is done).`,
          ``,
          `CRITICAL: The roadmap must cover the ENTIRE degree journey — NOT just admission.`,
          `Structure it in 3 parts:`,
          `  Part 1: Pre-admission (entrance test prep, applications, scholarships) — 2-3 phases`,
          `  Part 2: Full degree program with semester-by-semester breakdown — this is the MOST important part`,
          `  Part 3: Final year + career launch — 1-2 phases`,
          ``,
          `Degree duration guidelines (MUST follow):`,
          `  - Intermediate (ICS, FSc, ICom, FA, DAE): 2 years = 2 phases (Year 1 and Year 2). Keep it simple — these are college-level programs, NOT university.`,
          `  - BS/BSc (e.g. BS CS, BS IT, Software Engineering): 4 years = 8 semesters. Cover each year separately.`,
          `  - MBBS/BDS: 5 years + 1 year house job. Cover each year separately.`,
          `  - Pharm-D: 5 years. Cover each year separately.`,
          `  - Engineering (BSc Eng): 4 years. Cover each year separately.`,
          `  - BBA: 4 years. Cover each year separately.`,
          `  - LLB: 5 years. Cover each year separately.`,
          `  - MPhil/MS: 2 years. Cover each semester.`,
          `  - PhD: 3-5 years. Cover each year.`,
          `  - Diploma/Associate: 2 years. Cover each semester.`,
          `  - Certificate: 6-12 months. Cover monthly milestones.`,
          ``,
          `IMPORTANT: Match the roadmap length to the program duration:`,
          `  - Intermediate (2 years): Target 4-6 phases TOTAL. Do NOT over-complicate. Focus on: college admission → Year 1 → Year 2 → next step (university admission or job).`,
          `  - BS/Bachelor (4 years): Target 8-10 phases.`,
          `  - MBBS (5+1 years): Target 10-12 phases.`,
          `  - Short programs (diploma, certificate): Target 3-5 phases.`,
          ``,
          `For EACH year/semester of the degree, include:`,
          `  - Specific courses to study (e.g. "Programming Fundamentals", "Data Structures", "Database Systems")`,
          `  - Skills to develop (coding, projects, certifications)`,
          `  - GPA targets and academic goals`,
          `  - Internship/placement preparation if applicable`,
          `  - Year-end milestone`,
          ``,
          `Customize tasks based on the SPECIFIC degree and field:`,
          `- For MBBS/BDS: Include MDCAT/NMDCAT prep, hospital rotations, PMDC registration`,
          `- For Pharm-D: Include Pharmacy Council requirements, DRAP licensing`,
          `- For Engineering: Include ECAT prep, PEC registration`,
          `- For CS/IT/Software: Include programming prep, GitHub portfolio, hackathons, internships at tech companies`,
          `- For BBA/MBA: Include aptitude tests, business case competitions`,
          `- For LLB: Include LAT, bar council exam`,
          `- For PhD: Include research proposal, publications, GRE`,
          ``,
          `Target total phases: Match the program duration (see above). Do NOT generate 10+ phases for a 2-year program.`,
          ``,
          `Current education level: ${currentEducation}`,
          `Target degree: ${targetDegree}`,
          field ? `Field of interest: ${field}` : '',
          country ? `Country preference: ${country}` : '',
        ]
          .filter(Boolean)
          .join('\n');

        const completion = await provider.complete({
          systemPrompt: SYSTEM_PROMPTS.roadmapSystem,
          messages: [{ role: 'user', content: userPrompt }],
          temperature: 0.4,
          maxTokens: 5000,
        });

        const parsed = extractJsonArray(completion.content);
        if (parsed) roadmap = normalizeSteps(parsed);
      } catch (aiError) {
        console.error('AI roadmap generation failed:', aiError);
      }
    }

    if (roadmap.length < 3) {
      roadmap = buildFallbackRoadmap(currentEducation, targetDegree, field, country);
    }

    return successResponse({ roadmap });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to generate roadmap';
    return errorResponse(message, 'ROADMAP_GENERATION_FAILED', 500);
  }
}
