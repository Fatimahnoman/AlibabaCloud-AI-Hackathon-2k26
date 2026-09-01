const Database = require('better-sqlite3');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const postgresPrisma = new PrismaClient();

async function migrateData() {
  console.log('=== FAST MIGRATION FROM SQLITE TO POSTGRESQL ===\n');

  const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db.backup');
  console.log(`Opening SQLite database: ${dbPath}\n`);
  const sqlite = new Database(dbPath, { readonly: true });

  try {
    // 1. Migrate Users
    console.log('1. Migrating Users...');
    const users = sqlite.prepare('SELECT * FROM users').all();
    console.log(`   Found ${users.length} users`);
    const userData = users.map(user => ({
      id: user.id,
      email: user.email,
      passwordHash: user.password_hash,
      emailVerified: user.email_verified ? new Date(user.email_verified) : null,
      name: user.name,
      role: user.role,
      createdAt: new Date(user.created_at),
      updatedAt: new Date(user.updated_at),
    }));
    await postgresPrisma.user.createMany({ data: userData, skipDuplicates: true });
    console.log(`   ✅ Migrated ${users.length} users\n`);

    // 2. Migrate Countries
    console.log('2. Migrating Countries...');
    const countries = sqlite.prepare('SELECT * FROM countries').all();
    console.log(`   Found ${countries.length} countries`);
    const countryData = countries.map(country => ({
      id: country.id,
      name: country.name,
      code: country.code,
      currency: country.currency,
      currencySymbol: country.currency_symbol,
      tuitionRange: country.tuition_range,
      livingCostRange: country.living_cost_range,
      createdAt: new Date(country.created_at),
      updatedAt: new Date(country.updated_at),
    }));
    await postgresPrisma.country.createMany({ data: countryData, skipDuplicates: true });
    console.log(`   ✅ Migrated ${countries.length} countries\n`);

    // 3. Migrate Universities
    console.log('3. Migrating Universities...');
    const universities = sqlite.prepare('SELECT * FROM universities').all();
    console.log(`   Found ${universities.length} universities`);
    const uniData = universities.map(uni => ({
      id: uni.id,
      name: uni.name,
      city: uni.city,
      country: uni.country,
      sector: uni.sector,
      ranking: uni.ranking,
      website: uni.website,
      sourceUrl: uni.source_url,
      createdAt: new Date(uni.created_at),
      updatedAt: new Date(uni.updated_at),
    }));
    await postgresPrisma.university.createMany({ data: uniData, skipDuplicates: true });
    console.log(`   ✅ Migrated ${universities.length} universities\n`);

    // 4. Migrate Departments
    console.log('4. Migrating Departments...');
    const departments = sqlite.prepare('SELECT * FROM departments').all();
    console.log(`   Found ${departments.length} departments`);
    const deptData = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      universityId: dept.university_id,
      description: dept.description,
      createdAt: new Date(dept.created_at || Date.now()),
    }));
    await postgresPrisma.department.createMany({ data: deptData, skipDuplicates: true });
    console.log(`   ✅ Migrated ${departments.length} departments\n`);

    // 5. Migrate Courses (LARGEST TABLE - 6581 rows)
    console.log('5. Migrating Courses...');
    const courses = sqlite.prepare('SELECT * FROM courses').all();
    console.log(`   Found ${courses.length} courses`);
    const courseData = courses.map(course => ({
      id: course.id,
      name: course.name,
      degree: course.degree,
      duration: course.duration,
      tuitionFee: course.tuition_fee ? parseFloat(course.tuition_fee) : null,
      currency: course.currency,
      department: course.department,
      departmentId: course.department_id,
      universityId: course.university_id,
      description: course.description,
      requirements: course.requirements,
      createdAt: new Date(course.created_at),
      updatedAt: new Date(course.updated_at),
    }));
    await postgresPrisma.course.createMany({ data: courseData, skipDuplicates: true });
    console.log(`   ✅ Migrated ${courses.length} courses\n`);

    // 6. Migrate Scholarships
    console.log('6. Migrating Scholarships...');
    const scholarships = sqlite.prepare('SELECT * FROM Scholarship').all();
    console.log(`   Found ${scholarships.length} scholarships`);
    const scholarshipData = scholarships.map(scholarship => ({
      id: scholarship.id,
      name: scholarship.name,
      provider: scholarship.provider,
      country: scholarship.country,
      amount: scholarship.amount,
      currency: scholarship.currency,
      eligibility: scholarship.eligibility,
      deadline: scholarship.deadline ? (typeof scholarship.deadline === 'number' ? new Date(scholarship.deadline) : new Date(scholarship.deadline)) : null,
      sourceUrl: scholarship.source_url,
      description: scholarship.description,
      createdAt: new Date(scholarship.created_at),
      updatedAt: new Date(scholarship.updated_at),
    }));
    await postgresPrisma.scholarship.createMany({ data: scholarshipData, skipDuplicates: true });
    console.log(`   ✅ Migrated ${scholarships.length} scholarships\n`);

    // 7. Migrate Career Paths
    console.log('7. Migrating Career Paths...');
    const careers = sqlite.prepare('SELECT * FROM career_paths').all();
    console.log(`   Found ${careers.length} career paths`);
    const careerData = careers.map(career => ({
      id: career.id,
      title: career.title,
      slug: career.slug,
      field: career.field,
      description: career.description,
      skills: career.skills,
      entryRoles: career.entry_roles,
      furtherStudy: career.further_study,
      createdAt: new Date(career.created_at),
      updatedAt: new Date(career.updated_at),
    }));
    await postgresPrisma.careerPath.createMany({ data: careerData, skipDuplicates: true });
    console.log(`   ✅ Migrated ${careers.length} career paths\n`);

    console.log('=== MIGRATION COMPLETE ===');
    console.log('\n✅ All data successfully migrated to PostgreSQL!');
    console.log('✅ You can now use the app with PostgreSQL database.');
    console.log('\nSummary:');
    console.log(`  - Users: ${users.length}`);
    console.log(`  - Countries: ${countries.length}`);
    console.log(`  - Universities: ${universities.length}`);
    console.log(`  - Departments: ${departments.length}`);
    console.log(`  - Courses: ${courses.length}`);
    console.log(`  - Scholarships: ${scholarships.length}`);
    console.log(`  - Career Paths: ${careers.length}`);

  } catch (error) {
    console.error('\n❌ Migration error:', error.message);
    console.error('\nSome data may have been migrated. Check the logs above.');
  } finally {
    sqlite.close();
    await postgresPrisma.$disconnect();
  }
}

migrateData();
