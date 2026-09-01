const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

const DEFAULT_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔' },
  { name: 'Transportation', icon: '🚗' },
  { name: 'Housing & Rent', icon: '🏠' },
  { name: 'Utilities', icon: '💡' },
  { name: 'Education', icon: '📚' },
  { name: 'Healthcare', icon: '🏥' },
  { name: 'Entertainment', icon: '🎬' },
  { name: 'Shopping', icon: '🛍️' },
  { name: 'Personal Care', icon: '💇' },
  { name: 'Insurance', icon: '🛡️' },
  { name: 'Savings', icon: '💰' },
  { name: 'Debt Payments', icon: '💳' },
  { name: 'Gifts & Donations', icon: '🎁' },
  { name: 'Travel', icon: '✈️' },
  { name: 'Phone & Internet', icon: '📱' },
  { name: 'Tuition Fee', icon: '🎓' },
  { name: 'Books & Supplies', icon: '📖' },
  { name: 'Miscellaneous', icon: '📦' },
];

async function main() {
  // Check if default categories already exist
  const existing = await p.expenseCategory.count({ where: { isDefault: true } });
  if (existing > 0) {
    console.log(`Default categories already exist (${existing}). Skipping.`);
    return;
  }

  // Create default categories (no userId = system defaults)
  for (const cat of DEFAULT_CATEGORIES) {
    await p.expenseCategory.create({
      data: {
        name: cat.name,
        icon: cat.icon,
        isDefault: true,
        userId: null,
      },
    });
  }

  const count = await p.expenseCategory.count();
  console.log(`Created ${DEFAULT_CATEGORIES.length} default expense categories. Total: ${count}`);
}

main()
  .catch(console.error)
  .finally(() => p.$disconnect());
