const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const departments = [
  // University of Karachi
  { universityId: 'uni-pk-001', name: 'Computer Science & IT' },
  { universityId: 'uni-pk-001', name: 'Engineering' },
  { universityId: 'uni-pk-001', name: 'Business Administration' },
  { universityId: 'uni-pk-001', name: 'Social Sciences' },
  { universityId: 'uni-pk-001', name: 'Natural Sciences' },
  { universityId: 'uni-pk-001', name: 'Medicine & Surgery (AKU affiliated)' },
  { universityId: 'uni-pk-001', name: 'Pharmacy' },
  { universityId: 'uni-pk-001', name: 'Law' },
  { universityId: 'uni-pk-001', name: 'Education' },
  { universityId: 'uni-pk-001', name: 'Arts & Humanities' },
  { universityId: 'uni-pk-001', name: 'Agriculture' },

  // LUMS
  { universityId: 'uni-pk-lums', name: 'Computer Science' },
  { universityId: 'uni-pk-lums', name: 'Business (SBA)' },
  { universityId: 'uni-pk-lums', name: 'Engineering' },
  { universityId: 'uni-pk-lums', name: 'Law (SLS)' },
  { universityId: 'uni-pk-lums', name: 'Humanities & Social Sciences' },
  { universityId: 'uni-pk-lums', name: 'Education' },
  { universityId: 'uni-pk-lums', name: 'Mathematics' },
  { universityId: 'uni-pk-lums', name: 'Natural Sciences (Physics, Chemistry, Biology)' },
  { universityId: 'uni-pk-lums', name: 'Economics' },
  { universityId: 'uni-pk-lums', name: 'Performing Arts (Music)' },

  // NUST
  { universityId: 'uni-pk-nust', name: 'Computer Science & Software Engineering' },
  { universityId: 'uni-pk-nust', name: 'Electrical Engineering' },
  { universityId: 'uni-pk-nust', name: 'Mechanical Engineering' },
  { universityId: 'uni-pk-nust', name: 'Civil Engineering' },
  { universityId: 'uni-pk-nust', name: 'Business Administration (NBS)' },
  { universityId: 'uni-pk-nust', name: 'Architecture & Design' },
  { universityId: 'uni-pk-nust', name: 'Mathematics' },
  { universityId: 'uni-pk-nust', name: 'Natural Sciences (Physics, Chemistry)' },
  { universityId: 'uni-pk-nust', name: 'Humanities & Social Sciences' },
  { universityId: 'uni-pk-nust', name: 'Naval Architecture & Marine Engineering' },
  { universityId: 'uni-pk-nust', name: 'Aerospace Engineering' },

  // FAST-NUCES
  { universityId: 'uni-pk-fast', name: 'Computer Science' },
  { universityId: 'uni-pk-fast', name: 'Software Engineering' },
  { universityId: 'uni-pk-fast', name: 'Electrical Engineering' },
  { universityId: 'uni-pk-fast', name: 'Business Administration' },
  { universityId: 'uni-pk-fast', name: 'Management Sciences' },
  { universityId: 'uni-pk-fast', name: 'Mathematics' },
  { universityId: 'uni-pk-fast', name: 'Artificial Intelligence' },
  { universityId: 'uni-pk-fast', name: 'Data Science' },

  // IBA Karachi
  { universityId: 'uni-pk-iba', name: 'Computer Science' },
  { universityId: 'uni-pk-iba', name: 'Business Administration' },
  { universityId: 'uni-pk-iba', name: 'Economics & Social Sciences' },
  { universityId: 'uni-pk-iba', name: 'Mathematics' },
  { universityId: 'uni-pk-iba', name: 'Media Studies & Journalism' },
  { universityId: 'uni-pk-iba', name: 'Social Sciences' },

  // UET Lahore
  { universityId: 'uni-pk-uet', name: 'Electrical Engineering' },
  { universityId: 'uni-pk-uet', name: 'Mechanical Engineering' },
  { universityId: 'uni-pk-uet', name: 'Civil Engineering' },
  { universityId: 'uni-pk-uet', name: 'Computer Science & Engineering' },
  { universityId: 'uni-pk-uet', name: 'Architecture & Planning' },
  { universityId: 'uni-pk-uet', name: 'Chemical Engineering' },
  { universityId: 'uni-pk-uet', name: 'Textile Engineering' },
  { universityId: 'uni-pk-uet', name: 'Metallurgy & Materials Engineering' },
  { universityId: 'uni-pk-uet', name: 'Mining Engineering' },
  { universityId: 'uni-pk-uet', name: 'Environmental Engineering' },
  { universityId: 'uni-pk-uet', name: 'Industrial Engineering' },

  // International universities - key ones
  // MIT
  { universityId: 'uni-us-001', name: 'Electrical Engineering & Computer Science' },
  { universityId: 'uni-us-001', name: 'Mechanical Engineering' },
  { universityId: 'uni-us-001', name: 'Physics' },
  { universityId: 'uni-us-001', name: 'Mathematics' },
  { universityId: 'uni-us-001', name: 'Chemistry' },
  { universityId: 'uni-us-001', name: 'Economics' },
  { universityId: 'uni-us-001', name: 'Biological Engineering' },
  { universityId: 'uni-us-001', name: 'Aeronautics & Astronautics' },
  { universityId: 'uni-us-001', name: 'Brain & Cognitive Sciences' },
  { universityId: 'uni-us-001', name: 'Earth, Atmospheric & Planetary Sciences' },
  { universityId: 'uni-us-001', name: 'Materials Science & Engineering' },
  { universityId: 'uni-us-001', name: 'Nuclear Science & Engineering' },
  { universityId: 'uni-us-001', name: 'Civil & Environmental Engineering' },
  { universityId: 'uni-us-001', name: 'Chemical Engineering' },
  { universityId: 'uni-us-001', name: 'Biological Sciences' },

  // Stanford
  { universityId: 'uni-us-002', name: 'Computer Science' },
  { universityId: 'uni-us-002', name: 'Electrical Engineering' },
  { universityId: 'uni-us-002', name: 'Mechanical Engineering' },
  { universityId: 'uni-us-002', name: 'Business (GSB)' },
  { universityId: 'uni-us-002', name: 'Law' },
  { universityId: 'uni-us-002', name: 'Medicine' },
  { universityId: 'uni-us-002', name: 'Humanities & Sciences' },
  { universityId: 'uni-us-002', name: 'Education' },
  { universityId: 'uni-us-002', name: 'Earth, Energy & Environmental Sciences' },
  { universityId: 'uni-us-002', name: 'Bioengineering' },
  { universityId: 'uni-us-002', name: 'Statistics' },
  { universityId: 'uni-us-002', name: 'Management Science & Engineering' },

  // Harvard
  { universityId: 'uni-us-003', name: 'Arts & Sciences' },
  { universityId: 'uni-us-003', name: 'Business (HBS)' },
  { universityId: 'uni-us-003', name: 'Law' },
  { universityId: 'uni-us-003', name: 'Medicine' },
  { universityId: 'uni-us-003', name: 'Engineering & Applied Sciences' },
  { universityId: 'uni-us-003', name: 'Education' },
  { universityId: 'uni-us-003', name: 'Public Health' },
  { universityId: 'uni-us-003', name: 'Design (GSD)' },
  { universityId: 'uni-us-003', name: 'Government & Public Policy' },
  { universityId: 'uni-us-003', name: 'Divinity' },

  // Oxford
  { universityId: 'uni-uk-001', name: 'Mathematics & Computer Science' },
  { universityId: 'uni-uk-001', name: 'Medicine' },
  { universityId: 'uni-uk-001', name: 'Law' },
  { universityId: 'uni-uk-001', name: 'English & Humanities' },
  { universityId: 'uni-uk-001', name: 'Engineering Science' },
  { universityId: 'uni-uk-001', name: 'Physics' },
  { universityId: 'uni-uk-001', name: 'Business (Saïd)' },
  { universityId: 'uni-uk-001', name: 'Economics & Management' },
  { universityId: 'uni-uk-001', name: 'Chemistry' },
  { universityId: 'uni-uk-001', name: 'Biological Sciences' },
  { universityId: 'uni-uk-001', name: 'Earth Sciences' },
  { universityId: 'uni-uk-001', name: 'Archaeology' },
  { universityId: 'uni-uk-001', name: 'Theology & Religion' },

  // Cambridge
  { universityId: 'uni-uk-002', name: 'Computer Science & Technology' },
  { universityId: 'uni-uk-002', name: 'Mathematics' },
  { universityId: 'uni-uk-002', name: 'Engineering' },
  { universityId: 'uni-uk-002', name: 'Natural Sciences' },
  { universityId: 'uni-uk-002', name: 'Medicine' },
  { universityId: 'uni-uk-002', name: 'Law' },
  { universityId: 'uni-uk-002', name: 'Economics' },
  { universityId: 'uni-uk-002', name: 'Humanities & Social Sciences' },
  { universityId: 'uni-uk-002', name: 'Chemistry' },
  { universityId: 'uni-uk-002', name: 'Earth Sciences' },
  { universityId: 'uni-uk-002', name: 'Archaeology' },
  { universityId: 'uni-uk-002', name: 'Business (Judge)' },

  // UofT
  { universityId: 'uni-ca-001', name: 'Computer Science' },
  { universityId: 'uni-ca-001', name: 'Engineering' },
  { universityId: 'uni-ca-001', name: 'Rotman Commerce' },
  { universityId: 'uni-ca-001', name: 'Arts & Science' },
  { universityId: 'uni-ca-001', name: 'Medicine' },
  { universityId: 'uni-ca-001', name: 'Law' },
  { universityId: 'uni-ca-001', name: 'Nursing' },
  { universityId: 'uni-ca-001', name: 'Pharmacy' },
  { universityId: 'uni-ca-001', name: 'Music' },
  { universityId: 'uni-ca-001', name: 'Education' },
  { universityId: 'uni-ca-001', name: 'Environmental Science' },
  { universityId: 'uni-ca-001', name: 'Kinesiology & Physical Education' },

  // Melbourne
  { universityId: 'uni-au-002', name: 'Engineering & IT' },
  { universityId: 'uni-au-002', name: 'Science' },
  { universityId: 'uni-au-002', name: 'Medicine & Health' },
  { universityId: 'uni-au-002', name: 'Business & Economics' },
  { universityId: 'uni-au-002', name: 'Arts' },
  { universityId: 'uni-au-002', name: 'Law' },
  { universityId: 'uni-au-002', name: 'Veterinary & Agricultural Sciences' },
  { universityId: 'uni-au-002', name: 'Architecture, Building & Planning' },
  { universityId: 'uni-au-002', name: 'Education' },
  { universityId: 'uni-au-002', name: 'Fine Arts & Music' },

  // TUM
  { universityId: 'uni-de-001', name: 'Informatics' },
  { universityId: 'uni-de-001', name: 'Mechanical Engineering' },
  { universityId: 'uni-de-001', name: 'Electrical Engineering' },
  { universityId: 'uni-de-001', name: 'Civil Engineering' },
  { universityId: 'uni-de-001', name: 'Physics' },
  { universityId: 'uni-de-001', name: 'Mathematics' },
  { universityId: 'uni-de-001', name: 'Natural Sciences (Chemistry, Biology)' },
  { universityId: 'uni-de-001', name: 'Management (TUM School of Management)' },
  { universityId: 'uni-de-001', name: 'Life Sciences (Food, Nutrition)' },
  { universityId: 'uni-de-001', name: 'Sport & Health Sciences' },
  { universityId: 'uni-de-001', name: 'Aerospace & Geodesy' },
];

const internships = [
  // Pakistan - Medical
  { title: 'House Job (House Officer)', organization: 'Aga Khan University Hospital', website: 'https://www.aku.edu', country: 'Pakistan', city: 'Karachi', type: 'house_job', field: 'medicine', paidType: 'paid', stipendAmount: 'PKR 45,000-65,000/month', duration: '1 year', mode: 'onsite', eligibility: 'MBBS graduates from PMDC recognized university', requirements: 'MBBS degree, PMDC registration, House Job application', documentsRequired: 'MBBS degree certificate, PMDC provisional registration, CNIC, 2 passport photos, CV, application form', benefits: 'Clinical experience, mentorship, patient care skills, specialization pathway', description: 'Mandatory 1-year supervised clinical training after MBBS. Rotations in Medicine, Surgery, Pediatrics, Gynecology. Essential for medical license.', applicationUrl: 'https://www.aku.edu/careers', deadline: new Date('2027-01-31'), isVerified: true },
  { title: 'House Job', organization: 'Lahore General Hospital', website: 'https://www.lgh.punjab.gov.pk', country: 'Pakistan', city: 'Lahore', type: 'house_job', field: 'medicine', paidType: 'paid', stipendAmount: 'PKR 35,000-50,000/month', duration: '1 year', mode: 'onsite', eligibility: 'MBBS graduates', requirements: 'MBBS degree, PMDC registration', documentsRequired: 'MBBS degree, PMDC registration, CNIC, domicile, 2 photos', benefits: 'Hands-on clinical experience, diverse patient cases, specialization preparation', description: 'Public sector hospital house job with exposure to wide range of cases.', applicationUrl: 'https://www.lgh.punjab.gov.pk/careers', deadline: new Date('2027-02-15'), isVerified: true },
  { title: 'House Job', organization: 'Jinnah Postgraduate Medical Centre', website: 'https://www.jpmc.edu.pk', country: 'Pakistan', city: 'Karachi', type: 'house_job', field: 'medicine', paidType: 'paid', stipendAmount: 'PKR 40,000-55,000/month', duration: '1 year', mode: 'onsite', eligibility: 'MBBS graduates', requirements: 'MBBS, PMDC registration', documentsRequired: 'MBBS degree, PMDC registration, CNIC, 2 photos, application form', benefits: 'Largest public hospital in Karachi, massive case exposure, subspecialty rotations', description: 'Pakistan largest public hospital. Extremely diverse pathology and clinical exposure.', applicationUrl: 'https://www.jpmc.edu.pk/house-job', deadline: new Date('2027-01-15'), isVerified: true },

  // Pakistan - Tech/CS
  { title: 'Software Engineering Intern', organization: 'Systems Limited', website: 'https://www.systems.com', country: 'Pakistan', city: 'Lahore', type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'PKR 40,000-80,000/month', duration: '3-6 months', mode: 'hybrid', eligibility: 'CS/SE students or recent graduates', requirements: 'Programming skills (Java, Python, React), portfolio/GitHub', documentsRequired: 'CV, GitHub portfolio, university recommendation letter, CNIC, transcript', benefits: 'Real project experience, mentorship, potential full-time offer, industry exposure', description: 'Work on enterprise software solutions. One of Pakistan largest IT companies.', applicationUrl: 'https://careers.systems.com', deadline: new Date('2027-03-31'), isVerified: true },
  { title: 'Data Science Intern', organization: 'PTCL (Pakistan Telecommunication)', website: 'https://www.ptcl.com.pk', country: 'Pakistan', city: 'Islamabad', type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'PKR 35,000-50,000/month', duration: '3 months', mode: 'onsite', eligibility: 'CS/Math/Data Science students', requirements: 'Python, SQL, ML basics', documentsRequired: 'CV, transcript, Python/SQL portfolio, CNIC, university NOC', benefits: 'Telecom data exposure, real-world ML projects, government sector experience', description: 'Work with Pakistan largest telecom data. Analytics and ML projects.', applicationUrl: 'https://www.ptcl.com.pk/careers', deadline: new Date('2027-04-15'), isVerified: true },
  { title: 'AI/ML Research Intern', organization: 'NVIDIA Pakistan (Lahore Office)', website: 'https://www.nvidia.com', country: 'Pakistan', city: 'Lahore', type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'PKR 60,000-100,000/month', duration: '6 months', mode: 'hybrid', eligibility: 'CS/EE students with ML background', requirements: 'Python, PyTorch, ML/DL fundamentals', documentsRequired: 'CV, research papers (if any), GitHub, PyTorch portfolio, transcript, 2 recommendation letters', benefits: 'Global tech company experience, GPU computing, research publications', description: 'Research internship at NVIDIA. Work on cutting-edge AI/ML projects.', applicationUrl: 'https://www.nvidia.com/en-us/careers/', deadline: new Date('2027-02-28'), isVerified: true },

  // Pakistan - Business
  { title: 'Audit Intern', organization: 'KPMG Pakistan', website: 'https://kpmg.com/pk', country: 'Pakistan', city: 'Karachi', type: 'internship', field: 'business', paidType: 'stipend', stipendAmount: 'PKR 25,000-35,000/month', duration: '3 months', mode: 'onsite', eligibility: 'Commerce/BBA/MBA students', requirements: 'Accounting knowledge, Excel, attention to detail', documentsRequired: 'CV, transcript, cover letter, CNIC, 2 recommendation letters', benefits: 'Big Four experience, professional certification pathway, corporate exposure', description: 'Audit and assurance internship. Work with Fortune 500 clients in Pakistan.', applicationUrl: 'https://kpmg.com/pk/en/careers.html', deadline: new Date('2027-03-15'), isVerified: true },
  { title: 'Marketing Intern', organization: 'Unilever Pakistan', website: 'https://www.unilever.com.pk', country: 'Pakistan', city: 'Lahore', type: 'internship', field: 'business', paidType: 'paid', stipendAmount: 'PKR 30,000-45,000/month', duration: '3-6 months', mode: 'onsite', eligibility: 'MBA/BBA students', requirements: 'Marketing knowledge, creativity, communication skills', documentsRequired: 'CV, cover letter, transcript, marketing project samples, CNIC', benefits: 'FMCG brand management experience, global company exposure, networking', description: 'Work on iconic brands like Lux, Surf Excel, Knorr. Brand management and market research.', applicationUrl: 'https://www.unilever.com.pk/careers/', deadline: new Date('2027-04-30'), isVerified: true },

  // Pakistan - Engineering
  { title: 'Civil Engineering Intern', organization: 'National Engineering Services Pakistan (NESPAK)', website: 'https://www.nespak.com.pk', country: 'Pakistan', city: 'Lahore', type: 'internship', field: 'engineering', paidType: 'paid', stipendAmount: 'PKR 30,000-45,000/month', duration: '6 months', mode: 'onsite', eligibility: 'Civil Engineering students', requirements: 'AutoCAD, structural analysis basics, site willingness', documentsRequired: 'CV, transcript, AutoCAD portfolio, university NOC, CNIC', benefits: 'Major infrastructure projects, government contracts, practical site experience', description: 'Work on national infrastructure projects including highways, bridges, buildings.', applicationUrl: 'https://www.nespak.com.pk/careers', deadline: new Date('2027-03-01'), isVerified: true },

  // USA - Tech
  { title: 'Software Engineering Intern', organization: 'Google', website: 'https://www.google.com', country: 'United States', city: 'Mountain View, CA', type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'USD 8,000-10,000/month', duration: '12-14 weeks', mode: 'onsite', eligibility: 'CS students (Undergrad/Grad)', requirements: 'DSA, system design, coding interviews', documentsRequired: 'Resume, transcript, 2 recommendation letters, work samples/GitHub', benefits: 'Top-tier tech experience, housing stipend, potential return offer, networking', description: 'Summer internship at Google. Work on real products used by billions.', applicationUrl: 'https://careers.google.com/students/', deadline: new Date('2027-01-15'), isVerified: true },
  { title: 'Software Engineering Intern', organization: 'Microsoft', website: 'https://www.microsoft.com', country: 'United States', city: 'Redmond, WA', type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'USD 7,500-9,500/month', duration: '12 weeks', mode: 'hybrid', eligibility: 'CS students', requirements: 'Coding interviews, OOP, cloud basics', documentsRequired: 'Resume, transcript, cover letter, GitHub portfolio', benefits: 'Azure/Windows exposure, mentorship, full-time conversion', description: 'Intern at Microsoft headquarters. Work on Azure, Office, or Windows.', applicationUrl: 'https://careers.microsoft.com/students/', deadline: new Date('2027-01-31'), isVerified: true },
  { title: 'Data Science Intern', organization: 'Meta (Facebook)', website: 'https://www.meta.com', country: 'United States', city: 'Menlo Park, CA', type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'USD 8,000-10,000/month', duration: '12 weeks', mode: 'onsite', eligibility: 'CS/Stats students', requirements: 'Python, SQL, ML, statistics', documentsRequired: 'Resume, transcript, research paper (preferred), GitHub, 2 recommendations', benefits: 'Social media data scale, research publications, return offer', description: 'Work with massive social data. ML and analytics at scale.', applicationUrl: 'https://www.metacareers.com/students/', deadline: new Date('2027-02-01'), isVerified: true },

  // UK - Research
  { title: 'Summer Research Placement', organization: 'Oxford University (Department of Computer Science)', website: 'https://www.cs.ox.ac.uk', country: 'United Kingdom', city: 'Oxford', type: 'fellowship', field: 'research', paidType: 'paid', stipendAmount: 'GBP 1,800-2,200/month', duration: '2-3 months', mode: 'onsite', eligibility: 'Final year undergrad or Masters students', requirements: 'Strong academic record, research interest, reference letters', documentsRequired: 'CV, transcript, research proposal, 2 academic references, personal statement', benefits: 'World-class research environment, publication opportunity, PhD pathway', description: 'Summer research placement at Oxford. Work with leading academics on cutting-edge projects.', applicationUrl: 'https://www.cs.ox.ac.uk/research/summer/', deadline: new Date('2027-03-01'), isVerified: true },
  { title: 'NHS Foundation Year 1 (House Officer)', organization: 'NHS (National Health Service)', website: 'https://www.nhs.uk', country: 'United Kingdom', city: 'Various cities', type: 'house_job', field: 'medicine', paidType: 'paid', stipendAmount: 'GBP 2,800-3,200/month (Band 1)', duration: '1 year', mode: 'onsite', eligibility: 'UK medical graduates or PLAB-qualified international graduates', requirements: 'GMC registration, Foundation Year 1 allocation', documentsRequired: 'MBBS degree, GMC registration, PLAB certificate (international), ID, DBS check, occupational health', benefits: 'Structured medical training, patient care, specialization pathway, NHS pension', description: 'Mandatory first year of UK medical practice. Rotations through multiple specialties.', applicationUrl: 'https://www.oren.org.uk/foundation-programme', deadline: new Date('2027-08-01'), isVerified: true },

  // Canada
  { title: 'Co-op Software Engineering', organization: 'Shopify', website: 'https://www.shopify.com', country: 'Canada', city: 'Ottawa/Toronto', type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'CAD 5,000-7,000/month', duration: '4 months', mode: 'remote', eligibility: 'CS/SE students in co-op program', requirements: 'Full-stack development skills, Ruby on Rails', documentsRequired: 'Resume, GitHub, cover letter, transcript', benefits: 'Canadian tech leader, startup culture, remote work option', description: 'Work at Canada largest tech company. E-commerce platform development.', applicationUrl: 'https://www.shopify.com/careers/students', deadline: new Date('2027-02-15'), isVerified: true },

  // Germany
  { title: 'Working Student (Werkstudent)', organization: 'Siemens', website: 'https://www.siemens.com', country: 'Germany', city: 'Munich', type: 'internship', field: 'engineering', paidType: 'paid', stipendAmount: 'EUR 1,500-2,500/month', duration: '6-12 months', mode: 'hybrid', eligibility: 'Engineering/CS students enrolled in German university', requirements: 'German B1+ or English, relevant coursework', documentsRequired: 'CV (Lebenslauf), transcript, enrollment certificate, work permit (if non-EU)', benefits: 'German industry giant, part-time compatible with studies, career entry', description: 'Part-time working student at Siemens. Industry experience while studying.', applicationUrl: 'https://jobs.siemens.com/careers/student-workers', deadline: new Date('2027-03-31'), isVerified: true },
  { title: 'Research Intern', organization: 'Max Planck Institute', website: 'https://www.mpg.de', country: 'Germany', city: 'Munich', type: 'fellowship', field: 'research', paidType: 'paid', stipendAmount: 'EUR 1,200-2,000/month', duration: '3-6 months', mode: 'onsite', eligibility: 'Masters/PhD students', requirements: 'Research proposal, strong academic record', documentsRequired: 'CV, transcript, research proposal, 2 academic references, passport', benefits: 'Nobel laureate institution, research publications, PhD recommendation', description: 'Research internship at world-renowned Max Planck Institute.', applicationUrl: 'https://www.mpg.de/careers', deadline: new Date('2027-04-30'), isVerified: true },

  // Australia
  { title: 'Intern Pharmacist', organization: 'Chemist Warehouse Australia', website: 'https://www.chemistwarehouse.com.au', country: 'Australia', city: 'Sydney/Melbourne', type: 'internship', field: 'pharmacy', paidType: 'paid', stipendAmount: 'AUD 25-35/hour', duration: '1 year', mode: 'onsite', eligibility: 'BPharmacy graduates', requirements: 'AHPRA registration, English proficiency', documentsRequired: 'BPharmacy degree, AHPRA registration, IELTS/OET score, CV, police check, working with children check', benefits: 'Australian pharmacy practice, PR pathway, professional development', description: 'Intern year for international pharmacy graduates. Path to AHPRA registration.', applicationUrl: 'https://www.chemistwarehouse.com.au/careers', deadline: new Date('2027-06-30'), isVerified: true },

  // Remote/International
  { title: 'Remote Software Engineering Intern', organization: 'GitLab', website: 'https://www.gitlab.com', country: 'Remote', city: null, type: 'internship', field: 'computer_science', paidType: 'paid', stipendAmount: 'USD 4,000-5,000/month', duration: '3 months', mode: 'remote', eligibility: 'CS students globally', requirements: 'Git, programming skills, async communication', documentsRequired: 'Resume, GitHub profile, cover letter, coding sample', benefits: 'Remote-first, global team, open-source contribution, flexible hours', description: 'Fully remote internship. Work from anywhere in the world.', applicationUrl: 'https://about.gitlab.com/jobs/', deadline: new Date('2027-03-15'), isVerified: true },
];

const cmPrograms = [
  // ===== PUNJAB =====
  { name: 'Chief Minister Youth Internship Program', province: 'Punjab', category: 'internship', description: 'Paid internship for fresh graduates in government departments. Monthly stipend provided.', eligibility: 'Punjab domicile, 16 years education, age 21-28, unemployed', benefits: 'PKR 25,000-40,000/month stipend, government experience, skill development', howToApply: 'Apply online at Punjab Skills Development Fund (PSDF) portal. Submit CNIC, educational certificates, domicile.', targetAudience: 'fresh graduates', status: 'active' },
  { name: 'Ehsaas Undergraduate Scholarship Program', province: 'Punjab', category: 'scholarship', description: 'Need-based scholarship covering full tuition for undergraduate students in public universities.', eligibility: 'Punjab/Sindh/KPK/Balochistan domicile, family income < PKR 45,000/month, admission in public university', benefits: 'Full tuition coverage, monthly stipend PKR 10,000, book allowance', howToApply: 'Apply through HEC portal when announced. Submit income certificate, CNIC, admission letter.', targetAudience: 'undergraduate students', status: 'active' },
  { name: 'Punjab Rozgar Scheme', province: 'Punjab', category: 'financial_aid', description: 'Interest-free loans up to PKR 1 million for youth to start businesses.', eligibility: 'Punjab domicile, age 21-45, CNIC holder, business plan required', benefits: 'Interest-free loan up to PKR 1 million, 2-year repayment period, business mentorship', howToApply: 'Apply online at Punjab Rozgar Scheme portal. Submit business plan, CNIC, bank statements.', targetAudience: 'youth entrepreneurs', status: 'active' },
  { name: 'Saaf Dehat (Clean Village) Program', province: 'Punjab', category: 'housing', description: 'Free housing initiative for homeless families in rural Punjab.', eligibility: 'Landless homeless families, Punjab domicile', benefits: 'Free 3-marla house, basic utilities connection', howToApply: 'Register through local Union Council. Verification by district administration.', targetAudience: 'homeless families', status: 'active' },
  { name: 'Punjab Skills Development Fund (PSDF)', province: 'Punjab', category: 'skill', description: 'Free technical and vocational training programs across Punjab.', eligibility: 'Punjab domicile, age 15-45, matric pass minimum', benefits: 'Free training in 100+ trades, monthly stipend during training, job placement assistance', howToApply: 'Register at PSDF center or online portal. Choose trade and schedule.', targetAudience: 'youth seeking skills', status: 'active' },
  { name: 'Punjab Information Technology Board (PITB) Digital Skills', province: 'Punjab', category: 'skill', description: 'Free IT training programs by PITB including Freelancing, Graphic Design, SEO/Content Writing, QuickBooks, E-Commerce, and WordPress. Training centers in Lahore, Faisalabad, Rawalpindi, Multan, and Gujranwala.', eligibility: 'Punjab domicile, age 18-35, intermediate pass minimum', benefits: 'Free IT training, PITB certification, freelancing mentorship, PSDF stipend during training', howToApply: 'Register online at psdf.org.pk or pitb.gov.pk. Choose course and schedule. Submit CNIC and educational certificates.', targetAudience: 'youth seeking IT skills', status: 'active' },
  { name: 'CM Laptop Scheme Punjab', province: 'Punjab', category: 'laptop', description: 'Free laptops for meritorious students in public universities.', eligibility: 'Punjab domicile, enrolled in public university, minimum CGPA 3.0', benefits: 'Free laptop, digital literacy, academic improvement', howToApply: 'Apply through university administration when announced. Merit-based selection.', targetAudience: 'university students', status: 'active' },
  { name: 'Kisan Card (Farmer Card)', province: 'Punjab', category: 'financial_aid', description: 'Interest-free agricultural loans up to PKR 50,000 for small farmers.', eligibility: 'Punjab domicile, land ownership 12.5 acres or less, CNIC holder', benefits: 'Interest-free loan, agricultural inputs, crop insurance', howToApply: 'Apply through agricultural department or NADRA center.', targetAudience: 'small farmers', status: 'active' },

  // ===== SINDH =====
  { name: 'Sindh Youth Fellowship Program', province: 'Sindh', category: 'internship', description: 'Fellowship for young professionals in Sindh government departments.', eligibility: 'Sindh domicile, 16 years education, age 22-30', benefits: 'PKR 30,000/month stipend, government experience, networking', howToApply: 'Apply through Sindh Human Resource Commission portal.', targetAudience: 'young professionals', status: 'active' },
  { name: 'Sindh Scholarship Program (Benazir)', province: 'Sindh', category: 'scholarship', description: 'Need-based scholarship for Sindh students in universities.', eligibility: 'Sindh domicile, family income < PKR 40,000/month', benefits: 'Full tuition, monthly stipend, book allowance', howToApply: 'Apply through Sindh Higher Education Commission portal.', targetAudience: 'students from low-income families', status: 'active' },
  { name: 'Sindh Skills Development Program', province: 'Sindh', category: 'skill', description: 'TVET (Technical and Vocational Education) training programs.', eligibility: 'Sindh domicile, age 15-45', benefits: 'Free technical training, certification, job placement', howToApply: 'Register at nearest TEVTA center in Sindh.', targetAudience: 'youth seeking vocational training', status: 'active' },
  { name: 'Sindh Information Technology Board (SITB) Digital Skills', province: 'Sindh', category: 'skill', description: 'Free IT and digital skills training programs offered by Sindh Information Technology Board. Courses include Web Development, Mobile App Development, Digital Marketing, Graphic Design, Data Entry, and Freelancing. Training centers across Karachi, Hyderabad, and Sukkur.', eligibility: 'Sindh domicile, age 16-35, intermediate pass minimum', benefits: 'Free IT training, PSDF/SITB certification, job placement assistance, freelancing mentorship', howToApply: 'Register online at sitb.gos.pk or visit nearest SITB training center. Choose course and schedule. Submit CNIC, educational certificates, and domicile.', targetAudience: 'youth seeking IT skills', status: 'active' },
  { name: 'CM Housing Program Sindh', province: 'Sindh', category: 'housing', description: 'Affordable housing scheme for low-income families in Sindh.', eligibility: 'Sindh domicile, income below threshold, no existing house', benefits: 'Subsidized housing, easy installment plans', howToApply: 'Apply through Sindh Housing Authority.', targetAudience: 'low-income families', status: 'active' },
  { name: 'Sindh laptop Scheme', province: 'Sindh', category: 'laptop', description: 'Free laptops for top-performing students in Sindh public universities.', eligibility: 'Sindh domicile, public university student, merit-based', benefits: 'Free laptop, academic support', howToApply: 'Apply through university when scheme is announced.', targetAudience: 'university students', status: 'active' },

  // ===== KPK (Khyber Pakhtunkhwa) =====
  { name: 'KPK Youth Employment Program', province: 'KPK', category: 'internship', description: 'Government internship program for KPK youth in various departments.', eligibility: 'KPK domicile, 14+ years education, age 18-30', benefits: 'PKR 20,000-30,000/month stipend, experience, skill development', howToApply: 'Apply online at KPK E-Governance portal.', targetAudience: 'educated youth', status: 'active' },
  { name: 'KPK Education Scholarship', province: 'KPK', category: 'scholarship', description: 'Merit and need-based scholarships for KPK students.', eligibility: 'KPK domicile, enrolled in recognized institution', benefits: 'Tuition coverage, monthly stipend', howToApply: 'Apply through Higher Education Department KPK.', targetAudience: 'students', status: 'active' },
  { name: 'Khyber Pakhtunkhwa Skills Program', province: 'KPK', category: 'skill', description: 'Technical and vocational training programs across KPK.', eligibility: 'KPK domicile, age 15-45', benefits: 'Free training, certification, job market readiness', howToApply: 'Register at TEVTA KPK centers.', targetAudience: 'youth', status: 'active' },
  { name: 'Sehat Sahulat Card (Health Card)', province: 'KPK', category: 'health', description: 'Free health insurance up to PKR 1 million per family per year.', eligibility: 'All KPK residents (CNIC holder)', benefits: 'Free treatment at empaneled hospitals, cashless healthcare', howToApply: 'Auto-enrolled via CNIC. Visit any empaneled hospital with CNIC.', targetAudience: 'all residents', status: 'active' },

  // ===== BALOCHISTAN =====
  { name: 'Balochistan Youth Internship', province: 'Balochistan', category: 'internship', description: 'Paid internship for Balochistan youth in government departments.', eligibility: 'Balochistan domicile, 14+ years education, age 18-30', benefits: 'PKR 15,000-25,000/month, government experience', howToApply: 'Apply through Balochistan Civil Services Commission.', targetAudience: 'youth', status: 'active' },
  { name: 'Balochistan Scholarship Program', province: 'Balochistan', category: 'scholarship', description: 'Need-based scholarships for Balochistan students.', eligibility: 'Balochistan domicile, financial need', benefits: 'Full/partial tuition, monthly stipend', howToApply: 'Apply through Education Department Balochistan.', targetAudience: 'students', status: 'active' },
  { name: 'Balochistan Dars Programme', province: 'Balochistan', category: 'skill', description: 'Literacy and basic education program for out-of-school youth.', eligibility: 'Balochistan residents, age 10-40', benefits: 'Basic literacy, numeracy, vocational skills', howToApply: 'Register at nearest community center.', targetAudience: 'out-of-school youth', status: 'active' },

  // ===== ISLAMABAD =====
  { name: 'Federal Government Employees Housing Foundation', province: 'Islamabad', category: 'housing', description: 'Housing scheme for federal government employees.', eligibility: 'Federal govt employees, BPS-1 to BPS-17', benefits: 'Subsidized plots/flats, easy installments', howToApply: 'Apply through ministry/department housing cell.', targetAudience: 'government employees', status: 'active' },
  { name: 'HEC Need-Based Scholarship (Federal)', province: 'Islamabad', category: 'scholarship', description: 'HEC need-based scholarship for students in federal universities.', eligibility: 'Pakistan domicile, family income < PKR 45,000/month', benefits: 'Full tuition, monthly stipend, book allowance', howToApply: 'Apply through HEC E portal when announced.', targetAudience: 'students in federal universities', status: 'active' },
];

(async () => {
  console.log('=== Seeding Departments ===');
  let deptCount = 0;
  for (const d of departments) {
    try {
      await p.department.upsert({
        where: { universityId_name: { universityId: d.universityId, name: d.name } },
        update: { name: d.name },
        create: { universityId: d.universityId, name: d.name },
      });
      deptCount++;
    } catch { /* skip duplicates */ }
  }
  console.log(`  ${deptCount} departments seeded`);

  console.log('\n=== Seeding Internships ===');
  let intCount = 0;
  for (const i of internships) {
    await p.internship.upsert({
      where: { id: `int-${intCount + 1}` },
      update: i,
      create: { id: `int-${intCount + 1}`, ...i },
    });
    intCount++;
  }
  console.log(`  ${intCount} internships/fellowships seeded`);

  console.log('\n=== Seeding CM Programs ===');
  let cmCount = 0;
  for (const c of cmPrograms) {
    await p.cMProgram.upsert({
      where: { id: `cm-${cmCount + 1}` },
      update: c,
      create: { id: `cm-${cmCount + 1}`, ...c },
    });
    cmCount++;
  }
  console.log(`  ${cmCount} CM programs seeded`);

  // Summary
  const totalDepts = await p.department.count();
  const totalIntern = await p.internship.count();
  const totalCM = await p.cMProgram.count();
  console.log(`\nTotals: ${totalDepts} departments, ${totalIntern} internships, ${totalCM} CM programs`);

  await p.$disconnect();
})();
