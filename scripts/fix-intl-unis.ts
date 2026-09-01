import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();

const fixes: Record<string, { departments: { name: string; description?: string; courses: { name: string; degree: string; duration?: string }[] }[] }> = {
  // JAPAN
  'uni-jp-001': { departments: [
    { name: 'Faculty of Engineering', description: 'Civil, Mechanical, Electrical, Chemical, Architecture, Urban Engineering', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Science', description: 'Physics, Chemistry, Mathematics, Biology, Astronomy', courses: [
      { name: 'BS Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine and related health sciences', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'MS Medicine', degree: 'master', duration: '2 years' },
      { name: 'PhD Medicine', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law and political science', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Economics', description: 'Economics and finance', courses: [
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Economics', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Arts and Sciences', description: 'Liberal arts, humanities, interdisciplinary studies', courses: [
      { name: 'BA Arts and Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Arts and Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Agriculture', description: 'Agricultural and life sciences', courses: [
      { name: 'BS Agriculture', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Agriculture', degree: 'master', duration: '2 years' },
      { name: 'PhD Agriculture', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Pharmaceutical Sciences', description: 'Pharmacy and pharmaceutical sciences', courses: [
      { name: 'BS Pharmaceutical Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Pharmaceutical Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Pharmaceutical Sciences', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Education', description: 'Education and pedagogy', courses: [
      { name: 'BA Education', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Education', degree: 'master', duration: '2 years' },
      { name: 'PhD Education', degree: 'phd', duration: '3 years' },
    ]},
  ]},

  'uni-jp-003': { departments: [
    { name: 'School of Engineering', description: 'Mechanical, Electrical, Chemical, Civil, Materials, Information Engineering', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Science', description: 'Physics, Chemistry, Mathematics, Biology', courses: [
      { name: 'BS Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Medicine', description: 'Medicine, Dentistry, Allied Health', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '6 years' },
      { name: 'MS Medical Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Law and Politics', description: 'Law and political science', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Economics', description: 'Economics', courses: [
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Economics', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Letters', description: 'Literature, Philosophy, History, Linguistics', courses: [
      { name: 'BA Letters', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Letters', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Pharmaceutical Sciences', description: 'Pharmacy', courses: [
      { name: 'BS Pharmaceutical Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Pharmaceutical Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Human Sciences', description: 'Psychology, Education, Social Work', courses: [
      { name: 'BA Human Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Human Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Graduate School of Information Science and Technology', description: 'Computer Science, Information Science', courses: [
      { name: 'BS Information Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Information Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Information Science', degree: 'phd', duration: '3 years' },
    ]},
  ]},

  'uni-jp-004': { departments: [
    { name: 'School of Engineering', description: 'Mechanical, Electrical, Civil, Chemical, Materials, Aerospace', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Science', description: 'Physics, Chemistry, Mathematics, Biology', courses: [
      { name: 'BS Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'MS Medical Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Dentistry', description: 'Dental sciences', courses: [
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '6 years' },
      { name: 'MS Dental Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Economics', description: 'Economics', courses: [
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Economics', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Agriculture', description: 'Agricultural sciences', courses: [
      { name: 'BS Agriculture', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Agriculture', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Pharmaceutical Sciences', description: 'Pharmacy', courses: [
      { name: 'BS Pharmaceutical Sciences', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Arts and Letters', description: 'Literature, History, Philosophy', courses: [
      { name: 'BA Arts and Letters', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Arts and Letters', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Graduate School of Information Sciences', description: 'Information Science, Computer Science', courses: [
      { name: 'MS Information Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Information Sciences', degree: 'phd', duration: '3 years' },
    ]},
  ]},

  'uni-jp-005': { departments: [
    { name: 'School of Engineering', description: 'Mechanical, Electrical, Chemical, Civil, Aerospace, Computer Science', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Science', description: 'Physics, Chemistry, Mathematics, Biology', courses: [
      { name: 'BS Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'School of Informatics', description: 'Computer Science, Information Science', courses: [
      { name: 'BS Informatics', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Informatics', degree: 'master', duration: '2 years' },
      { name: 'PhD Informatics', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Economics', description: 'Economics', courses: [
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Humanities', description: 'Languages, History, Philosophy', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Agricultural Sciences', description: 'Agriculture, Food Science', courses: [
      { name: 'BS Agricultural Sciences', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},

  'uni-jp-006': { departments: [
    { name: 'Faculty of Engineering', description: 'Architecture, Civil, Mechanical, Electrical, Chemical, Materials, Applied Sciences', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Science', description: 'Physics, Chemistry, Mathematics, Biology', courses: [
      { name: 'BS Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Dental Medicine', description: 'Dentistry', courses: [
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Pharmaceutical Sciences', description: 'Pharmacy', courses: [
      { name: 'BS Pharmaceutical Sciences', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Veterinary Medicine', description: 'Veterinary Science', courses: [
      { name: 'DVM Veterinary Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Agriculture', description: 'Agricultural Sciences', courses: [
      { name: 'BS Agriculture', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Fisheries Sciences', description: 'Fisheries, Marine Science', courses: [
      { name: 'BS Fisheries Sciences', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Letters', description: 'Literature, History, Philosophy, Education', courses: [
      { name: 'BA Letters', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Economics', description: 'Economics', courses: [
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Graduate School of Information Science and Technology', description: 'CS, IT', courses: [
      { name: 'MS Information Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Information Science', degree: 'phd', duration: '3 years' },
    ]},
  ]},

  'uni-jp-007': { departments: [
    { name: 'Faculty of Science and Engineering', description: 'Mechanical, Electrical, Civil, Chemical, Applied Physics, Computer Science', courses: [
      { name: 'BS Science and Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science and Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Science and Engineering', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'School of Economics', description: 'Economics', courses: [
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Economics', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Political Science and Economics', description: 'Political Science, Economics', courses: [
      { name: 'BA Political Science and Economics', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Letters, Arts and Sciences', description: 'Humanities, Liberal Arts', courses: [
      { name: 'BA Letters, Arts and Sciences', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BS Pharmacy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Nursing and Medical Care', description: 'Nursing', courses: [
      { name: 'BSN Nursing', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},

  'uni-jp-008': { departments: [
    { name: 'Faculty of Science and Technology', description: 'Mechanical, Electrical, Civil, Applied Physics, Computer Science, Bioinformatics', courses: [
      { name: 'BS Science and Technology', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science and Technology', degree: 'master', duration: '2 years' },
      { name: 'PhD Science and Technology', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Economics', description: 'Economics', courses: [
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Economics', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Letters', description: 'Literature, History, Philosophy', courses: [
      { name: 'BA Letters', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Business and Commerce', description: 'Commerce, Business', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Commerce', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Policy Management', description: 'Policy, Governance', courses: [
      { name: 'BA Policy Management', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Environment and Information Studies', description: 'Environment, Information', courses: [
      { name: 'BA Environment and Information Studies', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BS Pharmacy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Nursing and Medical Care', description: 'Nursing', courses: [
      { name: 'BSN Nursing', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},

  // CANADA
  'uni-ca-003': { departments: [
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, Computer Science, Earth Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Applied Science (Engineering)', description: 'Chemical, Civil, Electrical, Computer, Mechanical, Mining, Materials Engineering', courses: [
      { name: 'BASc Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MASc Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Arts', description: 'English, History, Philosophy, Languages, Psychology, Sociology, Political Science, Economics', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Sauder School of Business', description: 'Commerce, MBA, Finance, Marketing', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Education', description: 'Teaching, Education', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '4 years' },
      { name: 'MEd Education', degree: 'master', duration: '2 years' },
      { name: 'EdD Education', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine, Dentistry, Nursing, Pharmacy, Health Sciences', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '4 years' },
      { name: 'DMD Dentistry', degree: 'bachelor', duration: '4 years' },
      { name: 'PharmD Pharmacy', degree: 'bachelor', duration: '4 years' },
      { name: 'BN Nursing', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'JD Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Forestry', description: 'Forestry, Conservation', courses: [
      { name: 'BSc Forestry', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Forestry', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-ca-004': { departments: [
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, CS, Earth Sciences, Psychology', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Engineering', description: 'Chemical, Civil, Electrical, Computer, Mechanical, Materials Engineering', courses: [
      { name: 'BSc Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Arts', description: 'English, History, Philosophy, Languages, Sociology, Political Science, Economics', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Alberta School of Business', description: 'BCom, MBA, Finance, Accounting', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Education', description: 'Education', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '4 years' },
      { name: 'MEd Education', degree: 'master', duration: '2 years' },
      { name: 'EdD Education', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Medicine and Dentistry', description: 'Medicine, Dentistry, Nursing, Pharmacy, Public Health', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '4 years' },
      { name: 'DMD Dentistry', degree: 'bachelor', duration: '4 years' },
      { name: 'PharmD Pharmacy', degree: 'bachelor', duration: '4 years' },
      { name: 'BScN Nursing', degree: 'bachelor', duration: '4 years' },
      { name: 'MPH Public Health', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'JD Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Native Studies', description: 'Native Studies', courses: [
      { name: 'BA Native Studies', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},

  'uni-ca-005': { departments: [
    { name: 'DeGroote School of Business', description: 'Commerce, MBA, Finance, Accounting', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Engineering', description: 'Chemical, Civil, Electrical & Computer, Materials, Mechanical, Mechatronics, Engineering Physics', courses: [
      { name: 'BEng Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MEng Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Health Sciences', description: 'Health Sciences, Nursing, Physiotherapy, Physician Assistant', courses: [
      { name: 'BSc Health Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'BNSc Nursing', degree: 'bachelor', duration: '4 years' },
      { name: 'MPH Public Health', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Humanities', description: 'English, History, Philosophy, Languages, Linguistics', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, Earth Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Psychology, Sociology, Political Science, Economics, Geography', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Social Sciences', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Michael G. DeGroote School of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '4 years' },
      { name: 'PhD Medical Sciences', degree: 'phd', duration: '4-6 years' },
    ]},
  ]},

  'uni-ca-006': { departments: [
    { name: 'Faculty of Engineering', description: 'Chemical, Civil, Electrical, Computer, Mechanical, Environmental, Geological, Nanotechnology, Mechatronics, Systems Design', courses: [
      { name: 'BASc Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MASc Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Mathematics', description: 'Mathematics, Computer Science, Actuarial Science, Statistics', courses: [
      { name: 'BMath Mathematics', degree: 'bachelor', duration: '4 years' },
      { name: 'MMath Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Mathematics', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Earth Sciences, Psychology', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Arts', description: 'English, History, Philosophy, Psychology, Sociology, Political Science, Economics', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Environment', description: 'Geography, Environmental Studies, Planning', courses: [
      { name: 'BES Environment', degree: 'bachelor', duration: '4 years' },
      { name: 'MES Environment', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Health', description: 'Kinesiology, Public Health, Recreation, Health Studies', courses: [
      { name: 'BSc Health', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Health', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Optometry and Vision Science', description: 'Optometry', courses: [
      { name: 'OD Optometry', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'PharmD Pharmacy', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},

  'uni-ca-007': { departments: [
    { name: 'Faculty of Engineering', description: 'Chemical, Civil, Electrical, Mechanical, Computer, Integrated, Mechatronics', courses: [
      { name: 'BESc Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MEng Engineering', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Computer Science, Math, Earth Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Arts & Humanities', description: 'English, History, Philosophy, Languages', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Ivey Business School', description: 'HBA, MBA, MSc, PhD', courses: [
      { name: 'HBA Business', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '1 year' },
      { name: 'PhD Business', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Health Sciences', description: 'Health Sciences, Kinesiology, Nursing', courses: [
      { name: 'BSc Health Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'BScN Nursing', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Schulich Medicine & Dentistry', description: 'Medicine, Dentistry', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '4 years' },
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Education', description: 'Education', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '4 years' },
      { name: 'MEd Education', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'JD Law', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'Faculty of Music', description: 'Music', courses: [
      { name: 'BMus Music', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Social Science', description: 'Psychology, Sociology, Political Science, Economics, Geography', courses: [
      { name: 'BA Social Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Social Science', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-ca-008': { departments: [
    { name: 'Faculty of Engineering', description: 'Civil, Mechanical, Electrical, Chemical, Industrial, Computer, Mining, Ocean, Biomedical, Environmental', courses: [
      { name: 'BEng Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MEng Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, Ocean Sciences, Earth Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Computer Science', description: 'Computer Science', courses: [
      { name: 'BCS Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MCS Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Arts and Social Sciences', description: 'English, History, Philosophy, Political Science, Sociology, Economics', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Management', description: 'Commerce, MBA', courses: [
      { name: 'BComm Commerce', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Management', degree: 'phd', duration: '4-6 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Health', description: 'Health Sciences, Recreation, Health Administration', courses: [
      { name: 'BHSc Health Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MPH Public Health', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'JD Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Agriculture', description: 'Agricultural Sciences', courses: [
      { name: 'BScAg Agriculture', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Faculty of Architecture and Planning', description: 'Architecture, Planning', courses: [
      { name: 'BScArch Architecture', degree: 'bachelor', duration: '5 years' },
      { name: 'MPlan Planning', degree: 'master', duration: '2 years' },
    ]},
  ]},

  // GERMANY
  'uni-de-001': { departments: [
    { name: 'TUM School of Computation, Information and Technology', description: 'Computer Science, Data Engineering, Mathematics, Information Engineering', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Data Engineering and Analytics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'TUM School of Engineering and Design', description: 'Mechanical, Electrical, Civil, Aerospace, Chemical, Biomedical Engineering', courses: [
      { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Aerospace Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mechanical Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'TUM School of Sciences', description: 'Physics, Chemistry, Mathematics', courses: [
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Physics', degree: 'master', duration: '2 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'TUM School of Life Sciences', description: 'Nutrition, Biochemistry, Biotechnology', courses: [
      { name: 'BSc Nutrition and Food Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Life Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'TUM School of Management', description: 'Management, Technology, Innovation, Finance', courses: [
      { name: 'BSc Management and Technology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Management and Technology', degree: 'master', duration: '2 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Management', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'TUM School of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'TUM School of Social Sciences and Technology', description: 'Philosophy, Politics, Education', courses: [
      { name: 'BA Political Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Education', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-de-003': { departments: [
    { name: 'Faculty of Mathematics, Natural Sciences and Computer Science', description: 'Math, Physics, Chemistry, Biology, Computer Science, Geosciences', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Architecture', description: 'Architecture, Civil Engineering, Urban Planning', courses: [
      { name: 'BSc Architecture', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Architecture', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Civil Engineering', description: 'Civil Engineering, Water Engineering, Transportation', courses: [
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Civil Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Civil Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Mechanical Engineering', description: 'Mechanical Engineering, Energy, Aerospace', courses: [
      { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Aerospace Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mechanical Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Mechanical Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Electrical Engineering and Information Technology', description: 'EE, IT, Automation', courses: [
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Information Technology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Electrical Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Arts and Humanities', description: 'Philosophy, History, Languages, Social Sciences', courses: [
      { name: 'BA Arts and Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Arts and Humanities', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Business and Economics', description: 'Business, Economics', courses: [
      { name: 'BSc Business Administration', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Business Administration', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine, Dentistry', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '5 years' },
    ]},
    { name: 'Faculty of Georesources and Materials Engineering', description: 'Georesources, Materials Science', courses: [
      { name: 'BSc Georesources Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Materials Engineering', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-de-004': { departments: [
    { name: 'Faculty of Mathematics and Computer Science', description: 'Math, CS', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Mathematics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Physics and Astronomy', description: 'Physics, Astronomy', courses: [
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Physics', degree: 'master', duration: '2 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Chemistry and Earth Sciences', description: 'Chemistry, Geosciences', courses: [
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Chemistry', degree: 'master', duration: '2 years' },
      { name: 'PhD Chemistry', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Biosciences', description: 'Biology', courses: [
      { name: 'BSc Biology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Biology', degree: 'master', duration: '2 years' },
      { name: 'PhD Biology', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Economics and Social Sciences', description: 'Economics, Social Sciences', courses: [
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Economics', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Philosophy and History', description: 'Philosophy, History, Classics', courses: [
      { name: 'BA Philosophy', degree: 'bachelor', duration: '3 years' },
      { name: 'BA History', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Philosophy', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Modern Languages', description: 'English, Romance, German Studies', courses: [
      { name: 'BA English Studies', degree: 'bachelor', duration: '3 years' },
      { name: 'MA English Studies', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Behavioural Sciences and Empirical Cultural Sciences', description: 'Psychology, Education, Cultural Studies', courses: [
      { name: 'BSc Psychology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Psychology', degree: 'master', duration: '2 years' },
      { name: 'PhD Psychology', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Theology', description: 'Theology', courses: [
      { name: 'BA Theology', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Theology', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Medicine and Medical Center', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
  ]},

  'uni-de-005': { departments: [
    { name: 'Faculty 1: Humanities and Social Sciences', description: 'Philosophy, History, Sociology, Political Science', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 2: Mathematics and Natural Sciences', description: 'Math, Physics, Chemistry', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 3: Process Science', description: 'Chemical Engineering, Process Engineering', courses: [
      { name: 'BSc Chemical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Chemical Engineering', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty 4: Electrical Engineering and Computer Science', description: 'EE, CS, AI', courses: [
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 5: Mechanical Engineering and Transport Systems', description: 'Mechanical, Aerospace, Naval', courses: [
      { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Aerospace Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mechanical Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Mechanical Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 6: Planning, Building and Environment', description: 'Architecture, Civil Engineering, Planning', courses: [
      { name: 'BSc Architecture', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Architecture', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty 7: Economics and Management', description: 'Business, Economics', courses: [
      { name: 'BSc Business Administration', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Business Administration', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-4 years' },
    ]},
  ]},

  'uni-de-002': { departments: [
    { name: 'Faculty of Mathematics, Computer Science and Statistics', description: 'Math, CS, Statistics', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Mathematics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Physics', description: 'Physics', courses: [
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Physics', degree: 'master', duration: '2 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Chemistry and Pharmacy', description: 'Chemistry, Pharmacy', courses: [
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Pharmacy', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Chemistry', degree: 'master', duration: '2 years' },
      { name: 'PhD Chemistry', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Biology', description: 'Biology', courses: [
      { name: 'BSc Biology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Biology', degree: 'master', duration: '2 years' },
      { name: 'PhD Biology', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Geosciences', description: 'Geography, Geology', courses: [
      { name: 'BSc Geography', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Geosciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Business Administration (Munich Business School)', description: 'Business, Economics', courses: [
      { name: 'BSc Business Administration', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Business Administration', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Economics', description: 'Economics', courses: [
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Economics', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Veterinary Medicine', description: 'Veterinary Medicine', courses: [
      { name: 'DVM Veterinary Medicine', degree: 'bachelor', duration: '5.5 years' },
    ]},
    { name: 'Faculty of Psychology and Educational Sciences', description: 'Psychology, Education', courses: [
      { name: 'BSc Psychology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Psychology', degree: 'master', duration: '2 years' },
      { name: 'PhD Psychology', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Languages and Literatures', description: 'Languages, Linguistics', courses: [
      { name: 'BA Linguistics', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Linguistics', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Sociology, Political Science, Communication', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of History and the Arts', description: 'History, Art History, Musicology', courses: [
      { name: 'BA History', degree: 'bachelor', duration: '3 years' },
      { name: 'MA History', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Catholic Theology', description: 'Theology', courses: [
      { name: 'BA Theology', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'Faculty of Protestant Theology', description: 'Theology', courses: [
      { name: 'BA Theology', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},

  'uni-de-006': { departments: [
    { name: 'Faculty of Mathematics, Informatics and Natural Sciences', description: 'Math, CS, Physics, Chemistry, Biology, Geosciences', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Natural Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Business, Economics and Social Sciences', description: 'Business, Economics, Social Sciences', courses: [
      { name: 'BSc Business Administration', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Business Administration', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Education', description: 'Education, Teaching', courses: [
      { name: 'BA Education', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Education', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Humanities', description: 'Languages, History, Philosophy, Cultural Studies', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Psychology and Human Movement Science', description: 'Psychology, Sports Science', courses: [
      { name: 'BSc Psychology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Psychology', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-de-007': { departments: [
    { name: 'Faculty of Management, Economics and Social Sciences', description: 'Business, Economics, Social Sciences', courses: [
      { name: 'BSc Business Administration', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Business Administration', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Arts and Humanities', description: 'Philosophy, History, Languages', courses: [
      { name: 'BA Arts and Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Arts and Humanities', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Mathematics and Natural Sciences', description: 'Math, Physics, Chemistry, Biology, Geosciences', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Natural Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Human Sciences', description: 'Psychology, Education, Rehabilitation Sciences', courses: [
      { name: 'BSc Psychology', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Education', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Psychology', degree: 'master', duration: '2 years' },
      { name: 'PhD Psychology', degree: 'phd', duration: '3-4 years' },
    ]},
  ]},

  'uni-de-008': { departments: [
    { name: 'Faculty of Mathematics and Computer Science', description: 'Math, CS', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Physics', description: 'Physics', courses: [
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Physics', degree: 'master', duration: '2 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Chemistry', description: 'Chemistry', courses: [
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Chemistry', degree: 'master', duration: '2 years' },
      { name: 'PhD Chemistry', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Economics', description: 'Economics', courses: [
      { name: 'BSc Economics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Economics', degree: 'master', duration: '2 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Sociology, Political Science, Social Work', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Humanities', description: 'Philosophy, History, Languages', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-de-009': { departments: [
    { name: 'Faculty 1: Architecture and Planning', description: 'Architecture, Urban Planning', courses: [
      { name: 'BSc Architecture', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Urban Planning', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Architecture', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty 2: Civil and Environmental Engineering', description: 'Civil, Environmental, Water Resources', courses: [
      { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Environmental Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Civil Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Civil Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 3: Mechanical Engineering and Automotive Technology', description: 'Mechanical, Automotive', courses: [
      { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mechanical Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Mechanical Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 4: Process Engineering and Chemistry', description: 'Chemical Engineering, Chemistry', courses: [
      { name: 'BSc Chemical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Chemical Engineering', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty 5: Computer Science, Electrical Engineering and Information Technology', description: 'CS, EE, IT', courses: [
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Computer Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 6: Mathematics and Physics', description: 'Math, Physics', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty 7: Humanities', description: 'Philosophy, History, Languages, Social Sciences', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-de-010': { departments: [
    { name: 'Faculty of Mathematics and Computer Science', description: 'Math, CS', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Computer Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Mathematics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Physics', description: 'Physics', courses: [
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Physics', degree: 'master', duration: '2 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Chemistry', description: 'Chemistry', courses: [
      { name: 'BSc Chemistry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Chemistry', degree: 'master', duration: '2 years' },
      { name: 'PhD Chemistry', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Biology and Psychology', description: 'Biology, Psychology', courses: [
      { name: 'BSc Biology', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Psychology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Biology', degree: 'master', duration: '2 years' },
      { name: 'PhD Biology', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Agricultural Sciences', description: 'Agriculture, Food Science', courses: [
      { name: 'BSc Agricultural Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Agricultural Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Agricultural Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Geosciences and Geography', description: 'Geosciences, Geography', courses: [
      { name: 'BSc Geosciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Geosciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Forest Sciences and Forest Ecology', description: 'Forestry', courses: [
      { name: 'BSc Forestry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Forestry', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Sociology, Political Science, Economics', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Humanities', description: 'Philosophy, History, Languages', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine, Dentistry', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '5 years' },
    ]},
    { name: 'Faculty of Theology', description: 'Theology', courses: [
      { name: 'BA Theology', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Theology', degree: 'master', duration: '2 years' },
    ]},
  ]},

  // SOUTH KOREA
  'uni-kr-003': { departments: [
    { name: 'College of Liberal Arts', description: 'Korean, English, History, Philosophy, Chinese, Archaeology', courses: [
      { name: 'BA Liberal Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Liberal Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Liberal Arts', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Science', description: 'Physics, Chemistry, Mathematics, Biology, Astronomy', courses: [
      { name: 'BS Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Engineering', description: 'Civil, Mechanical, EE, Chemical, Materials, Computer, Architecture, Industrial', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Business', description: 'Business, MBA', courses: [
      { name: 'BBA Business', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'College of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Education', description: 'Education', courses: [
      { name: 'BA Education', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Education', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Life Sciences and Biotechnology', description: 'Biotechnology, Life Sciences', courses: [
      { name: 'BS Life Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Life Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Life Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Nursing', description: 'Nursing', courses: [
      { name: 'BSN Nursing', degree: 'bachelor', duration: '4 years' },
      { name: 'MSN Nursing', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BPharm Pharmacy', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Pharmacy', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Health Sciences', description: 'Health Sciences', courses: [
      { name: 'BS Health Sciences', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Graduate School of International Studies', description: 'International Studies', courses: [
      { name: 'MA International Studies', degree: 'master', duration: '2 years' },
      { name: 'PhD International Studies', degree: 'phd', duration: '3-4 years' },
    ]},
  ]},

  'uni-kr-004': { departments: [
    { name: 'College of Liberal Arts', description: 'Korean, English, History, Philosophy, Chinese', courses: [
      { name: 'BA Liberal Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Liberal Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Liberal Arts', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Life Sciences and Biotechnology', description: 'Biotechnology, Life Sciences', courses: [
      { name: 'BS Life Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Life Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Life Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Science', description: 'Physics, Chemistry, Mathematics', courses: [
      { name: 'BS Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Engineering', description: 'Civil, Mechanical, EE, Chemical, Materials, Computer, Industrial', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Political Science and Economics', description: 'Political Science, Economics', courses: [
      { name: 'BA Political Science', degree: 'bachelor', duration: '4 years' },
      { name: 'BA Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Political Science', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Business', description: 'Business', courses: [
      { name: 'BBA Business', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Education', description: 'Education', courses: [
      { name: 'BA Education', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Education', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'College of Nursing', description: 'Nursing', courses: [
      { name: 'BSN Nursing', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'College of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BPharm Pharmacy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'College of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Graduate School of International Studies', description: 'International Studies', courses: [
      { name: 'MA International Studies', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Media and Communication', description: 'Media, Communication', courses: [
      { name: 'BA Media and Communication', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},

  'uni-kr-005': { departments: [
    { name: 'College of Liberal Arts', description: 'Korean, Chinese, English, History, Philosophy', courses: [
      { name: 'BA Liberal Arts', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Liberal Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Liberal Arts', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Social Sciences', description: 'Economics, Political Science, Psychology, Sociology, Public Admin', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Social Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Business', description: 'Business', courses: [
      { name: 'BBA Business', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Engineering', description: 'Chemical, Mechanical, EE, Materials Science', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Information and Communication Engineering', description: 'ICT, Electronics', courses: [
      { name: 'BS Information and Communication Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Information and Communication Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Information and Communication Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Software', description: 'Software Engineering, CS', courses: [
      { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Software Engineering', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Natural Sciences', description: 'Math, Physics, Chemistry', courses: [
      { name: 'BS Natural Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Natural Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Natural Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Humanities', description: 'History, Philosophy, Languages', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'College of Education', description: 'Education', courses: [
      { name: 'BA Education', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'School of Dentistry', description: 'Dentistry', courses: [
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'School of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BPharm Pharmacy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Graduate School of Business', description: 'MBA, Executive MBA', courses: [
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'EMBA', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-kr-006': { departments: [
    { name: 'College of Humanities', description: 'Korean, English, History, Philosophy, Languages', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Social Sciences', description: 'Sociology, Political Science, Media Studies', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Natural Sciences', description: 'Physics, Chemistry, Mathematics, Life Sciences', courses: [
      { name: 'BS Natural Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Natural Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Natural Sciences', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Engineering', description: 'Civil, Mechanical, EE, Chemical, Materials, Computer, Architecture, Energy', courses: [
      { name: 'BS Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'College of Information and Telecommunications', description: 'ICT, Electronics, Telecommunications', courses: [
      { name: 'BS Information and Telecommunications', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Information and Telecommunications', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Life Science and Biotechnology', description: 'Biotechnology, Life Sciences', courses: [
      { name: 'BS Life Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Life Sciences', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'College of Dentistry', description: 'Dentistry', courses: [
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'College of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BPharm Pharmacy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'College of Nursing', description: 'Nursing', courses: [
      { name: 'BSN Nursing', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'College of Business', description: 'Business', courses: [
      { name: 'BBA Business', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Education', description: 'Education', courses: [
      { name: 'BA Education', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'College of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
    ]},
    { name: 'College of Art and Physical Education', description: 'Art, Design, Physical Education', courses: [
      { name: 'BFA Art', degree: 'bachelor', duration: '4 years' },
      { name: 'BPE Physical Education', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Graduate School of International Studies', description: 'International Studies', courses: [
      { name: 'MA International Studies', degree: 'master', duration: '2 years' },
    ]},
  ]},

  // AUSTRALIA (Melbourne already done, fix Sydney, UNSW, ANU)
  'uni-au-002': { departments: [
    { name: 'Faculty of Engineering and IT', description: 'Chemical, Civil, EE, Mechanical, Computing, Biomedical Engineering', courses: [
      { name: 'BEng Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MEng Engineering', degree: 'master', duration: '2-3 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, CS, Earth Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Arts', description: 'Languages, History, Philosophy, Media, Social Sciences', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Arts', degree: 'master', duration: '2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Melbourne Business School', description: 'MBA, Commerce, Management', courses: [
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'MCom Commerce', degree: 'master', duration: '1.5 years' },
      { name: 'PhD Business', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'JD Law', degree: 'bachelor', duration: '3 years' },
      { name: 'LLM Law', degree: 'master', duration: '1 year' },
      { name: 'PhD Law', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Medicine, Dentistry and Health Sciences', description: 'Medicine, Dentistry, Health Sciences, Nursing, Pharmacy', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '4 years' },
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '4 years' },
      { name: 'BPharm Pharmacy', degree: 'bachelor', duration: '4 years' },
      { name: 'BNursing Nursing', degree: 'bachelor', duration: '3 years' },
      { name: 'MPH Public Health', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Veterinary and Agricultural Sciences', description: 'Veterinary, Agriculture', courses: [
      { name: 'DVM Veterinary Medicine', degree: 'bachelor', duration: '4 years' },
      { name: 'BSc Agriculture', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'Faculty of Education', description: 'Education', courses: [
      { name: 'MEd Education', degree: 'master', duration: '2 years' },
      { name: 'PhD Education', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Fine Arts and Music', description: 'Fine Arts, Music', courses: [
      { name: 'BFA Fine Arts', degree: 'bachelor', duration: '3 years' },
      { name: 'BMus Music', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'Faculty of Architecture, Building and Planning', description: 'Architecture, Urban Planning', courses: [
      { name: 'BArch Architecture', degree: 'bachelor', duration: '3 years' },
      { name: 'MPlan Planning', degree: 'master', duration: '2 years' },
    ]},
  ]},

  // NEW ZEALAND
  'uni-nz-001': { departments: [
    { name: 'Faculty of Engineering', description: 'Chemical, Civil, EE, Mechanical, Mechatronics, Software Engineering', courses: [
      { name: 'BE Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'ME Engineering', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, CS, Earth Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Science', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Arts', description: 'Languages, History, Philosophy, Social Sciences, Psychology', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Arts', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Business School', description: 'Commerce, MBA', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '3 years' },
      { name: 'MBA', degree: 'master', duration: '1.5 years' },
      { name: 'MCom Commerce', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '1 year' },
      { name: 'PhD Law', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Medical and Health Sciences', description: 'Medicine, Pharmacy, Optometry, Nursing, Population Health', courses: [
      { name: 'MBChB Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'PharmD Pharmacy', degree: 'bachelor', duration: '4 years' },
      { name: 'BOptom Optometry', degree: 'bachelor', duration: '4 years' },
      { name: 'BNursing Nursing', degree: 'bachelor', duration: '3 years' },
      { name: 'MPH Public Health', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Education and Social Work', description: 'Education, Social Work', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '3 years' },
      { name: 'BSW Social Work', degree: 'bachelor', duration: '3 years' },
      { name: 'MEd Education', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Creative Arts and Industries', description: 'Fine Arts, Architecture, Music, Dance, Design', courses: [
      { name: 'BFA Fine Arts', degree: 'bachelor', duration: '3 years' },
      { name: 'BArch Architecture', degree: 'bachelor', duration: '3 years' },
      { name: 'BMus Music', degree: 'bachelor', duration: '3 years' },
    ]},
  ]},

  'uni-nz-002': { departments: [
    { name: 'Faculty of Engineering', description: 'Civil, Electrical, Mechanical, Chemical, Mechatronics, Computer, Natural Resources, Surveying', courses: [
      { name: 'BE Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'ME Engineering', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, CS, Geological Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Science', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Arts', description: 'Languages, History, Philosophy, Political Science, Sociology', courses: [
      { name: 'BA Arts', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Arts', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Arts', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Business and Economics', description: 'Commerce, MBA, Economics', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '3 years' },
      { name: 'MCom Commerce', degree: 'master', duration: '1-2 years' },
      { name: 'MBA', degree: 'master', duration: '1.5 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '1 year' },
    ]},
    { name: 'Faculty of Education and Teaching', description: 'Education, Teaching', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '3 years' },
      { name: 'MEd Education', degree: 'master', duration: '1-2 years' },
    ]},
    { name: 'Faculty of Health', description: 'Health Sciences, Nursing, Public Health', courses: [
      { name: 'BHLSc Health Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'BNSc Nursing', degree: 'bachelor', duration: '3 years' },
      { name: 'MPH Public Health', degree: 'master', duration: '1-2 years' },
    ]},
  ]},

  'uni-nz-003': { departments: [
    { name: 'Faculty of Science and Engineering', description: 'Biology, Chemistry, Physics, Math, CS, EE, Civil Engineering', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'BE Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MSc Science', degree: 'master', duration: '1-2 years' },
      { name: 'ME Engineering', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Humanities and Social Sciences', description: 'Languages, History, Philosophy, Political Science, IR, Sociology', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '1 year' },
    ]},
    { name: 'Faculty of Business and Government', description: 'Commerce, MBA, Public Policy', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '3 years' },
      { name: 'MCom Commerce', degree: 'master', duration: '1-2 years' },
      { name: 'MPP Public Policy', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Education, Health, and Psychological Sciences', description: 'Education, Nursing, Psychology', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '3 years' },
      { name: 'BNursing Nursing', degree: 'bachelor', duration: '3 years' },
      { name: 'BPsych Psychology', degree: 'bachelor', duration: '3 years' },
    ]},
    { name: 'Faculty of Architecture and Design Innovation', description: 'Architecture, Design', courses: [
      { name: 'BArch Architecture', degree: 'bachelor', duration: '3 years' },
      { name: 'MArch Architecture', degree: 'master', duration: '2 years' },
    ]},
  ]},

  'uni-nz-004': { departments: [
    { name: 'Division of Sciences', description: 'Biology, Chemistry, Physics, Math, CS, Marine Science, Geology', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Science', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Division of Humanities', description: 'Languages, History, Philosophy, Politics, Music', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '1-2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '3-4 years' },
    ]},
    { name: 'Division of Health Sciences', description: 'Medicine, Dentistry, Pharmacy, Nursing, Physiotherapy, Medical Lab Science', courses: [
      { name: 'MBChB Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'BDS Dentistry', degree: 'bachelor', duration: '5 years' },
      { name: 'BPharm Pharmacy', degree: 'bachelor', duration: '4 years' },
      { name: 'BNursing Nursing', degree: 'bachelor', duration: '3 years' },
      { name: 'BPhysTh Physiotherapy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'Otago Business School', description: 'Commerce, MBA', courses: [
      { name: 'BCom Commerce', degree: 'bachelor', duration: '3 years' },
      { name: 'MBA', degree: 'master', duration: '1.5 years' },
    ]},
    { name: 'School of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '1 year' },
    ]},
    { name: 'College of Education', description: 'Education', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '3 years' },
      { name: 'MEd Education', degree: 'master', duration: '1-2 years' },
    ]},
  ]},

  // NORWAY
  'uni-no-001': { departments: [
    { name: 'Faculty of Mathematics and Natural Sciences', description: 'Math, Physics, Chemistry, Biology, Informatics, Geosciences', courses: [
      { name: 'BSc Mathematics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Physics', degree: 'bachelor', duration: '3 years' },
      { name: 'BSc Computer Science (Informatics)', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
      { name: 'PhD Natural Sciences', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine, Dentistry, Pharmacy', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '5 years' },
      { name: 'MPharm Pharmacy', degree: 'master', duration: '5 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'Cand.jur. Law', degree: 'bachelor', duration: '5 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Humanities', description: 'Languages, History, Philosophy, Media Studies', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Political Science, Sociology, Psychology, Economics', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Social Sciences', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Theology', description: 'Theology', courses: [
      { name: 'BA Theology', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Theology', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Education', description: 'Education', courses: [
      { name: 'BA Education', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Education', degree: 'master', duration: '2 years' },
    ]},
  ]},

  // DENMARK
  'uni-dk-001': { departments: [
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, CS, Geosciences, Pharmaceutical Sciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Health and Medical Sciences', description: 'Medicine, Dentistry, Pharmacy, Veterinary Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
      { name: 'DDS Dentistry', degree: 'bachelor', duration: '5 years' },
      { name: 'DVM Veterinary Medicine', degree: 'bachelor', duration: '5.5 years' },
      { name: 'MPharm Pharmacy', degree: 'master', duration: '5 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'BA Law', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Law', degree: 'master', duration: '2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Humanities', description: 'Languages, History, Philosophy, Media Studies', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Economics, Political Science, Sociology, Anthropology', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Social Sciences', degree: 'phd', duration: '3 years' },
    ]},
    { name: 'Faculty of Theology', description: 'Theology', courses: [
      { name: 'BA Theology', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Theology', degree: 'master', duration: '2 years' },
    ]},
  ]},

  // FINLAND
  'uni-fi-001': { departments: [
    { name: 'Faculty of Science', description: 'Biology, Chemistry, Physics, Math, CS, Geosciences', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Faculty of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '6 years' },
    ]},
    { name: 'Faculty of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '5 years' },
      { name: 'LLM Law', degree: 'master', duration: '2 years' },
      { name: 'PhD Law', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Faculty of Humanities', description: 'Languages, History, Philosophy', courses: [
      { name: 'BA Humanities', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Humanities', degree: 'master', duration: '2 years' },
      { name: 'PhD Humanities', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Faculty of Social Sciences', description: 'Political Science, Sociology, Psychology, Economics', courses: [
      { name: 'BA Social Sciences', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Social Sciences', degree: 'master', duration: '2 years' },
      { name: 'PhD Social Sciences', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Faculty of Agriculture and Forestry', description: 'Agriculture, Forestry, Food Science', courses: [
      { name: 'BSc Agriculture and Forestry', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Agriculture and Forestry', degree: 'master', duration: '2 years' },
      { name: 'PhD Agriculture', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Faculty of Biological and Environmental Sciences', description: 'Biology, Environmental Science', courses: [
      { name: 'BSc Biology', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Biology', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Educational Sciences', description: 'Education', courses: [
      { name: 'BEd Education', degree: 'bachelor', duration: '3 years' },
      { name: 'MEd Education', degree: 'master', duration: '2 years' },
      { name: 'PhD Education', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Faculty of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BPharm Pharmacy', degree: 'bachelor', duration: '3 years' },
      { name: 'MPharm Pharmacy', degree: 'master', duration: '2 years' },
      { name: 'PhD Pharmacy', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'Faculty of Theology', description: 'Theology', courses: [
      { name: 'BA Theology', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Theology', degree: 'master', duration: '2 years' },
    ]},
    { name: 'Faculty of Veterinary Medicine', description: 'Veterinary Medicine', courses: [
      { name: 'DVM Veterinary Medicine', degree: 'bachelor', duration: '5.5 years' },
    ]},
  ]},

  'uni-fi-002': { departments: [
    { name: 'School of Arts, Design and Architecture', description: 'Architecture, Design, Film, Art', courses: [
      { name: 'BA Architecture', degree: 'bachelor', duration: '3 years' },
      { name: 'BFA Design', degree: 'bachelor', duration: '3 years' },
      { name: 'MA Architecture', degree: 'master', duration: '2 years' },
      { name: 'MFA Design', degree: 'master', duration: '2 years' },
    ]},
    { name: 'School of Business', description: 'Business, Economics, Finance', courses: [
      { name: 'BSc Business', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Business', degree: 'master', duration: '2 years' },
      { name: 'MBA', degree: 'master', duration: '2 years' },
      { name: 'PhD Business', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'School of Chemical Engineering', description: 'Chemical Engineering', courses: [
      { name: 'BSc Chemical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Chemical Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Chemical Engineering', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'School of Electrical Engineering', description: 'EE, Automation, Electronics', courses: [
      { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Electrical Engineering', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'School of Engineering', description: 'Civil, Mechanical, Energy, Industrial', courses: [
      { name: 'BSc Engineering', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Engineering', degree: 'master', duration: '2 years' },
      { name: 'PhD Engineering', degree: 'phd', duration: '4 years' },
    ]},
    { name: 'School of Science', description: 'Math, Physics, CS, Applied Physics', courses: [
      { name: 'BSc Science', degree: 'bachelor', duration: '3 years' },
      { name: 'MSc Science', degree: 'master', duration: '2 years' },
      { name: 'PhD Science', degree: 'phd', duration: '4 years' },
    ]},
  ]},

  // CHINA
  'uni-cn-003': { departments: [
    { name: 'School of Computer Science', description: 'CS, Software Engineering', courses: [
      { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Computer Science', degree: 'master', duration: '3 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Economics', description: 'Economics', courses: [
      { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Economics', degree: 'master', duration: '3 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Management', description: 'Business, MBA, Finance', courses: [
      { name: 'BBA Business', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '3 years' },
      { name: 'PhD Management', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Law', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '3 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Physics', description: 'Physics', courses: [
      { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Physics', degree: 'master', duration: '3 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Chemistry', description: 'Chemistry', courses: [
      { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Chemistry', degree: 'master', duration: '3 years' },
      { name: 'PhD Chemistry', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Biological Sciences', description: 'Biology, Biotechnology', courses: [
      { name: 'BS Biological Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Biological Sciences', degree: 'master', duration: '3 years' },
      { name: 'PhD Biological Sciences', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Medicine', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '5 years' },
      { name: 'MS Medicine', degree: 'master', duration: '3 years' },
      { name: 'PhD Medicine', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Mathematics', description: 'Mathematics', courses: [
      { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Mathematics', degree: 'master', duration: '3 years' },
      { name: 'PhD Mathematics', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Philosophy', description: 'Philosophy', courses: [
      { name: 'BA Philosophy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of International Relations', description: 'International Relations', courses: [
      { name: 'BA International Relations', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Journalism', description: 'Journalism, Communication', courses: [
      { name: 'BA Journalism', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Foreign Languages', description: 'Foreign Languages', courses: [
      { name: 'BA Foreign Languages', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Software Engineering', description: 'Software Engineering', courses: [
      { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Electronic Engineering', description: 'Electronic Engineering', courses: [
      { name: 'BS Electronic Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Public Health', description: 'Public Health', courses: [
      { name: 'BS Public Health', degree: 'bachelor', duration: '4 years' },
      { name: 'MPH Public Health', degree: 'master', duration: '3 years' },
    ]},
    { name: 'School of Nursing', description: 'Nursing', courses: [
      { name: 'BSN Nursing', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Pharmacy', description: 'Pharmacy', courses: [
      { name: 'BS Pharmacy', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Pharmacy', degree: 'master', duration: '3 years' },
    ]},
  ]},

  'uni-cn-007': { departments: [
    { name: 'School of Computer Science and Technology', description: 'CS, Software Engineering, AI', courses: [
      { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Computer Science', degree: 'master', duration: '3 years' },
      { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Physics', description: 'Physics', courses: [
      { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Physics', degree: 'master', duration: '3 years' },
      { name: 'PhD Physics', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Chemistry and Chemical Engineering', description: 'Chemistry, Chemical Engineering', courses: [
      { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
      { name: 'BS Chemical Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Chemistry', degree: 'master', duration: '3 years' },
      { name: 'PhD Chemistry', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Mathematics', description: 'Mathematics', courses: [
      { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Mathematics', degree: 'master', duration: '3 years' },
      { name: 'PhD Mathematics', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Business', description: 'Business, MBA', courses: [
      { name: 'BS Business', degree: 'bachelor', duration: '4 years' },
      { name: 'MBA', degree: 'master', duration: '3 years' },
      { name: 'PhD Business', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Economics', description: 'Economics', courses: [
      { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Economics', degree: 'master', duration: '3 years' },
      { name: 'PhD Economics', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'Law School', description: 'Law', courses: [
      { name: 'LLB Law', degree: 'bachelor', duration: '4 years' },
      { name: 'LLM Law', degree: 'master', duration: '3 years' },
      { name: 'PhD Law', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'Medical School', description: 'Medicine', courses: [
      { name: 'MD Medicine', degree: 'bachelor', duration: '5 years' },
      { name: 'MS Medicine', degree: 'master', duration: '3 years' },
    ]},
    { name: 'School of Life Sciences', description: 'Biology, Biotechnology', courses: [
      { name: 'BS Biological Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Biological Sciences', degree: 'master', duration: '3 years' },
      { name: 'PhD Biological Sciences', degree: 'phd', duration: '3-5 years' },
    ]},
    { name: 'School of Environment', description: 'Environmental Sciences', courses: [
      { name: 'BS Environmental Sciences', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Environmental Sciences', degree: 'master', duration: '3 years' },
    ]},
    { name: 'School of Software Engineering', description: 'Software Engineering', courses: [
      { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Electronic Science and Engineering', description: 'Electronic Engineering', courses: [
      { name: 'BS Electronic Engineering', degree: 'bachelor', duration: '4 years' },
      { name: 'MS Electronic Engineering', degree: 'master', duration: '3 years' },
    ]},
    { name: 'School of Architecture and Urban Planning', description: 'Architecture, Urban Planning', courses: [
      { name: 'BArch Architecture', degree: 'bachelor', duration: '5 years' },
      { name: 'MArch Architecture', degree: 'master', duration: '3 years' },
    ]},
    { name: 'School of Foreign Languages', description: 'Foreign Languages', courses: [
      { name: 'BA Foreign Languages', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Philosophy', description: 'Philosophy', courses: [
      { name: 'BA Philosophy', degree: 'bachelor', duration: '4 years' },
    ]},
    { name: 'School of Information Management', description: 'Information Management', courses: [
      { name: 'BS Information Management', degree: 'bachelor', duration: '4 years' },
    ]},
  ]},
};

async function main() {
  let total = 0;
  for (const [uniId, data] of Object.entries(fixes)) {
    const uni = await p.university.findUnique({ where: { id: uniId } });
    if (!uni) { console.log(`SKIP: ${uniId}`); continue; }

    await p.course.deleteMany({ where: { universityId: uniId } });
    await p.department.deleteMany({ where: { universityId: uniId } });

    let d = 0, c = 0;
    for (const dept of data.departments) {
      await p.department.create({
        data: {
          universityId: uniId,
          name: dept.name,
          description: dept.description || null,
          totalCourses: dept.courses.length,
        },
      });
      d++;
      for (const course of dept.courses) {
        await p.course.create({
          data: {
            universityId: uniId,
            name: course.name,
            degree: course.degree,
            department: dept.name,
            duration: course.duration || null,
          },
        });
        c++;
      }
    }
    total += c;
    console.log(`✓ ${uni.name}: ${d} depts, ${c} courses`);
  }
  console.log(`\nDone! ${total} courses updated`);
  await p.$disconnect();
}
main().catch(console.error);
