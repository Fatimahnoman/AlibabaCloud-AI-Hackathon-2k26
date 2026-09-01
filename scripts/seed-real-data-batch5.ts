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

// Batch 5: Medical colleges + remaining Pakistani universities
const BATCH5: UniRealData[] = [
  // Allama Iqbal Medical College
  {
    search: 'Allama Iqbal Medical College',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 450000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 550000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 500000 },
        { name: 'MPhil Anatomy', degree: 'master', department: 'Medicine', duration: '2 years', fee: 300000 },
        { name: 'MPhil Physiology', degree: 'master', department: 'Medicine', duration: '2 years', fee: 300000 },
        { name: 'MPhil Biochemistry', degree: 'master', department: 'Medicine', duration: '2 years', fee: 300000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 600000 },
      ]},
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 220000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 250000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 320000 },
      ]},
    ],
  },
  // Fatima Jinnah Medical University
  {
    search: 'Fatima Jinnah Medical University',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 400000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 500000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 480000 },
        { name: 'MPhil Anatomy', degree: 'master', department: 'Medicine', duration: '2 years', fee: 280000 },
        { name: 'MPhil Physiology', degree: 'master', department: 'Medicine', duration: '2 years', fee: 280000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 550000 },
      ]},
      { name: 'Faculty of Nursing and Allied Health', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 200000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 230000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 300000 },
      ]},
    ],
  },
  // Nishtar Medical University
  {
    search: 'Nishtar Medical University',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 380000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 480000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 460000 },
        { name: 'MPhil Anatomy', degree: 'master', department: 'Medicine', duration: '2 years', fee: 260000 },
        { name: 'MPhil Pathology', degree: 'master', department: 'Medicine', duration: '2 years', fee: 260000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 500000 },
      ]},
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 180000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 210000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 280000 },
      ]},
    ],
  },
  // Rawalpindi Medical University
  {
    search: 'Rawalpindi Medical University',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 420000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 520000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 500000 },
        { name: 'MPhil Anatomy', degree: 'master', department: 'Medicine', duration: '2 years', fee: 290000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 580000 },
      ]},
      { name: 'Faculty of Nursing', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 210000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 310000 },
      ]},
    ],
  },
  // Faisalabad Medical University
  {
    search: 'Faisalabad Medical University',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 400000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 500000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 480000 },
        { name: 'MPhil Anatomy', degree: 'master', department: 'Medicine', duration: '2 years', fee: 280000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 550000 },
      ]},
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 200000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 230000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 300000 },
      ]},
    ],
  },
  // Liaquat University of Medical and Health Sciences
  {
    search: 'Liaquat University of Medical',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 350000 },
        { name: 'BDS Bachelor of Dental Surgery', degree: 'bachelor', department: 'Dentistry', duration: '4 years', fee: 300000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 450000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 430000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 500000 },
      ]},
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 180000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 200000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 270000 },
      ]},
    ],
  },
  // Sindh Agriculture University
  {
    search: 'Sindh Agriculture University',
    departments: [
      { name: 'Faculty of Crop Production', programs: [
        { name: 'BS Agriculture', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 35000 },
        { name: 'BS Agronomy', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 35000 },
        { name: 'BS Plant Protection', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 38000 },
      ]},
      { name: 'Faculty of Animal Husbandry and Veterinary Sciences', programs: [
        { name: 'BS Animal Sciences', degree: 'bachelor', department: 'Animal Sciences', duration: '4 years', fee: 38000 },
        { name: 'DVM Doctor of Veterinary Medicine', degree: 'bachelor', department: 'Veterinary Medicine', duration: '5 years', fee: 50000 },
      ]},
      { name: 'Faculty of Agricultural Engineering and Technology', programs: [
        { name: 'BS Agricultural Engineering', degree: 'bachelor', department: 'Agricultural Engineering', duration: '4 years', fee: 42000 },
        { name: 'BS Irrigation and Drainage', degree: 'bachelor', department: 'Agricultural Engineering', duration: '4 years', fee: 42000 },
      ]},
      { name: 'Faculty of Agricultural Social Sciences', programs: [
        { name: 'BS Agricultural Economics', degree: 'bachelor', department: 'Agricultural Economics', duration: '4 years', fee: 32000 },
        { name: 'BS Agribusiness', degree: 'bachelor', department: 'Agribusiness', duration: '4 years', fee: 35000 },
        { name: 'BS Rural Development', degree: 'bachelor', department: 'Social Sciences', duration: '4 years', fee: 30000 },
      ]},
      { name: 'Faculty of Food and Nutrition Sciences', programs: [
        { name: 'BS Food Science and Technology', degree: 'bachelor', department: 'Food Science', duration: '4 years', fee: 40000 },
        { name: 'BS Food Nutrition', degree: 'bachelor', department: 'Food Science', duration: '4 years', fee: 38000 },
      ]},
      { name: 'Faculty of Basic Sciences', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 35000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 30000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 30000 },
      ]},
    ],
  },
  // University of Veterinary and Animal Sciences
  {
    search: 'University of Veterinary and Animal Sciences',
    departments: [
      { name: 'Faculty of Veterinary Science', programs: [
        { name: 'DVM Doctor of Veterinary Medicine', degree: 'bachelor', department: 'Veterinary Medicine', duration: '5 years', fee: 55000 },
        { name: 'MVSc Veterinary Science', degree: 'master', department: 'Veterinary Medicine', duration: '2 years', fee: 45000 },
        { name: 'PhD Veterinary Science', degree: 'phd', department: 'Veterinary Medicine', duration: '3-5 years', fee: 100000 },
      ]},
      { name: 'Faculty of Animal Sciences', programs: [
        { name: 'BS Animal Sciences', degree: 'bachelor', department: 'Animal Sciences', duration: '4 years', fee: 42000 },
        { name: 'BS Poultry Science', degree: 'bachelor', department: 'Animal Sciences', duration: '4 years', fee: 42000 },
        { name: 'BS Dairy Science', degree: 'bachelor', department: 'Animal Sciences', duration: '4 years', fee: 42000 },
      ]},
      { name: 'Faculty of Life Sciences', programs: [
        { name: 'BS Biochemistry', degree: 'bachelor', department: 'Biochemistry', duration: '4 years', fee: 40000 },
        { name: 'BS Microbiology', degree: 'bachelor', department: 'Microbiology', duration: '4 years', fee: 42000 },
        { name: 'BS Biotechnology', degree: 'bachelor', department: 'Biotechnology', duration: '4 years', fee: 45000 },
        { name: 'BS Food Science and Technology', degree: 'bachelor', department: 'Food Science', duration: '4 years', fee: 42000 },
      ]},
      { name: 'Faculty of Agricultural Sciences', programs: [
        { name: 'BS Agriculture', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 38000 },
        { name: 'BS Horticulture', degree: 'bachelor', department: 'Agriculture', duration: '4 years', fee: 38000 },
      ]},
    ],
  },
  // University of Education Lahore
  {
    search: 'University of Education Lahore',
    departments: [
      { name: 'Faculty of Education', programs: [
        { name: 'BEd Bachelor of Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 35000 },
        { name: 'MEd Master of Education', degree: 'master', department: 'Education', duration: '2 years', fee: 45000 },
        { name: 'PhD Education', degree: 'phd', department: 'Education', duration: '3-5 years', fee: 80000 },
      ]},
      { name: 'Faculty of Languages', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 30000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 28000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 40000 },
        { name: 'MA Urdu', degree: 'master', department: 'Urdu', duration: '2 years', fee: 35000 },
      ]},
      { name: 'Faculty of Science and Technology', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 35000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 35000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 35000 },
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 40000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 40000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 30000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 32000 },
        { name: 'BA History', degree: 'bachelor', department: 'History', duration: '4 years', fee: 28000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 28000 },
      ]},
    ],
  },
  // University of Health Sciences Lahore
  {
    search: 'University of Health Sciences Lahore',
    departments: [
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 280000 },
        { name: 'BS Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 230000 },
        { name: 'BS Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 200000 },
        { name: 'BS Radiology Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 220000 },
        { name: 'BS Operation Theatre Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 220000 },
      ]},
      { name: 'Faculty of Postgraduate Studies', programs: [
        { name: 'MS Medical Technology', degree: 'master', department: 'Medical Technology', duration: '2 years', fee: 200000 },
        { name: 'MPhil Health Sciences', degree: 'master', department: 'Medicine', duration: '2 years', fee: 250000 },
        { name: 'PhD Health Sciences', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 450000 },
      ]},
    ],
  },
  // Pakistan Institute of Fashion and Design
  {
    search: 'Pakistan Institute of Fashion',
    departments: [
      { name: 'Department of Fashion Design', programs: [
        { name: 'BDes Fashion Design', degree: 'bachelor', department: 'Fashion Design', duration: '4 years', fee: 160000 },
        { name: 'BDes Textile Design', degree: 'bachelor', department: 'Fashion Design', duration: '4 years', fee: 155000 },
        { name: 'MDes Fashion Design', degree: 'master', department: 'Fashion Design', duration: '2 years', fee: 140000 },
      ]},
      { name: 'Department of Fashion Marketing', programs: [
        { name: 'BBA Fashion Marketing', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 150000 },
      ]},
      { name: 'Department of Leather Design', programs: [
        { name: 'BDes Leather Design', degree: 'bachelor', department: 'Fashion Design', duration: '4 years', fee: 145000 },
      ]},
      { name: 'Department of Jewellery Design', programs: [
        { name: 'BDes Jewellery Design', degree: 'bachelor', department: 'Fashion Design', duration: '4 years', fee: 140000 },
      ]},
    ],
  },
  // National University of Modern Languages
  {
    search: 'National University of Modern Languages',
    departments: [
      { name: 'Faculty of English and European Languages', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 55000 },
        { name: 'BA French', degree: 'bachelor', department: 'French', duration: '4 years', fee: 55000 },
        { name: 'BA German', degree: 'bachelor', department: 'German', duration: '4 years', fee: 55000 },
        { name: 'BA Spanish', degree: 'bachelor', department: 'Spanish', duration: '4 years', fee: 55000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 70000 },
        { name: 'MA Linguistics', degree: 'master', department: 'English', duration: '2 years', fee: 70000 },
        { name: 'MA Translation Studies', degree: 'master', department: 'English', duration: '2 years', fee: 68000 },
      ]},
      { name: 'Faculty of Oriental and National Languages', programs: [
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 45000 },
        { name: 'BA Arabic', degree: 'bachelor', department: 'Arabic', duration: '4 years', fee: 45000 },
        { name: 'BA Chinese', degree: 'bachelor', department: 'Chinese', duration: '4 years', fee: 50000 },
        { name: 'BA Persian', degree: 'bachelor', department: 'Persian', duration: '4 years', fee: 45000 },
        { name: 'BA Turkish', degree: 'bachelor', department: 'Turkish', duration: '4 years', fee: 48000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA Mass Communication', degree: 'bachelor', department: 'Mass Communication', duration: '4 years', fee: 55000 },
        { name: 'BA International Relations', degree: 'bachelor', department: 'International Relations', duration: '4 years', fee: 55000 },
      ]},
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 65000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 65000 },
      ]},
    ],
  },
  // University of Balochistan
  {
    search: 'University of Balochistan',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 30000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 30000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 40000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 25000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 25000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 25000 },
        { name: 'BS Geology', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 28000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 22000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 22000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 20000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 18000 },
        { name: 'BA Balochi', degree: 'bachelor', department: 'Balochi', duration: '4 years', fee: 18000 },
        { name: 'BA Pashto', degree: 'bachelor', department: 'Pashto', duration: '4 years', fee: 18000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 22000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 20000 },
        { name: 'BA International Relations', degree: 'bachelor', department: 'International Relations', duration: '4 years', fee: 22000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 30000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 32000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 35000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 55000 },
      ]},
    ],
  },
  // Karakoram International University
  {
    search: 'Karakoram International University',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 35000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 35000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 45000 },
      ]},
      { name: 'Faculty of Earth and Environmental Sciences', programs: [
        { name: 'BS Geology', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 32000 },
        { name: 'BS Environmental Science', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 32000 },
        { name: 'BS Geography', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 30000 },
      ]},
      { name: 'Faculty of Natural Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 28000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 28000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 28000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 25000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 25000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 22000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 28000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 25000 },
        { name: 'BA Tourism and Hospitality', degree: 'bachelor', department: 'Social Sciences', duration: '4 years', fee: 30000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 35000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 55000 },
      ]},
    ],
  },
  // Shaheed Zulfiqar Ali Bhutto Medical University
  {
    search: 'Shaheed Zulfiqar Ali Bhutto Medical',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 430000 },
        { name: 'BDS Bachelor of Dental Surgery', degree: 'bachelor', department: 'Dentistry', duration: '4 years', fee: 380000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 530000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 510000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 600000 },
      ]},
      { name: 'Faculty of Allied Health Sciences', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 220000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 250000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 320000 },
      ]},
    ],
  },
  // National University of Medical Sciences
  {
    search: 'National University of Medical Sciences',
    departments: [
      { name: 'Faculty of Medicine', programs: [
        { name: 'MBBS Bachelor of Medicine and Surgery', degree: 'bachelor', department: 'Medicine', duration: '5 years', fee: 440000 },
        { name: 'FCPS Medicine', degree: 'master', department: 'Medicine', duration: '4 years', fee: 540000 },
        { name: 'MS Surgery', degree: 'master', department: 'Medicine', duration: '4 years', fee: 520000 },
        { name: 'MPhil Anatomy', degree: 'master', department: 'Medicine', duration: '2 years', fee: 300000 },
        { name: 'PhD Medicine', degree: 'phd', department: 'Medicine', duration: '3-5 years', fee: 620000 },
      ]},
      { name: 'Faculty of Nursing and Allied Health', programs: [
        { name: 'BSc Nursing', degree: 'bachelor', department: 'Nursing', duration: '4 years', fee: 220000 },
        { name: 'BSc Medical Technology', degree: 'bachelor', department: 'Medical Technology', duration: '4 years', fee: 250000 },
        { name: 'Doctor of Physical Therapy DPT', degree: 'bachelor', department: 'Physical Therapy', duration: '5 years', fee: 330000 },
      ]},
    ],
  },
  // University of Azad Jammu and Kashmir
  {
    search: 'University of Azad Jammu and Kashmir',
    departments: [
      { name: 'Faculty of Computing', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 38000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 38000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 48000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 48000 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 48000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 30000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 30000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 30000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 28000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 28000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 25000 },
        { name: 'BA Urdu', degree: 'bachelor', department: 'Urdu', duration: '4 years', fee: 22000 },
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 22000 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 28000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 25000 },
        { name: 'BA Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 26000 },
      ]},
      { name: 'Faculty of Management Sciences', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 40000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 60000 },
      ]},
    ],
  },
];

async function main() {
  console.log('=== Seeding Batch 5: Medical Colleges + Remaining PK Universities ===\n');

  for (const uniData of BATCH5) {
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

  console.log('\n=== Batch 5 Done! ===');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
