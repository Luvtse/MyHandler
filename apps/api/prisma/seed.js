const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const COUNTRY_NAME_MAP = {
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
  TR: 'Turkey',
  SG: 'Singapore',
  NL: 'Netherlands',
};

async function backfillAirportCountries() {
  const airports = await prisma.airport.findMany();
  for (const a of airports) {
    const code = String(a.countryCode || a.country || '').toUpperCase();
    const name = COUNTRY_NAME_MAP[code] || a.country || '';
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

async function seedAirport() {
  // === Ethiopian Airports ===
  const ethiopianAirports = [
    { code: 'ADD', city: 'Addis Ababa', name: 'Bole International Airport', type: 'Hub' },
    { code: 'DIR', city: 'Dire Dawa', name: 'Dire Dawa Airport', type: 'Domestic' },
    { code: 'MQX', city: 'Mekelle', name: 'Alula Aba Nega Airport', type: 'Domestic' },
    { code: 'BJR', city: 'Bahir Dar', name: 'Bahir Dar Airport', type: 'Domestic' },
    { code: 'AWA', city: 'Hawassa', name: 'Hawassa Airport', type: 'Domestic' }, // ✅ Corrected from HOR to AWA
    { code: 'JIM', city: 'Jimma', name: 'Abdullahi Yousuf Airport', type: 'Domestic' },
    { code: 'GDQ', city: 'Gondar', name: 'Gondar Airport', type: 'Domestic' },
    { code: 'DSE', city: 'Dessie', name: 'Kombolcha Airport', type: 'Domestic' },
    { code: 'JIJ', city: 'Jijiga', name: 'Jijiga Airport', type: 'Domestic' },
    { code: 'AMH', city: 'Arba Minch', name: 'Arba Minch Airport', type: 'Domestic' },
    { code: 'ASO', city: 'Assosa', name: 'Assosa Airport', type: 'Domestic' },
    { code: 'GMB', city: 'Gambella', name: 'Gambella Airport', type: 'Domestic' },
    { code: 'SZE', city: 'Semera', name: 'Semera Airport', type: 'Domestic' },
  ];

  for (const apt of ethiopianAirports) {
    await prisma.airport.upsert({
      where: { code: apt.code },
      update: {
        city: apt.city,
        name: apt.name,
        type: apt.type,
        processingHours: apt.type === 'Hub' ? 6 : 4,
        businessStart: 9,
        businessEnd: apt.type === 'Hub' ? 18 : 17,
        tzOffset: 3,
        countryCode: 'ET',
        country: 'Ethiopia',
        timezone: 'Africa/Addis_Ababa'
      },
      create: {
        code: apt.code,
        city: apt.city,
        name: apt.name,
        type: apt.type,
        processingHours: apt.type === 'Hub' ? 6 : 4,
        businessStart: 9,
        businessEnd: apt.type === 'Hub' ? 18 : 17,
        tzOffset: 3,
        countryCode: 'ET',
        country: 'Ethiopia',
        timezone: 'Africa/Addis_Ababa'
      }
    });
  }

  // === International Airports ===
  const internationalAirports = [
    { code: 'JFK', city: 'New York', country: 'US', name: 'John F. Kennedy International Airport', tz: 'America/New_York', offset: -5 },
    { code: 'LHR', city: 'London', country: 'GB', name: 'Heathrow Airport', tz: 'Europe/London', offset: 0 },
    { code: 'CDG', city: 'Paris', country: 'FR', name: 'Charles de Gaulle Airport', tz: 'Europe/Paris', offset: 1 },
    { code: 'DXB', city: 'Dubai', country: 'AE', name: 'Dubai International Airport', tz: 'Asia/Dubai', offset: 4 },
    { code: 'NBO', city: 'Nairobi', country: 'KE', name: 'Jomo Kenyatta International Airport', tz: 'Africa/Nairobi', offset: 3 },
    { code: 'JNB', city: 'Johannesburg', country: 'ZA', name: 'O.R. Tambo International Airport', tz: 'Africa/Johannesburg', offset: 2 },
    { code: 'FRA', city: 'Frankfurt', country: 'DE', name: 'Frankfurt Airport', tz: 'Europe/Berlin', offset: 1 },
    { code: 'IST', city: 'Istanbul', country: 'TR', name: 'Istanbul Airport', tz: 'Europe/Istanbul', offset: 3 },
    { code: 'SIN', city: 'Singapore', country: 'SG', name: 'Singapore Changi Airport', tz: 'Asia/Singapore', offset: 8 },
    { code: 'AMS', city: 'Amsterdam', country: 'NL', name: 'Amsterdam Airport Schiphol', tz: 'Europe/Amsterdam', offset: 1 },
    { code: 'MAD', city: 'Madrid', country: 'ES', name: 'Adolfo Suárez Madrid–Barajas Airport', tz: 'Europe/Madrid', offset: 1 },
    { code: 'FCO', city: 'Rome', country: 'IT', name: 'Leonardo da Vinci–Fiumicino Airport', tz: 'Europe/Rome', offset: 1 },
  ];

  for (const apt of internationalAirports) {
    await prisma.airport.upsert({
      where: { code: apt.code },
      update: {
        city: apt.city,
        name: apt.name,
        type: 'Hub',
        processingHours: 6,
        businessStart: 8,
        businessEnd: 19,
        tzOffset: apt.offset,
        countryCode: apt.country,
        country: COUNTRY_NAME_MAP[apt.country],
        timezone: apt.tz
      },
      create: {
        code: apt.code,
        city: apt.city,
        name: apt.name,
        type: 'Hub',
        processingHours: 6,
        businessStart: 8,
        businessEnd: 19,
        tzOffset: apt.offset,
        countryCode: apt.country,
        country: COUNTRY_NAME_MAP[apt.country],
        timezone: apt.tz
      }
    });
  }
}

async function seedRegionalHub() {
  const hubs = [
    // Ethiopia
    { country: 'ET', hubCode: 'ADD' },
    // International
    { country: 'US', hubCode: 'JFK' },
    { country: 'GB', hubCode: 'LHR' },
    { country: 'FR', hubCode: 'CDG' },
    { country: 'AE', hubCode: 'DXB' },
    { country: 'KE', hubCode: 'NBO' },
    { country: 'ZA', hubCode: 'JNB' },
    { country: 'DE', hubCode: 'FRA' },
    { country: 'TR', hubCode: 'IST' },
    { country: 'SG', hubCode: 'SIN' },
    { country: 'NL', hubCode: 'AMS' },
    { country: 'ES', hubCode: 'MAD' },
    { country: 'IT', hubCode: 'FCO' },
  ];

  for (const hub of hubs) {
    await prisma.regionalHub.upsert({
      where: { country_hubCode: { country: hub.country, hubCode: hub.hubCode } },
      update: { priority: 1 },
      create: { country: hub.country, hubCode: hub.hubCode, priority: 1 }
    });
  }
}

async function seedAdminUser() {
  const email = 'admin@lwebapp.local';
  const hashed = bcrypt.hashSync('Admin@12345', 10);
  await prisma.user.upsert({
    where: { email },
    update: {
      name: 'Administrator',
      role: 'admin',
      phone: '+251000000000',
      businessAccountCode: 'ADMIN-0001',
      password: hashed
    },
    create: {
      email,
      password: hashed,
      name: 'Administrator',
      role: 'admin',
      phone: '+251000000000',
      businessAccountCode: 'ADMIN-0001'
    }
  });
}

async function seedServiceLevelSettings() {
  const settings = [
    { airportType: 'Hub', serviceLevel: 'express-domestic', cutoffHour: 16, processingAdjustmentHours: 0 },
    { airportType: 'Hub', serviceLevel: 'express-worldwide', cutoffHour: 16, processingAdjustmentHours: 1 },
    { airportType: 'Hub', serviceLevel: 'priority', cutoffHour: 16, processingAdjustmentHours: 1 },
    { airportType: 'Hub', serviceLevel: 'standard', cutoffHour: 14, processingAdjustmentHours: 0 },
    { airportType: 'Hub', serviceLevel: 'economy', cutoffHour: 13, processingAdjustmentHours: 0 },
    { airportType: 'Domestic', serviceLevel: 'express-domestic', cutoffHour: 14, processingAdjustmentHours: 0 },
    { airportType: 'Domestic', serviceLevel: 'priority', cutoffHour: 14, processingAdjustmentHours: 0 },
    { airportType: 'Domestic', serviceLevel: 'standard', cutoffHour: 12, processingAdjustmentHours: 0 },
    { airportType: 'Domestic', serviceLevel: 'economy', cutoffHour: 11, processingAdjustmentHours: 0 },
    { airportType: 'Regional', serviceLevel: 'express-domestic', cutoffHour: 15, processingAdjustmentHours: 0 },
    { airportType: 'Regional', serviceLevel: 'priority', cutoffHour: 15, processingAdjustmentHours: 0 },
    { airportType: 'Regional', serviceLevel: 'standard', cutoffHour: 13, processingAdjustmentHours: 0 },
    { airportType: 'Regional', serviceLevel: 'economy', cutoffHour: 12, processingAdjustmentHours: 0 },
  ];
  for (const s of settings) {
    await prisma.serviceLevelSettings.upsert({
      where: { airportType_serviceLevel: { airportType: s.airportType, serviceLevel: s.serviceLevel } },
      update: { cutoffHour: s.cutoffHour, processingAdjustmentHours: s.processingAdjustmentHours },
      create: s
    });
  }
}

async function findOrCreateSchedule(data) {
  const existing = await prisma.flightSchedule.findFirst({
    where: {
      originCode: data.originCode,
      destinationCode: data.destinationCode,
      originCity: data.originCity,
      destinationCity: data.destinationCity
    }
  });
  if (existing) {
    await prisma.flightSchedule.update({
      where: { id: existing.id },
      data
    });
  } else {
    await prisma.flightSchedule.create({ data });
  }
}

async function seedFlightSchedules() {
  // === Self-loop schedules for all hubs ===
  const ethiopianHubs = [
    { code: 'ADD', city: 'Addis Ababa', time: '09:00' }
  ];
  const internationalHubs = [
    { code: 'JFK', city: 'New York', time: '08:00' },
    { code: 'LHR', city: 'London', time: '07:00' },
    { code: 'CDG', city: 'Paris', time: '07:00' },
    { code: 'DXB', city: 'Dubai', time: '08:00' },
    { code: 'NBO', city: 'Nairobi', time: '08:00' },
    { code: 'JNB', city: 'Johannesburg', time: '08:00' },
    { code: 'FRA', city: 'Frankfurt', time: '07:00' },
    { code: 'IST', city: 'Istanbul', time: '08:00' },
    { code: 'SIN', city: 'Singapore', time: '09:00' },
    { code: 'AMS', city: 'Amsterdam', time: '07:00' },
    { code: 'MAD', city: 'Madrid', time: '07:00' },
    { code: 'FCO', city: 'Rome', time: '07:00' },
  ];

  for (const hub of [...ethiopianHubs, ...internationalHubs]) {
    await findOrCreateSchedule({
      originCity: hub.city,
      destinationCity: hub.city,
      originCode: hub.code,
      destinationCode: hub.code,
      daysOfWeek: [1, 2, 3, 4, 5, 6, 7],
      dailyFrequency: 1,
      lastDepartureLocal: hub.time,
      flightMinutes: 0
    });
  }

  // === Ethiopian Domestic Routes from ADD ===
  const domesticRoutes = [
    { dest: 'MQX', city: 'Mekelle', flightMin: 90, dep: '15:00', retDep: '11:00' },
    { dest: 'DIR', city: 'Dire Dawa', flightMin: 60, dep: '16:00', retDep: '12:00' },
    { dest: 'BJR', city: 'Bahir Dar', flightMin: 70, dep: '14:00', retDep: '10:00' },
    { dest: 'AWA', city: 'Hawassa', flightMin: 50, dep: '17:00', retDep: '13:00' }, // ✅ AWA
    { dest: 'JIM', city: 'Jimma', flightMin: 65, dep: '13:30', retDep: '09:30' },
    { dest: 'GDQ', city: 'Gondar', flightMin: 80, dep: '12:00', retDep: '08:00' },
    { dest: 'DSE', city: 'Dessie', flightMin: 75, dep: '14:30', retDep: '10:30' },
    { dest: 'JIJ', city: 'Jijiga', flightMin: 85, dep: '11:00', retDep: '07:00' },
    { dest: 'AMH', city: 'Arba Minch', flightMin: 75, dep: '14:30', retDep: '10:30' },
    { dest: 'ASO', city: 'Assosa', flightMin: 90, dep: '10:30', retDep: '06:30' },
    { dest: 'GMB', city: 'Gambella', flightMin: 90, dep: '12:30', retDep: '08:30' },
    { dest: 'SZE', city: 'Semera', flightMin: 95, dep: '10:00', retDep: '06:00' },
  ];

  for (const r of domesticRoutes) {
    // ADD → Domestic
    await findOrCreateSchedule({
      originCity: 'Addis Ababa',
      destinationCity: r.city,
      originCode: 'ADD',
      destinationCode: r.dest,
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      dailyFrequency: 2,
      lastDepartureLocal: r.dep,
      flightMinutes: r.flightMin
    });
    // Domestic → ADD
    await findOrCreateSchedule({
      originCity: r.city,
      destinationCity: 'Addis Ababa',
      originCode: r.dest,
      destinationCode: 'ADD',
      daysOfWeek: [1, 2, 3, 4, 5, 6],
      dailyFrequency: 2,
      lastDepartureLocal: r.retDep,
      flightMinutes: r.flightMin
    });
  }

  // === International Routes from ADD ===
  const intlRoutes = [
    { to: 'JFK', city: 'New York', days: [2, 5], retDays: [3, 6], out: 840, back: 780, dep: '22:00', retDep: '18:00' },
    { to: 'LHR', city: 'London', days: [1, 3, 5], retDays: [2, 4, 6], out: 450, back: 480, dep: '23:00', retDep: '19:00' },
    { to: 'CDG', city: 'Paris', days: [2, 4, 6], retDays: [1, 3, 5], out: 430, back: 460, dep: '22:30', retDep: '18:30' },
    { to: 'DXB', city: 'Dubai', days: [1,2,3,4,5,6,7], retDays: [1,2,3,4,5,6,7], out: 270, back: 280, dep: '21:00', retDep: '17:00' },
    { to: 'NBO', city: 'Nairobi', days: [1,3,5,7], retDays: [2,4,6], out: 150, back: 160, dep: '20:00', retDep: '16:00' },
    { to: 'JNB', city: 'Johannesburg', days: [2,4,6], retDays: [1,3,5], out: 300, back: 310, dep: '19:30', retDep: '15:30' },
    { to: 'FRA', city: 'Frankfurt', days: [2,5], retDays: [3,6], out: 440, back: 470, dep: '22:45', retDep: '18:45' },
    { to: 'IST', city: 'Istanbul', days: [1,3,5,7], retDays: [2,4,6], out: 330, back: 340, dep: '20:30', retDep: '16:30' },
    { to: 'SIN', city: 'Singapore', days: [2,6], retDays: [3,7], out: 600, back: 620, dep: '23:30', retDep: '19:30' },
    { to: 'AMS', city: 'Amsterdam', days: [2,4,6], retDays: [1,3,5], out: 460, back: 490, dep: '22:15', retDep: '18:15' },
  ];

  for (const r of intlRoutes) {
    await findOrCreateSchedule({
      originCity: 'Addis Ababa',
      destinationCity: r.city,
      originCode: 'ADD',
      destinationCode: r.to,
      daysOfWeek: r.days,
      dailyFrequency: 1,
      lastDepartureLocal: r.dep,
      flightMinutes: r.out
    });
    await findOrCreateSchedule({
      originCity: r.city,
      destinationCity: 'Addis Ababa',
      originCode: r.to,
      destinationCode: 'ADD',
      daysOfWeek: r.retDays,
      dailyFrequency: 1,
      lastDepartureLocal: r.retDep,
      flightMinutes: r.back
    });
  }
}

async function seedOperatingCalendar() {
  const today = new Date();
  const inSevenDays = new Date(today);
  inSevenDays.setDate(inSevenDays.getDate() + 7);
  const nextMonth = new Date(today);
  nextMonth.setMonth(nextMonth.getMonth() + 1);

  await prisma.operatingCalendar.createMany({
    data: [
      { country: 'ET', city: 'Addis Ababa', airportCode: 'ADD', date: inSevenDays, name: 'Local Holiday', closedAllDay: true },
      { country: 'US', city: 'New York', airportCode: 'JFK', date: nextMonth, name: 'Federal Holiday', closedAllDay: true },
      { country: 'GB', city: 'London', airportCode: 'LHR', date: nextMonth, name: 'Bank Holiday', closedAllDay: true },
      { country: 'KE', city: 'Nairobi', airportCode: 'NBO', date: inSevenDays, name: 'Madaraka Day Observed', closedAllDay: true },
      { country: 'TR', city: 'Istanbul', airportCode: 'IST', date: nextMonth, name: 'National Holiday', closedAllDay: true },
    ],
    skipDuplicates: true
  });
}

async function main() {
  console.log('🚀 Starting full data seeding...');
  await seedAirport();
  console.log('✅ Airports seeded');
  await seedRegionalHub();
  console.log('✅ Regional hubs seeded');
  await seedAdminUser();
  console.log('✅ Admin user seeded');
  await seedServiceLevelSettings();
  console.log('✅ Service level settings seeded');
  await seedFlightSchedules();
  console.log('✅ Flight schedules seeded');
  await seedOperatingCalendar();
  console.log('✅ Operating calendar seeded');
  await backfillAirportCountries();
  console.log('✅ Airport country backfill completed');
  console.log('🎉 All seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });