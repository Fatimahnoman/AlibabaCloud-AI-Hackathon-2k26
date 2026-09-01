import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addCourses(uniId: string, deptName: string, courses: { name: string; degree: string; duration: string; fee: number }[]) {
  for (const c of courses) {
    const existing = await prisma.course.findFirst({ where: { name: c.name, universityId: uniId, department: deptName } });
    if (!existing) {
      await prisma.course.create({
        data: {
          id: `crs-${uniId}-${deptName.replace(/\s+/g, '-')}-${c.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
          name: c.name,
          degree: c.degree,
          duration: c.duration,
          tuitionFee: c.fee,
          currency: 'PKR',
          department: deptName,
          universityId: uniId,
        },
      });
    }
  }
}

async function main() {
  // ===== FEDERAL URDU UNIVERSITY (FUUAST) =====
  const fuuast = await prisma.university.findFirst({ where: { name: { contains: 'Federal Urdu' } } });
  if (!fuuast) { console.log('FUUAST not found'); return; }

  const fuuastDepts = await prisma.department.findMany({ where: { universityId: fuuast.id } });
  const deptMap: Record<string, string> = {};
  for (const d of fuuastDepts) deptMap[d.name] = d.id;

  // Business Administration
  if (deptMap['Department of Business Administration']) {
    await addCourses(fuuast.id, 'Department of Business Administration', [
      { name: 'BBA', degree: 'bachelor', duration: '4 years', fee: 180000 },
      { name: 'MBA', degree: 'master', duration: '2 years', fee: 250000 },
      { name: 'B.Com', degree: 'bachelor', duration: '4 years', fee: 120000 },
      { name: 'M.Com', degree: 'master', duration: '2 years', fee: 150000 },
    ]);
  }
  // Computer Science & IT
  if (deptMap['Department of Computer Science & IT']) {
    await addCourses(fuuast.id, 'Department of Computer Science & IT', [
      { name: 'BS Computer Science', degree: 'bachelor', duration: '4 years', fee: 200000 },
      { name: 'BS Software Engineering', degree: 'bachelor', duration: '4 years', fee: 200000 },
      { name: 'BS Information Technology', degree: 'bachelor', duration: '4 years', fee: 180000 },
      { name: 'MS Computer Science', degree: 'master', duration: '2 years', fee: 280000 },
      { name: 'MS Data Science', degree: 'master', duration: '2 years', fee: 300000 },
    ]);
  }
  // Law
  if (deptMap['Department of Law']) {
    await addCourses(fuuast.id, 'Department of Law', [
      { name: 'LLB (5 years)', degree: 'bachelor', duration: '5 years', fee: 150000 },
      { name: 'LLM', degree: 'master', duration: '2 years', fee: 200000 },
    ]);
  }
  // Mass Communication
  if (deptMap['Department of Mass Communication']) {
    await addCourses(fuuast.id, 'Department of Mass Communication', [
      { name: 'BS Mass Communication', degree: 'bachelor', duration: '4 years', fee: 130000 },
      { name: 'MS Mass Communication', degree: 'master', duration: '2 years', fee: 170000 },
    ]);
  }
  // Mathematics
  if (deptMap['Department of Mathematics']) {
    await addCourses(fuuast.id, 'Department of Mathematics', [
      { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years', fee: 100000 },
      { name: 'MS Mathematics', degree: 'master', duration: '2 years', fee: 140000 },
    ]);
  }
  // Urdu Literature
  if (deptMap['Department of Urdu Literature']) {
    await addCourses(fuuast.id, 'Department of Urdu Literature', [
      { name: 'BA Urdu', degree: 'bachelor', duration: '4 years', fee: 80000 },
      { name: 'MA Urdu', degree: 'master', duration: '2 years', fee: 100000 },
    ]);
  }
  // Faculty of Engineering
  if (deptMap['Faculty of Engineering']) {
    await addCourses(fuuast.id, 'Faculty of Engineering', [
      { name: 'BS Electrical Engineering', degree: 'bachelor', duration: '4 years', fee: 250000 },
      { name: 'BS Civil Engineering', degree: 'bachelor', duration: '4 years', fee: 250000 },
      { name: 'BS Mechanical Engineering', degree: 'bachelor', duration: '4 years', fee: 250000 },
    ]);
  }
  // Faculty of Science
  if (deptMap['Faculty of Science']) {
    await addCourses(fuuast.id, 'Faculty of Science', [
      { name: 'BS Physics', degree: 'bachelor', duration: '4 years', fee: 120000 },
      { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years', fee: 120000 },
      { name: 'BS Biology', degree: 'bachelor', duration: '4 years', fee: 120000 },
      { name: 'MS Physics', degree: 'master', duration: '2 years', fee: 160000 },
    ]);
  }

  console.log('FUUAST courses added.');

  // ===== EXPAND ALL 44 SPARSE UNIVERSITIES =====
  const sparseUnis = await prisma.university.findMany({
    include: { departments: true, courses: true },
  });
  const sparse = sparseUnis.filter((u) => u.departments.length < 5 && u.courses.length < 10);

  for (const uni of sparse) {
    const depts = uni.departments;
    const existingCourseCount = uni.courses.length;
    if (existingCourseCount >= 10) continue;

    for (const dept of depts) {
      const deptCourses = await prisma.course.count({ where: { universityId: uni.id, department: dept.name } });
      if (deptCourses >= 3) continue;

      const deptLower = dept.name.toLowerCase();
      let courses: { name: string; degree: string; duration: string; fee: number }[] = [];

      // Medical colleges
      if (deptLower.includes('medicine') || deptLower.includes('medical') || uni.type === 'medical') {
        courses = [
          { name: 'MBBS', degree: 'bachelor_of_medicine', duration: '5 years', fee: 800000 },
          { name: 'BDS', degree: 'bachelor_of_medicine', duration: '4 years', fee: 700000 },
          { name: 'BSc Nursing', degree: 'bachelor', duration: '4 years', fee: 350000 },
        ];
      }
      // Engineering
      else if (deptLower.includes('engineer') || deptLower.includes('civil') || deptLower.includes('electrical') || deptLower.includes('mechanical') || deptLower.includes('computer')) {
        courses = [
          { name: 'BS Electrical Engineering', degree: 'bachelor_of_engineering', duration: '4 years', fee: 250000 },
          { name: 'BS Civil Engineering', degree: 'bachelor_of_engineering', duration: '4 years', fee: 230000 },
          { name: 'BS Mechanical Engineering', degree: 'bachelor_of_engineering', duration: '4 years', fee: 240000 },
          { name: 'BS Computer Engineering', degree: 'bachelor_of_engineering', duration: '4 years', fee: 260000 },
        ];
      }
      // Arts/Literature/Languages
      else if (deptLower.includes('art') || deptLower.includes('urdu') || deptLower.includes('english') || deptLower.includes('literature') || deptLower.includes('language')) {
        courses = [
          { name: 'BA English', degree: 'bachelor', duration: '4 years', fee: 80000 },
          { name: 'MA English', degree: 'master', duration: '2 years', fee: 100000 },
          { name: 'BA Urdu', degree: 'bachelor', duration: '4 years', fee: 70000 },
          { name: 'MA Urdu', degree: 'master', duration: '2 years', fee: 90000 },
        ];
      }
      // Law
      else if (deptLower.includes('law')) {
        courses = [
          { name: 'LLB (5 years)', degree: 'bachelor', duration: '5 years', fee: 150000 },
          { name: 'LLM', degree: 'master', duration: '2 years', fee: 200000 },
        ];
      }
      // Agriculture/Veterinary
      else if (deptLower.includes('agric') || deptLower.includes('vet') || deptLower.includes('animal')) {
        courses = [
          { name: 'BSc Agriculture', degree: 'bachelor', duration: '4 years', fee: 120000 },
          { name: 'DVM', degree: 'bachelor', duration: '5 years', fee: 150000 },
          { name: 'MSc Agriculture', degree: 'master', duration: '2 years', fee: 160000 },
        ];
      }
      // Textile
      else if (deptLower.includes('textile')) {
        courses = [
          { name: 'BS Textile Engineering', degree: 'bachelor', duration: '4 years', fee: 200000 },
          { name: 'BS Textile Design', degree: 'bachelor', duration: '4 years', fee: 180000 },
          { name: 'MS Textile Technology', degree: 'master', duration: '2 years', fee: 250000 },
        ];
      }
      // Education
      else if (deptLower.includes('education') || deptLower.includes('teaching')) {
        courses = [
          { name: 'B.Ed', degree: 'bachelor_of_education', duration: '4 years', fee: 100000 },
          { name: 'M.Ed', degree: 'master', duration: '2 years', fee: 130000 },
          { name: 'MA Education', degree: 'master', duration: '2 years', fee: 120000 },
        ];
      }
      // Commerce/Business
      else if (deptLower.includes('commerce') || deptLower.includes('business') || deptLower.includes('management') || deptLower.includes('administration')) {
        courses = [
          { name: 'BBA', degree: 'bachelor', duration: '4 years', fee: 180000 },
          { name: 'MBA', degree: 'master', duration: '2 years', fee: 250000 },
          { name: 'B.Com', degree: 'bachelor', duration: '4 years', fee: 120000 },
        ];
      }
      // Sciences (Physics, Chemistry, Biology, Math)
      else if (deptLower.includes('science') || deptLower.includes('physics') || deptLower.includes('chemistry') || deptLower.includes('biology') || deptLower.includes('math')) {
        courses = [
          { name: 'BS Physics', degree: 'bachelor', duration: '4 years', fee: 120000 },
          { name: 'BS Chemistry', degree: 'bachelor', duration: '4 years', fee: 120000 },
          { name: 'BS Mathematics', degree: 'bachelor', duration: '4 years', fee: 100000 },
          { name: 'BS Biology', degree: 'bachelor', duration: '4 years', fee: 110000 },
        ];
      }
      // Performing Arts/Media
      else if (deptLower.includes('performing') || deptLower.includes('media') || deptLower.includes('mass') || deptLower.includes('communication') || deptLower.includes('film')) {
        courses = [
          { name: 'BS Mass Communication', degree: 'bachelor', duration: '4 years', fee: 130000 },
          { name: 'BS Film & TV', degree: 'bachelor', duration: '4 years', fee: 150000 },
          { name: 'BS Performing Arts', degree: 'bachelor', duration: '4 years', fee: 120000 },
        ];
      }
      // Default - general programs
      else {
        courses = [
          { name: 'BS General', degree: 'bachelor', duration: '4 years', fee: 120000 },
          { name: 'MS General', degree: 'master', duration: '2 years', fee: 160000 },
        ];
      }

      await addCourses(uni.id, dept.name, courses);
    }
  }

  // Final stats
  const finalUnis = await prisma.university.findMany({ include: { departments: true, courses: true } });
  const totalDepts = finalUnis.reduce((sum, u) => sum + u.departments.length, 0);
  const totalCourses = finalUnis.reduce((sum, u) => sum + u.courses.length, 0);
  const stillSparse = finalUnis.filter((u) => u.departments.length < 5).length;

  console.log(`\nFinal stats: ${finalUnis.length} institutions, ${totalDepts} departments, ${totalCourses} courses`);
  console.log(`Still < 5 departments: ${stillSparse}`);
}
main().finally(() => prisma.$disconnect());
