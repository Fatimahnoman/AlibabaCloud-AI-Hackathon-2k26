/* eslint-disable */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Helper: Real program definition
interface RealProgram {
  name: string;
  degree: 'bachelor' | 'master' | 'phd' | 'intermediate' | 'diploma' | 'certificate' | 'associate';
  department: string;
  duration: string;
  fee: number;
}

// Helper: Real department definition
interface RealDept {
  name: string;
  programs: RealProgram[];
}

// Helper: University real data
interface UniRealData {
  search: string; // partial name to find university
  departments: RealDept[];
}

// ============================================================
// REAL UNIVERSITY DATA - TOP PAKISTANI UNIVERSITIES
// ============================================================
const REAL_UNIVERSITIES: UniRealData[] = [
  // 1. NUST - National University of Sciences & Technology
  {
    search: 'National University of Sciences & Technology',
    departments: [
      { name: 'School of Electrical Engineering and Computer Science (SEECS)', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 320000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 320000 },
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 320000 },
        { name: 'BS Computer Engineering', degree: 'bachelor', department: 'Computer Engineering', duration: '4 years', fee: 320000 },
        { name: 'BS Artificial Intelligence & Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 340000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 280000 },
        { name: 'MS Software Engineering', degree: 'master', department: 'Software Engineering', duration: '2 years', fee: 280000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 280000 },
        { name: 'MS Data Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 300000 },
        { name: 'MS Cyber Security', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 300000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 400000 },
        { name: 'PhD Electrical Engineering', degree: 'phd', department: 'Electrical Engineering', duration: '3-5 years', fee: 400000 },
      ]},
      { name: 'School of Mechanical and Manufacturing Engineering (SMME)', programs: [
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 320000 },
        { name: 'BS Manufacturing Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 320000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 280000 },
        { name: 'MS Manufacturing Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 280000 },
        { name: 'PhD Mechanical Engineering', degree: 'phd', department: 'Mechanical Engineering', duration: '3-5 years', fee: 400000 },
      ]},
      { name: 'School of Civil and Environmental Engineering (SCEE)', programs: [
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 320000 },
        { name: 'BS Environmental Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 320000 },
        { name: 'MS Civil Engineering', degree: 'master', department: 'Civil Engineering', duration: '2 years', fee: 280000 },
        { name: 'PhD Civil Engineering', degree: 'phd', department: 'Civil Engineering', duration: '3-5 years', fee: 400000 },
      ]},
      { name: 'School of Natural Sciences (SNS)', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 260000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 260000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 260000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 220000 },
        { name: 'MS Physics', degree: 'master', department: 'Physics', duration: '2 years', fee: 220000 },
        { name: 'PhD Mathematics', degree: 'phd', department: 'Mathematics', duration: '3-5 years', fee: 350000 },
      ]},
      { name: 'NUST Business School (NBS)', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 340000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 460000 },
        { name: 'Executive MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 600000 },
        { name: 'MS Finance', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 350000 },
        { name: 'PhD Business Administration', degree: 'phd', department: 'Business Administration', duration: '3-5 years', fee: 500000 },
      ]},
      { name: 'School of Chemical and Materials Engineering (SCME)', programs: [
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 320000 },
        { name: 'BS Materials Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 320000 },
        { name: 'MS Chemical Engineering', degree: 'master', department: 'Chemical Engineering', duration: '2 years', fee: 280000 },
        { name: 'PhD Chemical Engineering', degree: 'phd', department: 'Chemical Engineering', duration: '3-5 years', fee: 400000 },
      ]},
      { name: 'School of Aerospace Engineering (SAE)', programs: [
        { name: 'BS Aerospace Engineering', degree: 'bachelor', department: 'Aerospace Engineering', duration: '4 years', fee: 340000 },
        { name: 'MS Aerospace Engineering', degree: 'master', department: 'Aerospace Engineering', duration: '2 years', fee: 300000 },
        { name: 'MS Avionics', degree: 'master', department: 'Aerospace Engineering', duration: '2 years', fee: 300000 },
      ]},
      { name: 'Military College of Signals (MCS)', programs: [
        { name: 'BS Telecommunication Engineering', degree: 'bachelor', department: 'Telecommunication', duration: '4 years', fee: 300000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 300000 },
        { name: 'MS Telecommunication', degree: 'master', department: 'Telecommunication', duration: '2 years', fee: 260000 },
      ]},
    ],
  },
  // 2. LUMS - Lahore University of Management Sciences
  {
    search: 'Lahore University of Management Sciences',
    departments: [
      { name: 'Syed Babar Ali School of Science and Engineering (SASSE)', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 1100000 },
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 1100000 },
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 1100000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 1050000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 1050000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 1050000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 1100000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 900000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 900000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 850000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 1200000 },
      ]},
      { name: 'Suleman Dawood School of Business (SDSB)', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 1200000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 1800000 },
        { name: 'Executive MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 2200000 },
        { name: 'MS Finance', degree: 'master', department: 'Business Administration', duration: '1.5 years', fee: 1000000 },
        { name: 'PhD Management', degree: 'phd', department: 'Business Administration', duration: '4-6 years', fee: 1500000 },
      ]},
      { name: 'Mushtaq Ahmad Gurmani School of Humanities and Social Sciences (MGSHSS)', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 1050000 },
        { name: 'BA Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 1050000 },
        { name: 'BA Sociology', degree: 'bachelor', department: 'Sociology', duration: '4 years', fee: 1050000 },
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 1050000 },
        { name: 'BA History', degree: 'bachelor', department: 'History', duration: '4 years', fee: 1050000 },
        { name: 'BA Law', degree: 'bachelor', department: 'Law', duration: '4 years', fee: 1100000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 850000 },
        { name: 'MA English', degree: 'master', department: 'English', duration: '2 years', fee: 850000 },
      ]},
      { name: 'Syed Babar Ali School of Education (SBASSE)', programs: [
        { name: 'BS Education', degree: 'bachelor', department: 'Education', duration: '4 years', fee: 1050000 },
        { name: 'MA Education', degree: 'master', department: 'Education', duration: '2 years', fee: 850000 },
        { name: 'PhD Education', degree: 'phd', department: 'Education', duration: '3-5 years', fee: 1200000 },
      ]},
    ],
  },
  // 3. FAST-NUCES
  {
    search: 'Foundation for Advancement of Science and Technology',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 220000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 220000 },
        { name: 'BS Artificial Intelligence', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 230000 },
        { name: 'BS Data Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 230000 },
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
        { name: 'MS Management', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 250000 },
      ]},
      { name: 'Department of Mathematics', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 180000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 160000 },
      ]},
    ],
  },
  // 4. Quaid-i-Azam University
  {
    search: 'Quaid-i-Azam University',
    departments: [
      { name: 'Faculty of Biological Sciences', programs: [
        { name: 'BS Biochemistry', degree: 'bachelor', department: 'Biochemistry', duration: '4 years', fee: 45000 },
        { name: 'BS Biotechnology', degree: 'bachelor', department: 'Biotechnology', duration: '4 years', fee: 45000 },
        { name: 'BS Microbiology', degree: 'bachelor', department: 'Microbiology', duration: '4 years', fee: 45000 },
        { name: 'BS Botany', degree: 'bachelor', department: 'Botany', duration: '4 years', fee: 40000 },
        { name: 'BS Zoology', degree: 'bachelor', department: 'Zoology', duration: '4 years', fee: 40000 },
        { name: 'BS Genetics', degree: 'bachelor', department: 'Genetics', duration: '4 years', fee: 45000 },
        { name: 'MS Biochemistry', degree: 'master', department: 'Biochemistry', duration: '2 years', fee: 60000 },
        { name: 'MS Biotechnology', degree: 'master', department: 'Biotechnology', duration: '2 years', fee: 60000 },
        { name: 'MPhil Microbiology', degree: 'master', department: 'Microbiology', duration: '2 years', fee: 60000 },
        { name: 'PhD Biochemistry', degree: 'phd', department: 'Biochemistry', duration: '3-5 years', fee: 120000 },
        { name: 'PhD Biotechnology', degree: 'phd', department: 'Biotechnology', duration: '3-5 years', fee: 120000 },
      ]},
      { name: 'Faculty of Physical Sciences', programs: [
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 40000 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 40000 },
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 40000 },
        { name: 'BS Statistics', degree: 'bachelor', department: 'Statistics', duration: '4 years', fee: 40000 },
        { name: 'BS Earth Sciences', degree: 'bachelor', department: 'Earth Sciences', duration: '4 years', fee: 42000 },
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 50000 },
        { name: 'MS Physics', degree: 'master', department: 'Physics', duration: '2 years', fee: 55000 },
        { name: 'MS Chemistry', degree: 'master', department: 'Chemistry', duration: '2 years', fee: 55000 },
        { name: 'MS Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 55000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 65000 },
        { name: 'PhD Physics', degree: 'phd', department: 'Physics', duration: '3-5 years', fee: 100000 },
        { name: 'PhD Chemistry', degree: 'phd', department: 'Chemistry', duration: '3-5 years', fee: 100000 },
        { name: 'PhD Mathematics', degree: 'phd', department: 'Mathematics', duration: '3-5 years', fee: 100000 },
      ]},
      { name: 'Faculty of Social Sciences', programs: [
        { name: 'BS Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 42000 },
        { name: 'BS Political Science', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 40000 },
        { name: 'BS Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 42000 },
        { name: 'BS Sociology', degree: 'bachelor', department: 'Sociology', duration: '4 years', fee: 40000 },
        { name: 'BS International Relations', degree: 'bachelor', department: 'International Relations', duration: '4 years', fee: 42000 },
        { name: 'BS Anthropology', degree: 'bachelor', department: 'Anthropology', duration: '4 years', fee: 40000 },
        { name: 'MA Economics', degree: 'master', department: 'Economics', duration: '2 years', fee: 55000 },
        { name: 'MA Political Science', degree: 'master', department: 'Political Science', duration: '2 years', fee: 50000 },
        { name: 'MA Psychology', degree: 'master', department: 'Psychology', duration: '2 years', fee: 55000 },
        { name: 'MA International Relations', degree: 'master', department: 'International Relations', duration: '2 years', fee: 55000 },
        { name: 'PhD Economics', degree: 'phd', department: 'Economics', duration: '3-5 years', fee: 100000 },
        { name: 'PhD Political Science', degree: 'phd', department: 'Political Science', duration: '3-5 years', fee: 100000 },
      ]},
      { name: 'Quaid-i-Azam Business School', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 55000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 120000 },
        { name: 'PhD Business Administration', degree: 'phd', department: 'Business Administration', duration: '3-5 years', fee: 150000 },
      ]},
      { name: 'Faculty of Islamic & Religious Studies', programs: [
        { name: 'BA Islamic Studies', degree: 'bachelor', department: 'Islamic Studies', duration: '4 years', fee: 35000 },
        { name: 'MA Islamic Studies', degree: 'master', department: 'Islamic Studies', duration: '2 years', fee: 45000 },
        { name: 'PhD Islamic Studies', degree: 'phd', department: 'Islamic Studies', duration: '3-5 years', fee: 80000 },
      ]},
    ],
  },
  // 5. UET Lahore
  {
    search: 'University of Engineering and Technology Lahore',
    departments: [
      { name: 'Department of Computer Science and Engineering', programs: [
        { name: 'BS Computer Science and Engineering', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 145000 },
        { name: 'BS Software Engineering', degree: 'bachelor', department: 'Software Engineering', duration: '4 years', fee: 145000 },
        { name: 'BS Information Technology', degree: 'bachelor', department: 'Information Technology', duration: '4 years', fee: 140000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 130000 },
        { name: 'MS Software Engineering', degree: 'master', department: 'Software Engineering', duration: '2 years', fee: 130000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 250000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BSc Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 145000 },
        { name: 'BSc Electronic Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 145000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 125000 },
        { name: 'PhD Electrical Engineering', degree: 'phd', department: 'Electrical Engineering', duration: '3-5 years', fee: 250000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BSc Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 145000 },
        { name: 'BSc Industrial Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 140000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 125000 },
        { name: 'PhD Mechanical Engineering', degree: 'phd', department: 'Mechanical Engineering', duration: '3-5 years', fee: 250000 },
      ]},
      { name: 'Department of Civil Engineering', programs: [
        { name: 'BSc Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 145000 },
        { name: 'BSc Architectural Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 140000 },
        { name: 'MS Civil Engineering', degree: 'master', department: 'Civil Engineering', duration: '2 years', fee: 125000 },
        { name: 'PhD Civil Engineering', degree: 'phd', department: 'Civil Engineering', duration: '3-5 years', fee: 250000 },
      ]},
      { name: 'Department of Chemical Engineering', programs: [
        { name: 'BSc Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 145000 },
        { name: 'BSc Polymer Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 140000 },
        { name: 'MS Chemical Engineering', degree: 'master', department: 'Chemical Engineering', duration: '2 years', fee: 125000 },
      ]},
      { name: 'Department of Architecture and Design', programs: [
        { name: 'BArch Architecture', degree: 'bachelor', department: 'Architecture', duration: '4 years', fee: 150000 },
        { name: 'BDes Design', degree: 'bachelor', department: 'Architecture', duration: '4 years', fee: 145000 },
      ]},
      { name: 'Department of Sciences and Humanities', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 120000 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 120000 },
        { name: 'BS English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 110000 },
      ]},
    ],
  },
];

// ============================================================
// SEED EXECUTION
// ============================================================
async function main() {
  console.log('=== Seeding REAL University Data ===\n');

  for (const uniData of REAL_UNIVERSITIES) {
    const uni = await prisma.university.findFirst({
      where: { name: { contains: uniData.search } },
    });

    if (!uni) {
      console.log(`⚠️  NOT FOUND: ${uniData.search}`);
      continue;
    }

    console.log(`\n📚 ${uni.name} (${uni.city})`);

    // Delete existing template courses
    const deleted = await prisma.course.deleteMany({ where: { universityId: uni.id } });
    console.log(`   Removed ${deleted.count} old template courses`);

    // Delete existing departments
    const deletedDepts = await prisma.department.deleteMany({ where: { universityId: uni.id } });
    console.log(`   Removed ${deletedDepts.count} old departments`);

    // Add real departments and courses
    let totalCourses = 0;
    for (const dept of uniData.departments) {
      const deptRecord = await prisma.department.create({
        data: {
          universityId: uni.id,
          name: dept.name,
          totalCourses: dept.programs.length,
        },
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
            description: `${prog.name} at ${uni.name}. ${prog.duration} program in ${prog.department}.`,
            verificationStatus: 'verified',
          },
        });
        totalCourses++;
      }
    }

    console.log(`   ✅ Added ${uniData.departments.length} departments, ${totalCourses} real courses`);
  }

  console.log('\n=== Done! ===');
}

if (process.argv[1]?.includes('seed-real-data')) {
  main()
    .then(() => prisma.$disconnect())
    .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
}

export { main };
