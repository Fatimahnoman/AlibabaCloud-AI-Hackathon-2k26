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

const BATCH4: UniRealData[] = [
  // International Islamic University Islamabad
  {
    search: 'International Islamic University Islamabad',
    departments: [
      { name: 'Faculty of Computing and Information Sciences', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 85000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 85000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 85000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 90000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 75000 },
        { name: 'MS Data Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 80000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 150000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 90000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 90000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 90000 },
        { name: 'BS Mechatronics Engineering', degree: 'bachelor', department: 'Mechatronics', duration: '4 years', fee: 95000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 65000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 62000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 65000 },
        { name: 'BA International Relations', degree: 'bachelor', department: 'International Relations', duration: '4 years', fee: 65000 },
        { name: 'BA Mass Communication', degree: 'bachelor', department: 'Mass Communication', duration: '4 years', fee: 68000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 80000 },
        { name: 'MA Political Science', degree: 'master', department: 'Political Science', duration: '2 years', fee: 75000 },
        { name: 'MA Psychology', degree: 'master', department: 'Psychology', duration: '2 years', fee: 80000 },
        { name: 'MA International Relations', degree: 'master', department: 'International Relations', duration: '2 years', fee: 80000 },
      ]},
      { name: 'Faculty of Languages and Literature', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 60000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 55000 },
        { name: 'BA Arabic', degree: 'bachelor', department: 'Arabic', duration: '4 years', fee: 55000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 72000 },
        { name: 'MA Urdu', degree: 'master', department: 'Urdu', duration: '2 years', fee: 65000 },
        { name: 'MA Arabic', degree: 'master', department: 'Arabic', duration: '2 years', fee: 65000 },
      ]},
      { name: 'Faculty of Islamic Studies', programs: [
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 50000 },
        { name: 'BA Usul-ud-Din', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 50000 },
        { name: 'MA Islamic Studies', degree: 'master', department: 'Islamic Studies', duration: '2 years', fee: 65000 },
        { name: 'MA Hadith', degree: 'master', department: 'Islamic Studies', duration: '2 years', fee: 62000 },
        { name: 'PhD Islamic Studies', degree: 'phd', department: 'Islamic Studies', duration: '3-5 years', fee: 120000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 80000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 130000 },
      ]},
      { name: 'Faculty of Basic and Applied Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 60000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 60000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 60000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 60000 },
      ]},
      { name: 'Faculty of Law', programs: [
        { name: 'LLB Bachelor of Laws', degree: 'bachelor', department: 'Law', duration: '5 years', fee: 75000 },
        { name: 'LLM Master of Laws', degree: 'master', department: 'Law', duration: '2 years', fee: 95000 },
      ]},
    ],
  },
  // University of Gujrat
  {
    search: 'University of Gujrat',
    departments: [
      { name: 'Faculty of Computing and Information Technology', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 55000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 55000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 58000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 70000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 65000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 65000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 65000 },
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 68000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 58000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 95000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 42000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 38000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 38000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 45000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 42000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 45000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 42000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 45000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 45000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 45000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 42000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 42000 },
      ]},
    ],
  },
  // University of Sargodha
  {
    search: 'University of Sargodha',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 45000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 45000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 48000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 58000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 38000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 38000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 38000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 38000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 35000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 35000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 32000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 30000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 30000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 35000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 32000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 35000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 33000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 48000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 78000 },
      ]},
      { name: 'Faculty of Agriculture', programs: [
        { name: 'BS Agriculture', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 42000 },
        { name: 'BS Horticulture', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 42000 },
      ]},
    ],
  },
  // University of Agriculture Faisalabad
  {
    search: 'University of Agriculture Faisalabad',
    departments: [
      { name: 'Faculty of Agriculture', programs: [
        { name: 'BS Agriculture', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 45000 },
        { name: 'BS Agronomy', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 45000 },
        { name: 'BS Horticulture', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 45000 },
        { name: 'BS Plant Protection', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 48000 },
        { name: 'BS Soil Science', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 45000 },
      ]},
      { name: 'Faculty of Animal Husbandry', programs: [
        { name: 'BS Animal Sciences', degree: 'bachelor', department: 'Animal Sciences', duration: '4 years', fee: 48000 },
        { name: 'BS Poultry Science', degree: 'bachelor', department: 'Animal Sciences', duration: '4 years', fee: 48000 },
        { name: 'BS Dairy Science', degree: 'bachelor', department: 'Animal Sciences', duration: '4 years', fee: 48000 },
      ]},
      { name: 'Faculty of Food Science and Technology', programs: [
        { name: 'BS Food Science and Technology', degree: 'bachelor', department: 'Food Science', duration: '4 years', fee: 52000 },
        { name: 'BS Food Nutrition', degree: 'bachelor', department: 'Food Science', duration: '4 years', fee: 50000 },
      ]},
      { name: 'Faculty of Agricultural Engineering and Technology', programs: [
        { name: 'BS Agricultural Engineering', degree: 'bachelor', department: 'Agricultural Engineering', duration: '4 years', fee: 55000 },
        { name: 'BS Irrigation and Drainage Engineering', degree: 'bachelor', department: 'Agricultural Engineering', duration: '4 years', fee: 55000 },
        { name: 'BS Farm Machinery', degree: 'bachelor', department: 'Agricultural Engineering', duration: '4 years', fee: 52000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BS Agricultural Economics', degree: 'bachelor', department: 'Agricultural Economics', duration: '4 years', fee: 42000 },
        { name: 'BS Rural Development', degree: 'bachelor', department: 'Social Sciences', duration: '4 years', fee: 40000 },
        { name: 'BS Agribusiness', degree: 'bachelor', department: 'Agribusiness', duration: '4 years', fee: 45000 },
      ]},
      { name: 'Faculty of Sciences', programs: [
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 38000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 38000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 40000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 38000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 38000 },
      ]},
    ],
  },
  // Forman Christian College University
  {
    search: 'Forman Christian College',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 280000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 280000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 240000 },
      ]},
      { name: 'Department of Natural Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 250000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 250000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 250000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 250000 },
        { name: 'BS Microbiology', degree: 'bachelor', department: 'Microbiology', duration: '4 years', fee: 270000 },
        { name: 'BS Biochemistry', degree: 'bachelor', department: 'Biochemistry', duration: '4 years', fee: 270000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 230000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 220000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 230000 },
        { name: 'BA Sociology', degree: 'bachelor', department: 'Sociology', duration: '4 years', fee: 220000 },
      ]},
      { name: 'Department of Languages', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 220000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 200000 },
      ]},
      { name: 'Department of Business Administration', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 270000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 400000 },
      ]},
    ],
  },
  // Institute of Space Technology
  {
    search: 'Institute of Space Technology',
    departments: [
      { name: 'Department of Aerospace Engineering', programs: [
        { name: 'BS Aerospace Engineering', degree: 'bachelor', department: 'Aerospace Engineering', duration: '4 years', fee: 250000 },
        { name: 'BS Avionics Engineering', degree: 'bachelor', department: 'Avionics', duration: '4 years', fee: 255000 },
        { name: 'MS Aerospace Engineering', degree: 'master', department: 'Aerospace Engineering', duration: '2 years', fee: 220000 },
        { name: 'PhD Aerospace Engineering', degree: 'phd', department: 'Aerospace Engineering', duration: '3-5 years', fee: 380000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 240000 },
        { name: 'BS Computer Engineering', degree: 'bachelor', department: 'Computer Engineering', duration: '4 years', fee: 240000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 200000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 240000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 200000 },
      ]},
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 230000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 190000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 220000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 350000 },
      ]},
    ],
  },
  // National Textile University
  {
    search: 'National Textile University',
    departments: [
      { name: 'Department of Textile Engineering', programs: [
        { name: 'BS Textile Engineering', degree: 'bachelor', department: 'Textile Engineering', duration: '4 years', fee: 130000 },
        { name: 'BS Textile Design', degree: 'bachelor', department: 'Textile Engineering', duration: '4 years', fee: 125000 },
        { name: 'MS Textile Engineering', degree: 'master', department: 'Textile Engineering', duration: '2 years', fee: 115000 },
      ]},
      { name: 'Department of Fashion Design', programs: [
        { name: 'BDes Fashion Design', degree: 'bachelor', department: 'Fashion Design', duration: '4 years', fee: 135000 },
        { name: 'BDes Textile Design', degree: 'bachelor', department: 'Fashion Design', duration: '4 years', fee: 130000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 120000 },
        { name: 'MBA Textile Management', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 200000 },
      ]},
    ],
  },
  // The University of Lahore
  {
    search: 'The University of Lahore',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 160000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 160000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 160000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 140000 },
      ]},
      { name: 'Department of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 165000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 165000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 165000 },
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 168000 },
      ]},
      { name: 'Department of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 155000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 260000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 130000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 135000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 130000 },
      ]},
      { name: 'Department of Law', programs: [
        { name: 'LLB Bachelor of Laws', degree: 'bachelor', department: 'Law', duration: '5 years', fee: 145000 },
        { name: 'LLM Master of Laws', degree: 'master', department: 'Law', duration: '2 years', fee: 180000 },
      ]},
      { name: 'Department of Pharmacy', programs: [
        { name: 'Doctor of Pharmacy Pharm-D', degree: 'bachelor', department: 'Pharmacy', duration: '5 years', fee: 200000 },
      ]},
    ],
  },
  // University of Central Punjab
  {
    search: 'University of Central Punjab',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 175000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 175000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 175000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 155000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 180000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 180000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 180000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 170000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 280000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 140000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 145000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 140000 },
      ]},
    ],
  },
  // Riphah International University
  {
    search: 'Riphah International University',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 185000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 185000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 185000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 165000 },
      ]},
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 280000 },
        { name: 'BS Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 220000 },
        { name: 'BS Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 200000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 180000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 300000 },
      ]},
      { name: 'Faculty of Rehabilitation and Allied Health Sciences', programs: [
        { name: 'BS Speech and Language Pathology', degree: 'bachelor', department: 'Speech Pathology', duration: '4 years', fee: 230000 },
        { name: 'BS Occupational Therapy', degree: 'bachelor', department: 'Occupational Therapy', duration: '4 years', fee: 230000 },
      ]},
    ],
  },
  // Superior University Lahore
  {
    search: 'Superior University Lahore',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 165000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 165000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 165000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 170000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 145000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 170000 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 170000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 170000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 160000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 270000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 135000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 140000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 135000 },
      ]},
      { name: 'Faculty of Pharmacy', programs: [
        { name: 'Doctor of Pharmacy Pharm-D', degree: 'bachelor', department: 'Pharmacy', duration: '5 years', fee: 190000 },
      ]},
    ],
  },
  // Textile Institute of Pakistan
  {
    search: 'Textile Institute of Pakistan',
    departments: [
      { name: 'Department of Textile Engineering', programs: [
        { name: 'BS Textile Engineering', degree: 'bachelor', department: 'Textile Engineering', duration: '4 years', fee: 150000 },
        { name: 'BS Textile Management', degree: 'bachelor', department: 'Textile Engineering', duration: '4 years', fee: 145000 },
        { name: 'MS Textile Engineering', degree: 'master', department: 'Textile Engineering', duration: '2 years', fee: 130000 },
      ]},
      { name: 'Department of Textile Design', programs: [
        { name: 'BDes Textile Design', degree: 'bachelor', department: 'Textile Design', duration: '4 years', fee: 140000 },
        { name: 'BDes Fashion Design', degree: 'bachelor', department: 'Textile Design', duration: '4 years', fee: 140000 },
      ]},
      { name: 'Department of Business Administration', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 135000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 220000 },
      ]},
    ],
  },
  // National College of Arts
  {
    search: 'National College of Arts',
    departments: [
      { name: 'Department of Fine Arts', programs: [
        { name: 'BFA Fine Arts', degree: 'bachelor', department: 'Fine Arts', duration: '4 years', fee: 120000 },
        { name: 'BFA Painting', degree: 'bachelor', department: 'Fine Arts', duration: '4 years', fee: 120000 },
        { name: 'BFA Sculpture', degree: 'bachelor', department: 'Fine Arts', duration: '4 years', fee: 120000 },
        { name: 'MFA Fine Arts', degree: 'master', department: 'Fine Arts', duration: '2 years', fee: 100000 },
      ]},
      { name: 'Department of Design', programs: [
        { name: 'BDes Communication Design', degree: 'bachelor', department: 'Design', duration: '4 years', fee: 130000 },
        { name: 'BDes Industrial Design', degree: 'bachelor', department: 'Design', duration: '4 years', fee: 130000 },
        { name: 'BDes Fashion Design', degree: 'bachelor', department: 'Design', duration: '4 years', fee: 130000 },
        { name: 'BDes Textile Design', degree: 'bachelor', department: 'Design', duration: '4 years', fee: 125000 },
      ]},
      { name: 'Department of Architecture', programs: [
        { name: 'BArch Architecture', degree: 'bachelor', department: 'Architecture', duration: '4 years', fee: 140000 },
        { name: 'MArch Architecture', degree: 'master', department: 'Architecture', duration: '2 years', fee: 120000 },
      ]},
      { name: 'Department of Film and Television', programs: [
        { name: 'BFA Film and Television', degree: 'bachelor', department: 'Film and Television', duration: '4 years', fee: 125000 },
      ]},
      { name: 'Department of Music', programs: [
        { name: 'BMus Music', degree: 'bachelor', department: 'Music', duration: '4 years', fee: 110000 },
      ]},
      { name: 'Department of Art History and Criticism', programs: [
        { name: 'BA Art History', degree: 'bachelor', department: 'Art History', duration: '4 years', fee: 100000 },
        { name: 'MA Art History', degree: 'master', department: 'Art History', duration: '2 years', fee: 85000 },
      ]},
    ],
  },
  // Lahore College for Women University
  {
    search: 'Lahore College for Women University',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 50000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 50000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 50000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 62000 },
      ]},
      { name: 'Department of Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 42000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 42000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 42000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 42000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 40000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 40000 },
      ]},
      { name: 'Department of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 38000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 36000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 38000 },
        { name: 'BA Sociology', degree: 'bachelor', department: 'Sociology', duration: '4 years', fee: 36000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 37000 },
      ]},
      { name: 'Department of Languages', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 35000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 32000 },
        { name: 'BA Punjabi', degree: 'bachelor', department: 'Punjabi', duration: '4 years', fee: 30000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 45000 },
        { name: 'MA Urdu', degree: 'master', department: 'Urdu', duration: '2 years', fee: 40000 },
      ]},
      { name: 'Department of Business Administration', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 48000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 75000 },
      ]},
    ],
  },
];

async function main() {
  console.log('=== Seeding Batch 4: Real University Data ===\n');

  for (const uniData of BATCH4) {
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

  console.log('\n=== Batch 4 Done! ===');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
