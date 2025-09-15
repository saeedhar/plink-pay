import { PrismaClient } from '@prisma/client';

const db = new PrismaClient();

async function main() {
  const seed = [
    { category:'purpose_of_account', label:'Receiving payments', order:1, locale:'en' },
    { category:'purpose_of_account', label:'Paying suppliers', order:2, locale:'en' },
    { category:'business_activity',  label:'Retail trade', order:1, locale:'en' },
    { category:'annual_revenue',     label:'Less than $100K', order:1, locale:'en' },
  ];
  
  for (const s of seed) {
    await db.kybOption.upsert({
      where: { id: `${s.category}_${s.label}` }, // temporary key (not used later)
      update: {},
      create: { ...s, id: `${s.category}_${s.label}` }
    });
  }
}

main().finally(() => db.$disconnect());
