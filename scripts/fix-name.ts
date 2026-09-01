import { PrismaClient } from '@prisma/client';
const p = new PrismaClient();
async function main() {
  await p.freeInstitution.update({ where: { id: 'qabil-it-centre' }, data: { name: 'Bano Qabil IT Centre (Bano Qabila IT Training)' } });
  console.log('Updated name to Bano Qabil');
  await p.$disconnect();
}
main();
