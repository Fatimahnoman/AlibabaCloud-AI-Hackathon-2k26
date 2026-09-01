const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

async function main() {
  const unis = await p.university.findMany({
    where: { country: 'Pakistan' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });
  unis.forEach(u => console.log(u.id, '|', u.name));
  await p.$disconnect();
}

main();
