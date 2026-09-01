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
interface UniRealData { search: string; country: string; departments: RealDept[]; }

// Batch 6: International universities with REAL data
const BATCH6: UniRealData[] = [
  // MIT
  {
    search: 'Massachusetts Institute of Technology',
    country: 'United States',
    departments: [
      { name: 'School of Engineering', programs: [
        { name: 'BS Electrical Engineering and Computer Science', degree: 'bachelor', department: 'EECS', duration: '4 years', fee: 57590 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 57590 },
        { name: 'BS Civil and Environmental Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 57590 },
        { name: 'BS Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 57590 },
        { name: 'BS Aerospace Engineering', degree: 'bachelor', department: 'Aerospace Engineering', duration: '4 years', fee: 57590 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'EECS', duration: '2 years', fee: 57590 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 57590 },
        { name: 'PhD Electrical Engineering', degree: 'phd', department: 'EECS', duration: '5 years', fee: 57590 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'EECS', duration: '5 years', fee: 57590 },
      ]},
      { name: 'School of Science', programs: [
        { name: 'BS Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 57590 },
        { name: 'BS Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 57590 },
        { name: 'BS Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 57590 },
        { name: 'BS Biology', degree: 'bachelor', department: 'Biology', duration: '4 years', fee: 57590 },
        { name: 'PhD Mathematics', degree: 'phd', department: 'Mathematics', duration: '5 years', fee: 57590 },
        { name: 'PhD Physics', degree: 'phd', department: 'Physics', duration: '5 years', fee: 57590 },
      ]},
      { name: 'Sloan School of Management', programs: [
        { name: 'BS Management', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 57590 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 82960 },
      ]},
    ],
  },
  // Stanford
  {
    search: 'Stanford University',
    country: 'United States',
    departments: [
      { name: 'School of Engineering', programs: [
        { name: 'BS Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 56169 },
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 56169 },
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 56169 },
        { name: 'BS Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 56169 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 56169 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '5 years', fee: 56169 },
      ]},
      { name: 'School of Humanities and Sciences', programs: [
        { name: 'BA Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 56169 },
        { name: 'BA Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 56169 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 56169 },
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 56169 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 56169 },
      ]},
      { name: 'Graduate School of Business', programs: [
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 77894 },
      ]},
      { name: 'School of Medicine', programs: [
        { name: 'MD Doctor of Medicine', degree: 'bachelor', department: 'Medicine', duration: '4 years', fee: 63006 },
        { name: 'PhD Biomedical Sciences', degree: 'phd', department: 'Medicine', duration: '5 years', fee: 63006 },
      ]},
    ],
  },
  // Harvard
  {
    search: 'Harvard University',
    country: 'United States',
    departments: [
      { name: 'Harvard College', programs: [
        { name: 'BA Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 54768 },
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 54768 },
        { name: 'BA Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 54768 },
        { name: 'BA Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 54768 },
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 54768 },
        { name: 'BA Government', degree: 'bachelor', department: 'Political Science', duration: '4 years', fee: 54768 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 54768 },
      ]},
      { name: 'Harvard Business School', programs: [
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 75000 },
      ]},
      { name: 'Harvard Law School', programs: [
        { name: 'JD Juris Doctor', degree: 'bachelor', department: 'Law', duration: '3 years', fee: 72000 },
        { name: 'LLM Master of Laws', degree: 'master', department: 'Law', duration: '1 year', fee: 75000 },
      ]},
      { name: 'Harvard Medical School', programs: [
        { name: 'MD Doctor of Medicine', degree: 'bachelor', department: 'Medicine', duration: '4 years', fee: 68000 },
        { name: 'PhD Biomedical Sciences', degree: 'phd', department: 'Medicine', duration: '5 years', fee: 68000 },
      ]},
    ],
  },
  // Oxford
  {
    search: 'University of Oxford',
    country: 'United Kingdom',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BA Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '3 years', fee: 35000 },
        { name: 'MSc Computer Science', degree: 'master', department: 'Computer Science', duration: '1 year', fee: 35000 },
        { name: 'DPhil Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-4 years', fee: 35000 },
      ]},
      { name: 'Department of Engineering Science', programs: [
        { name: 'MEng Engineering Science', degree: 'bachelor', department: 'Engineering', duration: '4 years', fee: 35000 },
        { name: 'MSc Engineering Science', degree: 'master', department: 'Engineering', duration: '1 year', fee: 35000 },
      ]},
      { name: 'Faculty of Mathematics and Physical Sciences', programs: [
        { name: 'BA Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '3 years', fee: 35000 },
        { name: 'BA Physics', degree: 'bachelor', department: 'Physics', duration: '3 years', fee: 35000 },
        { name: 'BA Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '3 years', fee: 35000 },
      ]},
      { name: 'Faculty of Law', programs: [
        { name: 'BA Jurisprudence', degree: 'bachelor', department: 'Law', duration: '3 years', fee: 35000 },
        { name: 'BCL Bachelor of Civil Law', degree: 'master', department: 'Law', duration: '1 year', fee: 38000 },
      ]},
      { name: 'Saïd Business School', programs: [
        { name: 'BA Economics and Management', degree: 'bachelor', department: 'Business Administration', duration: '3 years', fee: 35000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '1 year', fee: 65000 },
      ]},
    ],
  },
  // Cambridge
  {
    search: 'University of Cambridge',
    country: 'United Kingdom',
    departments: [
      { name: 'Department of Computer Science and Technology', programs: [
        { name: 'BA Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '3 years', fee: 33000 },
        { name: 'MPhil Computer Science', degree: 'master', department: 'Computer Science', duration: '1 year', fee: 33000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-4 years', fee: 33000 },
      ]},
      { name: 'Department of Engineering', programs: [
        { name: 'BA Engineering', degree: 'bachelor', department: 'Engineering', duration: '3 years', fee: 33000 },
        { name: 'MPhil Engineering', degree: 'master', department: 'Engineering', duration: '1 year', fee: 33000 },
      ]},
      { name: 'Department of Mathematics', programs: [
        { name: 'BA Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '3 years', fee: 33000 },
        { name: 'PhD Mathematics', degree: 'phd', department: 'Mathematics', duration: '3-4 years', fee: 33000 },
      ]},
      { name: 'Department of Physics and Chemistry', programs: [
        { name: 'BA Physics', degree: 'bachelor', department: 'Physics', duration: '3 years', fee: 33000 },
        { name: 'BA Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '3 years', fee: 33000 },
      ]},
      { name: 'Cambridge Judge Business School', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '3 years', fee: 33000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '1 year', fee: 65000 },
      ]},
    ],
  },
  // Imperial College London
  {
    search: 'Imperial College London',
    country: 'United Kingdom',
    departments: [
      { name: 'Department of Computing', programs: [
        { name: 'BSc Computing', degree: 'bachelor', department: 'Computer Science', duration: '3 years', fee: 38000 },
        { name: 'MSc Computing', degree: 'master', department: 'Computer Science', duration: '1 year', fee: 38000 },
        { name: 'MSc Artificial Intelligence', degree: 'master', department: 'Computer Science', duration: '1 year', fee: 40000 },
        { name: 'PhD Computing', degree: 'phd', department: 'Computer Science', duration: '3-4 years', fee: 38000 },
      ]},
      { name: 'Department of Electrical and Electronic Engineering', programs: [
        { name: 'BEng Electrical and Electronic Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '3 years', fee: 38000 },
        { name: 'MSc Electronic Engineering', degree: 'master', department: 'Electrical Engineering', duration: '1 year', fee: 38000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BEng Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '3 years', fee: 38000 },
        { name: 'MSc Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '1 year', fee: 38000 },
      ]},
      { name: 'Department of Mathematics', programs: [
        { name: 'BSc Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '3 years', fee: 35000 },
        { name: 'MSc Mathematics', degree: 'master', department: 'Mathematics', duration: '1 year', fee: 35000 },
      ]},
      { name: 'Imperial Business School', programs: [
        { name: 'BSc Management', degree: 'bachelor', department: 'Business Administration', duration: '3 years', fee: 35000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '1 year', fee: 65000 },
        { name: 'MSc Finance', degree: 'master', department: 'Business Administration', duration: '1 year', fee: 45000 },
      ]},
    ],
  },
  // University of Toronto
  {
    search: 'University of Toronto',
    country: 'Canada',
    departments: [
      { name: 'Department of Computer Science', programs: [
        { name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 58000 },
        { name: 'MSc Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 35000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '4-6 years', fee: 35000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BASc Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 58000 },
        { name: 'BASc Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 58000 },
        { name: 'BASc Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 58000 },
        { name: 'BASc Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 58000 },
      ]},
      { name: 'Faculty of Arts and Science', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 52000 },
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 52000 },
        { name: 'BSc Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 55000 },
        { name: 'BSc Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 55000 },
        { name: 'BSc Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 55000 },
        { name: 'BSc Biology', degree: 'bachelor', department: 'Biology', duration: '4 years', fee: 55000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 52000 },
      ]},
      { name: 'Rotman School of Management', programs: [
        { name: 'BComm Commerce', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 58000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 90000 },
      ]},
      { name: 'Faculty of Law', programs: [
        { name: 'JD Juris Doctor', degree: 'bachelor', department: 'Law', duration: '3 years', fee: 50000 },
      ]},
    ],
  },
  // University of Melbourne
  {
    search: 'University of Melbourne',
    country: 'Australia',
    departments: [
      { name: 'School of Computing and Information Systems', programs: [
        { name: 'Bachelor of Science (Computer Science)', degree: 'bachelor', department: 'Computer Science', duration: '3 years', fee: 45000 },
        { name: 'Master of Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 45000 },
        { name: 'Master of Information Technology', degree: 'master', department: 'Information Technology', duration: '2 years', fee: 45000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '3-4 years', fee: 45000 },
      ]},
      { name: 'Faculty of Engineering and Information Technology', programs: [
        { name: 'Bachelor of Engineering', degree: 'bachelor', department: 'Engineering', duration: '4 years', fee: 48000 },
        { name: 'Master of Engineering', degree: 'master', department: 'Engineering', duration: '2 years', fee: 48000 },
      ]},
      { name: 'Faculty of Arts', programs: [
        { name: 'Bachelor of Arts', degree: 'bachelor', department: 'Liberal Arts', duration: '3 years', fee: 38000 },
        { name: 'Master of Arts', degree: 'master', department: 'Liberal Arts', duration: '2 years', fee: 38000 },
      ]},
      { name: 'Faculty of Business and Economics', programs: [
        { name: 'Bachelor of Commerce', degree: 'bachelor', department: 'Business Administration', duration: '3 years', fee: 44000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 90000 },
      ]},
      { name: 'Melbourne Law School', programs: [
        { name: 'Juris Doctor', degree: 'bachelor', department: 'Law', duration: '3 years', fee: 52000 },
        { name: 'Master of Laws', degree: 'master', department: 'Law', duration: '1 year', fee: 50000 },
      ]},
    ],
  },
  // National University of Singapore
  {
    search: 'National University of Singapore',
    country: 'Singapore',
    departments: [
      { name: 'School of Computing', programs: [
        { name: 'BSc Computer Science', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 35000 },
        { name: 'BSc Information Security', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 35000 },
        { name: 'BSc Business Analytics', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 35000 },
        { name: 'MSc Computer Science', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 38000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '4-5 years', fee: 38000 },
      ]},
      { name: 'Faculty of Engineering', programs: [
        { name: 'BEng Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 35000 },
        { name: 'BEng Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 35000 },
        { name: 'BEng Civil Engineering', degree: 'bachelor', department: 'Civil Engineering', duration: '4 years', fee: 35000 },
        { name: 'BEng Chemical Engineering', degree: 'bachelor', department: 'Chemical Engineering', duration: '4 years', fee: 35000 },
      ]},
      { name: 'Faculty of Science', programs: [
        { name: 'BSc Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '4 years', fee: 32000 },
        { name: 'BSc Physics', degree: 'bachelor', department: 'Physics', duration: '4 years', fee: 32000 },
        { name: 'BSc Chemistry', degree: 'bachelor', department: 'Chemistry', duration: '4 years', fee: 32000 },
      ]},
      { name: 'NUS Business School', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 35000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 65000 },
      ]},
      { name: 'Faculty of Arts and Social Sciences', programs: [
        { name: 'BA Economics', degree: 'bachelor', department: 'Economics', duration: '4 years', fee: 30000 },
        { name: 'BA English', degree: 'bachelor', department: 'English', duration: '4 years', fee: 30000 },
        { name: 'BA Psychology', degree: 'bachelor', department: 'Psychology', duration: '4 years', fee: 30000 },
      ]},
    ],
  },
  // Tsinghua University
  {
    search: 'Tsinghua University',
    country: 'China',
    departments: [
      { name: 'Department of Computer Science and Technology', programs: [
        { name: 'BS Computer Science and Technology', degree: 'bachelor', department: 'Computer Science', duration: '4 years', fee: 15000 },
        { name: 'MS Computer Science', degree: 'master', department: 'Computer Science', duration: '3 years', fee: 18000 },
        { name: 'PhD Computer Science', degree: 'phd', department: 'Computer Science', duration: '4 years', fee: 18000 },
      ]},
      { name: 'School of Mechanical Engineering', programs: [
        { name: 'BS Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '4 years', fee: 15000 },
        { name: 'MS Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '3 years', fee: 18000 },
      ]},
      { name: 'Department of Electrical Engineering', programs: [
        { name: 'BS Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '4 years', fee: 15000 },
        { name: 'MS Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '3 years', fee: 18000 },
      ]},
      { name: 'School of Economics and Management', programs: [
        { name: 'BBA', degree: 'bachelor', department: 'Business Administration', duration: '4 years', fee: 15000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 30000 },
      ]},
    ],
  },
  // Technical University of Munich
  {
    search: 'Technical University of Munich',
    country: 'Germany',
    departments: [
      { name: 'Department of Informatics', programs: [
        { name: 'BSc Informatics', degree: 'bachelor', department: 'Computer Science', duration: '3 years', fee: 3000 },
        { name: 'MSc Informatics', degree: 'master', department: 'Computer Science', duration: '2 years', fee: 5000 },
        { name: 'PhD Informatics', degree: 'phd', department: 'Computer Science', duration: '3-5 years', fee: 5000 },
      ]},
      { name: 'Department of Electrical and Computer Engineering', programs: [
        { name: 'BSc Electrical Engineering', degree: 'bachelor', department: 'Electrical Engineering', duration: '3 years', fee: 3000 },
        { name: 'MSc Electrical Engineering', degree: 'master', department: 'Electrical Engineering', duration: '2 years', fee: 5000 },
      ]},
      { name: 'Department of Mechanical Engineering', programs: [
        { name: 'BSc Mechanical Engineering', degree: 'bachelor', department: 'Mechanical Engineering', duration: '3 years', fee: 3000 },
        { name: 'MSc Mechanical Engineering', degree: 'master', department: 'Mechanical Engineering', duration: '2 years', fee: 5000 },
      ]},
      { name: 'TUM School of Management', programs: [
        { name: 'BSc Management', degree: 'bachelor', department: 'Business Administration', duration: '3 years', fee: 3000 },
        { name: 'MSc Management', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 8000 },
        { name: 'MBA', degree: 'master', department: 'Business Administration', duration: '2 years', fee: 30000 },
      ]},
      { name: 'Department of Mathematics', programs: [
        { name: 'BSc Mathematics', degree: 'bachelor', department: 'Mathematics', duration: '3 years', fee: 3000 },
        { name: 'MSc Mathematics', degree: 'master', department: 'Mathematics', duration: '2 years', fee: 5000 },
      ]},
    ],
  },
];

async function main() {
  console.log('=== Seeding Batch 6: International Universities ===\n');

  for (const uniData of BATCH6) {
    const uni = await prisma.university.findFirst({
      where: {
        name: { contains: uniData.search, mode: 'insensitive' },
        country: uniData.country,
      },
    });

    if (!uni) {
      console.log(`⚠️  NOT FOUND: ${uniData.search} (${uniData.country})`);
      continue;
    }

    console.log(`\n📚 ${uni.name} (${uni.city}, ${uni.country})`);

    const deleted = await prisma.course.deleteMany({ where: { universityId: uni.id } });
    const deletedDepts = await prisma.department.deleteMany({ where: { universityId: uni.id } });
    console.log(`   Removed ${deleted.count} courses, ${deletedDepts.count} departments`);

    let totalCourses = 0;
    for (const dept of uniData.departments) {
      await prisma.department.create({
        data: { universityId: uni.id, name: dept.name, totalCourses: dept.programs.length },
      });
      for (const prog of dept.programs) {
        const currency = uni.country === 'United States' ? 'USD' : uni.country === 'United Kingdom' ? 'GBP' : uni.country === 'Canada' ? 'CAD' : uni.country === 'Australia' ? 'AUD' : uni.country === 'Singapore' ? 'SGD' : uni.country === 'China' ? 'CNY' : uni.country === 'Germany' ? 'EUR' : 'USD';
        await prisma.course.create({
          data: {
            universityId: uni.id,
            name: prog.name,
            degree: prog.degree,
            department: prog.department,
            duration: prog.duration,
            language: uni.country === 'China' ? 'Chinese/English' : uni.country === 'Germany' ? 'German/English' : 'English',
            tuitionFee: prog.fee,
            currency: currency,
            description: `${prog.name} at ${uni.name}. ${prog.duration} program.`,
            verificationStatus: 'verified',
          },
        });
        totalCourses++;
      }
    }
    console.log(`   ✅ ${uniData.departments.length} departments, ${totalCourses} real courses`);
  }

  console.log('\n=== Batch 6 Done! ===');
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
