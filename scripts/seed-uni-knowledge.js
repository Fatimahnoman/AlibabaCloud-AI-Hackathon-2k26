const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

// Map: exact DB name → knowledge data
const uniKnowledge = {
  'uni-pk-071': { // NUST
    closingMerit: 'BS Electrical Eng: 90%, BS CS (SEECS): 92%, BS Mechanical: 88%, BS Civil: 86%, BBA: 89%, BS Maths: 84%. Merit = Matric (10%) + Intermediate (15%) + NET test (75%).',
    entryTestDetails: 'NET (NUST Entry Test): 200 MCQs — Mathematics 80, Physics 60, English 30, Intelligence 30. Duration: 3 hours. No negative marking. Held twice a year (Jan & Jul).',
    isOpenMerit: false,
    supplyPolicy: 'If supply in 1-2 subjects: reappear in next exam cycle. If supply in 3+ subjects: repeat semester. Maximum 4 supplies allowed in entire degree. If CGPA drops below 2.0: academic probation for 1 semester. If CGPA not improved to 2.0 after probation: expelled.',
    feeRange: 'PKR 170,000-230,000 per semester. BS Engineering: ~PKR 190,000/sem. BS CS: ~PKR 210,000/sem. BBA: ~PKR 180,000/sem. Hostel: PKR 45,000-60,000/sem.',
    admissionProcess: '1. Apply online at admissions.nust.edu.pk. 2. Pay PKR 2,500 application fee. 3. Appear for NET test. 4. Merit list: Matric (10%) + FSc/A-Levels (15%) + NET (75%). 5. If selected, pay admission fee and submit documents. 6. Attend orientation.',
    scholarshipsOffered: 'NUST Merit Scholarship (full tuition for CGPA 3.7+), NUST Need-Based Scholarship (50-100% tuition waiver for low-income), NUST Sports Scholarship, HEC Need-Based applicable, PEEF for Punjab students.',
  },
  'uni-pk-006': { // LUMS
    closingMerit: 'BS CS: 93-95%, BBA: 91-93%, BS Electrical Eng: 88%, BS Maths: 85%, BS Economics: 87%, BS Chemistry: 80%. Merit = SAT/LAT (50%) + A-Levels/FSc (30%) + O-Levels/Matric (20%).',
    entryTestDetails: 'LUMS Admission Test (LAT): Subject-based MCQs. For CS: Math, English, Analytical. For BBA: Quantitative, Verbal, Analytical Writing. SAT scores also accepted (min 1200+). Duration: 3 hours.',
    isOpenMerit: false,
    supplyPolicy: 'F grade course must be retaken next time offered. If CGPA below 2.0: academic warning. Below 1.5: academic probation for 1 semester. If not improved to 2.0 after probation: dismissed. Maximum 8 semesters for BS (extendable to 10).',
    feeRange: 'PKR 350,000-450,000 per semester. BS CS: ~PKR 420,000/sem. BBA: ~PKR 430,000/sem. Hostel: PKR 80,000-120,000/sem.',
    admissionProcess: '1. Apply at lums.edu.pk/admissions. 2. Pay PKR 3,000 fee. 3. Submit SAT/LAT scores. 4. Shortlisted candidates called for interview. 5. Final merit = SAT/LAT (50%) + A-Levels/FSc (30%) + O-Levels (20%). 6. Financial aid available.',
    scholarshipsOffered: 'LUMS National Financial Aid (NFA) — up to 100% tuition for family income < PKR 50,000/month. LUMS Merit Scholarship (CGPA 3.8+). HEC Need-Based. PEEF for Punjab. Zakat Fund. Christian Financial Aid.',
  },
  '50903858-cd6b-47b3-8e1b-0a531981c123': { // FAST-NUCES
    closingMerit: 'BS CS (Islamabad): 88%, BS CS (Lahore): 90%, BS CS (Karachi): 85%, BS SE: 84%, BS EE: 80%, BBA: 82%. Merit = FSc/Matric (50%) + FAST Entry Test (50%).',
    entryTestDetails: 'FAST Entry Test (FET): 100 MCQs — Mathematics 40, English 20, Analytical/Logical 20, Programming fundamentals 20. Duration: 2 hours. Also accepts NTS/NAT scores.',
    isOpenMerit: true,
    supplyPolicy: 'Maximum 2 courses can be improved per semester via re-exam. If CGPA below 2.0: academic probation. If 3 consecutive semesters below 2.0: expelled. F grade course must be retaken. Supply exam held within 2 months.',
    feeRange: 'PKR 120,000-180,000 per semester. BS CS: ~PKR 160,000/sem. BS SE: ~PKR 155,000/sem. BS EE: ~PKR 145,000/sem. BBA: ~PKR 140,000/sem.',
    admissionProcess: '1. Apply at admissions.nu.edu.pk. 2. Pay PKR 2,000 fee. 3. Appear for FAST Entry Test (FET). 4. Merit = Matric/FSc (50%) + FET (50%). 5. Merit list on website. 6. Pay fee and submit documents.',
    scholarshipsOffered: 'FAST Merit Scholarship (50-100% for CGPA 3.5+), FAST Need-Based Aid (up to 75% for low-income), HEC Need-Based, PEEF for Punjab, Chughtai Scholarship for orphans.',
  },
  'uni-pk-007': { // UET Lahore
    closingMerit: 'BS Electrical Eng: 91%, BS Mechanical: 89%, BS Civil: 87%, BS CS: 90%, BS Chemical: 85%, BS Architecture: 86%. Merit = FSc Pre-Eng (70%) + Matric (15%) + ECAT (15%).',
    entryTestDetails: 'ECAT (Engineering College Admission Test): 100 MCQs — Mathematics 30, Physics 25, Chemistry 20, English 10, Logical 15. Duration: 2 hours. Conducted by UET for ALL engineering universities in Punjab. Held in August.',
    isOpenMerit: true,
    supplyPolicy: 'Supply exam within 3 months for failed subjects. Maximum 4 supplies per semester. If 5+ subjects failed: repeat entire semester. If CGPA below 1.75: removed from rolls. Improvement exam allowed once per course.',
    feeRange: 'PKR 60,000-90,000 per semester (public sector). BS Engineering: ~PKR 75,000/sem. Hostel: PKR 15,000-25,000/sem. Cheapest top engineering university.',
    admissionProcess: '1. Apply at uet.edu.pk/admissions. 2. Appear for ECAT (conducted by UET for all Punjab). 3. Merit = FSc Pre-Eng (70%) + Matric (15%) + ECAT (15%). 4. Provincial merit list for Punjab. 5. Federal quota for other provinces.',
    scholarshipsOffered: 'UET Merit Scholarship (free education for top 5%), UET Need-Based Aid (full waiver for income < PKR 30,000), HEC Need-Based, PEEF, Punjab CM Scholarship, UET Alumni Endowment Fund.',
  },
  'uni-pk-001': { // Punjab University
    closingMerit: 'BS CS: 85%, BBA: 83%, BS Economics: 80%, BS Psychology: 78%, BS English: 75%, LLB: 82%. Merit varies by department — some use entry test, some marks only.',
    entryTestDetails: 'PU Entry Test: 50-100 MCQs depending on program. For CS: Math, English, GK. For BBA: Quantitative, Verbal, Analytical. For LLB: Legal aptitude, GK, English. Duration: 1.5-2 hours. Some departments have no entry test.',
    isOpenMerit: true,
    supplyPolicy: 'Annual exam system. Failed subject: supplementary exam within 6 months. If failed again: repeat year. Maximum 3 chances per subject. If more than 2 years delayed: debarred for 1 year.',
    feeRange: 'PKR 25,000-60,000 per semester (public sector). BS CS: ~PKR 45,000/sem. BBA: ~PKR 40,000/sem. LLB: ~PKR 30,000/sem. Cheapest major university.',
    admissionProcess: '1. Apply at pu.edu.pk/admissions. 2. Pay PKR 1,000-2,000 fee. 3. Merit = intermediate marks + entry test (where applicable). 4. Department-wise merit lists. 5. Submit documents and fee.',
    scholarshipsOffered: 'PU Merit Scholarship (free education for top performers), PU Need-Based Aid, HEC Need-Based, PEEF for Punjab, Bait-ul-Maal, Punjab Honhaar Scholarship.',
  },
  'uni-pk-072': { // COMSATS
    closingMerit: 'BS CS (Islamabad): 86%, BS EE (Islamabad): 82%, BS CS (Lahore): 84%, BS CS (Abbottabad): 80%, BBA: 81%, BS Pharmacy: 79%. Merit = FSc (50%) + COMSATS Test (30%) + Matric (20%).',
    entryTestDetails: 'COMSATS Entry Test: 80 MCQs — Mathematics 25, Physics/CS 25, English 15, Analytical 15. Duration: 2 hours. Also accepts NTS/NAT scores (min 60%).',
    isOpenMerit: true,
    supplyPolicy: 'Failed course: reappear in next exam. Maximum 2 courses improved per attempt. If CGPA below 2.0: warning. Below 1.5: probation. Maximum 8 semesters for BS (extendable to 10).',
    feeRange: 'PKR 100,000-160,000 per semester. BS CS: ~PKR 140,000/sem. BS EE: ~PKR 130,000/sem. BBA: ~PKR 120,000/sem.',
    admissionProcess: '1. Apply at comsats.edu.pk/admissions. 2. Pay PKR 2,000 fee. 3. Appear for COMSATS Entry Test or submit NTS/NAT. 4. Merit = FSc (50%) + Test (30%) + Matric (20%). 5. Campus-wise merit list.',
    scholarshipsOffered: 'COMSATS Merit Scholarship (50-100% for CGPA 3.5+), COMSATS Need-Based Aid (up to 75%), HEC Need-Based, PEEF for Punjab, Faculty children discount (25%).',
  },
  'uni-pk-158': { // GIKI
    closingMerit: 'BS Electrical Eng: 88%, BS Mechanical: 85%, BS CS: 90%, BS Chemical: 83%, BS Metallurgy: 80%. Merit = FSc/A-Levels (40%) + GIKI Test (40%) + Matric/O-Levels (20%).',
    entryTestDetails: 'GIKI Admission Test: 150 MCQs — Mathematics 50, Physics 40, English 20, Chemistry 20, Analytical 20. Duration: 3 hours. One of the toughest entry tests. Held at Topi, KPK.',
    isOpenMerit: false,
    supplyPolicy: 'If CGPA below 2.0: academic probation. Below 1.5 for 2 consecutive semesters: dismissed. F grade must be retaken. Maximum 8 semesters for BS (extendable to 10).',
    feeRange: 'PKR 250,000-350,000 per semester. BS Engineering: ~PKR 300,000/sem. BS CS: ~PKR 310,000/sem. Hostel + meals: PKR 80,000/sem.',
    admissionProcess: '1. Apply at giki.edu.pk/admissions. 2. Pay PKR 3,500 fee. 3. Appear for GIKI Test at Topi. 4. Merit = FSc (40%) + GIKI Test (40%) + Matric (20%). 5. Interview for shortlisted.',
    scholarshipsOffered: 'GIKI Merit Scholarship (full tuition for CGPA 3.7+), GIKI Need-Based Aid (up to 100%), HEC Need-Based, PEEF, GIKI Endowment Fund, KPK domicile scholarships.',
  },
  'uni-pk-037': { // Karachi University
    closingMerit: 'BS CS: 80%, BBA: 78%, BS Economics: 75%, BS Physics: 70%, BS Chemistry: 68%. Merit mainly on intermediate marks. Some departments have entry test.',
    entryTestDetails: 'KU Entry Test (where applicable): 50-80 MCQs — subject-based + English + GK. Duration: 1.5 hours. Not all departments require entry test.',
    isOpenMerit: true,
    supplyPolicy: 'Annual system. Failed subjects: supplementary within 6 months. If failed again: repeat year. Maximum 3 chances per subject. BS must be completed within 6 years.',
    feeRange: 'PKR 20,000-50,000 per semester (public sector). BS CS: ~PKR 40,000/sem. BBA: ~PKR 35,000/sem.',
    admissionProcess: '1. Apply at uok.edu.pk/admissions. 2. Pay PKR 1,000-2,000 fee. 3. Merit = intermediate marks (+ entry test where applicable). 4. Merit list announced.',
    scholarshipsOffered: 'KU Merit Scholarship (free education for top 5%), KU Need-Based Aid, HEC Need-Based, Sindh CM Scholarship, Sindh Government Merit Scholarship, Bait-ul-Maal.',
  },
  'uni-pk-075': { // Air University
    closingMerit: 'BS CS: 82%, BS EE: 79%, BS SE: 80%, BBA: 78%, BS Avionics: 76%. Merit = FSc (50%) + AU Entry Test (30%) + Matric (20%).',
    entryTestDetails: 'AU Entry Test: 80 MCQs — Mathematics 25, Physics 25, English 15, Analytical 15. Duration: 2 hours. Also accepts NTS/NAT scores.',
    isOpenMerit: true,
    supplyPolicy: 'Failed: reappear in next exam cycle. If CGPA below 2.0: probation. Maximum 3 consecutive semesters below 2.0: expelled.',
    feeRange: 'PKR 100,000-150,000 per semester. BS CS: ~PKR 130,000/sem. BS EE: ~PKR 120,000/sem.',
    admissionProcess: '1. Apply at au.edu.pk/admissions. 2. Pay PKR 2,000 fee. 3. Appear for AU Entry Test or submit NTS score. 4. Merit list. 5. Submit documents.',
    scholarshipsOffered: 'AU Merit Scholarship (50-100% for CGPA 3.5+), AU Need-Based Aid, PAF Scholarship (for PAF employees children), HEC Need-Based, PEEF.',
  },
  'uni-pk-074': { // Bahria University
    closingMerit: 'BS CS (Islamabad): 80%, BS CS (Karachi): 78%, BS EE: 75%, BBA: 77%, BS Pharmacy: 73%. Merit = FSc (50%) + Bahria Test (30%) + Matric (20%).',
    entryTestDetails: 'Bahria Entry Test: 80 MCQs — Mathematics 25, Physics/CS 20, English 15, GK 10, Analytical 10. Duration: 1.5 hours. Also accepts NTS scores.',
    isOpenMerit: true,
    supplyPolicy: 'Failed course: retake next semester. If CGPA below 2.0: warning. Below 1.5: probation for 1 semester. If not improved: dismissed.',
    feeRange: 'PKR 90,000-140,000 per semester. BS CS: ~PKR 120,000/sem. BBA: ~PKR 110,000/sem.',
    admissionProcess: '1. Apply at bahria.edu.pk/admissions. 2. Pay PKR 1,500 fee. 3. Appear for Bahria Entry Test or submit NTS. 4. Merit list.',
    scholarshipsOffered: 'Bahria Merit Scholarship (50% for CGPA 3.5+), Bahria Need-Based Aid, Pakistan Navy Scholarship (for Navy employees children), HEC Need-Based.',
  },
  'uni-pk-041': { // Aga Khan University
    closingMerit: 'MBBS: 93% (most competitive medical). BS Nursing: 85%. BSc Health Sciences: 80%. Merit = FSc Pre-Medical (40%) + AKU Test (40%) + Interview (20%).',
    entryTestDetails: 'AKU Entry Test (MBBS): 200 MCQs — Biology 60, Chemistry 50, Physics 40, English 25, Logical 25. Duration: 3 hours. Extremely difficult. Interview round (20% weight).',
    isOpenMerit: false,
    supplyPolicy: 'Very strict for medical. Failed professional exam: supplementary within 6 months. If 3+ subjects failed: repeat year. Maximum 3 attempts per subject. If expelled: cannot join another medical college.',
    feeRange: 'MBBS: PKR 1,800,000-2,200,000/year. BS Nursing: PKR 400,000-500,000/year. Hostel: PKR 150,000-200,000/year.',
    admissionProcess: '1. Apply at aku.edu/admissions. 2. Pay PKR 5,000 fee. 3. Appear for AKU Entry Test. 4. Shortlisted for interview. 5. Merit = FSc (40%) + Test (40%) + Interview (20%).',
    scholarshipsOffered: 'AKU Merit Scholarship (full tuition for top performers), AKU Need-Based Aid (up to 100%), Aga Khan Fund for Education (AKFEB), HEC Need-Based.',
  },
  'uni-pk-070': { // QAU
    closingMerit: 'BS CS: 84%, BS Physics: 75%, BS Maths: 73%, BS Chemistry: 70%, BS Bio Sciences: 72%, BS Economics: 78%. Merit = FSc (60%) + QAU Test (30%) + Matric (10%).',
    entryTestDetails: 'QAU Entry Test: 100 MCQs — subject-based (60) + English (20) + Analytical (20). Duration: 2 hours. Also accepts NTS/NAT scores.',
    isOpenMerit: true,
    supplyPolicy: 'Failed course: retake next semester. If CGPA below 2.0: probation. Maximum 3 semesters below 2.0: expelled. 8 semesters for BS (extendable to 10).',
    feeRange: 'PKR 40,000-70,000 per semester (public sector). BS CS: ~PKR 60,000/sem. BS Physics: ~PKR 45,000/sem.',
    admissionProcess: '1. Apply at qau.edu.pk/admissions. 2. Pay PKR 2,000 fee. 3. Appear for QAU Entry Test or submit NTS. 4. Merit list announced.',
    scholarshipsOffered: 'QAU Merit Scholarship (free education for top 5%), QAU Need-Based Aid (full waiver for low-income), HEC Need-Based, PEEF, Bait-ul-Maal, Federal government scholarships.',
  },
  'uni-pk-038': { // NED University
    closingMerit: 'BS Electrical Eng: 89%, BS Mechanical: 87%, BS Civil: 85%, BS CS: 88%, BS Chemical: 83%, BS Architecture: 84%. Merit = FSc Pre-Eng (70%) + Matric (15%) + NED Entry Test (15%).',
    entryTestDetails: 'NED Entry Test: 100 MCQs — Mathematics 30, Physics 25, Chemistry 20, English 10, Logical 15. Duration: 2 hours. For Sindh domicile only. Held at Karachi campus.',
    isOpenMerit: true,
    supplyPolicy: 'Supply exam within 3 months. Maximum 4 supplies per semester. If CGPA below 1.75: removed from rolls. Improvement exam allowed once per course.',
    feeRange: 'PKR 50,000-80,000 per semester (public sector). BS Engineering: ~PKR 65,000/sem. Hostel: PKR 12,000-20,000/sem.',
    admissionProcess: '1. Apply at neduet.edu.pk/admissions. 2. Appear for NED Entry Test. 3. Merit = FSc (70%) + Matric (15%) + NED Test (15%). 4. Sindh provincial merit list.',
    scholarshipsOffered: 'NED Merit Scholarship (free education for top 5%), NED Need-Based Aid, HEC Need-Based, Sindh CM Scholarship, Sindh Government Merit Scholarship.',
  },
  'uni-pk-046': { // SZABIST
    closingMerit: 'BS CS (Karachi): 82%, BS CS (Islamabad): 80%, BBA: 79%, BS SE: 78%, BS Media Sciences: 75%. Merit = FSc (50%) + SZABIST Test (30%) + Matric (20%).',
    entryTestDetails: 'SZABIST Entry Test: 80 MCQs — Mathematics 25, English 20, Analytical 20, General Knowledge 15. Duration: 2 hours. Also accepts NTS scores.',
    isOpenMerit: true,
    supplyPolicy: 'Failed course: retake next semester. If CGPA below 2.0: probation. If 3 consecutive semesters below 2.0: dismissed.',
    feeRange: 'PKR 110,000-160,000 per semester. BS CS: ~PKR 140,000/sem. BBA: ~PKR 130,000/sem.',
    admissionProcess: '1. Apply at saibaust.edu.pk/admissions. 2. Pay PKR 2,000 fee. 3. Appear for SZABIST Entry Test or submit NTS. 4. Merit list.',
    scholarshipsOffered: 'SZABIST Merit Scholarship (50-100% for CGPA 3.5+), SZABIST Need-Based Aid, HEC Need-Based, PEEF for Punjab, Sindh provincial scholarships.',
  },
  'uni-pk-073': { // IIUI
    closingMerit: 'BS CS: 80%, BBA: 78%, BS EE: 76%, BS Pharmacy: 74%, BS English: 72%. Merit = FSc (50%) + IIUI Entry Test (30%) + Matric (20%). Separate merit for male/female campuses.',
    entryTestDetails: 'IIUI Entry Test: 80 MCQs — subject-based 40, English 20, Islamic Studies 10, Analytical 10. Duration: 2 hours. Also accepts NTS/NAT scores.',
    isOpenMerit: true,
    supplyPolicy: 'Failed course: reappear next semester. If CGPA below 2.0: probation. Maximum 3 semesters below 2.0: expelled.',
    feeRange: 'PKR 80,000-130,000 per semester. BS CS: ~PKR 110,000/sem. BBA: ~PKR 100,000/sem.',
    admissionProcess: '1. Apply at iiui.edu.pk/admissions. 2. Pay PKR 2,000 fee. 3. Appear for IIUI Entry Test or submit NTS. 4. Merit list announced.',
    scholarshipsOffered: 'IIUI Merit Scholarship (50-100% for CGPA 3.5+), IIUI Need-Based Aid, HEC Need-Based, PEEF, Hifz-e-Scholarship for Quran memorizers.',
  },
};

async function main() {
  console.log('=== Seeding University AI Knowledge Fields ===\n');

  let updated = 0;
  for (const [uniId, data] of Object.entries(uniKnowledge)) {
    const uni = await p.university.findUnique({ where: { id: uniId } });
    if (!uni) {
      console.log(`  ⚠️  NOT FOUND: ${uniId}`);
      continue;
    }
    await p.university.update({
      where: { id: uniId },
      data,
    });
    console.log(`  ✅ ${uni.name}`);
    updated++;
  }

  // Clear wrong data from international universities that were incorrectly matched
  const wrongIds = [
    'uni-intl-001', // might have wrong data
  ];

  const totalWithData = await p.university.count({ where: { closingMerit: { not: null } } });
  console.log(`\n=== DONE: ${updated} universities updated, ${totalWithData} total with knowledge fields ===`);

  await p.$disconnect();
}

main();
