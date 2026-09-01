/* eslint-disable */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface RealProgram {
  name: string;
  degree: 'bachelor' | 'master' | 'phd' | 'intermediate' | 'diploma' | 'certificate' | 'associate';
  department: string;
  duration: string;
  fee: number;
}
interface RealDept {
  name: string;
  programs: RealProgram[];
}
interface UniRealData {
  search: string;
  departments: RealDept[];
}

const BATCH2: UniRealData[] = [
  {
    search: 'FAST-NUCES',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 220000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 220000 },
        { name: 'BS Artificial Intelligence', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 230000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 230000 },
        { name: 'BS Cyber Security', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 230000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '1.5 years', fee: 200000 },
        { name: 'MS Data Science', degree: 'master', department: 'Computer Science', duration: '1.5 years', fee: 210000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 350000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 220000 },
        { name: 'BS Computer Engineering', degree: 'bachelor', department: 'Computer Engineering', duration: '4 years', fee: 220000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 190000 },
        { name: 'PhD Electrical Engineering', degree: 'phd', department: 'Electrical Engineering', duration: '3-5 years', fee: 320000 },
      ]},
      { name: 'Department of Civil Engineering', programs: [
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 210000 },
        { name: 'MS Civil Engineering', degree: 'master', department: 'Civil Engineering', duration: '2 years', fee: 180000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 200000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 320000 },
      ]},
      { name: 'Department of Mathematics', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 180000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 160000 },
      ]},
    ],
  },
  {
    search: 'COMSATS University Islamabad',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 165000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 165000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 170000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 150000 },
        { name: 'MS Software Engineering', degree: 'master', department: 'Software Engineering', duration: '2 years', fee: 150000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 280000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 165000 },
        { name: 'BS Computer Engineering', degree: 'bachelor', department: 'Computer Engineering', duration: '4 years', fee: 165000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 140000 },
      ]},
      { name: 'Department of Civil Engineering', programs: [
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 160000 },
        { name: 'MS Civil Engineering', degree: 'master', department: 'Civil Engineering', duration: '2 years', fee: 135000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 155000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 280000 },
        { name: 'MS Management', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 220000 },
      ]},
      { name: 'Department of Physical Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 140000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 140000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 140000 },
        { name: 'MS Physics', degree: 'master', department: 'Physics', duration: '2 years', fee: 120000 },
      ]},
      { name: 'Department of Humanities', programs: [
        { name: 'BS English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 130000 },
        { name: 'BS Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 135000 },
      ]},
    ],
  },
  {
    search: 'Ghulam Ishaq Khan Institute',
    departments: [
      { name: 'Faculty of Engineering Sciences', programs: [
        { name: 'BS Computer Science and Engineering', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 450000 },
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 450000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 450000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 450000 },
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 450000 },
        { name: 'BS Mechatronics Engineering', degree: 'bachelor', department: 'Mechatronics', duration: '4 years', fee: 460000 },
        { name: 'BS Aerospace Engineering', degree: 'bachelor', department: 'Aerospace Engineering', duration: '4 years', fee: 460000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 400000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 400000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 400000 },
        { name: 'PhD Engineering Sciences', degree: 'phd', department: 'Engineering', duration: '3-5 years', fee: 600000 },
      ]},
      { name: 'Faculty of Basic Sciences', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 380000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 380000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 380000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 420000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 550000 },
      ]},
    ],
  },
  {
    search: 'University of the Punjab',
    departments: [
      { name: 'Faculty of Computing and IT', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 55000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 55000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 58000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 70000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 120000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 45000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 45000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 45000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 45000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 42000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 42000 },
        { name: 'BS Geography', degree: 'bachelor', department: 'Geography', duration: '4 years', fee: 40000 },
        { name: 'MS Physics', degree: 'master', department: 'Physics', duration: '2 years', fee: 60000 },
        { name: 'MS Chemistry', degree: 'master', department: 'Chemistry', duration: '2 years', fee: 60000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 60000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 38000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 35000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 40000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 38000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 40000 },
        { name: 'BA History', degree: 'bachelor', department: 'History', duration: '4 years', fee: 35000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 35000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 50000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 55000 },
        { name: 'MA Political Science', degree: 'master', department: 'Political Science', duration: '2 years', fee: 50000 },
        { name: 'MA Psychology', degree: 'master', department: 'Psychology', duration: '2 years', fee: 55000 },
        { name: 'MA Urdu', degree: 'master', department: 'Urdu', duration: '2 years', fee: 45000 },
        { name: 'PhD English', degree: 'phd', department: 'English', duration: '3-5 years', fee: 100000 },
        { name: 'PhD Economics', degree: 'phd', department: 'Economics', duration: '3-5 years', fee: 100000 },
      ]},
      { name: 'Faculty of Law', programs: [
        { name: 'LLB Bachelor of Laws', degree: 'bachelor', department: 'Law', duration: '5 years', fee: 60000 },
        { name: 'LLM Master of Laws', degree: 'master', department: 'Law', duration: '2 years', fee: 80000 },
      ]},
      { name: 'Faculty of Education', programs: [
        { name: 'BEd Bachelor of Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 45000 },
        { name: 'MEd Master of Education', degree: 'master', department: 'Education', duration: '2 years', fee: 55000 },
      ]},
      { name: 'PU Business School', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 55000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 100000 },
      ]},
    ],
  },
  {
    search: 'NED University of Engineering',
    departments: [
      { name: 'Department of Computer Science and IT', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 120000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 120000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 125000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 110000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BE Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 120000 },
        { name: 'BE Electronics Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 120000 },
        { name: 'BE Telecommunication Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 125000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 105000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BE Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 120000 },
        { name: 'BE Manufacturing Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 120000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 105000 },
      ]},
      { name: 'Department of Civil Engineering', programs: [
        { name: 'BE Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 120000 },
        { name: 'BE Environmental Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 125000 },
        { name: 'MS Civil Engineering', degree: 'master', department: 'Civil Engineering', duration: '2 years', fee: 105000 },
      ]},
      { name: 'Department of Chemical Engineering', programs: [
        { name: 'BE Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 120000 },
        { name: 'BE Petroleum and Gas Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 125000 },
      ]},
      { name: 'Department of Architecture', programs: [
        { name: 'BArch Architecture', degree: 'bachelor', department: 'Architecture', duration: '4 years', fee: 130000 },
        { name: 'BDes Design', degree: 'bachelor', department: 'Architecture', duration: '4 years', fee: 125000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 115000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 200000 },
      ]},
    ],
  },
  {
    search: 'Mehran University of Engineering',
    departments: [
      { name: 'Department of Computer Systems Engineering', programs: [
        { name: 'BE Computer Systems Engineering', degree: 'bachelor', department: 'Computer Engineering', duration: '4 years', fee: 85000 },
        { name: 'BE Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 85000 },
        { name: 'MS Computer Engineering', degree: 'master', department: 'Computer Engineering', duration: '2 years', fee: 75000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BE Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 85000 },
        { name: 'BE Electronics Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 85000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 75000 },
      ]},
      { name: 'Department of Civil Engineering', programs: [
        { name: 'BE Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 85000 },
        { name: 'BE Water Resources Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 88000 },
        { name: 'MS Civil Engineering', degree: 'master', department: 'Civil Engineering', duration: '2 years', fee: 75000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BE Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 85000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 75000 },
      ]},
      { name: 'Department of Petroleum Engineering', programs: [
        { name: 'BE Petroleum Engineering', degree: 'bachelor', department: 'Petroleum Engineering', duration: '4 years', fee: 90000 },
        { name: 'BE Gas Engineering', degree: 'bachelor', department: 'Petroleum Engineering', duration: '4 years', fee: 88000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 80000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 130000 },
      ]},
    ],
  },
  {
    search: 'Aga Khan University',
    departments: [
      { name: 'Faculty of Health Sciences', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 2500000 },
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 1200000 },
        { name: 'BDS Bachelor of Dental Surgery', degree: 'bachelor', department: 'Dentistry', duration: '4 years', fee: 2200000 },
        { name: 'Doctor of Pharmacy Pharm-D', degree: 'bachelor', department: 'Pharmacy', duration: '5 years', fee: 1800000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 2000000 },
        { name: 'MS Clinical Pathology', degree: 'master', department: 'Medicine', duration: '4 years', fee: 1800000 },
        { name: 'MPhil Biomedical Sciences', degree: 'master', department: 'Medicine', duration: '2 years', fee: 1500000 },
        { name: 'PhD Health Sciences', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 2500000 },
      ]},
      { name: 'Institute for Educational Development', programs: [
        { name: 'BEd Bachelor of Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 800000 },
        { name: 'MEd Master of Education', degree: 'master', department: 'Education', duration: '2 years', fee: 650000 },
        { name: 'PhD Education', degree: 'phd', department: 'Education', duration: '3-5 years', fee: 1200000 },
      ]},
    ],
  },
  {
    search: 'Dow University of Health Sciences',
    departments: [
      { name: 'Faculty of Medicine and Health Sciences', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 1500000 },
        { name: 'BDS Bachelor of Dental Surgery', degree: 'bachelor', department: 'Dentistry', duration: '4 years', fee: 1200000 },
        { name: 'Doctor of Pharmacy Pharm-D', degree: 'bachelor', department: 'Pharmacy', duration: '5 years', fee: 1000000 },
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 600000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 700000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 800000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 1500000 },
        { name: 'MS Pharmacology', degree: 'master', department: 'Pharmacy', duration: '2 years', fee: 800000 },
        { name: 'MPhil Biomedical Sciences', degree: 'master', department: 'Medicine', duration: '2 years', fee: 900000 },
        { name: 'PhD Health Sciences', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 1500000 },
      ]},
    ],
  },
  {
    search: 'Institute of Business Administration Karachi',
    departments: [
      { name: 'Department of Business Administration', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 450000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 700000 },
        { name: 'Executive MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 900000 },
      ]},
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 420000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 420000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 380000 },
      ]},
      { name: 'Department of Economics and Social Sciences', programs: [
        { name: 'BS Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 380000 },
        { name: 'BS Social Sciences', degree: 'bachelor', department: 'Social Sciences', duration: '4 years', fee: 380000 },
      ]},
      { name: 'Department of Mathematics', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 350000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 350000 },
      ]},
      { name: 'Department of Media and Communication', programs: [
        { name: 'BS Media and Communication Studies', degree: 'bachelor', department: 'Media Studies', duration: '4 years', fee: 400000 },
      ]},
    ],
  },
  {
    search: 'Sukkur IBA University',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 130000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 130000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 135000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 120000 },
      ]},
      { name: 'Department of Business Administration', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 125000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 200000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BS English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 110000 },
        { name: 'BS Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 115000 },
      ]},
      { name: 'Department of Natural Sciences', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 110000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 110000 },
      ]},
    ],
  },
  {
    search: 'Bahria University',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 180000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 180000 },
        { name: 'BS Cyber Security', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 190000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 160000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 300000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 180000 },
        { name: 'BS Mechatronics Engineering', degree: 'bachelor', department: 'Mechatronics', duration: '4 years', fee: 185000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 175000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 300000 },
      ]},
      { name: 'Department of Earth Sciences', programs: [
        { name: 'BS Geology', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 150000 },
        { name: 'BS Maritime Science', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 160000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BS English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 140000 },
        { name: 'BS International Relations', degree: 'bachelor', department: 'International Relations', duration: '4 years', fee: 145000 },
      ]},
    ],
  },
  {
    search: 'Air University',
    departments: [
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 200000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 200000 },
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 200000 },
        { name: 'BS Avionics Engineering', degree: 'bachelor', department: 'Avionics', duration: '4 years', fee: 210000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 200000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 200000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 180000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 180000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 320000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 190000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 320000 },
      ]},
      { name: 'Faculty of Basic and Applied Sciences', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 160000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 160000 },
        { name: 'BS English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 150000 },
      ]},
    ],
  },
  {
    search: 'SZABIST',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 250000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 250000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 220000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 380000 },
      ]},
      { name: 'Department of Business Administration', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 240000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 400000 },
        { name: 'Executive MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 500000 },
      ]},
      { name: 'Department of Media Sciences', programs: [
        { name: 'BS Media Sciences', degree: 'bachelor', department: 'Media Studies', duration: '4 years', fee: 230000 },
        { name: 'MS Media Sciences', degree: 'master', department: 'Media Studies', duration: '2 years', fee: 200000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BS English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 200000 },
        { name: 'BS Law', degree: 'bachelor', department: 'Law', duration: '4 years', fee: 220000 },
      ]},
    ],
  },
  {
    search: 'Government College University Lahore',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 60000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 60000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 75000 },
      ]},
      { name: 'Department of Physics', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 50000 },
        { name: 'MS Physics', degree: 'master', department: 'Physics', duration: '2 years', fee: 60000 },
        { name: 'PhD Physics', degree: 'phd', department: 'Physics', duration: '3-5 years', fee: 100000 },
      ]},
      { name: 'Department of Chemistry', programs: [
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 50000 },
        { name: 'MS Chemistry', degree: 'master', department: 'Chemistry', duration: '2 years', fee: 60000 },
      ]},
      { name: 'Department of Mathematics', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 50000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 60000 },
      ]},
      { name: 'Department of Biological Sciences', programs: [
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 48000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 48000 },
        { name: 'BS Biochemistry', degree: 'bachelor', department: 'Biochemistry', duration: '4 years', fee: 52000 },
        { name: 'BS Genetics', degree: 'bachelor', department: 'Genetics', duration: '4 years', fee: 52000 },
      ]},
      { name: 'Department of English', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 45000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 55000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 45000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 42000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 45000 },
        { name: 'BA History', degree: 'bachelor', department: 'History', duration: '4 years', fee: 42000 },
      ]},
    ],
  },
  {
    search: 'University of Karachi',
    departments: [
      { name: 'Faculty of Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 35000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 30000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 30000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 30000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 30000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 28000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 28000 },
        { name: 'BS Microbiology', degree: 'bachelor', department: 'Microbiology', duration: '4 years', fee: 35000 },
        { name: 'BS Biochemistry', degree: 'bachelor', department: 'Biochemistry', duration: '4 years', fee: 35000 },
        { name: 'BS Geology', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 30000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 45000 },
        { name: 'MS Physics', degree: 'master', department: 'Physics', duration: '2 years', fee: 40000 },
        { name: 'MS Chemistry', degree: 'master', department: 'Chemistry', duration: '2 years', fee: 40000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 40000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 80000 },
        { name: 'PhD Chemistry', degree: 'phd', department: 'Chemistry', duration: '3-5 years', fee: 80000 },
      ]},
      { name: 'Faculty of Arts', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 25000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 22000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 22000 },
        { name: 'BA History', degree: 'bachelor', department: 'History', duration: '4 years', fee: 22000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 35000 },
        { name: 'MA Urdu', degree: 'master', department: 'Urdu', duration: '2 years', fee: 30000 },
        { name: 'MA Islamic Studies', degree: 'master', department: 'Islamic Studies', duration: '2 years', fee: 30000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 28000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 25000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 28000 },
        { name: 'BA Sociology', degree: 'bachelor', department: 'Sociology', duration: '4 years', fee: 25000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 38000 },
        { name: 'MA Political Science', degree: 'master', department: 'Political Science', duration: '2 years', fee: 35000 },
        { name: 'MA Psychology', degree: 'master', department: 'Psychology', duration: '2 years', fee: 38000 },
      ]},
      { name: 'Faculty of Management Studies', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 40000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 70000 },
      ]},
      { name: 'Faculty of Pharmacy', programs: [
        { name: 'Doctor of Pharmacy Pharm-D', degree: 'bachelor', department: 'Pharmacy', duration: '5 years', fee: 60000 },
        { name: 'MS Pharmacology', degree: 'master', department: 'Pharmacy', duration: '2 years', fee: 50000 },
      ]},
    ],
  },
];

async function main() {
  console.log('=== Seeding Batch 2: Real University Data ===\n');

  for (const uniData of BATCH2) {
    let uni = await prisma.university.findFirst({
      where: { name: { contains: uniData.search, mode: 'insensitive' } },
    });

    if (!uni && uniData.search === 'FAST-NUCES') {
      console.log('Creating FAST-NUCES...');
      uni = await prisma.university.create({
        data: {
          name: 'FAST-NUCES (National University of Computer and Emerging Sciences)',
          city: 'Islamabad',
          country: 'Pakistan',
          type: 'university',
          sector: 'private',
          foundedYear: 1980,
          website: 'https://www.nu.edu.pk',
          description: 'FAST-NUCES is Pakistan\'s premier university for Computer Science and IT, with campuses in Islamabad, Lahore, Karachi, Peshawar, and Chiniot.',
          verificationStatus: 'verified',
        },
      });
    }

    if (!uni) {
      console.log(`⚠️  NOT FOUND: ${uniData.search}`);
      continue;
    }

    console.log(`\n📚 ${uni.name} (${uni.city})`);

    const deleted = await prisma.course.deleteMany({ where: { universityId: uni.id } });
    const deletedDepts = await prisma.department.deleteMany({ where: { universityId: uni.id } });
    console.log(`   Removed ${deleted.count} courses, ${deletedDepts.count} departments`);

    let totalCourses = 0;
    for (const dept of uniData.departments) {
      await prisma.department.create({
        data: { universityId: uni.id, name: dept.name, totalCourses: dept.programs.length },
      });
      for (const prog of dept.programs) {
        await prisma.course.create({
          data: {
            universityId: uni.id,
            name: prog.name,
            degree: prog.degree,
            department: prog.department,
            duration: prog.duration,
            language: 'English',
            tuitionFee: prog.fee,
            currency: 'PKR',
            description: `${prog.name} at ${uni.name}. ${prog.duration} program.`,
            verificationStatus: 'verified',
          },
        });
        totalCourses++;
      }
    }
    console.log(`   ✅ ${uniData.departments.length} departments, ${totalCourses} real courses`);
  }

  console.log('\n=== Batch 2 Done! ===');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
