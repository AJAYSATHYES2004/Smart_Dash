const express = require('express');
const router = express.Router();
const Car = require('../models/Car');

// Register a new Car
router.post('/register', async (req, res) => {
    try {
        const car = new Car(req.body);
        await car.save();
        res.json(car);
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Login to Car
router.post('/login', async (req, res) => {
    const { numberPlate, secretCode } = req.body;
    console.log('Login Attempt:', { numberPlate, secretCode });

    try {
        // Case insensitive search for number plate
        const car = await Car.findOne({
            number_plate: { $regex: new RegExp(`^${numberPlate}$`, 'i') }
        });

        console.log('Car found during login:', car ? car.number_plate : 'None');

        if (!car) return res.status(400).json({ msg: 'Invalid Car Credentials (Plate)' });

        if (car.secret_code !== secretCode) {
            console.log('Secret code mismatch:', { expected: car.secret_code, received: secretCode });
            return res.status(400).json({ msg: 'Invalid Car Credentials (Code)' });
        }

        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Get Car Details
router.get('/:plate', async (req, res) => {
    try {
        const car = await Car.findOne({ number_plate: req.params.plate });
        if (!car) return res.status(404).json({ msg: 'Car not found' });
        res.json(car);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Add Fine
router.post('/:plate/fine', async (req, res) => {
    try {
        const car = await Car.findOne({ number_plate: req.params.plate });
        if (!car) return res.status(404).json({ msg: 'Car not found' });

        car.fine_details.push(req.body); // Body should contain fine object
        await car.save();
        res.json(car);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update Driving Data (Speed, logs, etc)
router.post('/:plate/update', async (req, res) => {
    try {
        const car = await Car.findOne({ number_plate: req.params.plate });
        if (!car) return res.status(404).json({ msg: 'Car not found' });

        if (req.body.driving_data) {
            car.driving_data = { ...car.driving_data, ...req.body.driving_data };
        }
        if (req.body.safety_logs) {
            if (req.body.safety_logs.emotion_alerts) car.safety_logs.emotion_alerts.push(...req.body.safety_logs.emotion_alerts);
            if (req.body.safety_logs.drowsiness_events) car.safety_logs.drowsiness_events.push(...req.body.safety_logs.drowsiness_events);
        }

        await car.save();
        res.json(car);
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// Update Car Details
router.put('/:plate/details', async (req, res) => {
    const { owner_details, car_details } = req.body;
    try {
        const car = await Car.findOneAndUpdate(
            { number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } },
            { owner_details, car_details },
            { new: true }
        );
        if (!car) return res.status(404).json({ msg: 'Car not found' });
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Upload Documents (Insurance, RC Book)
router.post('/:plate/documents', async (req, res) => {
    const { insurance, rc_book } = req.body;
    try {
        const updateData = {};
        if (insurance) updateData['car_details.insurance'] = insurance;
        if (rc_book) updateData['car_details.rc_book'] = rc_book;

        const car = await Car.findOneAndUpdate(
            { number_plate: { $regex: new RegExp(`^${req.params.plate}$`, 'i') } },
            updateData,
            { new: true }
        );
        if (!car) return res.status(404).json({ msg: 'Car not found' });
        res.json(car);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
