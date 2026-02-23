const mongoose = require('mongoose');
const { Car, OwnerDetail, EmergencyContact, UserDetail, Insurance, RCBook, Fine, DrivingData, SafetyLog } = require('../models/Car');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital-drive-assistant';

async function run() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to', MONGO_URI);

  // Create test car
  const car = new Car({ car_id: 'CAR_TEST_1', number_plate: 'TEST-123', secret_code: 'abc123' });
  await car.save();
  console.log('Saved Car:', car.number_plate);

  // Owner
  const owner = new OwnerDetail({ car_id: car.car_id, owner_id: 'USER_TEST_1', name: 'Test Owner', contact: '9999999999' });
  await owner.save();
  console.log('Saved OwnerDetail');

  // Insurance
  const ins = new Insurance({ car_id: car.car_id, policyNumber: 'POL123', validity: new Date(Date.now()+1000*60*60*24*365) });
  await ins.save();
  console.log('Saved Insurance');

  // RC Book (immutable fields)
  const rc = new RCBook({ car_id: car.car_id, registrationDate: new Date(), image: 'data:image/png;base64,TEST' });
  await rc.save();
  console.log('Saved RCBook');

  // Driving data
  const dd = new DrivingData({ car_id: car.car_id, speed: 10, kilometers: 100 });
  await dd.save();
  console.log('Saved DrivingData');

  // Fine
  const fine = new Fine({ car_id: car.car_id, type: 'Speed', amount: 500, description: 'Test fine' });
  await fine.save();
  console.log('Saved Fine');

  // Safety logs
  const sl = new SafetyLog({ car_id: car.car_id, emotion_alerts: [{ event: 'yawn' }], drowsiness_events: [] });
  await sl.save();
  console.log('Saved SafetyLog');

  // Query back
  const loadedCar = await Car.findOne({ car_id: 'CAR_TEST_1' });
  console.log('Loaded car:', loadedCar.number_plate);

  await mongoose.disconnect();
  console.log('Disconnected');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});