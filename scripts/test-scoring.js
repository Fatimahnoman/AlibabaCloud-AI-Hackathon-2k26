const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testRecommendationScoring() {
  console.log('=== TESTING RECOMMENDATION SCORING LOGIC ===\n');

  // Simulate the scoring logic
  function scoreUniversity(uni, profile) {
    let score = 0;

    // Country match (25 points)
    if (profile.country && uni.country && uni.country.toLowerCase().includes(profile.country.toLowerCase())) {
      score += 25;
    }

    // City match (20 points)
    if (profile.city && uni.city && uni.city.toLowerCase().includes(profile.city.toLowerCase())) {
      score += 20;
    }

    // Field/department match (20-25 points)
    if (profile.field && uni.courses.length > 0) {
      const fieldLower = profile.field.toLowerCase();
      const hasDeptMatch = uni.courses.some(c => 
        c.department && c.department.toLowerCase().includes(fieldLower)
      );
      const hasNameMatch = uni.courses.some(c => 
        c.name && c.name.toLowerCase().includes(fieldLower)
      );
      
      let hasSpecificProgramMatch = false;
      if (profile.careerGoal) {
        const careerGoalLower = profile.careerGoal.toLowerCase();
        hasSpecificProgramMatch = uni.courses.some(c => {
          const courseText = `${c.name} ${c.department || ''}`.toLowerCase();
          return courseText.includes(careerGoalLower);
        });
      }
      
      if (hasSpecificProgramMatch) {
        score += 25;
      } else if (hasDeptMatch) {
        score += 20;
      } else if (hasNameMatch) {
        score += 15;
      } else {
        score -= 15;
      }
    }

    // Degree level match (15 points)
    if (profile.degreeLevel && uni.courses.length > 0) {
      const hasMatchingDegree = uni.courses.some(c => 
        c.degree.toLowerCase().includes(profile.degreeLevel.toLowerCase())
      );
      if (hasMatchingDegree) score += 15;
    }

    // Career goal alignment (10 points)
    if (profile.careerGoal && uni.courses.length > 0) {
      const careerGoalLower = profile.careerGoal.toLowerCase();
      const careerKeywords = careerGoalLower.split(/\s+/).filter(w => w.length > 3);
      
      const hasCareerMatch = uni.courses.some(c => {
        const courseText = `${c.name} ${c.department || ''}`.toLowerCase();
        
        if (courseText.includes(careerGoalLower)) {
          return true;
        }
        
        if (careerKeywords.length > 0 && careerKeywords.every(kw => courseText.includes(kw))) {
          return true;
        }
        
        return false;
      });
      
      if (hasCareerMatch) score += 10;
    }

    return score;
  }

  // Test Case 1: Civil Engineering in Karachi
  console.log('TEST 1: Civil Engineering in Karachi');
  console.log('======================================');
  
  const profile1 = {
    country: 'Pakistan',
    city: 'Karachi',
    field: 'Civil Engineering',
    careerGoal: 'Civil Engineering',
    degreeLevel: 'bachelor'
  };

  // Get universities with Civil Engineering
  const civilEngUnis = await prisma.university.findMany({
    where: {
      city: { contains: 'Karachi' },
      courses: {
        some: {
          name: { contains: 'Civil Engineering' }
        }
      }
    },
    include: {
      courses: {
        where: {
          name: { contains: 'Civil Engineering' }
        }
      }
    },
    take: 5
  });

  console.log('\nUniversities WITH Civil Engineering:');
  civilEngUnis.forEach(uni => {
    const score = scoreUniversity(uni, profile1);
    const matchPercent = Math.min(100, Math.round((score / 95) * 100)); // 95 is max possible score
    console.log(`  ${uni.name}: ${matchPercent}% match (score: ${score})`);
  });

  // Get universities WITHOUT Civil Engineering
  const nonCivilUnis = await prisma.university.findMany({
    where: {
      city: { contains: 'Karachi' },
      courses: {
        none: {
          name: { contains: 'Civil Engineering' }
        }
      }
    },
    include: {
      courses: {
        take: 5
      }
    },
    take: 5
  });

  console.log('\nUniversities WITHOUT Civil Engineering:');
  nonCivilUnis.forEach(uni => {
    const score = scoreUniversity(uni, profile1);
    const matchPercent = Math.min(100, Math.round((score / 95) * 100));
    console.log(`  ${uni.name}: ${matchPercent}% match (score: ${score})`);
  });

  // Test Case 2: Computer Science
  console.log('\n\nTEST 2: Computer Science in Karachi');
  console.log('====================================');
  
  const profile2 = {
    country: 'Pakistan',
    city: 'Karachi',
    field: 'Computer Science',
    careerGoal: 'Computer Science',
    degreeLevel: 'bachelor'
  };

  const csUnis = await prisma.university.findMany({
    where: {
      city: { contains: 'Karachi' },
      courses: {
        some: {
          name: { contains: 'Computer Science' }
        }
      }
    },
    include: {
      courses: {
        where: {
          name: { contains: 'Computer Science' }
        }
      }
    },
    take: 5
  });

  console.log('\nTop 5 Universities WITH Computer Science:');
  csUnis.forEach(uni => {
    const score = scoreUniversity(uni, profile2);
    const matchPercent = Math.min(100, Math.round((score / 95) * 100));
    console.log(`  ${uni.name}: ${matchPercent}% match (score: ${score})`);
  });

  console.log('\n\n=== SCORING TEST COMPLETE ===');
  console.log('✅ Universities WITH the specific program should score HIGHER');
  console.log('✅ Universities WITHOUT the specific program should score LOWER');
}

testRecommendationScoring()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
