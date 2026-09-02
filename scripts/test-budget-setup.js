const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const p = new PrismaClient();

async function main() {
  // List existing users
  const users = await p.user.findMany({ select: { id: true, email: true, name: true, role: true } });
  console.log('Existing users:', JSON.stringify(users, null, 2));

  // Create a test user for budget testing
  const email = 'budget-test@eduguard.com';
  const password = 'Test@1234';
  const existing = await p.user.findUnique({ where: { email } });
  
  if (existing) {
    console.log('Test user already exists:', existing.id);
    // Update password
    const hash = await bcrypt.hash(password, 12);
    await p.user.update({ where: { email }, data: { passwordHash: hash } });
    console.log('Password updated');
  } else {
    const hash = await bcrypt.hash(password, 12);
    const user = await p.user.create({
      data: {
        email,
        passwordHash: hash,
        name: 'Budget Tester',
        role: 'user',
        emailVerified: new Date(),
        isActive: true,
        preferredLanguage: 'en',
      },
    });
    console.log('Test user created:', user.id);
  }

  // Check budget categories
  const catCount = await p.expenseCategory.count();
  console.log('Total categories:', catCount);
  const defaultCatCount = await p.expenseCategory.count({ where: { isDefault: true } });
  console.log('Default categories:', defaultCatCount);

  // Check budget profile for test user
  const testUser = await p.user.findUnique({ where: { email } });
  if (testUser) {
    const profile = await p.budgetProfile.findUnique({ where: { userId: testUser.id } });
    console.log('Budget profile exists:', !!profile);
    
    // Clean up old test data
    if (profile) {
      await p.expenseRecord.deleteMany({ where: { budgetProfileId: profile.id } });
      await p.incomeRecord.deleteMany({ where: { budgetProfileId: profile.id } });
      await p.budget.deleteMany({ where: { budgetProfileId: profile.id } });
      await p.budgetProfile.delete({ where: { id: profile.id } });
      console.log('Cleaned up old budget data');
    }
    
    // Clean up savings goals
    await p.savingsGoal.deleteMany({ where: { userId: testUser.id } });
    // Clean up user-specific categories
    await p.expenseCategory.deleteMany({ where: { userId: testUser.id } });
    console.log('Cleaned up old savings goals and categories');
  }
}

main().catch(console.error).finally(() => p.$disconnect());
