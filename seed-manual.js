const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting manual database seed...');

  // Create business settings
  console.log('📋 Creating business settings...');
  await prisma.businessSettings.upsert({
    where: { id: "1" },
    update: {},
    create: {
      timezone: 'America/Toronto',
      defaultBufferMins: 30,
      depositPct: 50,
      taxRate: 0.13,
      address: '123 Dog Street, Toronto, ON M5V 3A8',
      contactEmail: 'BeautifulSoulsPetBoarding@hotmail.com',
      contactPhone: '(647) 986-4106',
      businessName: 'Beautiful Souls Boarding',
    },
  });

  // Create admin user
  console.log('👤 Creating admin user...');
  await prisma.user.upsert({
    where: { email: 'admin@beautifulsoulsboarding.com' },
    update: {},
    create: {
      role: 'ADMIN',
      name: 'Admin User',
      email: 'admin@beautifulsoulsboarding.com',
      phone: '+1 (647) 986-4106',
      address: '123 Dog Street, Toronto, ON M5V 3A8',
    },
  });

  // Create client user
  console.log('👤 Creating demo client...');
  await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      role: 'CLIENT',
      name: 'Demo Client',
      email: 'demo@example.com',
      phone: '+1 (416) 555-0124',
      address: '456 Pet Avenue, Toronto, ON M4W 1A1',
    },
  });

  // Create services
  console.log('🐕 Creating services...');
  const services = [
    {
      type: 'BOARDING',
      name: 'Overnight Boarding',
      description: 'Your dog stays overnight at our facility with 24/7 care, love, and attention',
      basePriceCents: 6200, // $62.00 per night
      capacity: 10,
      bufferMins: 60,
      durationMins: null, // Variable duration
    },
    {
      type: 'DAYCARE',
      name: 'Daycare',
      description: 'Daytime care and socialization for your dog while you work',
      basePriceCents: 4500, // $45.00 per day
      capacity: 15,
      bufferMins: 30,
      durationMins: null, // Variable duration
    },
  ];

  for (const service of services) {
    await prisma.service.upsert({
      where: { type: service.type },
      update: service,
      create: service,
    });
  }

  // Create availability rules
  console.log('📅 Creating availability rules...');
  const availabilityRules = [
    // Monday to Friday
    { dayOfWeek: 1, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 2, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 3, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 4, startTime: '08:00', endTime: '18:00' },
    { dayOfWeek: 5, startTime: '08:00', endTime: '18:00' },
    // Saturday
    { dayOfWeek: 6, startTime: '09:00', endTime: '17:00' },
    // Sunday
    { dayOfWeek: 0, startTime: '10:00', endTime: '16:00' },
  ];

  for (const rule of availabilityRules) {
    try {
      await prisma.availabilityRule.create({
        data: rule,
      });
      console.log(`✅ Created availability rule for day ${rule.dayOfWeek}`);
    } catch (error) {
      if (error.code === 'P2002') {
        console.log(`⚠️ Availability rule for day ${rule.dayOfWeek} already exists`);
      } else {
        console.log(`⚠️ Error creating rule for day ${rule.dayOfWeek}:`, error.message);
      }
    }
  }

  console.log('✅ Database seeded successfully!');
  console.log('🎉 Melissa can now access services and availability data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
