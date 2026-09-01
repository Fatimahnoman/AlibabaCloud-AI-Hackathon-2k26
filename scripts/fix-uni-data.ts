/* eslint-disable */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Real-world university data correction script
// This fixes departments, courses, and programs to match actual universities

interface DeptData {
  name: string;
  head?: string;
  courses: { name: string; degree: string; duration: string; fee?: number }[];
}

interface UniCorrection {
  name: string;
  departments: DeptData[];
}

const corrections: UniCorrection[] = [
  // ==================== LUMS ====================
  {
    name: 'Lahore University of Management Sciences',
    departments: [
      {
        name: 'Suleman Dawood School of Business (SDSB)',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Accounting and Finance', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'MBA', degree: 'master', duration: '2 years', fee: 1550000 },
          { name: 'MPhil Business Administration', degree: 'master', duration: '2 years' },
          { name: 'PhD Business Administration', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Syed Babar Ali School of Science and Engineering (SASSE)',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Electrical Engineering', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Mechanical Engineering', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'MS Electrical Engineering', degree: 'master', duration: '2 years' },
          { name: 'MS Chemical Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Mushtaq Ahmad Gurmani School of Humanities and Social Sciences (MAGSHSS)',
        courses: [
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS English', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS History', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS International Relations', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Political Science', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'BS Sociology', degree: 'bachelor', duration: '4 years', fee: 1350000 },
          { name: 'MA English', degree: 'master', duration: '2 years' },
          { name: 'MA Economics', degree: 'master', duration: '2 years' },
          { name: 'PhD English', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Lahore Law School (LLS)',
        courses: [
          { name: 'LLB', degree: 'bachelor', duration: '5 years', fee: 1350000 },
          { name: 'LLM', degree: 'master', duration: '1-2 years' },
        ],
      },
    ],
  },

  // ==================== QUAD-i-AZAM UNIVERSITY ====================
  {
    name: 'Quaid-i-Azam University',
    departments: [
      {
        name: 'Faculty of Biological Sciences',
        courses: [
          { name: 'BS Biochemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Biotechnology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Microbiology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Zoology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Botany', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Environmental Sciences', degree: 'bachelor', duration: '4 years' },
          { name: 'MPhil Biochemistry', degree: 'master', duration: '2 years' },
          { name: 'MPhil Biotechnology', degree: 'master', duration: '2 years' },
          { name: 'PhD Biochemistry', degree: 'phd', duration: '3-5 years' },
          { name: 'PhD Biotechnology', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Physical Sciences',
        courses: [
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Statistics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Earth Sciences', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Physics', degree: 'master', duration: '2 years' },
          { name: 'MS Chemistry', degree: 'master', duration: '2 years' },
          { name: 'MS Mathematics', degree: 'master', duration: '2 years' },
          { name: 'PhD Physics', degree: 'phd', duration: '3-5 years' },
          { name: 'PhD Chemistry', degree: 'phd', duration: '3-5 years' },
          { name: 'PhD Mathematics', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Social Sciences',
        courses: [
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Sociology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Political Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS International Relations', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Anthropology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS History', degree: 'bachelor', duration: '4 years' },
          { name: 'MA Economics', degree: 'master', duration: '2 years' },
          { name: 'MA Political Science', degree: 'master', duration: '2 years' },
          { name: 'MA International Relations', degree: 'master', duration: '2 years' },
          { name: 'PhD Economics', degree: 'phd', duration: '3-5 years' },
          { name: 'PhD Political Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Islamic Studies & Religious Studies',
        courses: [
          { name: 'BA Islamic Studies', degree: 'bachelor', duration: '4 years' },
          { name: 'MA Islamic Studies', degree: 'master', duration: '2 years' },
          { name: 'PhD Islamic Studies', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Quaid-i-Azam Business School',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
          { name: 'PhD Business Administration', degree: 'phd', duration: '3-5 years' },
        ],
      },
    ],
  },

  // ==================== UET LAHORE ====================
  {
    name: 'University of Engineering and Technology Lahore',
    departments: [
      {
        name: 'Faculty of Architecture & Planning',
        courses: [
          { name: 'B.Arch', degree: 'bachelor', duration: '4 years' },
          { name: 'B.Des', degree: 'bachelor', duration: '4 years' },
          { name: 'M.Arch', degree: 'master', duration: '2 years' },
          { name: 'M.Des', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Chemical Engineering & Petroleum',
        courses: [
          { name: 'BSc Chemical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Petroleum Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Chemical Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Chemical Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Civil Engineering',
        courses: [
          { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Civil Engineering', degree: 'master', duration: '2 years' },
          { name: 'MSc Structural Engineering', degree: 'master', duration: '2 years' },
          { name: 'MSc Transportation Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Civil Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Electrical Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Electronics Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Telecommunication Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
          { name: 'MSc Power Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Electrical Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Mechanical Engineering',
        courses: [
          { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Mechatronics Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Mechanical Engineering', degree: 'master', duration: '2 years' },
          { name: 'MSc Thermal Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Mechanical Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Computer Science & Information Technology',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Information Technology', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Sciences',
        courses: [
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
          { name: 'MSc Physics', degree: 'master', duration: '2 years' },
        ],
      },
    ],
  },

  // ==================== FAST-NUCES Lahore ====================
  {
    name: 'FAST NUCES Lahore',
    departments: [
      {
        name: 'Department of Computer Science',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years', fee: 320000 },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years', fee: 320000 },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Electrical Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years', fee: 320000 },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Management Sciences',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years', fee: 300000 },
          { name: 'MBA', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Humanities',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years', fee: 280000 },
        ],
      },
    ],
  },

  // ==================== FAST-NUCES Islamabad ====================
  {
    name: 'FAST NUCES Islamabad',
    departments: [
      {
        name: 'Department of Computer Science',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'BS Artificial Intelligence', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Electrical Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Civil Engineering',
        courses: [
          { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'MSc Civil Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Management Sciences',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years', fee: 300000 },
          { name: 'MBA', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Humanities',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years', fee: 280000 },
        ],
      },
    ],
  },

  // ==================== FAST-NUCES Karachi ====================
  {
    name: 'FAST NUCES Karachi',
    departments: [
      {
        name: 'Department of Computer Science',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years', fee: 320000 },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years', fee: 320000 },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Electrical Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years', fee: 320000 },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Management Sciences',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years', fee: 300000 },
          { name: 'MBA', degree: 'master', duration: '2 years' },
        ],
      },
    ],
  },

  // ==================== COMSATS University Islamabad ====================
  {
    name: 'COMSATS University Islamabad',
    departments: [
      {
        name: 'Department of Computer Science',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Electrical Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Electrical Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Civil Engineering',
        courses: [
          { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Civil Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Management Sciences',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
          { name: 'PhD Management Sciences', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Physical Sciences',
        courses: [
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Physics', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Humanities & Social Sciences',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years' },
          { name: 'MA English', degree: 'master', duration: '2 years' },
        ],
      },
    ],
  },

  // ==================== University of the Punjab ====================
  {
    name: 'University of the Punjab',
    departments: [
      {
        name: 'Faculty of Arts & Humanities',
        courses: [
          { name: 'BA English', degree: 'bachelor', duration: '2 years' },
          { name: 'BA Urdu', degree: 'bachelor', duration: '2 years' },
          { name: 'BA Arabic', degree: 'bachelor', duration: '2 years' },
          { name: 'BA Persian', degree: 'bachelor', duration: '2 years' },
          { name: 'MA English', degree: 'master', duration: '2 years' },
          { name: 'MA Urdu', degree: 'master', duration: '2 years' },
          { name: 'MA Islamic Studies', degree: 'master', duration: '2 years' },
          { name: 'MA History', degree: 'master', duration: '2 years' },
          { name: 'MA Political Science', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Social Sciences',
        courses: [
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Sociology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Political Science', degree: 'bachelor', duration: '4 years' },
          { name: 'MA Economics', degree: 'master', duration: '2 years' },
          { name: 'MA Psychology', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Sciences',
        courses: [
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Botany', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Zoology', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Physics', degree: 'master', duration: '2 years' },
          { name: 'MSc Chemistry', degree: 'master', duration: '2 years' },
          { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Law',
        courses: [
          { name: 'LLB', degree: 'bachelor', duration: '5 years' },
          { name: 'LLM', degree: 'master', duration: '1-2 years' },
        ],
      },
      {
        name: 'Punjab University College of Engineering & Technology',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Chemical Engineering', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'Punjab University College of Commerce & Economics',
        courses: [
          { name: 'B.Com', degree: 'bachelor', duration: '2 years' },
          { name: 'M.Com', degree: 'master', duration: '2 years' },
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Punjab University College of Pharmacy',
        courses: [
          { name: 'Pharm-D', degree: 'bachelor', duration: '5 years' },
          { name: 'MPhil Pharmaceutical Sciences', degree: 'master', duration: '2 years' },
          { name: 'PhD Pharmaceutical Sciences', degree: 'phd', duration: '3-5 years' },
        ],
      },
    ],
  },

  // ==================== GCU Lahore ====================
  {
    name: 'Government College University Lahore',
    departments: [
      {
        name: 'Faculty of Arts & Humanities',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Urdu', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Islamic Studies', degree: 'bachelor', duration: '4 years' },
          { name: 'BS History', degree: 'bachelor', duration: '4 years' },
          { name: 'MA English', degree: 'master', duration: '2 years' },
          { name: 'MA Urdu', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Social Sciences',
        courses: [
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Political Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Sociology', degree: 'bachelor', duration: '4 years' },
          { name: 'MA Economics', degree: 'master', duration: '2 years' },
          { name: 'MA Political Science', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Sciences',
        courses: [
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Botany', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Zoology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Physics', degree: 'master', duration: '2 years' },
          { name: 'MSc Chemistry', degree: 'master', duration: '2 years' },
          { name: 'MSc Mathematics', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Business Administration',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Law',
        courses: [
          { name: 'LLB', degree: 'bachelor', duration: '5 years' },
        ],
      },
    ],
  },

  // ==================== Bahria University Islamabad ====================
  {
    name: 'Bahria University',
    departments: [
      {
        name: 'Faculty of Computing',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Information Technology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Cyber Security', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Engineering Sciences',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Mechatronics Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Management & Social Sciences',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS International Relations', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'Faculty of Maritime Sciences',
        courses: [
          { name: 'BS Maritime Sciences', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Nautical Studies', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'Faculty of Health & Biosciences',
        courses: [
          { name: 'BS Biochemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Microbiology', degree: 'bachelor', duration: '4 years' },
        ],
      },
    ],
  },

  // ==================== SZABIST Karachi ====================
  {
    name: 'SZABIST Karachi',
    departments: [
      {
        name: 'Faculty of Computer Science',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Business Administration',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
          { name: 'BS Accounting and Finance', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'Faculty of Media Sciences',
        courses: [
          { name: 'BS Media Sciences', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Media Sciences', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Law',
        courses: [
          { name: 'LLB', degree: 'bachelor', duration: '5 years' },
          { name: 'LLM', degree: 'master', duration: '1-2 years' },
        ],
      },
      {
        name: 'Faculty of Social Sciences',
        courses: [
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
        ],
      },
    ],
  },

  // ==================== Air University ====================
  {
    name: 'Air University',
    departments: [
      {
        name: 'Faculty of Computing & AI',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Artificial Intelligence', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Cyber Security', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Aeronautics & Aerospace',
        courses: [
          { name: 'BS Aerospace Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Avionics', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Aerospace Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Aerospace Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Engineering',
        courses: [
          { name: 'BS Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mechatronics Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Management Sciences',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
          { name: 'BS Accounting and Finance', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'Faculty of Social Sciences',
        courses: [
          { name: 'BS International Relations', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS English', degree: 'bachelor', duration: '4 years' },
        ],
      },
    ],
  },

  // ==================== Aga Khan University ====================
  {
    name: 'Aga Khan University',
    departments: [
      {
        name: 'Medical College',
        courses: [
          { name: 'MBBS', degree: 'bachelor', duration: '5 years' },
          { name: 'FCPS Medicine', degree: 'master', duration: '4 years' },
          { name: 'FCPS Surgery', degree: 'master', duration: '4 years' },
        ],
      },
      {
        name: 'School of Nursing & Midwifery',
        courses: [
          { name: 'BS Nursing', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Nursing', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Community Health Sciences',
        courses: [
          { name: 'MPH Public Health', degree: 'master', duration: '2 years' },
          { name: 'PhD Community Health Sciences', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Pathology & Laboratory Medicine',
        courses: [
          { name: 'MPhil Pathology', degree: 'master', duration: '2 years' },
        ],
      },
    ],
  },
];

async function main() {
  console.log('Starting university data correction...\n');

  for (const correction of corrections) {
    const uni = await prisma.university.findFirst({
      where: { name: { contains: correction.name } },
    });

    if (!uni) {
      console.log(`WARNING: University not found: ${correction.name}`);
      continue;
    }

    console.log(`\nCorrecting: ${uni.name} (${uni.city})`);

    // Delete existing departments and courses for this university
    const deletedDepts = await prisma.department.deleteMany({
      where: { universityId: uni.id },
    });
    const deletedCourses = await prisma.course.deleteMany({
      where: { universityId: uni.id },
    });
    console.log(`  Deleted ${deletedDepts.count} old departments, ${deletedCourses.count} old courses`);

    // Add corrected departments and courses
    for (const dept of correction.departments) {
      const createdDept = await prisma.department.create({
        data: {
          universityId: uni.id,
          name: dept.name,
          head: dept.head || null,
          totalCourses: dept.courses.length,
        },
      });

      for (const course of dept.courses) {
        await prisma.course.create({
          data: {
            universityId: uni.id,
            name: course.name,
            degree: course.degree,
            duration: course.duration,
            department: dept.name,
            tuitionFee: course.fee || null,
            currency: course.fee ? 'PKR' : null,
            verificationStatus: 'verified',
            description: `${course.degree === 'bachelor' ? 'An undergraduate' : course.degree === 'master' ? 'A postgraduate' : 'A doctoral'} program in ${dept.name} at ${uni.name}. Duration: ${course.duration}.`,
          },
        });
      }

      console.log(`  + ${dept.name}: ${dept.courses.length} courses`);
    }

    console.log(`  ✓ Done!`);
  }

  console.log('\n\nCorrection complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
