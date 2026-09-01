/* eslint-disable */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

interface DeptData {
  name: string;
  courses: { name: string; degree: string; duration: string; fee?: number }[];
}

interface UniCorrection {
  name: string;
  departments: DeptData[];
}

const corrections: UniCorrection[] = [
  // ==================== FAST-NUCES (Islamabad) ====================
  {
    name: 'National University of Computer and Emerging Sciences',
    departments: [
      {
        name: 'Department of Computer Science',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'BS Artificial Intelligence', degree: 'bachelor', duration: '4 years', fee: 340000 },
          { name: 'BS Data Science', degree: 'bachelor', duration: '4 years', fee: 340000 },
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
        name: 'Department of Humanities & Social Sciences',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years', fee: 280000 },
        ],
      },
    ],
  },

  // ==================== NUST ====================
  {
    name: 'National University of Sciences & Technology',
    departments: [
      {
        name: 'School of Electrical Engineering & Computer Science (SEECS)',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Computer Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Artificial Intelligence', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Cyber Security', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Data Science', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'MS Electrical Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'School of Civil & Environmental Engineering (SCEE)',
        courses: [
          { name: 'BS Civil Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Environmental Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Civil Engineering', degree: 'master', duration: '2 years' },
          { name: 'MS Structural Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Civil Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'School of Mechanical & Manufacturing Engineering (SMME)',
        courses: [
          { name: 'BS Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Manufacturing Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Mechanical Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Mechanical Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'School of Chemical & Materials Engineering (SCME)',
        courses: [
          { name: 'BS Chemical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Materials Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Chemical Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Chemical Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'College of Aeronautical Engineering (CAE)',
        courses: [
          { name: 'BS Aerospace Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Aerospace Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'College of Electrical & Mechanical Engineering (EME)',
        courses: [
          { name: 'BE Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BE Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mechatronics Engineering', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'NUST Business School (NBS)',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
          { name: 'MS Management', degree: 'master', duration: '2 years' },
          { name: 'PhD Management', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'School of Natural Sciences (SNS)',
        courses: [
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Physics', degree: 'master', duration: '2 years' },
          { name: 'PhD Physics', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Atta-ur-Rahman School of Applied Bio Sciences (ASAB)',
        courses: [
          { name: 'BS Biotechnology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Environmental Sciences', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Biotechnology', degree: 'master', duration: '2 years' },
          { name: 'PhD Biotechnology', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'School of Social Sciences & Humanities (SS&H)',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years' },
          { name: 'BS International Relations', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'MS International Relations', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'School of Art, Design & Architecture (SADA)',
        courses: [
          { name: 'B.Arch', degree: 'bachelor', duration: '5 years' },
          { name: 'B.Des', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Architecture', degree: 'master', duration: '2 years' },
        ],
      },
    ],
  },

  // ==================== International Islamic University Islamabad ====================
  {
    name: 'International Islamic University Islamabad',
    departments: [
      {
        name: 'Faculty of Computing & Information Technology',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Information Technology', degree: 'bachelor', duration: '4 years' },
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
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Political Science', degree: 'bachelor', duration: '4 years' },
          { name: 'MA Economics', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Islamic Studies',
        courses: [
          { name: 'BA Islamic Studies', degree: 'bachelor', duration: '4 years' },
          { name: 'MA Islamic Studies', degree: 'master', duration: '2 years' },
          { name: 'PhD Islamic Studies', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Faculty of Languages & Literature',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Arabic', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Urdu', degree: 'bachelor', duration: '4 years' },
          { name: 'MA English', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Faculty of Basic & Applied Sciences',
        courses: [
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Botany', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Zoology', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'Faculty of Law',
        courses: [
          { name: 'LLB', degree: 'bachelor', duration: '5 years' },
          { name: 'LLM', degree: 'master', duration: '1-2 years' },
        ],
      },
    ],
  },

  // ==================== Institute of Space Technology ====================
  {
    name: 'Institute of Space Technology',
    departments: [
      {
        name: 'Department of Aerospace Engineering',
        courses: [
          { name: 'BS Aerospace Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Aerospace Engineering', degree: 'master', duration: '2 years' },
          { name: 'PhD Aerospace Engineering', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Electrical Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Avionics', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Mechanical Engineering',
        courses: [
          { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Mechanical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Computer Science & IT',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Space Science',
        courses: [
          { name: 'BS Space Science', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Space Science', degree: 'master', duration: '2 years' },
        ],
      },
    ],
  },

  // ==================== ITU Lahore ====================
  {
    name: 'Information Technology University',
    departments: [
      {
        name: 'Department of Computer Science',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
          { name: 'PhD Computer Science', degree: 'phd', duration: '3-5 years' },
        ],
      },
      {
        name: 'Department of Electrical Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'MSc Electrical Engineering', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Management & Business',
        courses: [
          { name: 'BBA', degree: 'bachelor', duration: '4 years' },
          { name: 'MBA', degree: 'master', duration: '2 years' },
        ],
      },
      {
        name: 'Department of Liberal Arts',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years' },
        ],
      },
    ],
  },

  // ==================== The University of Lahore ====================
  {
    name: 'The University of Lahore',
    departments: [
      {
        name: 'Faculty of Engineering',
        courses: [
          { name: 'BSc Electrical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Mechanical Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BSc Civil Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Computer Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Chemical Engineering', degree: 'bachelor', duration: '4 years' },
        ],
      },
      {
        name: 'Faculty of Information Technology',
        courses: [
          { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Information Technology', degree: 'bachelor', duration: '4 years' },
          { name: 'MS Computer Science', degree: 'master', duration: '2 years' },
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
        name: 'Faculty of Pharmacy',
        courses: [
          { name: 'Pharm-D', degree: 'bachelor', duration: '5 years' },
          { name: 'MPhil Pharmacy', degree: 'master', duration: '2 years' },
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
        name: 'Faculty of Arts & Social Sciences',
        courses: [
          { name: 'BS English', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Psychology', degree: 'bachelor', duration: '4 years' },
          { name: 'BS Economics', degree: 'bachelor', duration: '4 years' },
        ],
      },
    ],
  },

  // ==================== LUMS (correction for the name with full form) ====================
  {
    name: 'Lahore University of Management',
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
];

async function main() {
  console.log('Starting second round of university data correction...\n');

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
      await prisma.department.create({
        data: {
          universityId: uni.id,
          name: dept.name,
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

  console.log('\n\nSecond correction round complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
