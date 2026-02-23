/**
 * Migration script to normalize legacy car documents.
 * Usage: node backend/scripts/migrate-car-schema.js
 * Ensure MONGO_URI is set in env or defaults to mongodb://localhost:27017/digital-drive-assistant
 */
const mongoose = require('mongoose');
const Car = require('../models/Car');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital-drive-assistant';

async function migrate() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB:', MONGO_URI);

  const cars = await Car.find({});
  console.log(`Found ${cars.length} cars`);

  let changed = 0;
  for (const car of cars) {
    let modified = false;

    // Ensure car_details object
    car.car_details = car.car_details || {};

    // insurance string -> object
    if (car.car_details && (typeof car.car_details.insurance === 'string' || typeof car.car_details.insurance === 'number')) {
      car.car_details.insurance = { policyNumber: String(car.car_details.insurance) };
      modified = true;
    }

    // rc_book string -> object
    if (car.car_details && (typeof car.car_details.rc_book === 'string' || typeof car.car_details.rc_book === 'number')) {
      car.car_details.rc_book = { image: String(car.car_details.rc_book) };
      modified = true;
    }

    // fine_details -> array
    if (!Array.isArray(car.fine_details)) {
      if (car.fine_details == null) {
        car.fine_details = [];
        modified = true;
      } else if (typeof car.fine_details === 'string' || typeof car.fine_details === 'number') {
        const amount = Number(car.fine_details);
        car.fine_details = [{ amount: isNaN(amount) ? 0 : amount, description: '', date: car.updatedAt || new Date() }];
        modified = true;
      } else if (typeof car.fine_details === 'object') {
        car.fine_details = [car.fine_details];
        modified = true;
      }
    }

    // users -> array
    if (!Array.isArray(car.users)) {
      if (car.users == null) {
        car.users = [];
        modified = true;
      } else if (typeof car.users === 'object') {
        car.users = [car.users];
        modified = true;
      }
    }

    // safety_logs arrays
    car.safety_logs = car.safety_logs || {};
    if (!Array.isArray(car.safety_logs.emotion_alerts)) {
      car.safety_logs.emotion_alerts = Array.isArray(car.safety_logs.emotion_alerts) ? car.safety_logs.emotion_alerts : [];
      modified = true;
    }
    if (!Array.isArray(car.safety_logs.drowsiness_events)) {
      car.safety_logs.drowsiness_events = Array.isArray(car.safety_logs.drowsiness_events) ? car.safety_logs.drowsiness_events : [];
      modified = true;
    }

    if (modified) {
      try {
        await car.save();
        changed++;
        console.log(`Updated car ${car.number_plate || car.car_id}`);
      } catch (err) {
        console.error('Failed to save car', car._id, err.message);
      }
    }
  }

  console.log(`Migration complete. Documents changed: ${changed}`);
  await mongoose.disconnect();
  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
