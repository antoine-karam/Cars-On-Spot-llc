import { PrismaClient, CompanyUserStatus, RateType, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Create Company
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-texas' },
    update: {},
    create: {
      id: 'demo-company-texas',
      name: 'Demo Limo Texas',
      timezone: 'America/Chicago',
    },
  })
  console.log('✅ Created company:', company.name)

  // Create Admin User
  const adminUser = await prisma.user.upsert({
    where: { idpSubject: 'keycloak-admin-demo-123' },
    update: {},
    create: {
      idpSubject: 'keycloak-admin-demo-123',
      email: 'admin@demolimotexas.com',
      fullName: 'Admin User',
      phone: '+1-555-0100',
    },
  })
  console.log('✅ Created admin user:', adminUser.email)

  // Create CompanyUser membership
  const companyUser = await prisma.companyUser.upsert({
    where: {
      companyId_userId: {
        companyId: company.id,
        userId: adminUser.id,
      },
    },
    update: {
      status: CompanyUserStatus.ACTIVE,
    },
    create: {
      companyId: company.id,
      userId: adminUser.id,
      status: CompanyUserStatus.ACTIVE,
    },
  })
  console.log('✅ Created company membership')

  // Create Driver Profile for admin
  await prisma.driverProfile.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      active: true,
    },
  })
  console.log('✅ Created driver profile')

  // Create Vehicles
  const vehicles = [
    {
      id: 'vehicle-sedan-1',
      name: 'Luxury Sedan',
      make: 'Lincoln',
      model: 'Continental',
      year: 2023,
      capacity: 4,
      luggageCapacity: 2,
      childSeatCapable: true,
    },
    {
      id: 'vehicle-suv-1',
      name: 'Premium SUV',
      make: 'Cadillac',
      model: 'Escalade',
      year: 2024,
      capacity: 7,
      luggageCapacity: 4,
      childSeatCapable: true,
    },
    {
      id: 'vehicle-van-1',
      name: 'Executive Van',
      make: 'Mercedes-Benz',
      model: 'Sprinter',
      year: 2023,
      capacity: 12,
      luggageCapacity: 8,
      childSeatCapable: true,
    },
  ]

  for (const vehicleData of vehicles) {
    const vehicle = await prisma.vehicle.upsert({
      where: { id: vehicleData.id },
      update: {},
      create: {
        ...vehicleData,
        companyId: company.id,
        active: true,
      },
    })
    console.log(`✅ Created vehicle: ${vehicle.name}`)

    // Create current VehicleRate for each vehicle
    const rate = await prisma.vehicleRate.create({
      data: {
        companyId: company.id,
        vehicleId: vehicle.id,
        rateType: RateType.PER_MILE,
        pricePerMile: new Prisma.Decimal(
          vehicleData.capacity <= 4 ? '3.50' : vehicleData.capacity <= 7 ? '4.50' : '5.50'
        ),
        effectiveFrom: new Date(),
        effectiveTo: null, // Current rate
      },
    })
    console.log(`✅ Created rate for ${vehicle.name}: $${rate.pricePerMile}/mile`)
  }

  // Create a sample historical rate (to demonstrate rate history)
  const sedan = await prisma.vehicle.findUnique({
    where: { id: 'vehicle-sedan-1' },
  })

  if (sedan) {
    const pastDate = new Date()
    pastDate.setMonth(pastDate.getMonth() - 3)

    await prisma.vehicleRate.create({
      data: {
        companyId: company.id,
        vehicleId: sedan.id,
        rateType: RateType.PER_MILE,
        pricePerMile: new Prisma.Decimal('3.00'),
        effectiveFrom: pastDate,
        effectiveTo: new Date(Date.now() - 86400000), // Yesterday
      },
    })
    console.log('✅ Created historical rate example')
  }

  console.log('🎉 Seed completed successfully!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
