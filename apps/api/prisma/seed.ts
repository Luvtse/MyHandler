import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const COUNTRY_NAME_MAP: Record<string, string> = {
  ET: 'Ethiopia',
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  KE: 'Kenya',
  AE: 'United Arab Emirates',
  ZA: 'South Africa',
  FR: 'France',
  DE: 'Germany',
  CN: 'China',
  JP: 'Japan',
  IN: 'India',
  BR: 'Brazil',
  RU: 'Russia',
  AU: 'Australia',
  IT: 'Italy',
  ES: 'Spain',
};

async function backfillAirportCountries() {
  const airports = await prisma.airport.findMany();
  for (const a of airports as any[]) {
    const code: string = (a.countryCode || a.country || '').toUpperCase();
    const name: string = COUNTRY_NAME_MAP[code] || a.country || '';
    if (!code) continue;
    await prisma.airport.update({
      where: { code: a.code },
      data: {
        countryCode: code,
        country: name || code,
      },
    });
  }
}

async function main() {
  await backfillAirportCountries();
  console.log('Backfilled Airport.country from country codes');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

