const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function enhancePakScholarships() {
  console.log('\n🎓 ENHANCING PAKISTANI SCHOLARSHIPS WITH UNIVERSITY COVERAGE...\n');

  // Define comprehensive scholarship data with university coverage
  const scholarships = [
    {
      name: 'HEC Need-Based Scholarship',
      universities: 'All HEC-recognized public universities (130+ universities including UoP, UET, GC University, King Edward Medical University, Fatima Jinnah Medical University, University of Education, all public sector universities)',
      stipend: 'PKR 60,000/month (PKR 720,000/year)',
      coverage: 'Full tuition + monthly stipend + hostel allowance',
      eligibility: 'Pakistani nationals, family income < PKR 45,000/month, admission in HEC-recognized public university',
      description: 'HEC flagship need-based scholarship for undergraduate students at public universities. Covers full tuition fees, provides monthly stipend of PKR 60,000, hostel accommodation, and book allowance. Renewable for 4 years if CGPA maintained above 2.5.'
    },
    {
      name: 'Ehsaas Undergraduate Scholarship Program',
      universities: '275+ HEC-recognized universities (All public and private universities including LUMS, NUST, FAST-NU, UCP, Superior University, Minhaj University, COMSATS, GIKI, and all public sector universities)',
      stipend: 'PKR 50,000/month (PKR 600,000/year)',
      coverage: 'Full tuition + monthly stipend + laptop + skill development training',
      eligibility: 'Pakistani nationals, family income < PKR 45,000/month, enrolled in HEC-recognized university, not receiving any other HEC scholarship',
      description: 'Pakistan\'s largest need-based scholarship program covering 200,000+ undergraduate students. Provides PKR 50,000 monthly stipend, full tuition coverage, free laptop, and skill development courses. Covers all degree levels (BS, MS, PhD) at 275+ universities.'
    },
    {
      name: 'Punjab Educational Endowment Fund (PEEF) Scholarship',
      universities: 'All Punjab public universities (University of the Punjab, UET Lahore, GC University Lahore, UMT Lahore, University of Education Lahore, King Edward Medical University, Fatima Jinnah Medical University, Lahore College for Women University, Superior University Lahore, Minhaj University Lahore, and 40+ other Punjab universities)',
      stipend: 'PKR 40,000/month (PKR 480,000/year)',
      coverage: 'Full tuition + monthly stipend + hostel charges + book allowance',
      eligibility: 'Punjab domicile, family monthly income < PKR 45,000, minimum 60% marks in last exam, enrolled in Punjab public university',
      description: 'Punjab government flagship scholarship for meritorious students from low-income families. Covers all Punjab public universities. Provides PKR 40,000 monthly stipend, full tuition, hostel accommodation, and book allowance. Renewable for duration of program.'
    },
    {
      name: 'Punjab Honhaar Scholarship Program',
      universities: 'All Punjab public universities (University of the Punjab, UET Lahore, GC University Lahore, UMT Lahore, University of Education Lahore, King Edward Medical University, Fatima Jinnah Medical University, LCWU, and all government universities in Punjab)',
      stipend: 'PKR 100,000/year (PKR 8,333/month) + Full tuition waiver',
      coverage: 'Full tuition waiver + PKR 100,000 annual cash award',
      eligibility: 'Punjab domicile, 80%+ marks in last exam, enrolled in Punjab public university, age under 25 for bachelor',
      description: 'Chief Minister Punjab merit scholarship for top students. Provides full tuition waiver at all Punjab public universities plus PKR 100,000 annual cash award. Covers BS, MS, and PhD programs. Highly competitive - only top 5% students eligible.'
    },
    {
      name: 'SEEF Workers Scholarship (Sindh)',
      universities: 'All Sindh universities (University of Karachi, NED University, Mehran University, Sindh Agriculture University, University of Sindh, Liaquat University of Medical & Health Sciences, Indus Valley Institute of Art & Architecture, Shaheed Benazir Bhutto University, and all public/private universities in Sindh)',
      stipend: 'PKR 40,000/month (PKR 480,000/year)',
      coverage: 'Full tuition + monthly stipend + medical allowance',
      eligibility: 'Children of SESSI-registered workers, Sindh domicile, enrolled in recognized university, good academic record',
      description: 'Scholarship for children of registered industrial workers in Sindh under Sindh Employees Social Security Institution. Covers all universities in Sindh. Provides PKR 40,000 monthly stipend, full tuition, and medical allowance. Priority given to orphans and disabled students.'
    },
    {
      name: 'Sindh Government Merit Scholarship',
      universities: 'All Sindh public universities (University of Karachi, NED University, Mehran University, Sindh Agriculture University, University of Sindh, LUMHS, and all government universities in Sindh)',
      stipend: 'PKR 50,000/month (PKR 600,000/year)',
      coverage: 'Full tuition + monthly stipend + hostel allowance',
      eligibility: 'Sindh domicile, family income < PKR 40,000/month, enrolled in Sindh public university, minimum 60% marks',
      description: 'Sindh government need-cum-merit scholarship for students from Sindh studying in Sindh public universities. Provides PKR 50,000 monthly stipend, full tuition, and hostel allowance. Covers all public sector universities in Sindh.'
    },
    {
      name: 'Benazir Bhutto Scholarship (Sindh)',
      universities: 'All Sindh universities (University of Karachi, NED University, Mehran University, Sindh Agriculture University, University of Sindh, LUMHS, and all public/private universities in Sindh)',
      stipend: 'PKR 45,000 total (one-time) + Monthly PKR 5,000 for 4 years',
      coverage: 'One-time grant + monthly stipend + tuition support',
      eligibility: 'Sindh domicile, family income < PKR 35,000/month, enrolled in recognized university',
      description: 'Need-based scholarship named after Benazir Bhutto for Sindh students from low-income families. Provides PKR 45,000 one-time grant plus PKR 5,000 monthly stipend for 4 years. Covers all universities in Sindh.'
    },
    {
      name: 'Khyber Pakhtunkhwa Education Endowment Fund (KEEF)',
      universities: 'All KP public universities (University of Peshawar, UET Peshawar, Agriculture University Peshawar, Abdul Wali Khan University Mardan, Gomal University, Kohat University, and all public universities in KP)',
      stipend: 'PKR 35,000/month (PKR 420,000/year)',
      coverage: 'Full tuition + monthly stipend + hostel charges',
      eligibility: 'KP domicile, family income < PKR 40,000/month, enrolled in KP public university, minimum 60% marks',
      description: 'KP government scholarship for meritorious students from low-income families. Covers all public universities in Khyber Pakhtunkhwa. Provides PKR 35,000 monthly stipend, full tuition, and hostel allowance.'
    },
    {
      name: 'Balochistan Education Endowment Fund (BEEF) Scholarship',
      universities: 'All Balochistan universities (University of Balochistan, BUITEMS Quetta, Lasbela University, Sardar Bahadur Khan Women\'s University, and all public universities in Balochistan)',
      stipend: 'PKR 30,000/month (PKR 360,000/year)',
      coverage: 'Full tuition + monthly stipend + hostel + book allowance',
      eligibility: 'Balochistan domicile, family income < PKR 40,000/month, enrolled in university, good academic record',
      description: 'Endowment fund scholarship for Balochistan students. Covers all universities in Balochistan. Provides PKR 30,000 monthly stipend, full tuition, hostel accommodation, and book allowance. Priority for students from remote areas.'
    },
    {
      name: 'Gilgit-Baltistan Scholarship',
      universities: 'All universities across Pakistan (Public and private universities including UoP, UET, NUST, FAST-NU, LUMS, and all HEC-recognized universities)',
      stipend: 'PKR 35,000/month (PKR 420,000/year)',
      coverage: 'Full tuition + monthly stipend + hostel + travel allowance',
      eligibility: 'GB domicile, family income < PKR 45,000/month, enrolled in HEC-recognized university',
      description: 'Scholarship for GB students to pursue higher education at universities across Pakistan. Covers all HEC-recognized universities. Provides PKR 35,000 monthly stipend, full tuition, hostel, and travel allowance for home visits.'
    },
    {
      name: 'HEC Merit-Based Scholarship',
      universities: 'All HEC-recognized universities (130+ public and private universities including UoP, UET, NUST, FAST-NU, LUMS, GIKI, COMSATS, and all public sector universities)',
      stipend: 'PKR 50,000/year (PKR 4,167/month) + Full tuition',
      coverage: 'Full tuition + annual cash award',
      eligibility: 'Pakistani nationals, CGPA 3.0+ or 80%+ marks, enrolled in HEC-recognized university, no other HEC scholarship',
      description: 'Merit-based scholarship for top academic performers. Covers all HEC-recognized universities. Provides full tuition coverage plus PKR 50,000 annual cash award. Renewable if CGPA maintained above 3.0.'
    },
    {
      name: 'PAF Officer Commission Scholarship',
      universities: 'Pakistan Air Force academies and partner universities (CAE College, PAF Academy, and affiliated universities for degree completion)',
      stipend: 'PKR 80,000/month (PKR 960,000/year)',
      coverage: 'Fully-funded: tuition + stipend + accommodation + medical + transport',
      eligibility: 'Pakistani nationals, male/female, age 16-22, intermediate with 60%+ marks, medically fit, unmarried',
      description: 'PAF fully-funded scholarship for cadets joining Pakistan Air Force. Covers all training costs, provides PKR 80,000 monthly stipend, free accommodation, medical, and transport. Leads to officer commission in PAF.'
    },
    {
      name: 'Pakistan Navy Officer Entry Scholarship',
      universities: 'Pakistan Navy academies and partner institutions (Pakistan Navy Engineering College, Naval Academy, and affiliated universities)',
      stipend: 'PKR 80,000/month (PKR 960,000/year)',
      coverage: 'Fully-funded: tuition + stipend + accommodation + medical + uniform',
      eligibility: 'Pakistani nationals, male/female, age 16-22, intermediate with 60%+ marks, medically fit, unmarried',
      description: 'Fully-funded scholarship for cadets joining Pakistan Navy. Covers all training costs, provides PKR 80,000 monthly stipend, free accommodation, medical, and uniform. Leads to officer commission in Pakistan Navy.'
    },
    {
      name: 'Army Medical College MBBS Scholarship',
      universities: 'Army Medical College (AMC) Rawalpindi and affiliated institutions',
      stipend: 'PKR 100,000/month (PKR 1,200,000/year)',
      coverage: 'Fully-funded: tuition + stipend + accommodation + meals + medical',
      eligibility: 'Pakistani nationals, age 17-25, FSc Pre-Medical with 70%+ marks, unmarried, medically fit',
      description: 'Fully-funded MBBS scholarship at Army Medical College. Provides PKR 100,000 monthly stipend, free tuition, accommodation, meals, and medical. Graduates serve in Pakistan Army Medical Corps.'
    },
    {
      name: 'National Talent Hunt Program (NTHP)',
      universities: 'All HEC-recognized universities (Pre-entry program, then placement at any HEC-recognized university)',
      stipend: 'PKR 30,000 total (pre-entry training) + Full scholarship at university',
      coverage: 'Free preparation + full university scholarship',
      eligibility: 'Pakistani nationals, Matric/FSc appearing or appeared, family income < PKR 45,000/month, 80%+ marks',
      description: 'HEC pre-entry program for talented students from underprivileged backgrounds. Provides free preparation for entry tests, then full scholarship at any HEC-recognized university. Covers tuition + stipend + hostel.'
    },
    {
      name: 'Sindh Talent Hunt Program (STHP)',
      universities: 'All Sindh universities (After preparation, placement at any Sindh university)',
      stipend: 'PKR 25,000 total (pre-entry training) + Full scholarship at university',
      coverage: 'Free preparation + full university scholarship',
      eligibility: 'Sindh domicile, Matric/FSc, family income < PKR 40,000/month, 80%+ marks',
      description: 'Sindh version of NTHP. Prepares talented Sindh students for university entry tests and admission. Provides free preparation then full scholarship at any Sindh university.'
    },
    {
      name: 'HEC Masters (Indigenous) Scholarship',
      universities: 'All HEC-recognized Pakistani universities offering MS/MPhil programs (UoP, UET, NUST, FAST-NU, COMSATS, GIKI, LUMS, and all public/private universities)',
      stipend: 'PKR 45,000/month (PKR 540,000/year)',
      coverage: 'Full tuition + monthly stipend + research allowance + conference travel',
      eligibility: 'Pakistani nationals, GAT score 50+, admission in MS/MPhil at HEC-recognized university, not on other HEC scholarship',
      description: 'HEC scholarship for Pakistani students pursuing MS/MPhil at HEC-recognized universities. Provides PKR 45,000 monthly stipend, full tuition, research allowance, and conference travel funding.'
    },
  ];

  let updated = 0;
  let created = 0;

  for (const data of scholarships) {
    const existing = await p.scholarship.findFirst({
      where: { name: data.name }
    });

    if (existing) {
      // Update existing scholarship with enhanced data
      await p.scholarship.update({
        where: { id: existing.id },
        data: {
          description: `${data.description}\n\nCOVERAGE: ${data.coverage}\n\nUNIVERSITIES COVERED: ${data.universities}`,
          eligibilityCriteria: data.eligibility,
          amount: parseFloat(data.stipend.match(/PKR ([\d,]+)/)[1].replace(/,/g, '')),
          amountFrequency: data.stipend.includes('/month') ? 'monthly' : data.stipend.includes('/year') ? 'annual' : 'total',
        }
      });
      updated++;
      console.log(`✅ Updated: ${data.name}`);
    } else {
      // Create new scholarship
      await p.scholarship.create({
        data: {
          name: data.name,
          provider: data.name.split(' ').slice(-2).join(' '),
          country: 'Pakistan',
          category: 'local',
          description: `${data.description}\n\nCOVERAGE: ${data.coverage}\n\nUNIVERSITIES COVERED: ${data.universities}`,
          eligibilityCriteria: data.eligibility,
          amount: parseFloat(data.stipend.match(/PKR ([\d,]+)/)[1].replace(/,/g, '')),
          currency: 'PKR',
          amountFrequency: data.stipend.includes('/month') ? 'monthly' : data.stipend.includes('/year') ? 'annual' : 'total',
          verificationStatus: 'verified',
        }
      });
      created++;
      console.log(`✅ Created: ${data.name}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log(`\n📊 RESULTS:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ✅ Created: ${created}`);
  console.log(`   Total: ${updated + created} scholarships enhanced`);

  await p.$disconnect();
}

enhancePakScholarships().catch(console.error).finally(() => process.exit(0));
