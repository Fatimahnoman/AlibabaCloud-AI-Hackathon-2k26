import prisma from '@/lib/prisma';
import type { ChatIntent } from './intent-detection';

export async function retrieveEducationContext(
  query: string,
  intent: ChatIntent
): Promise<string> {
  const educationIntents: ChatIntent[] = ['education', 'university', 'course', 'scholarship', 'admission', 'visa', 'career', 'general'];
  if (!educationIntents.includes(intent)) return '';

  const contextParts: string[] = [];
  const lowerQuery = query.toLowerCase();

  // Detect city from query — global cities
  const globalCities: Record<string, string[]> = {
    Pakistan: ['lahore', 'karachi', 'islamabad', 'peshawar', 'faisalabad', 'hyderabad', 'multan', 'bahawalpur', 'rawalpindi', 'jamshoro', 'hasanabdal', 'sialkot', 'gujranwala', 'abbottabad', 'quetta', 'sukkur', 'larkana', 'dera ghazi khan', 'sahiwal', 'jhang', 'kasur', 'sheikhupura', 'gujrat', 'sargodha', 'mianwali', 'dera ismail khan', 'charsadda', 'nowshera', 'swat', 'mingora', 'turbat', 'khuzdar', 'bannu', 'kohat', 'hafizabad', 'nankana sahib', 'chiniot', 'toba tek singh', 'vehari', 'jhelum', 'chakwal', 'attock', 'mardan'],
    Germany: ['munich', 'berlin', 'hamburg', 'cologne', 'frankfurt', 'stuttgart', 'aachen', 'heidelberg', 'dresden', 'leipzig', 'bonn', 'goettingen', 'freiburg', 'braunschweig'],
    'United States': ['cambridge', 'stanford', 'boston', 'new york', 'los angeles', 'chicago', 'pasadena', 'berkeley', 'new haven', 'princeton', 'atlanta', 'houston', 'seattle', 'san francisco', 'austin'],
    'United Kingdom': ['oxford', 'cambridge', 'london', 'edinburgh', 'manchester', 'bristol', 'glasgow', 'birmingham', 'leeds', 'liverpool', 'warwick', 'durham', 'bath', 'exeter'],
    Canada: ['toronto', 'montreal', 'vancouver', 'ottawa', 'calgary', 'edmonton', 'waterloo', 'hamilton', 'kingston', 'halifax'],
    Australia: ['sydney', 'melbourne', 'canberra', 'brisbane', 'perth', 'adelaide', 'gold coast', 'newcastle', 'wollongong', 'hobart'],
  };

  let detectedCity: string | undefined;
  let detectedCountry: string | undefined;
  for (const [country, cities] of Object.entries(globalCities)) {
    const found = cities.find(city => lowerQuery.includes(city));
    if (found) {
      detectedCity = found;
      detectedCountry = country;
      break;
    }
  }

  try {
    if (intent === 'university' || intent === 'education' || intent === 'course') {
      let countryFilter = detectedCountry;
      if (lowerQuery.includes('pakistan')) countryFilter = 'Pakistan';
      else if (lowerQuery.includes('germany') || lowerQuery.includes('german')) countryFilter = 'Germany';
      else if (lowerQuery.includes('usa') || lowerQuery.includes('america') || lowerQuery.includes('united states')) countryFilter = 'United States';
      else if (lowerQuery.includes('uk') || lowerQuery.includes('britain') || lowerQuery.includes('united kingdom')) countryFilter = 'United Kingdom';
      else if (lowerQuery.includes('canada') || lowerQuery.includes('canadian')) countryFilter = 'Canada';
      else if (lowerQuery.includes('australia') || lowerQuery.includes('australian')) countryFilter = 'Australia';

      // Detect institution type from query
      let typeFilter: string | undefined;
      if (lowerQuery.includes('college') || lowerQuery.includes('intermediate') || lowerQuery.includes('fsc') || lowerQuery.includes('ics')) {
        typeFilter = 'college';
      } else if (lowerQuery.includes('school') || lowerQuery.includes('o level') || lowerQuery.includes('a level') || lowerQuery.includes('matric')) {
        typeFilter = 'school';
      }

      const universities = await prisma.university.findMany({
        where: {
          verificationStatus: 'verified',
          ...(countryFilter ? { country: countryFilter } : {}),
          ...(detectedCity ? { city: { contains: detectedCity } } : {}),
          ...(typeFilter ? { type: typeFilter } : {}),
        },
        include: {
          courses: {
            select: {
              name: true,
              degree: true,
              department: true,
              duration: true,
              tuitionFee: true,
              currency: true,
              description: true,
            },
          },
          departments: {
            select: {
              name: true,
              head: true,
              description: true,
              totalCourses: true,
            },
          },
          rankings: { select: { provider: true, year: true, position: true, category: true } },
          campuses: { select: { name: true, city: true, isMain: true } },
        },
        take: detectedCity ? 10 : 8,
      });

        if (universities.length > 0) {
        const countryLabel = countryFilter || 'Global';
        contextParts.push(`DATABASE RESULTS - Verified ${countryLabel} Institutions (real-world data):`);
        for (const u of universities) {
          const courses = u.courses.map(c => {
            const fee = c.tuitionFee ? `${c.currency || 'PKR'} ${Number(c.tuitionFee).toLocaleString()}` : 'N/A';
            const dept = c.department ? `, Dept: ${c.department}` : '';
            return `${c.name} (${c.degree}${dept}, ${c.duration || 'N/A'}, Fee: ${fee})`;
          }).join('\n    ');
          const deptList = u.departments.map(d => {
            const head = d.head ? ` (Head: ${d.head})` : '';
            return `${d.name}${head} - ${d.totalCourses} courses`;
          }).join('\n    ');
          const rank = u.rankings.map(r => `${r.provider} ${r.year}: #${r.position}`).join('; ');
          const campusList = u.campuses.map(c => `${c.name}${c.isMain ? ' (Main)' : ''}${c.city ? ', ' + c.city : ''}`).join('; ');
          contextParts.push(
            `- ${u.name} (${u.city}, ${u.country}) [${u.type}]` +
            `\n  Founded: ${u.foundedYear || 'N/A'}` +
            `\n  Website: ${u.website || 'N/A'}` +
            (u.description ? `\n  Details: ${u.description}` : '') +
            (deptList ? `\n  Departments (${u.departments.length}):\n    ${deptList}` : '') +
            (courses ? `\n  Programs:\n    ${courses}` : '') +
            (rank ? `\n  Rankings: ${rank}` : '') +
            (campusList ? `\n  Campuses: ${campusList}` : '')
          );
        }
      }
    }

    // Campus query — detect campus-related questions
    const campusKeywords = ['campus', 'sub campus', 'sub-campus', 'main campus', 'branch', 'location', 'where is', 'address'];
    if (campusKeywords.some(kw => lowerQuery.includes(kw))) {
      const campusUni = await prisma.university.findMany({
        where: {
          verificationStatus: 'verified',
          campuses: { some: {} },
        },
        include: {
          campuses: { select: { name: true, city: true, isMain: true, address: true, description: true } },
        },
        take: 10,
      });

      if (campusUni.length > 0) {
        contextParts.push('DATABASE RESULTS - Institutions with Multiple Campuses:');
        for (const u of campusUni) {
          const campusDetails = u.campuses.map(c =>
            `${c.isMain ? '[MAIN]' : '[SUB]'} ${c.name}${c.city ? ', ' + c.city : ''}${c.address ? ' - ' + c.address : ''}${c.description ? ' (' + c.description + ')' : ''}`
          ).join('\n    ');
          contextParts.push(
            `- ${u.name} (${u.city}) — ${u.campuses.length} campus(es):\n    ${campusDetails}`
          );
        }
      }
    }

    // Department query — detect department-related questions
    const deptKeywords = ['department', 'dept', 'faculty', 'school of', 'how many departments', 'number of departments', 'departments does'];
    if (deptKeywords.some(kw => lowerQuery.includes(kw))) {
      const deptUnis = await prisma.university.findMany({
        where: {
          verificationStatus: 'verified',
          departments: { some: {} },
        },
        include: {
          departments: {
            select: { name: true, head: true, description: true, totalCourses: true },
            orderBy: { name: 'asc' },
          },
        },
        take: 15,
      });

      if (deptUnis.length > 0) {
        contextParts.push('DATABASE RESULTS - University Departments:');
        for (const u of deptUnis) {
          const deptDetails = u.departments.map(d =>
            `${d.name}${d.head ? ` (Head: ${d.head})` : ''} - ${d.totalCourses} courses${d.description ? ` - ${d.description.substring(0, 100)}` : ''}`
          ).join('\n    ');
          contextParts.push(
            `- ${u.name} (${u.city}, ${u.country}) — ${u.departments.length} department(s):\n    ${deptDetails}`
          );
        }
      }
    }

    // Fee comparison query
    if (lowerQuery.includes('fee') || lowerQuery.includes('cost') || lowerQuery.includes('affordable') || lowerQuery.includes('cheap') || lowerQuery.includes('expensive') || lowerQuery.includes('tuition')) {
      const feeCountry = lowerQuery.includes('pakistan') ? 'Pakistan' :
        lowerQuery.includes('germany') ? 'Germany' :
        lowerQuery.includes('usa') || lowerQuery.includes('america') ? 'United States' :
        lowerQuery.includes('uk') || lowerQuery.includes('britain') ? 'United Kingdom' :
        lowerQuery.includes('canada') ? 'Canada' :
        lowerQuery.includes('australia') ? 'Australia' : undefined;

      const feeCourses = await prisma.course.findMany({
        where: {
          verificationStatus: 'verified',
          tuitionFee: { not: null },
          ...(feeCountry ? { university: { country: feeCountry } } : {}),
        },
        include: {
          university: { select: { name: true, city: true, type: true } },
        },
        orderBy: { tuitionFee: 'asc' },
        take: 20,
      });

      if (feeCourses.length > 0) {
        contextParts.push(`DATABASE RESULTS - Fee Comparison (${feeCountry || 'All Countries'}, sorted by cost):`);
        for (const c of feeCourses) {
          const feeInfo = c.description ? c.description.substring(0, 150) : 'Annual tuition fee';
          contextParts.push(
            `- ${c.university.name} (${c.university.city}) - ${c.name}` +
            `\n  Fee: ${c.currency || 'PKR'} ${Number(c.tuitionFee).toLocaleString()}` +
            `\n  Duration: ${c.duration || 'N/A'}` +
            `\n  Details: ${feeInfo}`
          );
        }
      }
    }

    // Scholarship query — enhanced with province/district filtering
    if (intent === 'scholarship' || intent === 'education' || intent === 'general') {
      const scholarshipKeywords = ['scholarship', 'scholorship', 'scholar', 'financial aid', 'grant', 'funding', 'bursary', 'waiver', 'fee waiver', 'stipend', 'ntthp', 'sthp', 'seef', 'beef', 'peef', 'ehsaas', 'fulbright', 'chevening', 'daad', 'commonwealth', 'erasmus', 'mext', 'kgsp', 'csc', 'holland', 'swedish', 'vanier', 'ukaa', 'bait-ul-mal', 'hec'];
      if (scholarshipKeywords.some(kw => lowerQuery.includes(kw))) {
        // Detect scholarship type
        const isInternational = lowerQuery.includes('international') || lowerQuery.includes('abroad') || lowerQuery.includes('foreign') || lowerQuery.includes('usa') || lowerQuery.includes('uk') || lowerQuery.includes('germany') || lowerQuery.includes('australia') || lowerQuery.includes('canada') || lowerQuery.includes('japan') || lowerQuery.includes('korea') || lowerQuery.includes('turkey') || lowerQuery.includes('china') || lowerQuery.includes('fulbright') || lowerQuery.includes('chevening') || lowerQuery.includes('daad') || lowerQuery.includes('erasmus');
        const isNational = lowerQuery.includes('national') || lowerQuery.includes('pakistan') || lowerQuery.includes('hec') || lowerQuery.includes('peef') || lowerQuery.includes('ehsaas') || lowerQuery.includes('punjab') || lowerQuery.includes('sindh') || lowerQuery.includes('kpk') || lowerQuery.includes('balochistan') || lowerQuery.includes('fauji') || lowerQuery.includes('bait-ul-mal');

        // Detect province
        let provinceFilter: string | undefined;
        if (lowerQuery.includes('punjab')) provinceFilter = 'Punjab';
        else if (lowerQuery.includes('sindh')) provinceFilter = 'Sindh';
        else if (lowerQuery.includes('kpk') || lowerQuery.includes('khyber') || lowerQuery.includes('pakhtunkhwa')) provinceFilter = 'KPK';
        else if (lowerQuery.includes('balochistan') || lowerQuery.includes('baluchistan')) provinceFilter = 'Balochistan';
        else if (lowerQuery.includes('islamabad') || lowerQuery.includes('fata') || lowerQuery.includes('ajk') || lowerQuery.includes('gilgit')) provinceFilter = 'Federal/AJK/GB';

        // Detect level
        const isUndergrad = lowerQuery.includes('undergraduate') || lowerQuery.includes('bachelor') || lowerQuery.includes('intermediate') || lowerQuery.includes('hssc') || lowerQuery.includes('bs ') || lowerQuery.includes('b.s');
        const isGraduate = lowerQuery.includes('master') || lowerQuery.includes('ms') || lowerQuery.includes('mph') || lowerQuery.includes('phd') || lowerQuery.includes('doctoral') || lowerQuery.includes('postgraduate');

        let scholarshipFilter: Record<string, unknown> = { verificationStatus: 'verified' };

        if (isInternational && !isNational) {
          // For international queries, exclude Pakistan-only scholarships
          scholarshipFilter.country = { not: 'Pakistan' };
        } else if (isNational && !isInternational) {
          scholarshipFilter.country = 'Pakistan';
        }

        const scholarships = await prisma.scholarship.findMany({
          where: scholarshipFilter,
          include: { requirements: { select: { requirementType: true, requirementValue: true, isRequired: true } } },
          take: 60,
          orderBy: { deadline: 'asc' },
        });

        // Filter by province if detected
        let filteredScholarships = scholarships;
        if (provinceFilter) {
          filteredScholarships = scholarships.filter(s => {
            const reqs = s.requirements.map(r => `${r.requirementType}: ${r.requirementValue}`.toLowerCase()).join(' ');
            const desc = (s.description || '').toLowerCase();
            const elig = (s.eligibilityCriteria || '').toLowerCase();
            const allText = `${reqs} ${desc} ${elig}`;
            return allText.includes(provinceFilter!.toLowerCase()) || allText.includes('all pakistan') || allText.includes('all provinces');
          });
        }

        // Filter by level if detected
        if (isUndergrad) {
          filteredScholarships = filteredScholarships.filter(s => {
            const desc = (s.description || '').toLowerCase();
            const elig = (s.eligibilityCriteria || '').toLowerCase();
            const reqs = s.requirements.map(r => r.requirementValue.toLowerCase()).join(' ');
            const allText = `${desc} ${elig} ${reqs}`;
            return allText.includes('undergraduate') || allText.includes('bachelor') || allText.includes('hssc') || allText.includes('intermediate') || allText.includes('bs ') || allText.includes('b.s') || allText.includes('12th');
          });
        } else if (isGraduate) {
          filteredScholarships = filteredScholarships.filter(s => {
            const desc = (s.description || '').toLowerCase();
            const elig = (s.eligibilityCriteria || '').toLowerCase();
            const reqs = s.requirements.map(r => r.requirementValue.toLowerCase()).join(' ');
            const allText = `${desc} ${elig} ${reqs}`;
            return allText.includes('master') || allText.includes('ms') || allText.includes('phd') || allText.includes('doctoral') || allText.includes('postgraduate') || allText.includes('graduate');
          });
        }

        if (filteredScholarships.length > 0) {
          const filterLabel = provinceFilter ? ` (${provinceFilter} eligible)` : isInternational ? ' (International)' : isNational ? ' (Pakistan National)' : '';
          contextParts.push(`SCHOLARSHIP DATABASE - Verified Scholarships${filterLabel} (sorted by deadline):`);
          for (const s of filteredScholarships) {
            const reqs = s.requirements.map(r => `${r.requirementType}: ${r.requirementValue}${r.isRequired ? ' [required]' : ' [optional]'}`).join('\n    ');
            const deadlineStr = s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : 'Rolling';
            contextParts.push(
              `\n  SCHOLARSHIP: ${s.name}` +
              `\n  Provider: ${s.provider}` +
              (s.country ? `\n  Country: ${s.country}` : '') +
              `\n  Deadline: ${deadlineStr}` +
              (s.amount ? `\n  Amount: ${s.currency || ''} ${s.amount}` : 'Amount: Fully Funded') +
              (s.eligibilityCriteria ? `\n  Eligibility: ${s.eligibilityCriteria}` : '') +
              `\n  Full Details: ${s.description || 'N/A'}` +
              (reqs ? `\n  Requirements:\n    ${reqs}` : '') +
              (s.sourceUrl ? `\n  Apply at: ${s.sourceUrl}` : '')
            );
          }
        } else if (provinceFilter) {
          contextParts.push(`SCHOLARSHIP DATABASE - No specific ${provinceFilter} scholarships found. Showing ALL Pakistan national scholarships instead.`);
          const allNational = scholarships.filter(s => s.country === 'Pakistan').slice(0, 8);
          for (const s of allNational) {
            const deadlineStr = s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : 'Rolling';
            contextParts.push(
              `\n  SCHOLARSHIP: ${s.name} (${s.provider})` +
              `\n  Deadline: ${deadlineStr}` +
              (s.eligibilityCriteria ? `\n  Eligibility: ${s.eligibilityCriteria}` : '') +
              (s.description ? `\n  Details: ${s.description.substring(0, 300)}...` : '')
            );
          }
        }
      }
    }

    // Government Schemes query
    if (intent === 'scholarship' || intent === 'education' || intent === 'general') {
      const schemeKeywords = ['scheme', 'ehsaas', 'bisp', 'peef', 'kamyab', 'panagah', 'laptop', 'training', 'naavttc', 'tevta', 'psdf', 'free course', 'government scheme', 'sarkari', 'yojana', 'program', 'stipend', 'waseela', 'loan', 'housing', 'aid'];
      if (schemeKeywords.some(kw => lowerQuery.includes(kw))) {
        const schemeFilter: Record<string, unknown> = { status: 'active', verificationStatus: 'verified' };

        if (lowerQuery.includes('scholarship') || lowerQuery.includes('ehsaas') || lowerQuery.includes('peef') || lowerQuery.includes('bisp')) {
          schemeFilter.category = 'scholarship';
        } else if (lowerQuery.includes('loan') || lowerQuery.includes('kamyab')) {
          schemeFilter.category = 'loan';
        } else if (lowerQuery.includes('training') || lowerQuery.includes('naavttc') || lowerQuery.includes('tevta') || lowerQuery.includes('psdf') || lowerQuery.includes('free course')) {
          schemeFilter.category = 'training';
        } else if (lowerQuery.includes('stipend') || lowerQuery.includes('waseela')) {
          schemeFilter.category = 'stipend';
        } else if (lowerQuery.includes('housing') || lowerQuery.includes('panagah')) {
          schemeFilter.category = 'housing';
        } else if (lowerQuery.includes('laptop')) {
          schemeFilter.category = 'digital';
        }

        if (lowerQuery.includes('punjab')) {
          schemeFilter.OR = [{ province: 'all' }, { province: 'punjab' }];
        } else if (lowerQuery.includes('sindh')) {
          schemeFilter.OR = [{ province: 'all' }, { province: 'sindh' }];
        } else if (lowerQuery.includes('kpk') || lowerQuery.includes('khyber') || lowerQuery.includes('pakhtunkhwa')) {
          schemeFilter.OR = [{ province: 'all' }, { province: 'kpk' }];
        } else if (lowerQuery.includes('balochistan')) {
          schemeFilter.OR = [{ province: 'all' }, { province: 'balochistan' }];
        }

        const schemes = await prisma.governmentScheme.findMany({
          where: schemeFilter,
          include: { requirements: true, documents: true },
          take: 15,
          orderBy: { deadline: 'asc' },
        });

        if (schemes.length > 0) {
          contextParts.push(`DATABASE RESULTS - Government Schemes for Pakistani Students (${schemes.length} found):`);
          for (const s of schemes) {
            const deadlineStr = s.deadline ? new Date(s.deadline).toISOString().split('T')[0] : 'Rolling';
            const reqs = s.requirements.map(r => `${r.requirementType}: ${r.requirementValue}`).join('; ');
            const docs = s.documents.map(d => d.documentName).join(', ');
            contextParts.push(
              `\n  SCHEME: ${s.name} (${s.provider})` +
              `\n  Category: ${s.category}` +
              `\n  Province: ${s.province || 'All Pakistan'}` +
              `\n  Deadline: ${deadlineStr}` +
              (s.amount ? `\n  Amount: ${s.currency} ${Number(s.amount).toLocaleString()}` : '') +
              (s.eligibilityCriteria ? `\n  Eligibility: ${s.eligibilityCriteria}` : '') +
              (reqs ? `\n  Requirements: ${reqs}` : '') +
              (docs ? `\n  Documents Required: ${docs}` : '') +
              (s.applicationProcess ? `\n  How to Apply: ${s.applicationProcess.substring(0, 200)}...` : '') +
              (s.website ? `\n  Website: ${s.website}` : '')
            );
          }
        }
      }
    }

    // Free Institutions query
    if (intent === 'education' || intent === 'general' || intent === 'course') {
      const instKeywords = ['free course', 'free training', 'institute', 'navttc', 'tevta', 'psdf', 'saylani', 'hands', 'ignite', 'pitb', 'vocational', 'technical course', 'diploma course', 'skill', 'certificate course', 'idaara', 'institute'];
      if (instKeywords.some(kw => lowerQuery.includes(kw))) {
        const instFilter: Record<string, unknown> = { status: 'active', verificationStatus: 'verified' };

        if (lowerQuery.includes('punjab')) {
          instFilter.OR = [{ province: 'all' }, { province: 'punjab' }];
        } else if (lowerQuery.includes('sindh')) {
          instFilter.OR = [{ province: 'all' }, { province: 'sindh' }];
        } else if (lowerQuery.includes('kpk')) {
          instFilter.OR = [{ province: 'all' }, { province: 'kpk' }];
        } else if (lowerQuery.includes('balochistan')) {
          instFilter.OR = [{ province: 'all' }, { province: 'balochistan' }];
        }

        if (lowerQuery.includes('government') || lowerQuery.includes('govt') || lowerQuery.includes('sarkari')) {
          instFilter.type = 'govt';
        } else if (lowerQuery.includes('ngo') || lowerQuery.includes('welfare')) {
          instFilter.type = 'ngo';
        }

        const institutions = await prisma.freeInstitution.findMany({
          where: instFilter,
          include: { courses: true, entryTests: true, documents: true },
          take: 10,
          orderBy: { name: 'asc' },
        });

        if (institutions.length > 0) {
          contextParts.push(`DATABASE RESULTS - Free Course Institutions (${institutions.length} found):`);
          for (const inst of institutions) {
            const courses = inst.courses.map(c => `${c.name} (${c.duration}, ${c.fee})`).join('; ');
            const tests = inst.entryTests.filter(t => t.type !== 'none').map(t => `${t.testName}: ${t.totalMarks} marks, ${t.passingPercentage} passing`).join('; ');
            const docs = inst.documents.map(d => d.documentName).join(', ');
            contextParts.push(
              `\n  INSTITUTION: ${inst.name} [${inst.type}]` +
              `\n  Location: ${inst.location || 'Multiple cities'}` +
              `\n  Province: ${inst.province || 'All Pakistan'}` +
              (inst.eligibilityCriteria ? `\n  Eligibility: ${inst.eligibilityCriteria}` : '') +
              (courses ? `\n  Courses: ${courses}` : '') +
              (tests ? `\n  Entry Test: ${tests}` : '') +
              (docs ? `\n  Documents Required: ${docs}` : '') +
              (inst.applicationProcess ? `\n  How to Apply: ${inst.applicationProcess.substring(0, 200)}...` : '') +
              (inst.website ? `\n  Website: ${inst.website}` : '')
            );
          }
        }
      }
    }

    // Career query
    if (intent === 'career' || intent === 'education') {
      const careerPaths = await prisma.careerPath.findMany({
        where: { verificationStatus: 'verified' },
        take: 8,
      });

      const matching = careerPaths.filter(c => {
        const lower = `${c.title} ${c.field}`.toLowerCase();
        return lowerQuery.split(' ').some(w => w.length > 2 && lower.includes(w));
      });

      if (matching.length > 0) {
        contextParts.push('DATABASE RESULTS - Career Paths:');
        for (const c of matching.slice(0, 6)) {
          contextParts.push(
            `- ${c.title} (Field: ${c.field}) [${c.verificationStatus}]` +
            (c.description ? `\n  Description: ${c.description}` : '') +
            (c.entryRoles ? `\n  Entry Roles: ${c.entryRoles}` : '') +
            (c.skills ? `\n  Skills: ${c.skills}` : '')
          );
        }
      }
    }

    // Visa query
    if (intent === 'visa') {
      let countryFilter = undefined;
      if (lowerQuery.includes('germany')) countryFilter = 'Germany';
      else if (lowerQuery.includes('usa') || lowerQuery.includes('america')) countryFilter = 'United States';
      else if (lowerQuery.includes('uk') || lowerQuery.includes('britain')) countryFilter = 'United Kingdom';

      if (countryFilter) {
        const country = await prisma.country.findFirst({ where: { name: countryFilter } });
        if (country) {
          const visaInfo = await prisma.visaInformation.findMany({
            where: { countryId: country.id },
            include: { country: { select: { name: true } } },
            take: 3,
          });

          if (visaInfo.length > 0) {
            contextParts.push('DATABASE RESULTS - Visa Information:');
            for (const v of visaInfo) {
              contextParts.push(
                `- ${v.country.name} - ${v.visaType}` +
                (v.processingTime ? `\n  Processing Time: ${v.processingTime}` : '') +
                (v.requirements ? `\n  Requirements: ${v.requirements}` : '') +
                `\n  ⚠️ Verify with official immigration source before applying`
              );
            }
          }
        }
      }
    }

    // Rankings query
    if (intent === 'university') {
      const rankings = await prisma.universityRanking.findMany({
        where: { provider: 'QS', year: 2024 },
        include: { university: { select: { name: true, country: true } } },
        orderBy: { position: 'asc' },
        take: 10,
      });

      if (rankings.length > 0) {
        contextParts.push('DATABASE RESULTS - University Rankings (QS 2024):');
        for (const r of rankings) {
          contextParts.push(
            `- #${r.position} ${r.university.name} (${r.university.country})` +
            (r.category ? ` [${r.category}]` : '')
          );
        }
      }
    }
    // Marks/Grades/Requirements query — comprehensive international reference
    if (intent === 'education' || intent === 'university' || intent === 'admission' || intent === 'course' || intent === 'scholarship' || intent === 'general') {
      const marksKeywords = ['marks', 'percentage', 'grades', 'gpa', 'cgpa', 'requirement', 'eligible', 'eligibility', 'minimum', 'cut off', 'cutoff', 'entry', 'admission', 'kaise', 'kitne', 'kitna', 'sat', 'ielts', 'toefl', 'gre', 'gmat', 'a-levels', 'o-levels', 'atar', 'score', 'how.much', 'kitne.chahiye', 'kitna.hona', 'apply', 'join', 'jaana', 'karna', 'konsi', 'kaun.si'];
      if (marksKeywords.some(kw => lowerQuery.includes(kw))) {
        const countryReq = lowerQuery.includes('pakistan') ? 'Pakistan' :
          lowerQuery.includes('germany') || lowerQuery.includes('german') ? 'Germany' :
          lowerQuery.includes('usa') || lowerQuery.includes('america') || lowerQuery.includes('united states') ? 'United States' :
          lowerQuery.includes('uk') || lowerQuery.includes('britain') || lowerQuery.includes('united kingdom') ? 'United Kingdom' :
          lowerQuery.includes('canada') || lowerQuery.includes('canadian') ? 'Canada' :
          lowerQuery.includes('australia') || lowerQuery.includes('australian') ? 'Australia' : undefined;

        const marksData = getMarksRequirements(countryReq);
        contextParts.push(marksData);
      }
    }
  } catch {
    // Database query failure is non-critical for education context
  }

  if (contextParts.length === 0) return '';

  return `\n\n--- VERIFIED EDUCATION DATA (Real-world institutions) ---\n${contextParts.join('\n')}\n--- END VERIFIED DATA ---\nUse this verified data as your primary source. The fee structures and program details are REAL figures from official sources. If it doesn't answer the question, provide general guidance based on your training knowledge and clearly mark it as unverified.`;
}

function getMarksRequirements(country?: string): string {
  const base = `
=== COMPREHENSIVE MARKS/GRADES REQUIREMENTS FOR INTERNATIONAL STUDY ===

--- PAKISTAN (Matric/FSc/Intermediate System) ---
Matric (SSC): 8th pass minimum. Competitive universities: 80%+ in Matric.
Intermediate (HSSC): FSc/ICS/I.Com/A-Levels after Matric.
University Admission:
- Engineering (UET, NUST): 60%+ in FSc + Entry Test (ECAT/MDCAT/NTS). UET Lahore CS closing: 81.13% aggregate. Formula: Matric 10% + FSc 40% + ECAT 50%.
- Medical (MBBS): 60%+ in FSc (Pre-Medical) + MDCAT 60%+ (out of 200). PMC passing: 65% aggregate.
- Business (LUMS, IBA): 70%+ in Matric + Intermediate. LUMS SBASSE: SAT 1200+ or LUMS National Test. IBA Karachi: SAT 1100+ or IBA aptitude test.
- CS/IT (FAST, NUST): 60%+ in FSc. NUST NET: 60%+ marks. FAST: 50%+ in FAST entry test.
- Law (LAW College): 50%+ in Intermediate + LAT (Law Admission Test) 50+ marks.
- Arts/Humanities: 45%+ in Intermediate. Some need interview.
IELTS for Pakistan: Not usually required for Pakistani universities. For international applications: IELTS 6.0-7.0.
Documents: CNIC/B-Form, Domicile, Matric+Intermediate marksheets, Photos (4-6), Character certificate, Migration, Hope certificate (if awaiting results).

--- GERMANY (Abitur/German System) ---
Abitur (German high school diploma): Minimum 1.0-2.0 (best possible) for top universities. NC (Numerus Clausus) programs have strict cutoffs.
For Pakistani students: FSc/A-Levels equivalent. Need 75%+ in Intermediate for competitive programs. APS certificate required (for Indian/Chinese students too).
Bachelor's Admission:
- NC programs (Medicine, Psychology, Pharmacy): NC 1.0-1.5 (90%+ equivalent). Extremely competitive for non-EU.
- Non-NC programs (Engineering, CS): No minimum grade, but competitive. 75%+ in previous degree recommended.
- English-taught Master's: Bachelor's degree 2.5 German GPA or better (70%+ equivalent). IELTS 6.0-6.5 or TOEFL 80-95.
- German-taught programs: TestDaF TDN 4 (4 sections each) or DSH-2. German B2-C1 level.
Language Requirements:
- TestDaF: TDN 4 in all 4 sections (Lesen, Hören, Schreiben, Sprechen). Score of 4 = "fortgeschritten".
- DSH: DSH-2 or DSH-3 for most universities.
- IELTS: 6.0-6.5 for English programs (varies by university).
- TOEFL iBT: 80-95 for English programs.
Documents: APS certificate, uni-assist VPD, certified translations of degrees, Language certificate, CV, Motivation letter, Passport, 2 recommendation letters (Master's).

--- USA (American System — GPA/SAT/ACT) ---
High School GPA: 3.5-4.0 (unweighted) for top universities. MIT: 3.9+. Stanford: 3.96 average.
SAT: 1400-1600 for top universities. MIT: 1520-1580. Stanford: 1500-1570. Harvard: 1490-1580. State universities: 1000-1300.
ACT: 30-36 for top universities. MIT: 34-36. Stanford: 34-36. Harvard: 34-36.
AP Courses: 5-10 AP courses recommended for Ivy League. AP scores of 4-5 demonstrate college readiness.
IB Diploma: 38-45 points for top universities. MIT/Stanford/Harvard: 40+ with 7s in HL subjects.
TOEFL iBT: 80-110 depending on university. MIT: 110+. Stanford: 100+. State universities: 80+.
IELTS: 6.5-8.0 depending on university. MIT: 8.0+. Stanford: 7.5+. State universities: 6.5+.
GPA Conversion: 90-100% = 4.0, 80-89% = 3.0-3.9, 70-79% = 2.0-2.9, 60-69% = 1.0-1.9.
Community College Pathway: GPA 2.5+ and TOEFL 60+ for community colleges. Transfer to 4-year after 2 years.
Documents: Common/Coalition App, SAT/ACT scores, TOEFL/IELTS, Transcripts (official, evaluated by WES/ECE for international), 2 teacher recommendations, Counselor recommendation, Personal essays, Application fee ($50-90), Financial aid forms (CSS Profile for need-based aid).

--- UK (A-Levels/IB System) ---
A-Levels: A*A*A to BBB depending on university and course.
- Oxford/Cambridge: A*A*A to A*AA (most courses). Medicine: A*A*A.
- Imperial/UCL/LSE: AAA to A*A*A.
- Russell Group (Manchester, Bristol, Edinburgh): AAB to A*AA.
- Mid-tier: BBB to AAB.
IB Diploma: 36-45 points depending on university.
- Oxford/Cambridge: 40-42 with 7,7,6 at Higher Level.
- Imperial/UCL: 38-42.
- Russell Group: 34-40.
Scottish Highers: AAAA to AABBB depending on university.
IELTS: 
- Standard: 6.5 overall (no band below 6.0). Most Russell Group.
- Good: 7.0 overall (6.5 each). Oxford, Cambridge, Imperial, UCL, KCL.
- Advanced: 7.5 overall (7.0 each). Oxford humanities, Cambridge law.
TOEFL iBT: 88-110 depending on university.
UCAS Points: A-Level A* = 56, A = 48, B = 40, C = 32, D = 24, E = 16.
Documents: UCAS application (deadline 15 Oct for Oxbridge/Medicine, 29 Jan for most), A-Levels/IB/Highers scores, IELTS/TOEFL, Personal statement (4000 chars), 1 academic reference, Admissions test (MAT, BMAT, LNAT, TSA, STEP), Interview (Oxbridge, Medicine, some others), Written work (humanities at Oxbridge). UCAS fee: £28 (2025 entry).

--- CANADA (Canadian System — GPA-Based) ---
High School Average: Percentage-based (no GPA conversion needed — Canadian universities use raw %).
- University of Toronto: 90-95%+ for CS/Engineering, 85-90% for Commerce, 80-85% for Arts.
- McGill: 85-92%+ for competitive programs, 80-85% for general.
- UBC: 80-90%+ (personal profile 50% of decision).
- UWaterloo: 90-95%+ for CS/SWE, 85-90% for other engineering.
- McMaster: 85-90%+ for Engineering, 90%+ for Health Science.
SAT/ACT: NOT required for Canadian universities.
IELTS: 6.5 overall (no band below 6.0) for most. UWaterloo CS: 6.5 with W/S 6.5.
TOEFL iBT: 83-100 depending on university.
GPA Conversion: 90-100% = 4.0, 80-89% = 3.0-3.9, 70-79% = 2.0-2.9, 60-69% = 1.0-1.9.
Provincial Differences: Ontario uses OUAC, BC uses EducationPlannerBC, Quebec uses Minerva (McGill).
Documents: Provincial application portal, High school transcripts (official), IELTS/TOEFL, Supplementary applications (for competitive programs — UofT Engineering, UWaterloo AIF, UBC Personal Profile), Video interviews (some), Non-refundable application fee ($50-150 CAD).

--- AUSTRALIA (ATAR System) ---
ATAR (Australian Tertiary Admission Rank): 0-99.95 scale.
- University of Sydney/Melbourne: ATAR 95+ for competitive programs.
- UNSW: ATAR 90+ for most, 95+ for engineering/commerce.
- Monash: ATAR 70-95 depending on course.
- UQ/RMIT/UTS/Curtin: ATAR 60-85 for most programs.
IB Diploma: 28-42 points depending on university.
- Sydney/Melbourne: 38-42.
- UNSW/Monash: 34-39.
- RMIT/UTS/Curtin: 26-34.
GPA Conversion (for international students): 85-100% = ATAR 95+, 80-84% = ATAR 90-94, 75-79% = ATAR 85-89, 70-74% = ATAR 80-84, 65-69% = ATAR 75-79, 60-64% = ATAR 70-74.
IELTS: 6.5 overall (no band below 6.0) for most. Health/Medicine: 7.0-7.5.
TOEFL iBT: 79-100 depending on university.
UCAT (for Medicine): Required for most medical schools. Score out of 3000. Competitive: 2800+.
Documents: UAC (NSW/ACT), VTAC (Victoria), QTAC (Queensland), TISC (WA), SATAC (SA), UTAS (Tasmania). High school transcripts, ATAR or equivalent, IELTS/TOEFL, Portfolio (Architecture/Design), Interview (Medicine, some others), Application fee ($50-100 AUD).`;

  if (country === 'Pakistan') return base + `

--- QUICK REFERENCE FOR PAKISTAN ---
Matric: 80%+ for good colleges. 60%+ minimum for intermediate.
Intermediate (FSc/ICS/I.Com): 60%+ minimum for university. 70%+ competitive. 80%+ for top universities.
Entry Tests: ECAT (Engineering), MDCAT (Medical), NTS (General), LAT (Law), SAT (LUMS/IBA).
Aggregate Formula (UET): Matric 10% + FSc 40% + ECAT 50% = Final Merit.
IELTS: Not required for Pakistani universities. Required for abroad: 6.0-7.0.
Documents: CNIC/B-Form, Domicile, Matric marksheet, Intermediate marksheet, Photos, Character certificate, Migration, Hope certificate.`;

  if (country === 'Germany') return base + `

--- QUICK REFERENCE FOR GERMANY ---
Abitur/GPA: NC 1.0-1.5 for Medicine (90%+ equivalent). 2.0-2.5 for Engineering (75%+ equivalent).
APS Certificate: Required for students from India, China, Vietnam. Process: 4-8 weeks. Fee: €75.
Language: TestDaF TDN 4 (all sections) or DSH-2 for German. IELTS 6.0-6.5 or TOEFL 80-95 for English.
University Application: uni-assist for most universities. Deadline: 15 July (winter), 15 January (summer).
Blocked Account: €11,900/year proof of funds for visa.
Semester Fee: €100-400/semester (includes student ID, public transport).`;

  if (country === 'United States') return base + `

--- QUICK REFERENCE FOR USA ---
GPA: 3.5+ for state universities. 3.8+ for top 20. 3.9+ for Ivy League.
SAT: 1000+ for state universities. 1300+ for top 50. 1500+ for Ivy League.
ACT: 21+ for state universities. 28+ for top 50. 33+ for Ivy League.
TOEFL: 80+ for state universities. 100+ for top 50. 110+ for MIT/Stanford.
IELTS: 6.5+ for state universities. 7.0+ for top 50. 8.0+ for MIT.
Application Deadlines: Early Action/Decision: Nov 1-15. Regular Decision: Jan 1-15. Rolling: varies.
CSS Profile: Required for financial aid at most private universities. Opens Oct 1.
Community College: GPA 2.5+ and TOEFL 60+ (easiest path to US degree).`;

  if (country === 'United Kingdom') return base + `

--- QUICK REFERENCE FOR UK ---
A-Levels: A*A*A for Oxford/Cambridge. AAA-A*AA for Imperial/UCL. AAB-ABB for Russell Group.
IB: 40+ for Oxford/Cambridge. 38+ for Imperial/UCL. 34+ for Russell Group.
IELTS: 7.0-7.5 for Oxbridge. 6.5-7.0 for Imperial/UCL/KCL. 6.0-6.5 for Russell Group.
UCAS Deadlines: 15 Oct (Oxford/Cambridge/Medicine). 29 Jan (most). 30 Jun (Clearing).
Admissions Tests: MAT (Math Oxford), BMAT (Medicine), LNAT (Law), STEP (Cambridge Maths).
Interview: All Oxbridge candidates. Medicine. Some others.
Personal Statement: 4,000 characters max. 1 statement for all 5 choices.`;

  if (country === 'Canada') return base + `

--- QUICK REFERENCE FOR CANADA ---
Percentage: 90%+ for UofT CS/Engineering. 85%+ for McGill/UWaterloo. 80%+ for most programs.
IELTS: 6.5 (no band <6.0) for most. UWaterloo CS: 6.5 with W/S 6.5.
TOEFL: 83-100 depending on university.
Application: OUAC (Ontario), EducationPlannerBC (BC), Minerva (McGill/Quebec).
Deadlines: Jan 15 (most Ontario). Jan 31 (UofT Engineering). Varies by province.
Supplementary Apps: UofT Engineering, UWaterloo AIF, UBC Personal Profile — heavily weighted (50% of decision).
PGWP: Post-Graduation Work Permit up to 3 years after study.`;

  if (country === 'Australia') return base + `

--- QUICK REFERENCE FOR AUSTRALIA ---
ATAR: 95+ for Sydney/Melbourne. 90+ for UNSW/Monash. 70-85 for RMIT/UTS/Curtin.
IB: 38+ for Sydney/Melbourne. 34+ for UNSW/Monash. 26-34 for RMIT/UTS/Curtin.
IELTS: 6.5 (no band <6.0) for most. 7.0+ for Medicine/Health.
TOEFL: 79-100 depending on university.
Application: UAC (NSW), VTAC (Victoria), QTAC (Queensland), TISC (WA).
Deadlines: Varies by state. Typically Dec-Feb for Feb/Mar intake. Jul-Aug for Jul/Aug intake.
UCAT: Required for Medicine. Score 2800+ competitive.
Post-Study Work Visa: 2-4 years (temporary graduate visa 485).`;

  return base;
}
