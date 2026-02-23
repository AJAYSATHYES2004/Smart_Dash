/**
 * Seed script to populate database with test data
 * Usage: node backend/scripts/seed-db.js
 * Set MONGO_URI env var if needed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const {
  Car,
  OwnerDetail,
  Insurance,
  RCBook,
  Fine,
  DrivingData,
  SafetyLog,
  UserDetail,
  EmergencyContact
} = require('../models/Car');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital-drive-assistant';

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('Connected to MongoDB:', MONGO_URI);

    // Clear existing data
    console.log('Clearing existing data...');
    await Car.deleteMany({});
    await OwnerDetail.deleteMany({});
    await Insurance.deleteMany({});
    await RCBook.deleteMany({});
    await Fine.deleteMany({});
    await DrivingData.deleteMany({});
    await SafetyLog.deleteMany({});
    await UserDetail.deleteMany({});
    await EmergencyContact.deleteMany({});
    console.log('✓ Database cleared');

    // Create test car 1
    const car1 = await Car.create({
      car_id: 'CAR_TEST_001',
      number_plate: 'DL-01-AB-1234',
      secret_code: 'secret123',
      engine_number: 'EN-2021-001234'
    });
    console.log('✓ Created car:', car1.number_plate);

    // Owner details for car 1
    const owner1 = await OwnerDetail.create({
      car_id: car1.car_id,
      owner_id: 'USER_001',
      name: 'Ajay Sathyesh',
      contact: '8190035105',
      proof_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });
    console.log('✓ Created owner details');

    // Insurance for car 1
    const insurance1 = await Insurance.create({
      car_id: car1.car_id,
      policyNumber: 'POL-DL-2024-001',
      validity: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      providerName: 'State Bank Insurance',
      premium: 18500,
      coverageAmount: 1500000
    });
    console.log('✓ Created insurance');

    // RC Book for car 1
    const rcbook1 = await RCBook.create({
      car_id: car1.car_id,
      registrationDate: new Date('2022-05-15'),
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });
    console.log('✓ Created RC book');

    // Driving data for car 1
    const driving1 = await DrivingData.create({
      car_id: car1.car_id,
      speed: 45,
      kilometers: 12500,
      petrol: 75,
      oil: 80
    });
    console.log('✓ Created driving data');

    // Fines for car 1
    const fine1 = await Fine.create({
      car_id: car1.car_id,
      type: 'Speed Violation',
      amount: 500,
      description: 'Exceeded speed limit in school zone',
      date: new Date('2026-01-15')
    });
    const fine2 = await Fine.create({
      car_id: car1.car_id,
      type: 'Parking Violation',
      amount: 300,
      description: 'Parked in no-parking zone',
      date: new Date('2026-02-05')
    });
    console.log('✓ Created fines');

    // Safety logs for car 1
    const safety1 = await SafetyLog.create({
      car_id: car1.car_id,
      emotion_alerts: [
        { timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), emotion: 'drowsy', confidence: 0.85 },
        { timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), emotion: 'alert', confidence: 0.95 }
      ],
      drowsiness_events: [
        { timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), level: 'moderate', duration: 45 }
      ]
    });
    console.log('✓ Created safety logs');

    // User details for car 1
    const user1 = await UserDetail.create({
      car_id: car1.car_id,
      user_id: 'USER_001',
      name: 'Ajay Sathyesh',
      license_no: 'DL-0920240001234',
      role: 'owner',
      face_data: 'face_descriptor_base64_here'
    });
    const user2 = await UserDetail.create({
      car_id: car1.car_id,
      user_id: 'USER_002',
      name: 'Ramesh Kumar',
      license_no: 'DL-0920240002345',
      role: 'driver',
      face_data: 'face_descriptor_base64_here'
    });
    console.log('✓ Created user details');

    // Emergency contact for car 1
    const emergency1 = await EmergencyContact.create({
      car_id: car1.car_id,
      name: 'Priya Sathyesh',
      phone: '9876543210',
      relation: 'Spouse'
    });
    console.log('✓ Created emergency contact');

    // ===== Create test car 2 =====
    const car2 = await Car.create({
      car_id: 'CAR_TEST_002',
      number_plate: 'MH-02-CD-5678',
      secret_code: 'secret456',
      engine_number: 'EN-2022-005678'
    });
    console.log('✓ Created car 2:', car2.number_plate);

    // Owner details for car 2
    await OwnerDetail.create({
      car_id: car2.car_id,
      owner_id: 'USER_003',
      name: 'Rahul Sharma',
      contact: '9988776655',
      proof_image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });

    // Insurance for car 2
    await Insurance.create({
      car_id: car2.car_id,
      policyNumber: 'POL-MH-2024-002',
      validity: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months (expiring soon)
      providerName: 'HDFC Insurance',
      premium: 20000,
      coverageAmount: 2000000
    });

    // RC Book for car 2
    await RCBook.create({
      car_id: car2.car_id,
      registrationDate: new Date('2023-08-20'),
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
    });

    // Driving data for car 2
    await DrivingData.create({
      car_id: car2.car_id,
      speed: 60,
      kilometers: 25000,
      petrol: 50,
      oil: 70
    });

    // Safety logs for car 2
    await SafetyLog.create({
      car_id: car2.car_id,
      emotion_alerts: [],
      drowsiness_events: []
    });

    console.log('✓ Created car 2 with all details');

    console.log('\n✅ Database seeded successfully!');
    console.log('\nTest credentials:');
    console.log('  Car 1: DL-01-AB-1234 / secret123');
    console.log('  Car 2: MH-02-CD-5678 / secret456');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
}

seedDatabase();
