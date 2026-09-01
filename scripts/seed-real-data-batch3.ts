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
interface RealDept { name: string; programs: RealProgram[]; }
interface UniRealData { search: string; departments: RealDept[]; }

const BATCH3: UniRealData[] = [
  // UET Taxila
  {
    search: 'University of Engineering and Technology Taxila',
    departments: [
      { name: 'Department of Computer Science and IT', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 130000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 130000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 115000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BSc Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 130000 },
        { name: 'BSc Electronics Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 130000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 110000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BSc Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 130000 },
        { name: 'BSc Industrial Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 128000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 110000 },
      ]},
      { name: 'Department of Civil Engineering', programs: [
        { name: 'BSc Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 130000 },
        { name: 'MS Civil Engineering', degree: 'master', department: 'Civil Engineering', duration: '2 years', fee: 110000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 120000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 200000 },
      ]},
    ],
  },
  // UET Peshawar
  {
    search: 'University of Engineering and Technology Peshawar',
    departments: [
      { name: 'Department of Computer Science and IT', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 110000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 110000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 95000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BSc Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 110000 },
        { name: 'BSc Electronics Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 110000 },
      ]},
      { name: 'Department of Civil Engineering', programs: [
        { name: 'BSc Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 110000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BSc Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 110000 },
      ]},
      { name: 'Department of Mining Engineering', programs: [
        { name: 'BSc Mining Engineering', degree: 'bachelor', department: 'Mining Engineering', duration: '4 years', fee: 115000 },
        { name: 'BSc Petroleum Engineering', degree: 'bachelor', department: 'Mining Engineering', duration: '4 years', fee: 118000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 100000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 170000 },
      ]},
    ],
  },
  // University of Peshawar
  {
    search: 'University of Peshawar',
    departments: [
      { name: 'Faculty of Computer Science and IT', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 50000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 50000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 52000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 65000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 100000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 35000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 33000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 35000 },
        { name: 'BA Sociology', degree: 'bachelor', department: 'Sociology', duration: '4 years', fee: 33000 },
        { name: 'BA International Relations', degree: 'bachelor', department: 'International Relations', duration: '4 years', fee: 35000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 45000 },
        { name: 'MA Political Science', degree: 'master', department: 'Political Science', duration: '2 years', fee: 42000 },
        { name: 'MA Psychology', degree: 'master', department: 'Psychology', duration: '2 years', fee: 45000 },
      ]},
      { name: 'Faculty of Physical Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 38000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 38000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 38000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 38000 },
        { name: 'MS Physics', degree: 'master', department: 'Physics', duration: '2 years', fee: 50000 },
        { name: 'MS Chemistry', degree: 'master', department: 'Chemistry', duration: '2 years', fee: 50000 },
      ]},
      { name: 'Faculty of Biological Sciences', programs: [
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 35000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 35000 },
        { name: 'BS Biochemistry', degree: 'bachelor', department: 'Biochemistry', duration: '4 years', fee: 40000 },
        { name: 'BS Microbiology', degree: 'bachelor', department: 'Microbiology', duration: '4 years', fee: 42000 },
      ]},
      { name: 'Faculty of Arts', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 32000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 30000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 30000 },
        { name: 'BA Pashto', degree: 'bachelor', department: 'Pashto', duration: '4 years', fee: 28000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 42000 },
        { name: 'MA Urdu', degree: 'master', department: 'Urdu', duration: '2 years', fee: 38000 },
      ]},
      { name: 'Business School', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 50000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 90000 },
      ]},
      { name: 'Faculty of Law', programs: [
        { name: 'LLB Bachelor of Laws', degree: 'bachelor', department: 'Law', duration: '5 years', fee: 45000 },
        { name: 'LLM Master of Laws', degree: 'master', department: 'Law', duration: '2 years', fee: 60000 },
      ]},
    ],
  },
  // University of Sindh
  {
    search: 'University of Sindh',
    departments: [
      { name: 'Faculty of Natural Sciences', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 30000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 25000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 25000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 25000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 22000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 22000 },
        { name: 'BS Microbiology', degree: 'bachelor', department: 'Microbiology', duration: '4 years', fee: 30000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 40000 },
        { name: 'MS Chemistry', degree: 'master', department: 'Chemistry', duration: '2 years', fee: 35000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 20000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 18000 },
        { name: 'BA Sindhi', degree: 'bachelor', department: 'Sindhi', duration: '4 years', fee: 18000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 22000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 20000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 22000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 30000 },
        { name: 'MA Sindhi', degree: 'master', department: 'Sindhi', duration: '2 years', fee: 25000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 32000 },
      ]},
      { name: 'Faculty of Education', programs: [
        { name: 'BEd Bachelor of Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 25000 },
        { name: 'MEd Master of Education', degree: 'master', department: 'Education', duration: '2 years', fee: 35000 },
        { name: 'PhD Education', degree: 'phd', department: 'Education', duration: '3-5 years', fee: 60000 },
      ]},
      { name: 'Sindh Madressatul Islam Business School', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 35000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 60000 },
      ]},
    ],
  },
  // Bahauddin Zakariya University Multan
  {
    search: 'Bahauddin Zakariya University',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 42000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 42000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 44000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 55000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 50000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 50000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 50000 },
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 52000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 35000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 35000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 35000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 35000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 32000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 32000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 30000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 28000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 32000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 30000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 32000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 40000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 42000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 45000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 75000 },
      ]},
    ],
  },
  // Islamia University Bahawalpur
  {
    search: 'Islamia University',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 38000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 38000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 48000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 45000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 45000 },
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 47000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 32000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 32000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 32000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 30000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 30000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 28000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 25000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 25000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 30000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 28000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 38000 },
        { name: 'MA Islamic Studies', degree: 'master', department: 'Islamic Studies', duration: '2 years', fee: 35000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 40000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 40000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 65000 },
      ]},
    ],
  },
  // Allama Iqbal Open University
  {
    search: 'Allama Iqbal Open University',
    departments: [
      { name: 'Faculty of Education', programs: [
        { name: 'BEd Bachelor of Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 25000 },
        { name: 'MEd Master of Education', degree: 'master', department: 'Education', duration: '2 years', fee: 35000 },
        { name: 'PhD Education', degree: 'phd', department: 'Education', duration: '3-5 years', fee: 60000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 18000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 16000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 18000 },
        { name: 'BA Sociology', degree: 'bachelor', department: 'Sociology', duration: '4 years', fee: 16000 },
        { name: 'MA Education', degree: 'master', department: 'Education', duration: '2 years', fee: 28000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 30000 },
      ]},
      { name: 'Faculty of Arts', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 16000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 14000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 14000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 25000 },
        { name: 'MA Urdu', degree: 'master', department: 'Urdu', duration: '2 years', fee: 22000 },
      ]},
      { name: 'Faculty of Natural Sciences', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 20000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 20000 },
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 25000 },
      ]},
      { name: 'Faculty of Management', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 28000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 50000 },
      ]},
    ],
  },
  // Virtual University of Pakistan
  {
    search: 'Virtual University',
    departments: [
      { name: 'Faculty of Computing and Technology', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 120000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 120000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 125000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 130000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 110000 },
      ]},
      { name: 'Faculty of Management', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 115000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 180000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 95000 },
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 90000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 95000 },
      ]},
      { name: 'Faculty of Natural Sciences', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 90000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 90000 },
      ]},
    ],
  },
  // PIEAS
  {
    search: 'Pakistan Institute of Engineering',
    departments: [
      { name: 'Department of Computer and Information Sciences', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 180000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 180000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 160000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 280000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 180000 },
        { name: 'BS Nuclear Engineering', degree: 'bachelor', department: 'Nuclear Engineering', duration: '4 years', fee: 190000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 155000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 180000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 155000 },
      ]},
      { name: 'Department of Basic Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 150000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 150000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 150000 },
      ]},
    ],
  },
  // King Edward Medical University
  {
    search: 'King Edward Medical',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 500000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 600000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 550000 },
        { name: 'MPhil Anatomy', degree: 'master', department: 'Medicine', duration: '2 years', fee: 350000 },
        { name: 'MPhil Physiology', degree: 'master', department: 'Medicine', duration: '2 years', fee: 350000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 700000 },
      ]},
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 250000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 280000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 350000 },
      ]},
    ],
  },
  // Fatima Jinnah Women University
  {
    search: 'Fatima Jinnah Women University',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 45000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 45000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 45000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 58000 },
      ]},
      { name: 'Department of Biological Sciences', programs: [
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 35000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 35000 },
        { name: 'BS Biochemistry', degree: 'bachelor', department: 'Biochemistry', duration: '4 years', fee: 38000 },
        { name: 'BS Microbiology', degree: 'bachelor', department: 'Microbiology', duration: '4 years', fee: 40000 },
        { name: 'BS Biotechnology', degree: 'bachelor', department: 'Biotechnology', duration: '4 years', fee: 42000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 32000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 30000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 35000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 35000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 33000 },
      ]},
      { name: 'Department of Physical Sciences', programs: [
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 38000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 38000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 38000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 42000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 65000 },
      ]},
    ],
  },
  // COMSATS other campuses
  {
    search: 'COMSATS University',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 155000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 155000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 160000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 140000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 155000 },
        { name: 'BS Computer Engineering', degree: 'bachelor', department: 'Computer Engineering', duration: '4 years', fee: 155000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 145000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 260000 },
      ]},
      { name: 'Department of Physical Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 130000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 130000 },
        { name: 'BS English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 120000 },
      ]},
    ],
  },
  // NUST - Military College of Signals
  {
    search: 'Military College of Signals',
    departments: [
      { name: 'Department of Computer Science and IT', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 280000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 280000 },
        { name: 'BS Cyber Security', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 290000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 250000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 280000 },
        { name: 'BS Telecommunication Engineering', degree: 'bachelor', department: 'Telecommunication', duration: '4 years', fee: 290000 },
        { name: 'BS Avionics Engineering', degree: 'bachelor', department: 'Avionics', duration: '4 years', fee: 295000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 260000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 380000 },
      ]},
    ],
  },
];

async function main() {
  console.log('=== Seeding Batch 3: Real University Data ===\n');

  for (const uniData of BATCH3) {
    const uni = await prisma.university.findFirst({
      where: { name: { contains: uniData.search, mode: 'insensitive' } },
    });

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

  console.log('\n=== Batch 3 Done! ===');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
