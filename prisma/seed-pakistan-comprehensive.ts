/* eslint-disable */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CourseSeed {
  name: string;
  degree: any;
  duration: string;
  fee: number;
}

interface ReqSeed {
  requirementType: string;
  requirementValue: string;
  deadline?: Date;
}

interface CampusSeed {
  name: string;
  city?: string;
  address?: string;
}

interface UniSeed {
  name: string;
  city: string;
  province: string;
  type: 'university' | 'college' | 'school';
  founded: number;
  website: string | null;
  desc: string;
  minPercent?: number;
  entryTest?: string;
  deadline?: string;
  mainCampusName?: string;
  mainAddress?: string;
  extraCampuses?: CampusSeed[];
  customReqs?: ReqSeed[];
  programs: CourseSeed[];
}

function P(name: string, degree: string, duration: string, fee: number): CourseSeed {
  return { name, degree, duration, fee };
}

function csTri(fee: number): CourseSeed[] {
  return [
    P('BS Computer Science', 'bachelor', '4 years', fee),
    P('BS Software Engineering', 'bachelor', '4 years', Math.round(fee * 1.05)),
    P('BS Information Technology', 'bachelor', '4 years', fee),
    P('MS Computer Science', 'master', '2 years', Math.round(fee * 0.9)),
  ];
}

function pubEng(fee: number): CourseSeed[] {
  return [
    P('BSc Electrical Engineering', 'bachelor', '4 years', fee),
    P('BSc Mechanical Engineering', 'bachelor', '4 years', fee),
    P('BSc Civil Engineering', 'bachelor', '4 years', fee),
    P('MS Electrical Engineering', 'master', '2 years', Math.round(fee * 0.85)),
  ];
}

function bizTri(fee: number): CourseSeed[] {
  return [
    P('BBA Business Administration', 'bachelor', '4 years', fee),
    P('BS Accounting & Finance', 'bachelor', '4 years', fee),
    P('MBA Master of Business Administration', 'master', '2 years', Math.round(fee * 0.95)),
  ];
}

function artSci(fee: number): CourseSeed[] {
  return [
    P('BS English Literature', 'bachelor', '4 years', fee),
    P('BS Mathematics', 'bachelor', '4 years', fee),
    P('BS Physics', 'bachelor', '4 years', fee),
    P('BS Chemistry', 'bachelor', '4 years', fee),
    P('MA English', 'master', '2 years', Math.round(fee * 0.8)),
  ];
}

function medPub(mbbsFee: number): CourseSeed[] {
  return [
    P('MBBS Bachelor of Medicine & Surgery', 'bachelor', '5 years', mbbsFee),
    P('BDS Bachelor of Dental Surgery', 'bachelor', '4 years', Math.round(mbbsFee * 0.9)),
    P('MD Doctor of Medicine Residency', 'master', '4 years', Math.round(mbbsFee * 0.7)),
  ];
}

function medCol(mbbsFee: number): CourseSeed[] {
  return [
    P('MBBS Bachelor of Medicine & Surgery', 'bachelor', '5 years', mbbsFee),
    P('BDS Bachelor of Dental Surgery', 'bachelor', '4 years', Math.round(mbbsFee * 1.1)),
    P('Doctor of Physical Therapy', 'bachelor', '5 years', Math.round(mbbsFee * 0.6)),
    P('Doctor of Pharmacy Pharm-D', 'bachelor', '5 years', Math.round(mbbsFee * 0.75)),
  ];
}

function agriQuad(fee: number): CourseSeed[] {
  return [
    P('BSc Hons Agriculture', 'bachelor', '4 years', fee),
    P('Doctor of Veterinary Medicine DVM', 'bachelor', '5 years', Math.round(fee * 1.15)),
    P('BS Food Science & Technology', 'bachelor', '4 years', fee),
    P('MSc Horticulture', 'master', '2 years', Math.round(fee * 0.8)),
  ];
}

function interQuad(fee: number): CourseSeed[] {
  return [
    P('FSc Pre-Medical', 'intermediate', '2 years', fee),
    P('FSc Pre-Engineering', 'intermediate', '2 years', fee),
    P('ICS Intermediate in Computer Science', 'intermediate', '2 years', fee),
    P('I.Com Intermediate in Commerce', 'intermediate', '2 years', fee),
  ];
}

const facilityPool: string[][] = [
  ['Central Library', 'Computer Labs', 'Auditorium', 'Sports Ground', 'Cafeteria', 'Campus Wi-Fi'],
  ['Science Laboratories', 'Digital Library', 'Student Hostels', 'Medical Room', 'Transport Fleet', 'Masjid'],
  ['Research Centres', 'Seminar Halls', 'Gymnasium', 'Career Services Office', 'Scholarship Desk'],
  ['Incubation Centre', 'Language Lab', 'Botanical Garden', 'Bank Branch', 'Prayer Area'],
];

function degreeLabel(degree: string): string {
  switch (degree) {
    case 'intermediate':
      return 'An intermediate-level program';
    case 'master':
      return 'A postgraduate program';
    case 'phd':
      return 'A doctoral research program';
    default:
      return 'An undergraduate degree program';
  }
}

function courseDesc(u: UniSeed, c: CourseSeed): string {
  return (
    degreeLabel(c.degree) +
    ' offered at ' +
    u.name +
    ', ' +
    u.city +
    '. Duration ' +
    c.duration +
    '. Indicative annual tuition PKR ' +
    c.fee.toLocaleString('en-US') +
    '.'
  );
}

function pad(n: number): string {
  return String(n).padStart(3, '0');
}

const lahoreInstitutions: UniSeed[] = [
  {
    name: 'University of the Punjab', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1882, website: 'https://pu.edu.pk',
    desc: 'Oldest public university in Pakistan with a vast academic range across arts, sciences, law, engineering and commerce.',
    minPercent: 50, entryTest: 'PU departmental admission test or ECAT for engineering programs', deadline: '2026-09-30',
    mainCampusName: 'Quaid-i-Azam Campus',
    mainAddress: 'Quaid-i-Azam Campus, Canal Road, Lahore',
    extraCampuses: [
      { name: 'University of the Punjab — Gujranwala Campus', city: 'Gujranwala' },
      { name: 'University of the Punjab — Jhelum Campus', city: 'Jhelum' },
      { name: 'Allama Iqbal Campus (Old Campus)', address: 'The Mall, Lahore' },
    ],
    programs: [...csTri(45000), ...bizTri(50000), ...artSci(35000)],
  },
  {
    name: 'Government College University Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1864, website: 'https://www.gcu.edu.pk',
    desc: 'Historic institution famous for its alumni of poets and scientists, offering liberal arts and sciences.',
    minPercent: 50, entryTest: 'GCU entrance assessment', deadline: '2026-09-20',
    programs: [...artSci(40000), ...csTri(55000)],
  },
  {
    name: 'Forman Christian College University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1864, website: 'https://www.fccollege.edu.pk',
    desc: 'Chartered liberal arts university known for a four-year Baccalaureate model and strong sciences.',
    minPercent: 50, entryTest: 'FCCU placement test or SAT', deadline: '2026-08-15',
    programs: [...csTri(320000), ...bizTri(280000), ...artSci(250000)],
  },
  {
    name: 'Kinnaird College for Women University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1913, website: 'https://kinnaird.edu.pk',
    desc: 'Premier women-only university for humanities, sciences and social sciences.',
    minPercent: 50, entryTest: 'Kinnaird admission aptitude test', deadline: '2026-08-31',
    customReqs: [{ requirementType: 'document', requirementValue: 'Character certificate from last attended institution (women applicants only)' }],
    programs: [...artSci(180000), ...csTri(200000)],
  },
  {
    name: 'National College of Arts', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1875, website: 'https://nca.edu.pk',
    desc: 'Pakistan flagship art school for fine arts, design, architecture and cultural studies.',
    minPercent: 45, entryTest: 'NCA aptitude test', deadline: '2026-08-10',
    mainCampusName: 'NCA Main Campus',
    extraCampuses: [{ name: 'NCA Rawalpindi Campus', city: 'Rawalpindi' }],
    customReqs: [
      { requirementType: 'portfolio', requirementValue: 'Portfolio of original artwork reviewed at interview stage' },
      { requirementType: 'interview', requirementValue: 'Studio interview with faculty jury' },
    ],
    programs: [
      P('Bachelor of Fine Arts', 'bachelor', '4 years', 85000),
      P('Bachelor of Design', 'bachelor', '4 years', 90000),
      P('Bachelors in Architecture', 'bachelor', '5 years', 95000),
      P('Master of Fine Arts', 'master', '2 years', 70000),
    ],
  },
  {
    name: 'Lahore University of Management Sciences', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1984, website: 'https://lums.edu.pk',
    desc: 'Top-ranked private research university for business, economics, computer science and engineering.',
    minPercent: 60, entryTest: 'LUMS admission test (LCAT) or SAT I/II', deadline: '2026-03-31',
    mainAddress: 'DHA, Raiwind Road, Lahore',
    customReqs: [
      { requirementType: 'essay', requirementValue: 'Personal statement essay' },
      { requirementType: 'interview', requirementValue: 'Interview for shortlisted applicants' },
      { requirementType: 'test_score', requirementValue: 'SAT recommended for international curriculum applicants' },
    ],
    programs: [...csTri(850000), ...bizTri(950000), ...artSci(800000)],
  },
  {
    name: 'University of Engineering and Technology Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1921, website: 'https://uet.edu.pk',
    desc: 'Flagship public engineering university of Punjab with high merit and research output.',
    minPercent: 60, entryTest: 'UET ECAT combined entry test', deadline: '2026-08-31',
    mainAddress: 'G.T. Road, Lahore',
    extraCampuses: [
      { name: 'UET Kala Shah Kaku Campus', address: 'KSK, Sheikhupura Road' },
      { name: 'UET Narowal Campus', city: 'Narowal' },
      { name: 'UET New Campus', address: 'Grand Trunk Road, Lahore' },
    ],
    programs: [...pubEng(65000), ...csTri(70000)],
  },
  {
    name: 'King Edward Medical University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1860, website: 'https://kemu.edu.pk',
    desc: 'Oldest medical college in Pakistan attached to Mayo Hospital, extremely high MDCAT merit.',
    minPercent: 88, entryTest: 'MDCAT plus PMDC central admission', deadline: '2026-09-30',
    programs: medPub(60000),
  },
  {
    name: 'University of Health Sciences Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2002, website: 'https://www.uhs.edu.pk',
    desc: 'Public health sciences university administering medical education standards across Punjab.',
    minPercent: 60, entryTest: 'UHS admission test', deadline: '2026-10-05',
    programs: [
      P('Doctor of Physical Therapy', 'bachelor', '5 years', 55000),
      P('BS Nursing', 'bachelor', '4 years', 45000),
      P('BS Medical Laboratory Technology', 'bachelor', '4 years', 48000),
      P('MPhil Physiology', 'master', '2 years', 52000),
    ],
  },
  {
    name: 'Fatima Jinnah Medical University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1948, website: 'https://fjmu.edu.pk',
    desc: 'Public womens medical university attached to Sir Ganga Ram Hospital.',
    minPercent: 88, entryTest: 'MDCAT plus PMDC central admission', deadline: '2026-09-30',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only per seat policy' }],
    programs: medPub(55000),
  },
  {
    name: 'Lahore College for Women University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1922, website: 'https://lcwu.edu.pk',
    desc: 'Large public womens university covering arts, sciences, pharmacy and home economics.',
    minPercent: 50, entryTest: 'LCWU departmental test', deadline: '2026-09-25',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: [...artSci(45000), ...csTri(60000)],
  },
  {
    name: 'University of Central Punjab', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1999, website: 'https://ucp.edu.pk',
    desc: 'Private university of the Punjab Group focused on computing, business and engineering.',
    minPercent: 50, entryTest: 'UCP aptitude test or NTS', deadline: '2026-09-15',
    programs: [...csTri(285000), ...bizTri(265000), pubEng(250000)[0]],
  },
  {
    name: 'The University of Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1999, website: 'https://www.ulhr.edu.pk',
    desc: 'Comprehensive private university strong in health sciences, rehabilitation and engineering.',
    minPercent: 50, entryTest: 'UOL entry test or NTS NAT', deadline: '2026-09-20',
    programs: [
      ...csTri(250000),
      ...bizTri(230000),
      P('Doctor of Physical Therapy', 'bachelor', '5 years', 320000),
      P('Doctor of Pharmacy Pharm-D', 'bachelor', '5 years', 300000),
    ],
  },
  {
    name: 'Superior University Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2001, website: 'https://superior.edu.pk',
    desc: 'Private university promoting industry-linked programs and entrepreneurship.',
    minPercent: 45, entryTest: 'Superior admission test or NTS', deadline: '2026-09-18',
    programs: [...csTri(220000), ...bizTri(200000)],
  },
  {
    name: 'Minhaj University Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1999, website: 'https://mul.edu.pk',
    desc: 'Private university founded by Dr Tahir-ul-Qadri offering affordable degrees across faculties.',
    minPercent: 45, entryTest: 'MUL basic entry test', deadline: '2026-09-25',
    programs: [...artSci(80000), ...csTri(110000)],
  },
  {
    name: 'University of Management and Technology', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2004, website: 'https://umt.edu.pk',
    desc: 'Leading private business-focused chartered university with expanding engineering and CS schools.',
    minPercent: 50, entryTest: 'UMT admission test or NTS GAT/NAT', deadline: '2026-09-10',
    programs: [...bizTri(310000), ...csTri(290000)],
  },
  {
    name: 'Information Technology University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2012, website: 'https://itu.edu.pk',
    desc: 'Research-driven public IT university modeled on MIT focusing on data science and entrepreneurship.',
    minPercent: 50, entryTest: 'ITU admission test', deadline: '2026-07-31',
    programs: [...csTri(190000)],
  },
  {
    name: 'Pakistan Institute of Fashion and Design', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1994, website: 'https://pifd.edu.pk',
    desc: 'Specialized design institute for fashion, textiles, jewellery and furniture design.',
    minPercent: 45, entryTest: 'PIFD creative aptitude test', deadline: '2026-08-20',
    customReqs: [
      { requirementType: 'portfolio', requirementValue: 'Design portfolio submission' },
      { requirementType: 'interview', requirementValue: 'Creative interview with jury' },
    ],
    programs: [
      P('BS Fashion Design', 'bachelor', '4 years', 220000),
      P('BS Textile Design', 'bachelor', '4 years', 210000),
      P('BS Jewellery & Gemological Sciences', 'bachelor', '4 years', 230000),
      P('Bachelors of Furniture Design', 'bachelor', '4 years', 215000),
    ],
  },
  {
    name: 'University of Education Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2002, website: 'https://ue.edu.pk',
    desc: 'Public specialist teacher-education university operating campuses across Punjab districts.',
    minPercent: 45, entryTest: 'UE general entry test', deadline: '2026-09-22',
    extraCampuses: [
      { name: 'UE Vehari Campus', city: 'Vehari' },
      { name: 'UE Attock Campus', city: 'Attock' },
      { name: 'UE DG Khan Campus', city: 'Dera Ghazi Khan' },
    ],
    programs: [...artSci(38000), P('BEd Hons Elementary', 'bachelor', '4 years', 35000), ...csTri(50000)],
  },
  {
    name: 'Lahore School of Economics', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1993, website: 'https://lahoreschool.edu.pk',
    desc: 'Private university specializing in economics, finance, business and actuarial sciences.',
    minPercent: 50, entryTest: 'LSE admission test', deadline: '2026-08-25',
    programs: [...bizTri(420000), P('BA Economics', 'bachelor', '4 years', 400000), P('MSc Economics', 'master', '2 years', 350000)],
  },
  {
    name: 'University of Veterinary and Animal Sciences', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 1882, website: 'https://uvas.edu.pk',
    desc: 'Top veterinary and animal sciences university with teaching veterinary hospitals.',
    minPercent: 55, entryTest: 'UVAS entrance test', deadline: '2026-09-12',
    extraCampuses: [{ name: 'UVAS Ravi Campus Pattoki', city: 'Pattoki' }],
    programs: agriQuad(60000),
  },
  {
    name: 'Beaconhouse National University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2003, website: 'https://bnu.edu.pk',
    desc: 'First private not-for-profit liberal arts university in Pakistan with strong visual arts school.',
    minPercent: 50, entryTest: 'BNU aptitude test', deadline: '2026-08-28',
    customReqs: [{ requirementType: 'portfolio', requirementValue: 'Portfolio required for Mariam Dawood School of Visual Arts applicants' }],
    programs: [...csTri(600000), P('BFA Visual Arts', 'bachelor', '4 years', 580000), P('BDes Visual Communication Design', 'bachelor', '4 years', 590000), ...bizTri(550000)],
  },
  {
    name: 'Hajvery University Lahore', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2002, website: 'https://hu.edu.pk',
    desc: 'Private university known for pharmacy, fashion and business programs.',
    minPercent: 45, entryTest: 'HU entry test', deadline: '2026-09-28',
    programs: [P('Pharm-D', 'bachelor', '5 years', 260000), ...csTri(190000), ...bizTri(170000)],
  },
  {
    name: 'Lahore Garrison University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2010, website: 'https://lgu.edu.pk',
    desc: 'Army-sponsored public sector university with focus on CS, security studies and biosciences.',
    minPercent: 50, entryTest: 'LGU entry test', deadline: '2026-09-16',
    programs: [...csTri(160000), ...artSci(120000)],
  },
  {
    name: 'Allama Iqbal Medical College', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 1975, website: 'https://aimc.edu.pk',
    desc: 'Major public medical college attached to Jinnah Hospital Lahore under UHS affiliation.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(58000),
  },
  {
    name: 'Services Institute of Medical Sciences', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 2003, website: 'https://sims.edu.pk',
    desc: 'Public medical college attached to Services Hospital Lahore.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(55000),
  },
  {
    name: 'CMH Lahore Medical College', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 2005, website: 'https://cmhlahore.edu.pk',
    desc: 'Combined Military Hospitals administered private medical college under NUMS.',
    minPercent: 85, entryTest: 'NUMS entry test', deadline: '2026-09-05',
    customReqs: [{ requirementType: 'service_bond', requirementValue: 'Preference to children of armed forces personnel; civilian seats open via NUMS merit' }],
    programs: medCol(1150000),
  },
  {
    name: 'Shalamar Medical & Dental College', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 2009, website: 'https://smdc.edu.pk',
    desc: 'Private teaching hospital medical college on Shalamar Link Road.',
    minPercent: 80, entryTest: 'MDCAT plus institutional assessment', deadline: '2026-09-08',
    programs: medCol(1050000),
  },
  {
    name: 'Avicenna Medical College', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 2009, website: null,
    desc: 'Private medical college near Bedian Road affiliated with UHS.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-10',
    programs: medCol(1000000),
  },
  {
    name: 'Central Park Medical College', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 2007, website: null,
    desc: 'Private medical college within Central Park housing society.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-10',
    programs: medCol(1020000),
  },
  {
    name: 'Rashid Latif Medical College', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 2010, website: 'https://rlmc.edu.pk',
    desc: 'Private medical college attached to Rashid Latif Teaching Hospital, Ferozepur Road.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-12',
    programs: medCol(1010000),
  },
  {
    name: 'FMH College of Medicine and Dentistry', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 2001, website: 'https://fmhcmd.edu.pk',
    desc: 'Fatima Memorial Hospital affiliated private dental and medical college at Shadman.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-12',
    programs: medCol(1080000),
  },
  {
    name: 'Akhuwat FIRST University', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2021, website: null,
    desc: 'Interest-free education university run by Akhuwat Foundation promoting accessible quality education.',
    minPercent: 50, entryTest: 'AFU admission assessment', deadline: '2026-09-30',
    customReqs: [{ requirementType: 'essay', requirementValue: 'Statement of financial need for Akhuwat fee-support consideration' }],
    programs: [...csTri(150000), ...bizTri(140000)],
  },
  {
    name: 'Queen Mary College Lahore', city: 'Lahore', province: 'Punjab', type: 'college',
    founded: 1908, website: null,
    desc: 'Historic government womens college offering intermediate and degree classes.',
    minPercent: 50, deadline: '2026-09-20',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: interQuad(40000),
  },
  {
    name: 'University of South Asia', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2005, website: null,
    desc: 'Private chartered university on Raiwind Road offering media, health and computing programs.',
    minPercent: 45, entryTest: 'USA entry test', deadline: '2026-09-24',
    programs: [...csTri(180000), ...bizTri(165000), P('BS Media Studies', 'bachelor', '4 years', 170000)],
  },
  {
    name: 'University of Home Economics', city: 'Lahore', province: 'Punjab', type: 'university',
    founded: 2019, website: null,
    desc: 'Public chartered university evolved from the College of Home Economics, Gulberg.',
    minPercent: 50, deadline: '2026-09-26',
    customReqs: [{ requirementType: 'document', requirementValue: 'Primarily female intake per charter policy' }],
    programs: [
      P('BS Human Nutrition & Dietetics', 'bachelor', '4 years', 42000),
      P('BS Textile & Clothing', 'bachelor', '4 years', 40000),
      P('BS Human Development & Family Studies', 'bachelor', '4 years', 38000),
    ],
  },
];

const karachiInstitutions: UniSeed[] = [
  {
    name: 'University of Karachi', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1951, website: 'https://www.uok.edu.pk',
    desc: 'Largest public university in Pakistan by enrollment spanning dozens of departments and research institutes.',
    minPercent: 50, entryTest: 'UoK pre-admission test', deadline: '2026-10-10',
    programs: [...artSci(30000), ...csTri(42000), P('Pharm-D', 'bachelor', '5 years', 55000)],
  },
  {
    name: 'NED University of Engineering & Technology', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1921, website: 'https://www.neduet.edu.pk',
    desc: 'Oldest engineering institution of Sindh with rigorous merit-based public admission.',
    minPercent: 60, entryTest: 'NED pre-admission entry test', deadline: '2026-08-31',
    programs: pubEng(48000),
  },
  {
    name: 'Institute of Business Administration Karachi', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1955, website: 'https://iba.edu.pk',
    desc: 'Pioneering business school of South Asia with strong placement and alumni network.',
    minPercent: 60, entryTest: 'IBA aptitude test or SAT', deadline: '2026-06-30',
    customReqs: [
      { requirementType: 'essay', requirementValue: 'Statement of purpose' },
      { requirementType: 'interview', requirementValue: 'Group discussion and interview for shortlisted candidates' },
    ],
    programs: bizTri(520000),
  },
  {
    name: 'Dow University of Health Sciences', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1945, website: 'https://www.duhs.edu.pk',
    desc: 'Major public health sciences university operating Dow hospitals and institutes.',
    minPercent: 85, entryTest: 'MDCAT plus Sindh central admission', deadline: '2026-09-30',
    extraCampuses: [{ name: 'Dow Ojha Campus', address: 'Suparco Road, Karachi' }],
    programs: medPub(65000),
  },
  {
    name: 'Aga Khan University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1983, website: 'https://www.aku.edu',
    desc: 'International private university renowned for medicine, nursing and education research.',
    minPercent: 75, entryTest: 'AKU admission tests', deadline: '2026-06-15',
    customReqs: [
      { requirementType: 'interview', requirementValue: 'Panel interview mandatory' },
      { requirementType: 'test_score', requirementValue: 'English proficiency evidence recommended' },
      { requirementType: 'sponsorship', requirementValue: 'Need and merit based financial aid application optional' },
    ],
    programs: [
      P('MBBS Bachelor of Medicine & Surgery', 'bachelor', '5 years', 950000),
      P('BS Nursing', 'bachelor', '4 years', 400000),
      P('Master of Science Epidemiology', 'master', '2 years', 700000),
    ],
  },
  {
    name: 'Jinnah Sindh Medical University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2012, website: 'https://jsmu.edu.pk',
    desc: 'Public medical university centered on Jinnah Postgraduate Medical Centre.',
    minPercent: 85, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(58000),
  },
  {
    name: 'Ziauddin University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1995, website: 'https://ziauddin.edu.pk',
    desc: 'Private health sciences university with teaching hospitals across Karachi.',
    minPercent: 80, entryTest: 'ZU institutional test plus MDCAT', deadline: '2026-09-05',
    programs: medCol(1250000),
  },
  {
    name: 'Hamdard University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1991, website: 'https://hamdard.edu.pk',
    desc: 'Private university at Madinat al-Hikmah covering medicine, pharmacy, engineering and humanities.',
    minPercent: 50, entryTest: 'HU entry test or NTS', deadline: '2026-09-20',
    mainAddress: 'Madinat al-Hikmah, Muhammad Bin Qasim Avenue, Karachi',
    programs: [P('Pharm-D', 'bachelor', '5 years', 240000), ...csTri(180000), ...bizTri(160000)],
  },
  {
    name: 'Federal Urdu University of Arts Sciences & Technology', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2002, website: 'https://www.fuuast.edu.pk',
    desc: 'Federally chartered university offering affordable Urdu and English medium education.',
    minPercent: 50, deadline: '2026-10-05',
    extraCampuses: [{ name: 'FUUAST Islamabad Campus', city: 'Islamabad' }],
    programs: [...artSci(35000), ...csTri(50000)],
  },
  {
    name: 'SZABIST Karachi', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1995, website: 'https://szabist.edu.pk',
    desc: 'Shaheed Zulfikar Ali Bhutto Institute flagship campus for management and computer sciences.',
    minPercent: 50, entryTest: 'SZABIST admission test or NTS', deadline: '2026-09-12',
    extraCampuses: [{ name: 'SZABIST Larkana Campus', city: 'Larkana' }, { name: 'SZABIST Hyderabad Campus', city: 'Hyderabad' }],
    programs: [...csTri(260000), ...bizTri(240000)],
  },
  {
    name: 'Indus Valley School of Art and Architecture', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1989, website: 'https://www.ivs.edu.pk',
    desc: 'Leading private art and architecture school on a restored heritage campus.',
    minPercent: 45, entryTest: 'IVS aptitude test', deadline: '2026-07-25',
    customReqs: [
      { requirementType: 'portfolio', requirementValue: 'Artwork portfolio submission' },
      { requirementType: 'interview', requirementValue: 'Interview with admissions jury' },
    ],
    programs: [
      P('Bachelors in Architecture', 'bachelor', '5 years', 480000),
      P('Bachelor of Fine Arts', 'bachelor', '4 years', 450000),
      P('BS Communication Design', 'bachelor', '4 years', 460000),
      P('BS Textile Design', 'bachelor', '4 years', 450000),
    ],
  },
  {
    name: 'PAF Karachi Institute of Economics & Technology', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1997, website: 'https://pafkiet.edu.pk',
    desc: 'Air Force sponsored degree-awarding institute for computing and business.',
    minPercent: 50, entryTest: 'KIET entrance test', deadline: '2026-09-15',
    mainCampusName: 'KIET Korangi Creek Campus',
    extraCampuses: [{ name: 'KIET City Campus', address: 'Shahrah-e-Faisal, Karachi' }],
    programs: [...csTri(190000), ...pubEng(170000), ...bizTri(160000)],
  },
  {
    name: 'Institute of Business Management', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1995, website: 'https://www.iobm.edu.pk',
    desc: 'Private management university known as IoBM with corporate-linked curriculum.',
    minPercent: 50, entryTest: 'IoBM admission test', deadline: '2026-09-01',
    programs: bizTri(430000),
  },
  {
    name: 'Sir Syed University of Engineering & Technology', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1994, website: 'https://ssuet.edu.pk',
    desc: 'Aligarh movement private engineering university in Gulshan-e-Iqbal.',
    minPercent: 50, entryTest: 'SSUET admission test', deadline: '2026-09-18',
    programs: [...pubEng(210000), ...csTri(200000)],
  },
  {
    name: 'Mohammad Ali Jinnah University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1998, website: 'https://maju.edu.pk',
    desc: 'Private university group campus strong in computer science and business.',
    minPercent: 50, entryTest: 'MAJU entry test or NTS', deadline: '2026-09-14',
    programs: [...csTri(230000), ...bizTri(220000)],
  },
  {
    name: 'Textile Institute of Pakistan', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1994, website: 'https://www.tip.edu.pk',
    desc: 'Aptech-affiliated specialist textile institute serving the export industry.',
    minPercent: 45, entryTest: 'TIP assessment', deadline: '2026-08-30',
    customReqs: [{ requirementType: 'portfolio', requirementValue: 'Design portfolio for design programs' }],
    programs: [
      P('BS Textile Engineering', 'bachelor', '4 years', 250000),
      P('BS Textile Design Technology', 'bachelor', '4 years', 245000),
      P('BS Fashion Design Management', 'bachelor', '4 years', 255000),
    ],
  },
  {
    name: 'Greenwich University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1998, website: 'https://www.greenwich.edu.pk',
    desc: 'Private seaside campus university focused on business and media studies.',
    minPercent: 45, entryTest: 'GU entry interview and test', deadline: '2026-09-22',
    programs: [...bizTri(350000), ...artSci(300000)],
  },
  {
    name: 'Benazir Bhutto Shaheed University Lyari', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2010, website: 'https://www.bbsul.edu.pk',
    desc: 'Public university established to serve Lyari and adjoining districts.',
    minPercent: 45, deadline: '2026-10-15',
    programs: [...artSci(30000), ...csTri(40000)],
  },
  {
    name: 'Jinnah University for Women', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1998, website: 'https://juw.edu.pk',
    desc: 'Large private womens university with wide faculty range.',
    minPercent: 50, deadline: '2026-09-28',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: [...artSci(60000), ...csTri(75000)],
  },
  {
    name: 'Iqra University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2000, website: 'https://iqra.edu.pk',
    desc: 'Top-ranked private university for business and computer science in Karachi.',
    minPercent: 50, entryTest: 'IU entrance test', deadline: '2026-09-10',
    mainAddress: 'Defence View, Shaheed-e-Millat Road, Karachi',
    programs: [...bizTri(280000), ...csTri(270000)],
  },
  {
    name: 'Sindh Madressatul Islam University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1885, website: 'https://www.smiu.edu.pk',
    desc: 'Historic alma mater of Quaid-e-Azam Muhammad Ali Jinnah, upgraded to a chartered university. One of the oldest institutions of higher learning in Sindh.',
    minPercent: 50, entryTest: 'SMIU entry test', deadline: '2026-10-01',
    programs: [
      ...artSci(35000), ...csTri(50000),
      P('BBA Business Administration', 'bachelor', '4 years', 80000),
      P('BS Accounting & Finance', 'bachelor', '4 years', 75000),
      P('LLB Bachelor of Laws', 'bachelor', '5 years', 60000),
      P('BCom Bachelor of Commerce', 'bachelor', '4 years', 55000),
      P('BS Economics', 'bachelor', '4 years', 45000),
      P('BS Political Science', 'bachelor', '4 years', 38000),
      P('BS Urdu', 'bachelor', '4 years', 30000),
      P('BS Islamic Studies', 'bachelor', '4 years', 28000),
      P('MBA Master of Business Administration', 'master', '2 years', 120000),
      P('MS Computer Science', 'master', '2 years', 90000),
      P('MA English', 'master', '2 years', 50000),
      P('MA Urdu', 'master', '2 years', 35000),
      P('LLM Master of Laws', 'master', '2 years', 80000),
      P('MCom Master of Commerce', 'master', '2 years', 60000),
      P('PhD Business Administration', 'phd', '3-5 years', 150000),
      P('PhD Computer Science', 'phd', '3-5 years', 140000),
      P('PhD English', 'phd', '3-5 years', 100000),
      P('PhD Law', 'phd', '3-5 years', 120000),
    ],
  },
  {
    name: 'Habib University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2014, website: 'https://habib.edu.pk',
    desc: 'Liberal arts and sciences university built around integrated yohsin education.',
    minPercent: 65, entryTest: 'SAT or Habib admission assessment', deadline: '2026-03-15',
    customReqs: [
      { requirementType: 'essay', requirementValue: 'Reflective essays as part of holistic review' },
      { requirementType: 'interview', requirementValue: 'Faculty interview required' },
    ],
    programs: [
      P('BS Computer Science', 'bachelor', '4 years', 650000),
      P('BA Communication & Design', 'bachelor', '4 years', 640000),
      P('BS Electrical Engineering', 'bachelor', '4 years', 660000),
      P('BA Social Development & Policy', 'bachelor', '4 years', 635000),
    ],
  },
  {
    name: 'DHA Suffa University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2002, website: 'https://dhasuffa.edu.pk',
    desc: 'DHACSS-managed university with growing engineering and computing schools.',
    minPercent: 50, entryTest: 'DSU entry test', deadline: '2026-09-16',
    programs: [...csTri(260000), ...pubEng(240000)],
  },
  {
    name: 'Preston University Karachi', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1984, website: 'https://preston.edu.pk',
    desc: 'Among the oldest private degree-awarding universities in Pakistan.',
    minPercent: 45, deadline: '2026-09-30',
    extraCampuses: [
      { name: 'Preston University Islamabad Campus', city: 'Islamabad' },
      { name: 'Preston University Peshawar Campus', city: 'Peshawar' },
    ],
    programs: [...bizTri(150000), ...csTri(160000)],
  },
  {
    name: 'Baqai Medical University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1988, website: 'https://baqai.edu.pk',
    desc: 'Private medical university on Super Highway with veterinary and pharma faculties.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-08',
    programs: [...medCol(1100000), P('DVM Veterinary Medicine', 'bachelor', '5 years', 350000)],
  },
  {
    name: 'Indus University Karachi', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2012, website: 'https://indus.edu.pk',
    desc: 'Private chartered university combining engineering, fashion and business schools.',
    minPercent: 45, deadline: '2026-09-24',
    programs: [...csTri(180000), P('BS Fashion Design', 'bachelor', '4 years', 175000)],
  },
  {
    name: 'UIT University', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2021, website: 'https://uit.edu.pk',
    desc: 'Chartered university evolved from Usman Institute of Technology in Gulshan.',
    minPercent: 50, deadline: '2026-09-20',
    programs: [...pubEng(200000), ...csTri(195000)],
  },
  {
    name: 'Dawood University of Engineering & Technology', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 1964, website: 'https://duet.edu.pk',
    desc: 'Public engineering university founded by Ahmed Dawood near M.A. Jinnah Road.',
    minPercent: 60, entryTest: 'DUET pre-admission test', deadline: '2026-09-02',
    programs: pubEng(40000),
  },
  {
    name: 'Jinnah Medical & Dental College', city: 'Karachi', province: 'Sindh', type: 'college',
    founded: 1998, website: null,
    desc: 'Private medical and dental college on Shaheed-e-Millat Road.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-10',
    programs: medCol(1150000),
  },
  {
    name: 'United Medical & Dental College', city: 'Karachi', province: 'Sindh', type: 'college',
    founded: 2012, website: null,
    desc: 'Private college attached to United Hospital, Ibrahim Hyderi corridor.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-12',
    programs: medCol(1050000),
  },
  {
    name: 'National Academy of Performing Arts', city: 'Karachi', province: 'Sindh', type: 'college',
    founded: 2005, website: 'https://www.napa.org.pk',
    desc: 'Chartered academy for theatre, music and performing arts housed at Hindu Gymkhana.',
    minPercent: 45, entryTest: 'NAPA audition and aptitude evaluation', deadline: '2026-08-20',
    customReqs: [{ requirementType: 'interview', requirementValue: 'Live audition before faculty panel' }],
    programs: [
      P('Diploma in Acting', 'diploma', '2 years', 120000),
      P('Diploma in Music', 'diploma', '2 years', 120000),
    ],
  },
  {
    name: 'Karachi School of Art', city: 'Karachi', province: 'Sindh', type: 'college',
    founded: 1964, website: null,
    desc: 'Oldest private art school of Pakistan awarding degrees through affiliated universities.',
    minPercent: 45, entryTest: 'KSA drawing test', deadline: '2026-08-25',
    customReqs: [{ requirementType: 'portfolio', requirementValue: 'Sketch portfolio review' }],
    programs: [P('Diploma in Fine Art', 'diploma', '2 years', 90000), P('Diploma in Communication Design', 'diploma', '2 years', 95000)],
  },
  {
    name: 'Newports Institute of Communications & Economics', city: 'Karachi', province: 'Sindh', type: 'university',
    founded: 2002, website: null,
    desc: 'Private institute chartered in Sindh offering business and computing degrees.',
    minPercent: 45, deadline: '2026-09-26',
    programs: [...bizTri(140000), ...csTri(150000)],
  },
];

const islamabadInstitutions: UniSeed[] = [
  {
    name: 'Quaid-i-Azam University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1967, website: 'https://www.qau.edu.pk',
    desc: 'Premier federal research university consistently ranked top in Pakistan for natural sciences.',
    minPercent: 55, entryTest: 'QAU departmental admission test or GAT', deadline: '2026-09-15',
    mainAddress: 'Shahdra Valley Road, Islamabad',
    programs: [...artSci(38000), ...csTri(45000), P('MS Biotechnology', 'master', '2 years', 42000)],
  },
  {
    name: 'National University of Sciences & Technology', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1991, website: 'https://nust.edu.pk',
    desc: 'Top multi-campus STEM university of Pakistan with defence-linked research ecosystem.',
    minPercent: 60, entryTest: 'NUST NET series', deadline: '2026-07-31',
    mainCampusName: 'NUST H-12 Main Campus',
    extraCampuses: [
      { name: 'NUST College of E&ME', address: 'Rawalpindi' },
      { name: 'NUST PNEC Karachi', city: 'Karachi' },
      { name: 'NUST College of Aeronautical Engineering Risalpur', city: 'Nowshera' },
      { name: 'NUST Balochistan Campus Quetta', city: 'Quetta' },
    ],
    programs: [...pubEng(135000), ...csTri(140000), ...bizTri(130000)],
  },
  {
    name: 'COMSATS University Islamabad', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1998, website: 'https://comsats.edu.pk',
    desc: 'South Asia largest computing-focused public university network.',
    minPercent: 50, entryTest: 'CUI NTS-based entry test', deadline: '2026-09-10',
    mainCampusName: 'CUI Chak Shahzad Campus',
    extraCampuses: [
      { name: 'CUI Lahore Campus', city: 'Lahore' },
      { name: 'CUI Abbottabad Campus', city: 'Abbottabad' },
      { name: 'CUI Wah Campus', city: 'Wah Cantt' },
      { name: 'CUI Attock Campus', city: 'Attock' },
      { name: 'CUI Sahiwal Campus', city: 'Sahiwal' },
      { name: 'CUI Vehari Campus', city: 'Vehari' },
    ],
    programs: [...csTri(145000), ...pubEng(130000)],
  },
  {
    name: 'International Islamic University Islamabad', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1980, website: 'https://www.iiu.edu.pk',
    desc: 'Federal university integrating Islamic studies with contemporary disciplines across male and female campuses.',
    minPercent: 50, entryTest: 'IIUI departmental test', deadline: '2026-09-20',
    extraCampuses: [{ name: 'IIUI Female Campus', address: 'Sector H-10, Islamabad' }],
    programs: [...artSci(55000), ...csTri(70000)],
  },
  {
    name: 'Bahria University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2000, website: 'https://bahria.edu.pk',
    desc: 'Pakistan Navy administered chartered university with campuses nationwide.',
    minPercent: 50, entryTest: 'Bahria entry test', deadline: '2026-09-12',
    extraCampuses: [
      { name: 'Bahria University Karachi Campus', city: 'Karachi' },
      { name: 'Bahria University Lahore Campus', city: 'Lahore' },
    ],
    programs: [...csTri(230000), ...pubEng(215000)],
  },
  {
    name: 'Air University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2002, website: 'https://air.edu.pk',
    desc: 'Pakistan Air Force chartered university excelling in avionics, mechatronics and CS.',
    minPercent: 50, entryTest: 'AU admission test', deadline: '2026-09-08',
    extraCampuses: [
      { name: 'Air University Multan Campus', city: 'Multan' },
      { name: 'Air University Kamra Campus', city: 'Attock' },
    ],
    programs: [...csTri(225000), ...pubEng(210000)],
  },
  {
    name: 'Pakistan Institute of Engineering and Applied Sciences', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1997, website: 'https://www.pieas.edu.pk',
    desc: 'Nuclear-focused federal engineering institute with fully funded fellowships.',
    minPercent: 70, entryTest: 'PIEAS fellowship admission test', deadline: '2026-06-30',
    customReqs: [{ requirementType: 'service_bond', requirementValue: 'Selected fellows sign PAEC service agreement' }],
    programs: [...pubEng(35000), P('MS Nuclear Engineering', 'master', '2 years', 30000)],
  },
  {
    name: 'Institute of Space Technology', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2002, website: 'http://www.ist.edu.pk',
    desc: 'SUPARCO-administered university dedicated to aerospace and avionics education.',
    minPercent: 60, entryTest: 'IST admission test', deadline: '2026-08-20',
    programs: [
      P('BS Aerospace Engineering', 'bachelor', '4 years', 95000),
      P('BS Avionics Engineering', 'bachelor', '4 years', 95000),
      P('BS Space Science', 'bachelor', '4 years', 85000),
      P('MS Aerospace Engineering', 'master', '2 years', 90000),
    ],
  },
  {
    name: 'National Defence University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2007, website: 'https://www.ndu.edu.pk',
    desc: 'Flagship national security university training civil and military leaders.',
    minPercent: 55, entryTest: 'NDU entry assessment', deadline: '2026-08-15',
    customReqs: [{ requirementType: 'document', requirementValue: 'Government or armed forces nomination for select programmes; open merit seats available' }],
    programs: [
      P('MSc War Studies', 'master', '2 years', 85000),
      P('MSc International Relations', 'master', '2 years', 85000),
      P('MPhil Peace & Conflict Studies', 'master', '2 years', 80000),
    ],
  },
  {
    name: 'National University of Modern Languages', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1969, website: 'https://numl.edu.pk',
    desc: 'Federal language and liberal arts university with countrywide campus network.',
    minPercent: 50, entryTest: 'NUML departmental test', deadline: '2026-09-25',
    extraCampuses: [
      { name: 'NUML Lahore Campus', city: 'Lahore' },
      { name: 'NUML Karachi Campus', city: 'Karachi' },
      { name: 'NUML Peshawar Campus', city: 'Peshawar' },
      { name: 'NUML Quetta Campus', city: 'Quetta' },
      { name: 'NUML Faisalabad Campus', city: 'Faisalabad' },
    ],
    programs: [...artSci(60000), P('BS English Linguistics', 'bachelor', '4 years', 62000), P('Diploma in Chinese Language', 'certificate', '1 year', 30000)],
  },
  {
    name: 'Allama Iqbal Open University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1974, website: 'https://www.aiou.edu.pk',
    desc: 'World leading open distance-learning university by enrolled students.',
    minPercent: 45, deadline: '2026-10-31',
    extraCampuses: [
      { name: 'AIOU Regional Campus Lahore', city: 'Lahore' },
      { name: 'AIOU Regional Campus Karachi', city: 'Karachi' },
    ],
    programs: [
      P('BS Computer Science Distance', 'bachelor', '4 years', 20000),
      P('MA Education Distance', 'master', '2 years', 18000),
      P('BS Mass Communication Distance', 'bachelor', '4 years', 19000),
    ],
  },
  {
    name: 'Riphah International University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1998, website: 'https://riphah.edu.pk',
    desc: 'Private not-for-profit university strong in rehabilitation sciences and pharmacy.',
    minPercent: 50, entryTest: 'Riphah entry test or NTS', deadline: '2026-09-18',
    extraCampuses: [{ name: 'Riphah International University Lahore Campus', city: 'Lahore' }],
    programs: [P('Doctor of Physical Therapy', 'bachelor', '5 years', 320000), P('Pharm-D', 'bachelor', '5 years', 300000), ...csTri(240000)],
  },
  {
    name: 'Foundation University Islamabad', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2000, website: 'https://fui.edu.pk',
    desc: 'Fauji Foundation chartered university with medical and dental colleges.',
    minPercent: 50, entryTest: 'FUI entry test', deadline: '2026-09-14',
    extraCampuses: [{ name: 'Foundation University Rawalpindi Campus', address: 'New Lalazar, Rawalpindi' }],
    programs: [...csTri(210000), ...bizTri(200000), ...medCol(1050000)],
  },
  {
    name: 'Capital University of Science and Technology', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1998, website: 'https://cust.edu.pk',
    desc: 'Former Mohammad Ali Jinnah University Islamabad campus, strong in CS and management.',
    minPercent: 50, entryTest: 'CUST admission test', deadline: '2026-09-16',
    programs: [...csTri(250000), ...bizTri(235000)],
  },
  {
    name: 'Shifa Tameer-e-Millat University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2007, website: 'https://stmu.edu.pk',
    desc: 'Health-focused private university anchored by Shifa International Hospital.',
    minPercent: 80, entryTest: 'STMU institutional test plus MDCAT', deadline: '2026-09-06',
    programs: [...medCol(1150000), P('BS Nursing', 'bachelor', '4 years', 450000)],
  },
  {
    name: 'Shaheed Zulfiqar Ali Bhutto Medical University', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2013, website: 'https://szbmu.edu.pk',
    desc: 'Federal medical university operating PIMS and FGSH hospitals.',
    minPercent: 85, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(60000),
  },
  {
    name: 'National Skills University Islamabad', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2018, website: 'https://nsu.edu.pk',
    desc: 'First federal skills-focused university for technical trades and technologies.',
    minPercent: 45, entryTest: 'NSU skills assessment', deadline: '2026-10-10',
    programs: [
      P('BS Electrical Engineering Technology', 'bachelor', '4 years', 40000),
      P('Diploma of Associate Engineer Civil', 'diploma', '3 years', 25000),
      P('Certificate in Mechatronics Trades', 'certificate', '1 year', 15000),
    ],
  },
  {
    name: 'National University of Technology', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2019, website: 'https://nutech.edu.pk',
    desc: 'Engineering technology focused federal chartered university.',
    minPercent: 50, entryTest: 'NUTECH entry test', deadline: '2026-09-20',
    programs: [...pubEng(150000), P('BS Engineering Technology Mechanical', 'bachelor', '4 years', 120000)],
  },
  {
    name: 'National University of Computer and Emerging Sciences', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2000, website: 'https://nu.edu.pk',
    desc: 'FAST brand private computing university with five campuses nationally.',
    minPercent: 60, entryTest: 'FAST NUCES admission test', deadline: '2026-07-15',
    extraCampuses: [
      { name: 'FAST NU Karachi Campus', city: 'Karachi' },
      { name: 'FAST NU Lahore Campus', city: 'Lahore' },
      { name: 'FAST NU Peshawar Campus', city: 'Peshawar' },
      { name: 'FAST NU Faisalabad Campus', city: 'Faisalabad' },
      { name: 'FAST NU Multan Campus', city: 'Multan' },
    ],
    programs: csTri(330000),
  },
  {
    name: 'Pakistan Institute of Development Economics', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 1957, website: 'https://www.pide.org.pk',
    desc: 'Autonomous economics research institution granting degrees from bachelors to doctorate.',
    minPercent: 60, entryTest: 'PIDE graduate admission test or GAT General', deadline: '2026-08-31',
    customReqs: [{ requirementType: 'test_score', requirementValue: 'GAT General or GRE required for graduate programmes' }],
    programs: [
      P('BS Economics', 'bachelor', '4 years', 110000),
      P('MSc Economics', 'master', '2 years', 120000),
      P('MPhil Economics', 'master', '2 years', 135000),
      P('PhD Economics', 'phd', '3-5 years', 150000),
    ],
  },
  {
    name: 'Virtual University of Pakistan', city: 'Islamabad', province: 'Islamabad Capital Territory', type: 'university',
    founded: 2002, website: 'https://www.vu.edu.pk',
    desc: 'Government online university delivering fully digital degree programs.',
    minPercent: 45, deadline: '2026-11-15',
    extraCampuses: [
      { name: 'VU Lahore Campus', city: 'Lahore' },
      { name: 'VU Karachi Campus', city: 'Karachi' },
      { name: 'VU Peshawar Campus', city: 'Peshawar' },
      { name: 'VU Faisalabad Campus', city: 'Faisalabad' },
    ],
    programs: [...csTri(45000), ...bizTri(40000)],
  },
];

const rawalpindiInstitutions: UniSeed[] = [
  {
    name: 'Pir Mehr Ali Shah Arid Agriculture University', city: 'Rawalpindi', province: 'Punjab', type: 'university',
    founded: 1994, website: 'https://www.uaar.edu.pk',
    desc: 'Dryland agriculture specialist public university serving the Pothohar region.',
    minPercent: 50, entryTest: 'AAUR entry test', deadline: '2026-09-20',
    programs: agriQuad(45000),
  },
  {
    name: 'Fatima Jinnah Women University', city: 'Rawalpindi', province: 'Punjab', type: 'university',
    founded: 1998, website: 'https://fjwu.edu.pk',
    desc: 'First exclusive womens public university of Pakistan housed in heritage buildings.',
    minPercent: 50, entryTest: 'FJWU departmental test', deadline: '2026-09-25',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: [...artSci(50000), ...csTri(60000)],
  },
  {
    name: 'Rawalpindi Medical University', city: 'Rawalpindi', province: 'Punjab', type: 'university',
    founded: 2017, website: 'https://rmur.edu.pk',
    desc: 'Public medical university anchored at Holy Family and DHQ teaching hospitals.',
    minPercent: 87, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(55000),
  },
  {
    name: 'National University of Medical Sciences', city: 'Rawalpindi', province: 'Punjab', type: 'university',
    founded: 2015, website: 'https://numspak.edu.pk',
    desc: 'Armed forces medical university coordinating CMH network colleges.',
    minPercent: 85, entryTest: 'NUMS entry test plus MDCAT', deadline: '2026-09-05',
    extraCampuses: [{ name: 'Army Medical College Campus', address: 'Abid Majeed Road, Rawalpindi' }],
    programs: medPub(75000),
  },
  {
    name: 'University of Engineering and Technology Taxila', city: 'Taxila', province: 'Punjab', type: 'university',
    founded: 1975, website: 'https://web.uettaxila.edu.pk',
    desc: 'Independent engineering university evolved from UET Lahore Taxila campus.',
    minPercent: 60, entryTest: 'UET ECAT', deadline: '2026-08-31',
    programs: pubEng(60000),
  },
  {
    name: 'HITEC University Taxila', city: 'Taxila', province: 'Punjab', type: 'university',
    founded: 2007, website: 'https://hitecuni.edu.pk',
    desc: 'Heavy Industries Taxila sponsored private university for mechanical and CS programs.',
    minPercent: 50, entryTest: 'HITEC entry test or NTS', deadline: '2026-09-18',
    programs: [...pubEng(220000), ...csTri(210000)],
  },
  {
    name: 'University of Wah', city: 'Wah Cantt', province: 'Punjab', type: 'university',
    founded: 2005, website: 'https://uow.edu.pk',
    desc: 'Public sector chartered university serving the Wah industrial belt.',
    minPercent: 50, entryTest: 'UoW admission test', deadline: '2026-09-22',
    programs: [...pubEng(90000), ...artSci(70000)],
  },
  {
    name: 'University of Chakwal', city: 'Chakwal', province: 'Punjab', type: 'university',
    founded: 2020, website: null,
    desc: 'Newly established public general university of Chakwal district.',
    minPercent: 50, deadline: '2026-10-05',
    programs: [...artSci(50000), ...csTri(60000)],
  },
  {
    name: 'Rawalpindi Women University', city: 'Rawalpindi', province: 'Punjab', type: 'university',
    founded: 2019, website: null,
    desc: 'Government womens university upgraded from Satellite Town degree college.',
    minPercent: 50, deadline: '2026-09-28',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: artSci(45000),
  },
  {
    name: 'Wah Medical College', city: 'Wah Cantt', province: 'Punjab', type: 'college',
    founded: 2002, website: null,
    desc: 'Private medical college affiliated with NUMS in POF hospital premises.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-12',
    programs: medCol(1000000),
  },
];

const faisalabadInstitutions: UniSeed[] = [
  {
    name: 'University of Agriculture Faisalabad', city: 'Faisalabad', province: 'Punjab', type: 'university',
    founded: 1906, website: 'http://www.uaf.edu.pk',
    desc: 'South Asia leading agriculture university with extensive research farms.',
    minPercent: 55, entryTest: 'UAF ETG entry test', deadline: '2026-09-15',
    extraCampuses: [{ name: 'UAF Toba Tek Singh Sub-Campus', city: 'Toba Tek Singh' }],
    programs: [...agriQuad(55000), P('BSc Agricultural Engineering', 'bachelor', '4 years', 58000)],
  },
  {
    name: 'Government College University Faisalabad', city: 'Faisalabad', province: 'Punjab', type: 'university',
    founded: 1897, website: 'https://gcuf.edu.pk',
    desc: 'Historic public university covering sciences, arts and allied health.',
    minPercent: 50, entryTest: 'GCUF entrance test', deadline: '2026-09-22',
    programs: [...artSci(40000), ...csTri(55000)],
  },
  {
    name: 'University of Engineering and Technology Faisalabad', city: 'Faisalabad', province: 'Punjab', type: 'university',
    founded: 2004, website: 'https://uetfsd.edu.pk',
    desc: 'Chartered engineering university formerly the Faisalabad campus of UET Lahore.',
    minPercent: 60, entryTest: 'UET ECAT', deadline: '2026-08-31',
    programs: pubEng(55000),
  },
  {
    name: 'National Textile University', city: 'Faisalabad', province: 'Punjab', type: 'university',
    founded: 1992, website: 'https://ntu.edu.pk',
    desc: 'Federal chartered specialist university for textile engineering and design.',
    minPercent: 55, entryTest: 'NTU admission test', deadline: '2026-08-25',
    customReqs: [{ requirementType: 'portfolio', requirementValue: 'Design portfolio for design school applicants' }],
    programs: [
      P('BS Textile Engineering', 'bachelor', '4 years', 140000),
      P('BS Polymer Engineering', 'bachelor', '4 years', 135000),
      P('BS Textile Design', 'bachelor', '4 years', 145000),
      P('BS Fashion Design', 'bachelor', '4 years', 145000),
    ],
  },
  {
    name: 'Faisalabad Medical University', city: 'Faisalabad', province: 'Punjab', type: 'university',
    founded: 1973, website: null,
    desc: 'Public medical university attached to Allied Hospital Faisalabad.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(52000),
  },
  {
    name: 'Government College Women University Faisalabad', city: 'Faisalabad', province: 'Punjab', type: 'university',
    founded: 1934, website: 'https://gcwuf.edu.pk',
    desc: 'Public womens university offering sciences, arts and home economics.',
    minPercent: 50, deadline: '2026-09-26',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: artSci(38000),
  },
  {
    name: 'The University of Faisalabad', city: 'Faisalabad', province: 'Punjab', type: 'university',
    founded: 2002, website: 'https://tuf.edu.pk',
    desc: 'Private Madinah Foundation university strong in health sciences.',
    minPercent: 50, entryTest: 'TUF entry test', deadline: '2026-09-20',
    programs: [...medCol(950000), ...csTri(180000)],
  },
];

const multanInstitutions: UniSeed[] = [
  {
    name: 'Bahauddin Zakariya University', city: 'Multan', province: 'Punjab', type: 'university',
    founded: 1975, website: 'https://bzu.edu.pk',
    desc: 'Major south Punjab public university spanning agriculture, engineering and humanities.',
    minPercent: 50, entryTest: 'BZU departmental test', deadline: '2026-09-24',
    extraCampuses: [
      { name: 'BZU Layyah Campus', city: 'Layyah' },
      { name: 'BZU Sahiwal Campus', city: 'Sahiwal' },
    ],
    programs: [...artSci(40000), ...csTri(55000), ...agriQuad(48000)],
  },
  {
    name: 'Nishtar Medical University', city: 'Multan', province: 'Punjab', type: 'university',
    founded: 1951, website: null,
    desc: 'One of Pakistans oldest medical institutions attached to Nishtar Hospital.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(50000),
  },
  {
    name: 'Muhammad Nawaz Sharif University of Agriculture', city: 'Multan', province: 'Punjab', type: 'university',
    founded: 2013, website: 'https://mnsuam.edu.pk',
    desc: 'Cotton-belt focused agricultural university with field research stations.',
    minPercent: 50, entryTest: 'MNS-Agri entry test', deadline: '2026-09-18',
    programs: agriQuad(50000),
  },
  {
    name: 'Women University Multan', city: 'Multan', province: 'Punjab', type: 'university',
    founded: 2018, website: null,
    desc: 'Dedicated public womens university for southern Punjab.',
    minPercent: 50, deadline: '2026-09-28',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: artSci(45000),
  },
  {
    name: 'MNS University of Engineering and Technology Multan', city: 'Multan', province: 'Punjab', type: 'university',
    founded: 2019, website: null,
    desc: 'New public engineering university serving southern Punjab industrial needs.',
    minPercent: 60, entryTest: 'ECAT equivalent entry test', deadline: '2026-08-31',
    programs: pubEng(70000),
  },
  {
    name: 'Institute of Southern Punjab', city: 'Multan', province: 'Punjab', type: 'university',
    founded: 2010, website: null,
    desc: 'Private chartered institute offering accessible professional degrees.',
    minPercent: 45, deadline: '2026-09-25',
    programs: [...csTri(120000), ...bizTri(110000)],
  },
  {
    name: 'NFC Institute of Engineering and Technology Multan', city: 'Multan', province: 'Punjab', type: 'university',
    founded: 1985, website: null,
    desc: 'Fertilizer corporation endowed public engineering institute.',
    minPercent: 60, entryTest: 'Entry test per BZU/UET pattern', deadline: '2026-09-01',
    programs: pubEng(65000),
  },
  {
    name: 'Government Emerson College Multan', city: 'Multan', province: 'Punjab', type: 'college',
    founded: 1958, website: null,
    desc: 'Historic government degree college affiliated with BZU.',
    minPercent: 45, deadline: '2026-09-20',
    programs: interQuad(25000),
  },
];

const sindhInteriorInstitutions: UniSeed[] = [
  {
    name: 'University of Sindh Jamshoro', city: 'Jamshoro', province: 'Sindh', type: 'university',
    founded: 1947, website: 'https://www.usindh.edu.pk',
    desc: 'Oldest university of Sindh with sprawling Jamshoro hillside campus.',
    minPercent: 50, entryTest: 'SU pre-entry test', deadline: '2026-10-08',
    extraCampuses: [
      { name: 'Sindh University Hyderabad Campus', city: 'Hyderabad' },
      { name: 'Sindh University Laar Campus Badin', city: 'Badin' },
    ],
    programs: [...artSci(28000), ...csTri(35000)],
  },
  {
    name: 'Mehran University of Engineering and Technology', city: 'Jamshoro', province: 'Sindh', type: 'university',
    founded: 1963, website: 'https://www.muet.edu.pk',
    desc: 'Premier engineering university of Sindh beside Indus river.',
    minPercent: 60, entryTest: 'MUET pre-entry test', deadline: '2026-09-05',
    extraCampuses: [{ name: 'MUET SZAB Campus Khairpur', city: 'Khairpur' }],
    programs: pubEng(45000),
  },
  {
    name: 'Liaquat University of Medical and Health Sciences', city: 'Jamshoro', province: 'Sindh', type: 'university',
    founded: 1881, website: 'https://www.lumhs.edu.pk',
    desc: 'First medical college of Sindh now a full health sciences university.',
    minPercent: 85, entryTest: 'MDCAT plus Sindh central admission', deadline: '2026-09-30',
    extraCampuses: [{ name: 'LUMHS City Campus Hyderabad', city: 'Hyderabad' }],
    programs: medPub(55000),
  },
  {
    name: 'Isra University Hyderabad', city: 'Hyderabad', province: 'Sindh', type: 'university',
    founded: 1997, website: 'https://www.isra.edu.pk',
    desc: 'Private philanthropic university with medical college and Karachi campus.',
    minPercent: 80, entryTest: 'MDCAT plus Isra assessment', deadline: '2026-09-10',
    extraCampuses: [{ name: 'Isra University Karachi Campus', city: 'Karachi' }],
    programs: medCol(1050000),
  },
  {
    name: 'Sindh Agriculture University Tandojam', city: 'Tandojam', province: 'Sindh', type: 'university',
    founded: 1977, website: 'https://www.sau.edu.pk',
    desc: 'Agricultural university serving Indus delta farming communities.',
    minPercent: 50, entryTest: 'SAU entry test', deadline: '2026-09-20',
    programs: agriQuad(40000),
  },
  {
    name: 'Government College University Hyderabad', city: 'Hyderabad', province: 'Sindh', type: 'university',
    founded: 1921, website: null,
    desc: 'Upgraded historic govt college providing affordable higher education.',
    minPercent: 50, deadline: '2026-10-10',
    programs: artSci(32000),
  },
];

const balochistanInstitutions: UniSeed[] = [
  {
    name: 'University of Balochistan Quetta', city: 'Quetta', province: 'Balochistan', type: 'university',
    founded: 1970, website: 'https://www.uob.edu.pk',
    desc: 'Largest oldest public university of Balochistan province.',
    minPercent: 50, entryTest: 'UoB departmental test', deadline: '2026-10-12',
    programs: [...artSci(25000), ...csTri(30000)],
  },
  {
    name: 'BUITEMS Quetta', city: 'Quetta', province: 'Balochistan', type: 'university',
    founded: 2002, website: 'https://www.buitems.edu.pk',
    desc: 'Balochistan flagship IT, engineering and management sciences university.',
    minPercent: 55, entryTest: 'BUITEMS entry test', deadline: '2026-09-20',
    programs: [...csTri(60000), ...pubEng(55000)],
  },
  {
    name: 'Lasbela University of Agriculture Water and Marine Sciences', city: 'Uthal', province: 'Balochistan', type: 'university',
    founded: 2005, website: 'https://luawms.edu.pk',
    desc: 'Coastal agricultural and marine sciences specialist university.',
    minPercent: 50, entryTest: 'LUAWMS entry test', deadline: '2026-09-28',
    programs: [...agriQuad(35000), P('BS Marine Sciences', 'bachelor', '4 years', 32000)],
  },
  {
    name: 'Sardar Bahadur Khan Women University', city: 'Quetta', province: 'Balochistan', type: 'university',
    founded: 2004, website: 'https://sbkwu.edu.pk',
    desc: 'First dedicated womens university of Balochistan.',
    minPercent: 50, deadline: '2026-10-05',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: artSci(28000),
  },
  {
    name: 'Balochistan University of Engineering & Technology Khuzdar', city: 'Khuzdar', province: 'Balochistan', type: 'university',
    founded: 1987, website: null,
    desc: 'Engineering university serving central Balochistan.',
    minPercent: 55, deadline: '2026-09-25',
    programs: pubEng(40000),
  },
  {
    name: 'University of Turbat', city: 'Turbat', province: 'Balochistan', type: 'university',
    founded: 2012, website: null,
    desc: 'Makran division public university promoting higher education in south Balochistan.',
    minPercent: 50, deadline: '2026-10-15',
    programs: artSci(26000),
  },
  {
    name: 'Bolan University of Medical and Health Sciences', city: 'Quetta', province: 'Balochistan', type: 'university',
    founded: 2018, website: null,
    desc: 'Provincial medical university consolidating Bolan Medical College.',
    minPercent: 85, entryTest: 'MDCAT plus Balochistan central admission', deadline: '2026-09-30',
    programs: medPub(45000),
  },
  {
    name: 'University of Gwadar', city: 'Gwadar', province: 'Balochistan', type: 'university',
    founded: 2020, website: null,
    desc: 'Coastal port-city university supporting CPEC-linked skills development.',
    minPercent: 50, deadline: '2026-10-20',
    programs: artSci(25000),
  },
];

const hazaraInstitutions: UniSeed[] = [
  {
    name: 'Hazara University Mansehra', city: 'Mansehra', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1985, website: 'https://www.hu.edu.pk',
    desc: 'Scenic public university at the foot of Kaghan valley serving greater Hazara.',
    minPercent: 50, entryTest: 'HU departmental test', deadline: '2026-10-05',
    programs: artSci(30000),
  },
  {
    name: 'Abbottabad University of Science and Technology', city: 'Abbottabad', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2015, website: null,
    desc: 'Public chartered university on Havelian Road focused on sciences and technology.',
    minPercent: 50, deadline: '2026-09-28',
    programs: [...artSci(45000), ...csTri(50000)],
  },
  {
    name: 'University of Haripur', city: 'Haripur', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2012, website: 'https://uoh.edu.pk',
    desc: 'Agriculture-rooted public university of Haripur district.',
    minPercent: 50, entryTest: 'UoH entry test', deadline: '2026-09-25',
    programs: [...agriQuad(42000), ...csTri(48000)],
  },
  {
    name: 'Kohsar University Murree', city: 'Murree', province: 'Punjab', type: 'university',
    founded: 2020, website: null,
    desc: 'Hill-station university promoting tourism, forestry and hospitality education.',
    minPercent: 50, deadline: '2026-10-10',
    programs: [P('BS Tourism & Hospitality Management', 'bachelor', '4 years', 40000), ...artSci(38000)],
  },
  {
    name: 'Ayub Medical College Abbottabad', city: 'Abbottabad', province: 'Khyber Pakhtunkhwa', type: 'college',
    founded: 1979, website: 'https://ayubmed.edu.pk',
    desc: 'Major public medical college attached to Ayub Teaching Hospital.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(50000),
  },
  {
    name: 'Frontier Medical College', city: 'Abbottabad', province: 'Khyber Pakhtunkhwa', type: 'college',
    founded: 1995, website: null,
    desc: 'First private medical college of KP in the hill town of Abbottabad.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-12',
    programs: medCol(950000),
  },
];

const peshawarInstitutions: UniSeed[] = [
  {
    name: 'University of Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1950, website: 'https://www.uop.edu.pk',
    desc: 'Oldest comprehensive public university of Khyber Pakhtunkhwa.',
    minPercent: 50, entryTest: 'UoP ETEA-based test', deadline: '2026-10-08',
    programs: [...artSci(30000), ...csTri(40000)],
  },
  {
    name: 'University of Engineering and Technology Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1980, website: 'https://www.uetpeshawar.edu.pk',
    desc: 'KP flagship engineering university with multiple campuses.',
    minPercent: 60, entryTest: 'UET ECAT combined entry test', deadline: '2026-08-31',
    extraCampuses: [{ name: 'UET Bannu Campus', city: 'Bannu' }],
    programs: pubEng(40000),
  },
  {
    name: 'Khyber Medical University', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2007, website: 'https://kmu.edu.pk',
    desc: 'Health sciences university regulating medical education across KP.',
    minPercent: 60, entryTest: 'KMU CAT or MDCAT per program', deadline: '2026-09-30',
    programs: medPub(45000),
  },
  {
    name: 'Islamia College University Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1913, website: 'https://icp.edu.pk',
    desc: 'Historic alma mater of founding leaders endowed by Quaid-e-Azam trust.',
    minPercent: 50, entryTest: 'ICP entry assessment', deadline: '2026-10-01',
    programs: artSci(28000),
  },
  {
    name: 'University of Agriculture Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1981, website: 'https://aup.edu.pk',
    desc: 'KP agricultural university supporting orchard and crop economies.',
    minPercent: 50, entryTest: 'AUP entry test', deadline: '2026-09-22',
    programs: agriQuad(40000),
  },
  {
    name: 'Institute of Management Sciences Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1995, website: 'https://imsciences.edu.pk',
    desc: 'Autonomous business school chartered as degree-awarding institute.',
    minPercent: 50, entryTest: 'IMSciences aptitude test', deadline: '2026-09-12',
    programs: bizTri(90000),
  },
  {
    name: 'CECOS University Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1986, website: 'https://cecos.edu.pk',
    desc: 'Private engineering university named after founder CECOS brand.',
    minPercent: 50, entryTest: 'CECOS entry test or NTS', deadline: '2026-09-18',
    programs: [...pubEng(150000), ...csTri(140000)],
  },
  {
    name: 'Edwardes College Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'college',
    founded: 1900, website: 'https://edwardescollege.edu.pk',
    desc: 'Mission-era college recently chartered as university-level institution.',
    minPercent: 50, entryTest: 'Edwardes admission test', deadline: '2026-08-25',
    programs: interQuad(50000),
  },
  {
    name: 'Gandhara University Peshawar', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1995, website: null,
    desc: 'Private health sciences university including Kabir Medical College.',
    minPercent: 80, entryTest: 'MDCAT', deadline: '2026-09-12',
    programs: medCol(950000),
  },
  {
    name: 'Qurtuba University of Science and Information Technology', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2001, website: 'https://www.qurtuba.edu.pk',
    desc: 'Private university with twin campuses in Peshawar and DI Khan.',
    minPercent: 45, deadline: '2026-09-26',
    extraCampuses: [{ name: 'Qurtuba University DI Khan Campus', city: 'Dera Ismail Khan' }],
    programs: [...artSci(80000), ...csTri(100000)],
  },
  {
    name: 'City University of Science and Information Technology', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2001, website: null,
    desc: 'Private computing-focused chartered university on Dalazak Road.',
    minPercent: 45, deadline: '2026-09-24',
    programs: csTri(110000),
  },
  {
    name: 'Sarhad University of Science and Information Technology', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2001, website: 'https://suit.edu.pk',
    desc: 'Large private university network headquartered in Peshawar.',
    minPercent: 45, deadline: '2026-09-20',
    programs: [...csTri(130000), ...pubEng(125000)],
  },
  {
    name: 'Iqra National University', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2010, website: 'https://inu.edu.pk',
    desc: 'Private chartered university on Warsak Road with business focus.',
    minPercent: 50, deadline: '2026-09-22',
    programs: [...bizTri(120000), ...csTri(130000)],
  },
  {
    name: 'Abasyn University', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2007, website: 'https://abasynuniv.edu.pk',
    desc: 'Progressive private university offering engineering and pharmacy.',
    minPercent: 50, deadline: '2026-09-24',
    extraCampuses: [{ name: 'Abasyn University Islamabad Campus', city: 'Islamabad' }],
    programs: [...csTri(125000), P('Pharm-D', 'bachelor', '5 years', 160000)],
  },
  {
    name: 'Khyber Girls Medical College', city: 'Peshawar', province: 'Khyber Pakhtunkhwa', type: 'college',
    founded: 2004, website: null,
    desc: 'First public sector girls medical college of KP in Hayatabad.',
    minPercent: 85, entryTest: 'MDCAT plus KMU central admission', deadline: '2026-09-30',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: medPub(46000),
  },
];

const mardanInstitutions: UniSeed[] = [
  {
    name: 'Abdul Wali Khan University Mardan', city: 'Mardan', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2009, website: 'https://awkum.edu.pk',
    desc: 'Fast-growing multi-campus public university of central KP.',
    minPercent: 50, entryTest: 'AWKUM entry test', deadline: '2026-10-05',
    extraCampuses: [
      { name: 'AWKUM Buner Campus', city: 'Buner' },
      { name: 'AWKUM Chitral Campus', city: 'Chitral' },
    ],
    programs: [...artSci(32000), ...csTri(40000)],
  },
  {
    name: 'University of Engineering and Technology Mardan', city: 'Mardan', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2020, website: null,
    desc: 'Newly independent engineering university carved from UET Peshawar campus.',
    minPercent: 55, entryTest: 'UET ECAT equivalent', deadline: '2026-08-31',
    programs: pubEng(45000),
  },
];

const malakandInstitutions: UniSeed[] = [
  {
    name: 'University of Swat', city: 'Swat', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2010, website: 'https://uswat.edu.pk',
    desc: 'Public university serving the Swat valley with arts, science and tourism faculties.',
    minPercent: 50, entryTest: 'USwat entry assessment', deadline: '2026-10-06',
    programs: artSci(30000),
  },
  {
    name: 'University of Malakand', city: 'Chakdara', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2001, website: 'https://www.uom.edu.pk',
    desc: 'Lower Dir public university on the Swat river bank.',
    minPercent: 50, deadline: '2026-10-08',
    programs: artSci(28000),
  },
  {
    name: 'Shaheed Benazir Bhutto University Sheringal', city: 'Upper Dir', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2009, website: 'https://sbbu.edu.pk',
    desc: 'Mountain university bringing higher education to Upper Dir valleys.',
    minPercent: 50, deadline: '2026-10-12',
    programs: artSci(28000),
  },
  {
    name: 'Saidu Medical College Swat', city: 'Swat', province: 'Khyber Pakhtunkhwa', type: 'college',
    founded: 1998, website: null,
    desc: 'Public medical college affiliated with KMU at Saidu Sharif.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(44000),
  },
  {
    name: 'University of Swabi', city: 'Swabi', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2015, website: null,
    desc: 'District public university between the Indus and Kabul rivers.',
    minPercent: 50, deadline: '2026-10-06',
    programs: artSci(30000),
  },
];

const kpOtherInstitutions: UniSeed[] = [
  {
    name: 'Ghulam Ishaq Khan Institute of Engineering Sciences and Technology', city: 'Topi', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1988, website: 'https://giki.edu.pk',
    desc: 'Elite private engineering institute famed for rigorous merit and lakeside campus.',
    minPercent: 70, entryTest: 'GIKI admission test or SAT Subject', deadline: '2026-07-10',
    customReqs: [
      { requirementType: 'test_score', requirementValue: 'SAT II Physics Math optional supplement' },
      { requirementType: 'interview', requirementValue: 'Interview for borderline merit cases' },
    ],
    programs: pubEng(480000),
  },
  {
    name: 'Khushal Khan Khattak University Karak', city: 'Karak', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2012, website: null,
    desc: 'Southern KP university named after the Pashtun warrior poet.',
    minPercent: 50, deadline: '2026-10-10',
    programs: artSci(30000),
  },
  {
    name: 'University of Science and Technology Bannu', city: 'Bannu', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2005, website: 'https://ustb.edu.pk',
    desc: 'Public university serving southern districts with science faculties.',
    minPercent: 50, entryTest: 'USTB entry test', deadline: '2026-10-08',
    programs: [...csTri(35000), ...artSci(30000)],
  },
  {
    name: 'Bacha Khan University Charsadda', city: 'Charsadda', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2012, website: 'https://bkuc.edu.pk',
    desc: 'Public university honouring Bacha Khan with growing science programs.',
    minPercent: 50, entryTest: 'BKUC entry test', deadline: '2026-10-06',
    programs: artSci(30000),
  },
  {
    name: 'Gomal University Dera Ismail Khan', city: 'Dera Ismail Khan', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 1975, website: 'http://gu.edu.pk',
    desc: 'Second oldest KP public university spanning agriculture and humanities.',
    minPercent: 50, entryTest: 'GU entry test', deadline: '2026-10-10',
    programs: [...artSci(30000), ...agriQuad(35000)],
  },
  {
    name: 'FATA University Darra Adamkhel', city: 'Kohat', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2017, website: null,
    desc: 'Federal-chartered university extending higher education to merged tribal districts.',
    minPercent: 50, deadline: '2026-10-15',
    programs: artSci(28000),
  },
  {
    name: 'Kohat University of Science and Technology', city: 'Kohat', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2001, website: null,
    desc: 'Public university of Kohat with geology and biosciences strengths.',
    minPercent: 50, deadline: '2026-10-08',
    programs: artSci(30000),
  },
  {
    name: 'University of Chitral', city: 'Chitral', province: 'Khyber Pakhtunkhwa', type: 'university',
    founded: 2017, website: null,
    desc: 'Remote-district university serving mountain communities of Chitral.',
    minPercent: 50, deadline: '2026-10-15',
    programs: artSci(28000),
  },
  {
    name: 'Bannu Medical College', city: 'Bannu', province: 'Khyber Pakhtunkhwa', type: 'college',
    founded: 2017, website: null,
    desc: 'Public medical college under KMU affiliation for southern KP.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(43000),
  },
];

const sialkotInstitutions: UniSeed[] = [
  {
    name: 'University of Sialkot', city: 'Sialkot', province: 'Punjab', type: 'university',
    founded: 2018, website: null,
    desc: 'Private chartered university serving the export-manufacturing hub.',
    minPercent: 50, deadline: '2026-09-22',
    programs: [...csTri(140000), ...bizTri(130000)],
  },
  {
    name: 'Government College Women University Sialkot', city: 'Sialkot', province: 'Punjab', type: 'university',
    founded: 2018, website: null,
    desc: 'Public womens university upgraded from the historic Murray college lineage.',
    minPercent: 50, deadline: '2026-09-26',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: artSci(45000),
  },
  {
    name: 'Sialkot Medical College', city: 'Sialkot', province: 'Punjab', type: 'college',
    founded: 2002, website: null,
    desc: 'Public medical college affiliated with UHS and Sialkot DHQ hospital.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(48000),
  },
];

const gujranwalaGujratInstitutions: UniSeed[] = [
  {
    name: 'University of Gujrat', city: 'Gujrat', province: 'Punjab', type: 'university',
    founded: 2004, website: 'https://www.uog.edu.pk',
    desc: 'Major public university on Hafiz Hayat campus between GT Road cities.',
    minPercent: 50, entryTest: 'UOG entry test', deadline: '2026-09-20',
    extraCampuses: [{ name: 'UOG Rawalakot Sub-Campus', city: 'Rawalakot' }],
    programs: [...artSci(40000), ...csTri(50000)],
  },
  {
    name: 'University of Chenab', city: 'Gujrat', province: 'Punjab', type: 'university',
    founded: 2020, website: null,
    desc: 'New public university chartered for the Chenab corridor region.',
    minPercent: 50, deadline: '2026-10-01',
    programs: [...csTri(90000), ...artSci(70000)],
  },
  {
    name: 'GIFT University Gujranwala', city: 'Gujranwala', province: 'Punjab', type: 'university',
    founded: 2002, website: 'https://gift.edu.pk',
    desc: 'Leading private university of Gujranwala industrial district.',
    minPercent: 50, entryTest: 'GIFT admission test or NTS', deadline: '2026-09-15',
    programs: [...bizTri(150000), ...csTri(140000)],
  },
  {
    name: 'Rachna College of Engineering and Technology', city: 'Gujranwala', province: 'Punjab', type: 'college',
    founded: 2002, website: null,
    desc: 'UET Lahore constituent engineering college at Sukheki Road.',
    minPercent: 60, entryTest: 'UET ECAT', deadline: '2026-08-31',
    programs: pubEng(60000),
  },
];

const otherPunjabInstitutions: UniSeed[] = [
  {
    name: 'University of Sargodha', city: 'Sargodha', province: 'Punjab', type: 'university',
    founded: 2002, website: 'https://www.uos.edu.pk',
    desc: 'Large public university with pharmacy, law and agriculture faculties.',
    minPercent: 50, entryTest: 'UoS departmental test', deadline: '2026-09-24',
    extraCampuses: [
      { name: 'UOS Mianwali Campus', city: 'Mianwali' },
      { name: 'UOS Bhakkar Campus', city: 'Bhakkar' },
    ],
    programs: [...artSci(38000), ...csTri(50000), P('Pharm-D', 'bachelor', '5 years', 65000)],
  },
  {
    name: 'University of Mianwali', city: 'Mianwali', province: 'Punjab', type: 'university',
    founded: 2022, website: null,
    desc: 'Recently chartered public university of trans-Indus Punjab.',
    minPercent: 50, deadline: '2026-10-10',
    programs: artSci(30000),
  },
  {
    name: 'University of Sahiwal', city: 'Sahiwal', province: 'Punjab', type: 'university',
    founded: 2021, website: null,
    desc: 'Independent public university upgraded from BZU sub-campus.',
    minPercent: 50, deadline: '2026-10-05',
    programs: artSci(35000),
  },
  {
    name: 'University of Layyah', city: 'Layyah', province: 'Punjab', type: 'university',
    founded: 2021, website: null,
    desc: 'Chartered public university in southern Punjab cotton belt.',
    minPercent: 50, deadline: '2026-10-08',
    programs: artSci(32000),
  },
  {
    name: 'University of Jhang', city: 'Jhang', province: 'Punjab', type: 'university',
    founded: 2021, website: null,
    desc: 'New public university serving Jhang district higher education demand.',
    minPercent: 50, deadline: '2026-10-06',
    programs: artSci(30000),
  },
  {
    name: 'University of Okara', city: 'Okara', province: 'Punjab', type: 'university',
    founded: 2016, website: null,
    desc: 'Public university chartered from Okara postgraduate college network.',
    minPercent: 50, entryTest: 'UO departmental assessment', deadline: '2026-09-28',
    programs: artSci(33000),
  },
  {
    name: 'University of Narowal', city: 'Narowal', province: 'Punjab', type: 'university',
    founded: 2018, website: null,
    desc: 'Border-district public university near Shakargarh plains.',
    minPercent: 50, deadline: '2026-10-02',
    programs: artSci(30000),
  },
];

const bahawalpurInstitutions: UniSeed[] = [
  {
    name: 'The Islamia University of Bahawalpur', city: 'Bahawalpur', province: 'Punjab', type: 'university',
    founded: 1925, website: 'https://www.iub.edu.pk',
    desc: 'Historic Abbasia-era university covering vast Cholistan catchment.',
    minPercent: 50, entryTest: 'IUB entry test', deadline: '2026-09-25',
    extraCampuses: [
      { name: 'IUB Rahim Yar Khan Campus', city: 'Rahim Yar Khan' },
      { name: 'IUB Bahawalnagar Campus', city: 'Bahawalnagar' },
    ],
    programs: [...artSci(35000), ...csTri(45000), P('Pharm-D', 'bachelor', '5 years', 55000)],
  },
  {
    name: 'Quaid-e-Azam Medical College', city: 'Bahawalpur', province: 'Punjab', type: 'college',
    founded: 1971, website: null,
    desc: 'Public medical college attached to BV Hospital under UHS system.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(48000),
  },
  {
    name: 'Cholistan University of Veterinary and Animal Sciences', city: 'Bahawalpur', province: 'Punjab', type: 'university',
    founded: 2019, website: null,
    desc: 'Desert-livestock focused veterinary public university.',
    minPercent: 50, entryTest: 'CUVAS entry test', deadline: '2026-09-20',
    programs: agriQuad(38000),
  },
];

const sukkuRegionInstitutions: UniSeed[] = [
  {
    name: 'Sukkur IBA University', city: 'Sukkur', province: 'Sindh', type: 'university',
    founded: 1994, website: 'https://iba-suk.edu.pk',
    desc: 'Outstanding public-sector business university modeled on IBA Karachi standards.',
    minPercent: 60, entryTest: 'Sukkur IBA aptitude test', deadline: '2026-07-31',
    customReqs: [{ requirementType: 'interview', requirementValue: 'Interview stage for final merit list' }],
    programs: bizTri(80000),
  },
  {
    name: 'Shah Abdul Latif University Khairpur', city: 'Khairpur', province: 'Sindh', type: 'university',
    founded: 1987, website: 'https://salu.edu.pk',
    desc: 'Upper Sindh general university named after mystic poet Shah Abdul Latif Bhittai.',
    minPercent: 50, entryTest: 'SALU pre-entry test', deadline: '2026-10-10',
    extraCampuses: [{ name: 'SALU Ghotki Campus', city: 'Ghotki' }],
    programs: artSci(30000),
  },
  {
    name: 'Aror University of Art Architecture Heritage and Archaeology', city: 'Sukkur', province: 'Sindh', type: 'university',
    founded: 2019, website: null,
    desc: 'Specialist heritage and design university at ancient Aror site.',
    minPercent: 45, entryTest: 'Creative aptitude evaluation', deadline: '2026-09-25',
    customReqs: [{ requirementType: 'portfolio', requirementValue: 'Design portfolio submission' }],
    programs: [P('BS Architecture', 'bachelor', '5 years', 60000), P('BFA Fine Arts', 'bachelor', '4 years', 55000), P('BS Conservation Studies', 'bachelor', '4 years', 50000)],
  },
  {
    name: 'Begum Nusrat Bhutto Women University', city: 'Sukkur', province: 'Sindh', type: 'university',
    founded: 2018, website: null,
    desc: 'Dedicated womens public university of northern Sindh.',
    minPercent: 50, deadline: '2026-10-12',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: artSci(28000),
  },
  {
    name: 'Ghulam Muhammad Mahar Medical College', city: 'Sukkur', province: 'Sindh', type: 'college',
    founded: 2003, website: null,
    desc: 'Public medical college attached to Sukkur civil hospital network.',
    minPercent: 85, entryTest: 'MDCAT plus Sindh central admission', deadline: '2026-09-30',
    programs: medPub(42000),
  },
];

const larkanaInstitutions: UniSeed[] = [
  {
    name: 'Shaheed Mohtarma Benazir Bhutto Medical University', city: 'Larkana', province: 'Sindh', type: 'university',
    founded: 2009, website: null,
    desc: 'Chandka Medical College parent university serving upper Sindh health needs.',
    minPercent: 85, entryTest: 'MDCAT plus Sindh central admission', deadline: '2026-09-30',
    programs: medPub(45000),
  },
];

const dgkhanInstitutions: UniSeed[] = [
  {
    name: 'Ghazi University Dera Ghazi Khan', city: 'Dera Ghazi Khan', province: 'Punjab', type: 'university',
    founded: 2014, website: null,
    desc: 'Fort Munro foothills public university for western Punjab districts.',
    minPercent: 50, entryTest: 'GU DG Khan entry test', deadline: '2026-10-05',
    programs: artSci(32000),
  },
  {
    name: 'DG Khan Medical College', city: 'Dera Ghazi Khan', province: 'Punjab', type: 'college',
    founded: 2010, website: null,
    desc: 'Public medical college attached to Teaching Hospital DG Khan.',
    minPercent: 88, entryTest: 'MDCAT', deadline: '2026-09-30',
    programs: medPub(46000),
  },
];

const nawabshahInstitutions: UniSeed[] = [
  {
    name: 'Quaid-e-Awam University of Engineering Science and Technology', city: 'Nawabshah', province: 'Sindh', type: 'university',
    founded: 1975, website: 'https://quest.edu.pk',
    desc: 'Zulfikar Ali Bhutto era engineering university of central Sindh.',
    minPercent: 60, entryTest: 'QUEST pre-entry test', deadline: '2026-09-08',
    extraCampuses: [{ name: 'QUEST Larkana Campus', city: 'Larkana' }],
    programs: pubEng(38000),
  },
  {
    name: "Peoples University of Medical and Health Sciences for Women", city: 'Nawabshah', province: 'Sindh', type: 'university',
    founded: 2009, website: null,
    desc: 'Exclusive womens public medical university of Sindh interior.',
    minPercent: 85, entryTest: 'MDCAT plus central admission', deadline: '2026-09-30',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: medPub(40000),
  },
  {
    name: 'Shaheed Benazir Bhutto University Shaheed Benazirabad', city: 'Nawabshah', province: 'Sindh', type: 'university',
    founded: 2012, website: null,
    desc: 'General public university chartered for Shaheed Benazirabad district.',
    minPercent: 50, deadline: '2026-10-12',
    programs: artSci(28000),
  },
];

const gbAjkInstitutions: UniSeed[] = [
  {
    name: 'Karakoram International University Gilgit', city: 'Gilgit', province: 'Gilgit-Baltistan', type: 'university',
    founded: 2002, website: 'https://kiu.edu.pk',
    desc: 'Mountain research university at the junction of three great ranges.',
    minPercent: 50, entryTest: 'KIU entry assessment', deadline: '2026-10-10',
    programs: artSci(30000),
  },
  {
    name: 'University of Baltistan Skardu', city: 'Skardu', province: 'Gilgit-Baltistan', type: 'university',
    founded: 2017, website: null,
    desc: 'Chartered university of Baltistan division promoting tourism studies.',
    minPercent: 50, deadline: '2026-10-15',
    programs: artSci(28000),
  },
  {
    name: 'University of Azad Jammu and Kashmir Muzaffarabad', city: 'Muzaffarabad', province: 'Azad Kashmir', type: 'university',
    founded: 1980, website: 'https://ajku.edu.pk',
    desc: 'Oldest AJK public university rebuilt after 2005 earthquake.',
    minPercent: 50, entryTest: 'AJKU entry test', deadline: '2026-10-08',
    programs: artSci(28000),
  },
  {
    name: 'Women University of Azad Jammu and Kashmir Bagh', city: 'Bagh', province: 'Azad Kashmir', type: 'university',
    founded: 2014, website: null,
    desc: 'Womens public university serving Bagh hill district.',
    minPercent: 50, deadline: '2026-10-12',
    customReqs: [{ requirementType: 'document', requirementValue: 'Female applicants only' }],
    programs: artSci(26000),
  },
  {
    name: 'University of Poonch Rawalakot', city: 'Rawalakot', province: 'Azad Kashmir', type: 'university',
    founded: 2012, website: null,
    desc: 'Poonch division public university with agriculture faculty.',
    minPercent: 50, deadline: '2026-10-10',
    programs: [...artSci(30000), agriQuad(32000)[0]],
  },
  {
    name: 'Mirpur University of Science and Technology MUST', city: 'Mirpur', province: 'Azad Kashmir', type: 'university',
    founded: 1997, website: 'https://must.edu.pk',
    desc: 'AJK engineering university linked to British-Pakistani diaspora city Mirpur.',
    minPercent: 55, entryTest: 'MUST entry test', deadline: '2026-09-20',
    programs: pubEng(45000),
  },
  {
    name: 'University of Kotli', city: 'Kotli', province: 'Azad Kashmir', type: 'university',
    founded: 2014, website: null,
    desc: 'District chartered public university of AJK lowlands.',
    minPercent: 50, deadline: '2026-10-14',
    programs: artSci(26000),
  },
];

export const institutions: UniSeed[] = [
  ...lahoreInstitutions,
  ...karachiInstitutions,
  ...islamabadInstitutions,
  ...rawalpindiInstitutions,
  ...faisalabadInstitutions,
  ...multanInstitutions,
  ...sindhInteriorInstitutions,
  ...balochistanInstitutions,
  ...hazaraInstitutions,
  ...peshawarInstitutions,
  ...mardanInstitutions,
  ...malakandInstitutions,
  ...kpOtherInstitutions,
  ...sialkotInstitutions,
  ...gujranwalaGujratInstitutions,
  ...otherPunjabInstitutions,
  ...bahawalpurInstitutions,
  ...sukkuRegionInstitutions,
  ...larkanaInstitutions,
  ...dgkhanInstitutions,
  ...nawabshahInstitutions,
  ...gbAjkInstitutions,
];

const HEC_SOURCE_URL =
  'https://www.hec.gov.pk/english/universities/Pages/Recognised-Degree-Awarding-Institutes.aspx';

function admissionEmail(website: string | null): string | null {
  if (!website) return null;
  const domain = website
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/$/, '');
  return 'admissions@' + domain;
}

export async function seedPakistanComprehensive(): Promise<void> {
  console.log('=== Comprehensive Pakistan Seed Start ===');

  const existing = await prisma.university.findMany({
    where: { country: 'Pakistan' },
    select: { id: true },
  });
  const existingIds = existing.map((u) => u.id);

  if (existingIds.length > 0) {
    const delReq = await prisma.admissionRequirement.deleteMany({
      where: { universityId: { in: existingIds } },
    });
    const delCampus = await prisma.campus.deleteMany({
      where: { universityId: { in: existingIds } },
    });
    const delCourse = await prisma.course.deleteMany({
      where: { universityId: { in: existingIds } },
    });
    const delUni = await prisma.university.deleteMany({
      where: { id: { in: existingIds } },
    });
    console.log(
      `Deleted previous Pakistan data: ${delUni.count} universities, ${delCampus.count} campuses, ${delCourse.count} courses, ${delReq.count} requirements.`
    );
  }

  const country = await prisma.country.upsert({
    where: { code: 'PK' },
    update: { name: 'Pakistan', continent: 'Asia' },
    create: {
      name: 'Pakistan',
      code: 'PK',
      continent: 'Asia',
      visaRequired: false,
      costOfLiving: 400,
      safetyIndex: 55,
      educationSystem:
        'HEC regulated higher education with HSSC entry, four year bachelor degrees and MDCAT or ECAT professional entry tests',
      sourceUrl: 'https://www.hec.gov.pk',
    },
  });

  let uniN = 0;
  let campusN = 0;
  let crsN = 0;
  let reqN = 0;

  for (let i = 0; i < institutions.length; i++) {
    const u: UniSeed = institutions[i];
    uniN++;
    const uid = `uni-pk-${pad(uniN)}`;

    await prisma.university.upsert({
      where: { id: uid },
      update: {
        name: u.name,
        country: 'Pakistan',
        city: u.city,
        website: u.website,
        logoUrl: null,
        description: u.desc,
        foundedYear: u.founded,
        type: u.type,
        sourceUrl: HEC_SOURCE_URL,
        sourceName: 'HEC Recognized Universities List',
        verificationStatus: 'verified',
      },
      create: {
        id: uid,
        name: u.name,
        country: 'Pakistan',
        city: u.city,
        website: u.website,
        logoUrl: null,
        description: u.desc,
        foundedYear: u.founded,
        type: u.type,
        sourceUrl: HEC_SOURCE_URL,
        sourceName: 'HEC Recognized Universities List',
        verificationStatus: 'verified',
      },
    });

    campusN++;
    const mainCampusId = `camp-${pad(campusN)}`;
    const facilitiesJson = JSON.stringify(facilityPool[i % facilityPool.length]);
    const programsJson = JSON.stringify(
      u.programs.slice(0, 6).map((p) => p.name)
    );

    await prisma.campus.upsert({
      where: { id: mainCampusId },
      update: {
        name: u.mainCampusName ?? `${u.name} Main Campus`,
        city: u.city,
        address: u.mainAddress ?? null,
        isMain: true,
        phone: null,
        email: null,
        website: u.website,
        description: `Primary campus of ${u.name}.`,
        facilities: facilitiesJson,
        programs: programsJson,
        admissionContact: admissionEmail(u.website),
      },
      create: {
        id: mainCampusId,
        universityId: uid,
        name: u.mainCampusName ?? `${u.name} Main Campus`,
        city: u.city,
        address: u.mainAddress ?? null,
        isMain: true,
        phone: null,
        email: null,
        website: u.website,
        description: `Primary campus of ${u.name}.`,
        facilities: facilitiesJson,
        programs: programsJson,
        admissionContact: admissionEmail(u.website),
      },
    });

    for (const extra of u.extraCampuses ?? []) {
      campusN++;
      const cid = `camp-${pad(campusN)}`;
      await prisma.campus.upsert({
        where: { id: cid },
        update: {
          name: extra.name,
          city: extra.city ?? u.city,
          address: extra.address ?? null,
          isMain: false,
          phone: null,
          email: null,
          website: u.website,
          description: `Satellite campus of ${u.name}.`,
          facilities: facilitiesJson,
          programs: programsJson,
          admissionContact: admissionEmail(u.website),
        },
        create: {
          id: cid,
          universityId: uid,
          name: extra.name,
          city: extra.city ?? u.city,
          address: extra.address ?? null,
          isMain: false,
          phone: null,
          email: null,
          website: u.website,
          description: `Satellite campus of ${u.name}.`,
          facilities: facilitiesJson,
          programs: programsJson,
          admissionContact: admissionEmail(u.website),
        },
      });
    }

    for (const c of u.programs) {
      crsN++;
      const crid = `crs-pk-${pad(crsN)}`;
      await prisma.course.upsert({
        where: { id: crid },
        update: {
          name: c.name,
          degree: c.degree,
          duration: c.duration,
          language: 'English',
          tuitionFee: c.fee,
          currency: 'PKR',
          description: courseDesc(u, c),
          sourceUrl: HEC_SOURCE_URL,
          verificationStatus: 'verified',
        },
        create: {
          id: crid,
          universityId: uid,
          name: c.name,
          degree: c.degree,
          duration: c.duration,
          language: 'English',
          tuitionFee: c.fee,
          currency: 'PKR',
          description: courseDesc(u, c),
          sourceUrl: HEC_SOURCE_URL,
          verificationStatus: 'verified',
        },
      });
    }

    const defaultReqs: ReqSeed[] = [];
    defaultReqs.push({
      requirementType: 'education',
      requirementValue: `HSSC Intermediate or equivalent with minimum ${u.minPercent ?? 50}% marks`,
    });
    const entryReq: ReqSeed = {
      requirementType: 'entry_test',
      requirementValue: u.entryTest || 'NTS NAT or university entrance test',
    };
    if (u.deadline) entryReq.deadline = new Date(u.deadline);
    defaultReqs.push(entryReq);
    defaultReqs.push({
      requirementType: 'document',
      requirementValue:
        'CNIC or B-Form plus matric and intermediate marksheets plus recent photographs',
    });
    defaultReqs.push({
      requirementType: 'document',
      requirementValue: `${u.province} domicile certificate`,
    });
    const allReqs = [...defaultReqs, ...(u.customReqs ?? [])];

    for (const r of allReqs) {
      reqN++;
      const rid = `req-pk-${pad(reqN)}`;
      await prisma.admissionRequirement.upsert({
        where: { id: rid },
        update: {
          requirementType: r.requirementType,
          requirementValue: r.requirementValue,
          deadline: r.deadline ?? null,
          notes: null,
        },
        create: {
          id: rid,
          universityId: uid,
          countryId: country.id,
          requirementType: r.requirementType,
          requirementValue: r.requirementValue,
          deadline: r.deadline ?? null,
          notes: null,
        },
      });
    }
  }

  const [finalUnis, finalCampuses, finalCourses, finalReqs] = await Promise.all([
    prisma.university.count({ where: { country: 'Pakistan' } }),
    prisma.campus.count(),
    prisma.course.count(),
    prisma.admissionRequirement.count(),
  ]);

  console.log('=== Summary ===');
  console.log(`Universities seeded: ${finalUnis}`);
  console.log(`Campuses total: ${finalCampuses}`);
  console.log(`Courses total: ${finalCourses}`);
  console.log(`Admission requirements total: ${finalReqs}`);
}

if (
  process.argv[1] &&
  process.argv[1].replace(/\\/g, '/').includes('seed-pakistan-comprehensive')
) {
  seedPakistanComprehensive()
    .then(async () => {
      console.log('Pakistan comprehensive seed complete.');
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    });
}


