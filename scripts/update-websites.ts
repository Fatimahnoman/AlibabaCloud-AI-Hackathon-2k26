import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const websiteUpdates: Record<string, string> = {
  // Batch 1
  'uni-pk-033': 'https://www.akhuwatfirst.edu.pk/',
  'uni-pk-186': 'https://aror.edu.pk/',
  'uni-pk-029': 'https://avicennamch.com/',
  'uni-pk-126': 'https://www.buetk.edu.pk/',
  'uni-pk-166': 'http://bmckp.edu.pk/',
  'uni-pk-187': 'https://www.bnbwu.edu.pk/',
  'uni-pk-128': 'https://www.bumhs.edu.pk/',
  'uni-pk-030': 'https://www.cpmc.edu.pk/',
  'uni-pk-183': 'https://cuvas.edu.pk/',
  'uni-pk-146': 'https://cusit.edu.pk/',
  'uni-pk-191': 'https://dgkmc.edu.pk/',
  'uni-pk-163': 'https://www.fu.edu.pk/',
  'uni-pk-105': 'http://pmc.edu.pk/',
  'uni-pk-135': 'https://fmc.edu.pk/',
  'uni-pk-144': 'https://gandhara.edu.pk/',
  'uni-pk-190': 'https://gudgk.edu.pk/',
  'uni-pk-188': 'https://gmc-suk.edu.pk/',
  'uni-pk-121': 'https://gcuh.edu.pk/',
  'uni-pk-168': 'https://gcwus.edu.pk/',
  'uni-pk-115': 'https://eum.edu.pk/',
  // Batch 2
  'uni-pk-113': 'https://www.isp.edu.pk/',
  'uni-pk-065': 'https://jmc.edu.pk/',
  'uni-pk-068': 'https://ksa.edu.pk/',
  'uni-pk-159': 'https://kkkuk.edu.pk/',
  'uni-pk-150': 'https://www.kgmc.edu.pk/',
  'uni-pk-164': 'https://www.kust.edu.pk/',
  'uni-pk-133': 'https://kum.edu.pk/',
  'uni-pk-112': 'https://mnsuet.edu.pk/',
  'uni-pk-114': 'https://www.nfciet.edu.pk/',
  'uni-pk-069': 'https://newports.edu.pk/',
  'uni-pk-109': 'https://nmu.edu.pk/',
  'uni-pk-193': 'https://pumhs.edu.pk/',
  'uni-pk-182': 'https://qamc.edu.pk/',
  'uni-pk-034': 'https://qmc.edu.pk/',
  'uni-pk-173': 'https://rcet.uet.edu.pk/',
  'uni-pk-099': 'https://www.rwu.edu.pk/',
  'uni-pk-156': 'https://smcswat.edu.pk/',
  'uni-pk-194': 'https://www.sbbusba.edu.pk/',
  'uni-pk-189': 'https://www.smbbmu.edu.pk/',
  'uni-pk-169': 'https://smcs.edu.pk/',
  // Individual searches
  'uni-pk-196': 'https://www.uobs.edu.pk/',
  'uni-pk-098': 'https://www.uoc.edu.pk/',
  'uni-pk-171': 'https://uchenab.edu.pk/',
  'uni-pk-165': 'https://uoch.edu.pk/',
  // Batch 3 - remaining universities
  'uni-pk-066': 'https://umdc.edu.pk/',
  'uni-pk-152': 'https://uetmardan.edu.pk/',
  'uni-pk-129': 'https://www.uog.edu.pk/',
  'uni-pk-036': 'https://uhe.edu.pk/',
  'uni-pk-178': 'https://www.uojhang.edu.pk/',
  'uni-pk-201': 'https://www.uok.edu.pk/',
  'uni-pk-177': 'https://www.uolayyah.edu.pk/',
  'uni-pk-175': 'https://www.uomianwali.edu.pk/',
  'uni-pk-180': 'https://www.uonarowal.edu.pk/',
  'uni-pk-179': 'https://www.uookara.edu.pk/',
  'uni-pk-199': 'https://www.uop.edu.pk/',
  'uni-pk-176': 'https://www.uosahiwal.edu.pk/',
  'uni-pk-167': 'https://www.uosialkot.edu.pk/',
  'uni-pk-035': 'https://www.usa.edu.pk/',
  'uni-pk-157': 'https://www.uoswabi.edu.pk/',
  'uni-pk-127': 'https://www.uot.edu.pk/',
  'uni-pk-100': 'https://wmc.edu.pk/',
  'uni-pk-111': 'https://www.wum.edu.pk/',
  'uni-pk-198': 'https://www.wuajkb.edu.pk/',
  // German schools
  'sch-de-002': 'https://leibniz-gymnasium-hannover.de/',
  'sch-de-001': 'https://www.max-planck-gymnasium-muenchen.de/',
};

async function main() {
  let updated = 0;
  let skipped = 0;

  for (const [id, website] of Object.entries(websiteUpdates)) {
    try {
      const existing = await prisma.university.findUnique({ where: { id }, select: { website: true } });
      if (existing && existing.website) {
        skipped++;
        continue;
      }
      await prisma.university.update({ where: { id }, data: { website } });
      updated++;
      console.log(`Updated: ${id} → ${website}`);
    } catch (e) {
      console.log(`Failed: ${id} - ${(e as Error).message}`);
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped (already had website)`);
  await prisma.$disconnect();
}

main();
