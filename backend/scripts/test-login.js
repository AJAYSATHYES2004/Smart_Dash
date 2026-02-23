require('dotenv').config();
const mongoose = require('mongoose');
const { Car } = require('../models/Car');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital-drive-assistant';

async function testLogin() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Test query
    const cars = await Car.find();
    console.log('Total cars in database:', cars.length);
    
    cars.forEach(car => {
      console.log(`\nCar: ${car.number_plate}`);
      console.log(`  Secret code: ${car.secret_code}`);
    });

    // Test login with first car
    if (cars.length > 0) {
      const firstCar = cars[0];
      const plate = firstCar.number_plate;
      const code = firstCar.secret_code;
      
      console.log(`\n\nTesting login with: ${plate} / ${code}`);
      
      const found = await Car.findOne({ number_plate: { $regex: new RegExp(`^${plate}$`, 'i') } });
      if (found) {
        console.log('✓ Car found');
        if (found.secret_code === code) {
          console.log('✓ Secret code matches');
        } else {
          console.log(`✗ Secret code mismatch: expected "${code}", got "${found.secret_code}"`);
        }
      } else {
        console.log('✗ Car not found');
      }
    }

    await mongoose.connection.close();
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

testLogin();
