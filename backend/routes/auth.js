const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, faceData, licenseNumber } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ msg: 'User already exists' });

        user = new User({
            name,
            email,
            password, // Note: In production, hash this password!
            phone,
            faceData,
            licenseNumber
        });

        await user.save();
        res.json({ msg: 'User registered successfully', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Login User
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (user.password !== password) { // Note: using plain text for simplicity as verified in plan
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        res.json({ msg: 'Login successful', user });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Face Login
router.post('/login-face', async (req, res) => {
    try {
        const { faceData } = req.body; // Expecting base64 string

        if (!faceData) return res.status(400).json({ msg: 'No face data provided' });

        // In a real app, you would use a face recognition library here.
        // For this implementation, we will look for an exact match or return a specific demo user
        // if the face data matches what was stored.

        const user = await User.findOne({ faceData });

        if (user) {
            return res.json({ msg: 'Face login successful', user });
        }

        // Fallback: compare logic for "similarity" (mocked)
        // Here we're just checking if any user has face data, 
        // real implementation needs numpy/python or face-api.js

        res.status(400).json({ msg: 'Face not recognized' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Update User Profile
router.put('/update/:userId', async (req, res) => {
    const { name, phone, licenseNumber, emergencyContact, profilePhoto } = req.body;
    try {
        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { name, phone, licenseNumber, emergencyContact, profilePhoto },
            { new: true }
        );
        if (!user) return res.status(404).json({ msg: 'User not found' });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
