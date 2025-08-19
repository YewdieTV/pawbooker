import { PrismaClient, ServiceType, UserRole } from '@prisma/client';
import { addDays, addHours } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create business settings
  await prisma.businessSettings.upsert({
    where: { id: 'singleton' },
    update: {},
    create: {
      id: 'singleton',
      timezone: 'America/Toronto',
      defaultBufferMins: 30,
      depositPct: 50,
      taxRate: 0.13,
      address: '123 Dog Street, Toronto, ON M5V 3A8',
      contactEmail: 'hello@pawbooker.com',
      contactPhone: '+1 (416) 555-0123',
      businessName: 'PawBooker Dog Services',
    },
  });

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@pawbooker.com' },
    update: {},
    create: {
      email: 'admin@pawbooker.com',
      name: 'Admin User',
      role: UserRole.ADMIN,
      phone: '+1 (416) 555-0123',
      address: '123 Dog Street, Toronto, ON M5V 3A8',
    },
  });

  // Create demo client user
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      name: 'Demo Client',
      role: UserRole.CLIENT,
      phone: '+1 (416) 555-0124',
      address: '456 Pet Avenue, Toronto, ON M4W 1A1',
    },
  });

  // Create services
  const services = [
    {
      type: ServiceType.BOARDING,
      name: 'Overnight Boarding',
      description: 'Your dog stays overnight at our facility with 24/7 care',
      basePriceCents: 8000, // $80.00
      capacity: 3,
      bufferMins: 60,
      durationMins: null, // Variable duration
    },
    {
      type: ServiceType.DAYCARE,
      name: 'Daycare',
      description: 'Daytime care and socialization for your dog',
      basePriceCents: 5000, // $50.00
      capacity: 5,
      bufferMins: 30,
      durationMins: null, // Variable duration
    },
    {
      type: ServiceType.WALK_30,
      name: '30-Minute Walk',
      description: 'A refreshing 30-minute walk around the neighborhood',
      basePriceCents: 2500, // $25.00
      capacity: 3,
      bufferMins: 15,
      durationMins: 30,
    },
    {
      type: ServiceType.WALK_60,
      name: '60-Minute Walk',
      description: 'An extended 60-minute walk with extra exercise',
      basePriceCents: 4000, // $40.00
      capacity: 2,
      bufferMins: 15,
      durationMins: 60,
    },
    {
      type: ServiceType.DROPIN_30,
      name: '30-Minute Drop-in Visit',
      description: 'Quick check-in, feeding, and bathroom break',
      basePriceCents: 2000, // $20.00
      capacity: 1,
      bufferMins: 15,
      durationMins: 30,
    },
    {
      type: ServiceType.DROPIN_45,
      name: '45-Minute Drop-in Visit',
      description: 'Extended visit with playtime and care',
      basePriceCents: 3000, // $30.00
      capacity: 1,
      bufferMins: 15,
      durationMins: 45,
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { type: service.type },
      update: service,
      create: service,
    });
  }

  // Create availability rules (Monday to Friday, 8 AM to 6 PM)
  const availabilityRules = [
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' }, // Monday
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' }, // Tuesday
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' }, // Wednesday
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' }, // Thursday
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' }, // Friday
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' }, // Saturday (shorter hours)
  ];

  for (const rule of availabilityRules) {
    await prisma.availabilityRule.upsert({
      where: {
        id: `rule-${rule.dayOfWeek}`,
      },
      update: rule,
      create: {
        id: `rule-${rule.dayOfWeek}`,
        ...rule,
      },
    });
  }

  // Create some blackout dates (holidays, vacation)
  const today = new Date();
  const blackouts = [
    {
      id: 'christmas-2024',
      startDateTime: new Date('2024-12-24T00:00:00-05:00'),
      endDateTime: new Date('2024-12-26T23:59:59-05:00'),
      reason: 'Christmas Holiday',
    },
    {
      id: 'vacation-summer',
      startDateTime: addDays(today, 60),
      endDateTime: addDays(today, 67),
      reason: 'Summer Vacation',
    },
  ];

  for (const blackout of blackouts) {
    await prisma.blackout.upsert({
      where: { id: blackout.id },
      update: blackout,
      create: blackout,
    });
  }

  // Create demo pets
  const pets = [
    {
      id: 'pet-1',
      ownerId: clientUser.id,
      name: 'Buddy',
      breed: 'Golden Retriever',
      weightKg: 30,
      ageYears: 4,
      vaccinationsUrl: ['https://example.com/buddy-vaccinations.pdf'],
      notes: 'Very friendly, loves treats',
      aggressive: false,
      specialCare: false,
    },
    {
      id: 'pet-2',
      ownerId: clientUser.id,
      name: 'Luna',
      breed: 'Border Collie',
      weightKg: 22,
      ageYears: 2,
      vaccinationsUrl: ['https://example.com/luna-vaccinations.pdf'],
      notes: 'High energy, needs lots of exercise',
      aggressive: false,
      specialCare: true,
    },
  ];

  for (const pet of pets) {
    await prisma.pet.upsert({
      where: { id: pet.id },
      update: pet,
      create: pet,
    });
  }

  // Create some demo bookings
  const boardingService = await prisma.service.findFirst({
    where: { type: ServiceType.BOARDING },
  });
  const walkService = await prisma.service.findFirst({
    where: { type: ServiceType.WALK_30 },
  });

  if (boardingService && walkService) {
    await prisma.booking.upsert({
      where: { id: 'booking-1' },
      update: {},
      create: {
        id: 'booking-1',
        clientId: clientUser.id,
        petId: 'pet-1',
        serviceId: boardingService.id,
        startDateTime: addDays(today, 7),
        endDateTime: addDays(today, 9),
        status: 'CONFIRMED',
        priceCents: boardingService.basePriceCents * 2, // 2 nights
        notes: 'First time boarding',
      },
    });

    await prisma.booking.upsert({
      where: { id: 'booking-2' },
      update: {},
      create: {
        id: 'booking-2',
        clientId: clientUser.id,
        petId: 'pet-2',
        serviceId: walkService.id,
        startDateTime: addDays(addHours(today, 14), 3), // 3 days from now at 2 PM
        endDateTime: addDays(addHours(today, 14.5), 3), // 30 minutes later
        status: 'CONFIRMED',
        priceCents: walkService.basePriceCents,
        notes: 'Regular walk',
      },
    });
  }

  console.log('Database seeded successfully!');
  console.log('Admin user:', adminUser.email);
  console.log('Demo client:', clientUser.email);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
