const express = require('express');
const router = express.Router();
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

const ADMIN_KEY = process.env.ADMIN_KEY || 'admin-secret';

async function aggregateCarByPlate(plate) {
  const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${plate}$`, 'i') } });
  if (!car) return null;

  const car_id = car.car_id;

  const [owner, insurance, rcbook, fines, driving, safety, users, emergency] = await Promise.all([
    OwnerDetail.findOne({ car_id }),
    Insurance.findOne({ car_id }),
    RCBook.findOne({ car_id }),
    Fine.find({ car_id }),
    DrivingData.findOne({ car_id }),
    SafetyLog.findOne({ car_id }),
    UserDetail.find({ car_id }),
    EmergencyContact.findOne({ car_id })
  ]);

  return {
    car_id: car.car_id,
    number_plate: car.number_plate,
    secret_code: car.secret_code,
    owner_details: owner || {},
    car_details: {
      engine_number: car.engine_number || null,
      insurance: insurance || {},
      rc_book: rcbook || {}
    },
    users: users || [],
    fine_details: fines || [],
    driving_data: driving || { speed: 0, kilometers: 0, petrol: 0, oil: 0 },
    safety_logs: safety || { emotion_alerts: [], drowsiness_events: [] },
    emergency_contact: emergency || {}
  };
}

// Register a new Car (and optional related documents) - uses transaction
router.post('/register', async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const { car, owner, insurance, rc_book } = req.body; // expect nested payload optionally

    if (!car || !car.car_id || !car.number_plate || !car.secret_code) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ msg: 'Missing required car fields' });
    }

    const createdCar = await Car.create([car], { session });

    if (owner) {
      owner.car_id = car.car_id;
      await OwnerDetail.create([owner], { session });
    }

    if (insurance) {
      insurance.car_id = car.car_id;
      await Insurance.create([insurance], { session });
    }

    if (rc_book) {
      rc_book.car_id = car.car_id;
      // Ensure registrationDate is present
      if (!rc_book.registrationDate) {
        rc_book.registrationDate = new Date();
      }
      await RCBook.create([rc_book], { session });
    }

    await session.commitTransaction();
    session.endSession();

    const aggregated = await aggregateCarByPlate(car.number_plate);
    res.json(aggregated);
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Login to Car
router.post('/login', async (req, res) => {
  const { numberPlate, secretCode } = req.body;
  try {
    const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${numberPlate}$`, 'i') } });
    if (!car) return res.status(400).json({ msg: 'Invalid Car Credentials (Plate)' });
    if (car.secret_code !== secretCode) return res.status(400).json({ msg: 'Invalid Car Credentials (Code)' });
    const aggregated = await aggregateCarByPlate(car.number_plate);
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Get Car Details (aggregated)
router.get('/:plate', async (req, res) => {
  try {
    const aggregated = await aggregateCarByPlate(req.params.plate);
    if (!aggregated) return res.status(404).json({ msg: 'Car not found' });
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Add Fine
router.post('/:plate/fine', async (req, res) => {
  try {
    const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } });
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    const fine = req.body;
    fine.car_id = car.car_id;
    await Fine.create(fine);

    const aggregated = await aggregateCarByPlate(req.params.plate);
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Pay Fine (Delete or Mark as Paid)
router.post('/:plate/fine/:fineId/pay', async (req, res) => {
  try {
    const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } });
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    // Mark fine as paid
    const result = await Fine.findByIdAndUpdate(req.params.fineId, { status: 'paid' }, { new: true });

    if (!result) return res.status(404).json({ msg: 'Fine not found' });

    const aggregated = await aggregateCarByPlate(req.params.plate);
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update Driving Data / Safety Logs
router.post('/:plate/update', async (req, res) => {
  try {
    const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } });
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    const car_id = car.car_id;
    if (req.body.driving_data) {
      await DrivingData.findOneAndUpdate({ car_id }, { $set: req.body.driving_data }, { upsert: true });
    }
    if (req.body.safety_logs) {
      const logs = req.body.safety_logs;
      const existing = await SafetyLog.findOne({ car_id });
      if (!existing) {
        await SafetyLog.create({ car_id, ...logs });
      } else {
        if (Array.isArray(logs.emotion_alerts) && logs.emotion_alerts.length) {
          existing.emotion_alerts.push(...logs.emotion_alerts);
        }
        if (Array.isArray(logs.drowsiness_events) && logs.drowsiness_events.length) {
          existing.drowsiness_events.push(...logs.drowsiness_events);
        }
        if (Array.isArray(logs.distraction_events) && logs.distraction_events.length) {
          existing.distraction_events.push(...logs.distraction_events);
        }
        if (logs.monitor_active !== undefined) {
          existing.monitor_active = logs.monitor_active;
        }
        await existing.save();
      }
    }

    const aggregated = await aggregateCarByPlate(req.params.plate);
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Update Car Details (owner and basic car fields)
router.put('/:plate/details', async (req, res) => {
  try {
    const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } });
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    const { owner_details, car_details } = req.body;
    const car_id = car.car_id;

    if (owner_details) {
      owner_details.car_id = car_id;
      await OwnerDetail.findOneAndUpdate({ car_id }, owner_details, { upsert: true });
    }

    // Handle car_details: engine_number and insurance
    if (car_details) {
      // Update engine_number in Car model if provided
      if (car_details.engine_number !== undefined) {
        await Car.findOneAndUpdate({ car_id }, { engine_number: car_details.engine_number });
      }

      // car_details may contain insurance updates; handle insurance separately
      if (car_details.insurance) {
        const ins = car_details.insurance;
        ins.car_id = car_id;
        await Insurance.findOneAndUpdate({ car_id }, ins, { upsert: true });
      }
    }

    const aggregated = await aggregateCarByPlate(req.params.plate);
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Upload Documents (Insurance update)
router.post('/:plate/documents', async (req, res) => {
  try {
    const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } });
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    const { insurance } = req.body;
    const car_id = car.car_id;
    if (insurance) {
      insurance.car_id = car_id;
      await Insurance.findOneAndUpdate({ car_id }, insurance, { upsert: true });
    }

    const aggregated = await aggregateCarByPlate(req.params.plate);
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Admin-only: Create RC Book (one-time, immutable fields)
router.post('/:plate/rcbook', async (req, res) => {
  try {
    const adminKey = req.headers['x-admin-key'];
    if (adminKey !== ADMIN_KEY) return res.status(403).json({ msg: 'Forbidden' });

    const car = await Car.findOne({ number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } });
    if (!car) return res.status(404).json({ msg: 'Car not found' });

    const car_id = car.car_id;
    const existing = await RCBook.findOne({ car_id });
    if (existing) return res.status(400).json({ msg: 'RC Book already exists and is immutable' });

    const payload = req.body || {};
    payload.car_id = car_id;
    const created = await RCBook.create(payload);

    const aggregated = await aggregateCarByPlate(req.params.plate);
    res.json(aggregated);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
