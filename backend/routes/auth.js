const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { findBestFaceMatch, normalizeFaceDescriptor, euclideanDistance } = require('../utils/faceRecognition');

// Register User
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, phone, faceData, faceDescriptor, licenseNumber } = req.body;

        console.log('Register Request:', {
            name,
            email,
            phone,
            licenseNumber,
            hasFaceData: !!faceData,
            faceDescriptorLength: faceDescriptor ? faceDescriptor.length : 0,
            faceDescriptorType: faceDescriptor ? typeof faceDescriptor : 'undefined',
            isArray: Array.isArray(faceDescriptor)
        });

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            console.log('Register Failed: User already exists', email);
            return res.status(400).json({ msg: 'User already exists' });
        }

        // Normalize face descriptor if provided
        const normalizedDescriptor = faceDescriptor ? normalizeFaceDescriptor(faceDescriptor) : null;
        
        user = new User({
            name,
            email,
            password, // Note: In production, hash this password!
            phone,
            faceData,
            faceDescriptor: normalizedDescriptor ? { type: 'Float32Array', data: normalizedDescriptor } : null,
            isFaceRegistered: !!normalizedDescriptor,
            licenseNumber
        });

        await user.save();
        
        // Return user without exposing sensitive descriptor details in response
        const userResponse = user.toObject();
        delete userResponse.faceDescriptor;
        
        res.json({ 
            msg: 'User registered successfully', 
            user: userResponse,
            faceRegistered: !!normalizedDescriptor
        });
    } catch (err) {
        console.error('Registration Error:', err.message);
        if (err.errors) console.error('Validation Errors:', err.errors);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Login User with Password
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ msg: 'Invalid Credentials' });

        if (user.password !== password) { // Note: using plain text for simplicity as verified in plan
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        // Return user without exposing sensitive descriptor
        const userResponse = user.toObject();
        delete userResponse.faceDescriptor;
        
        res.json({ 
            msg: 'Login successful', 
            user: userResponse,
            faceRegistered: user.isFaceRegistered
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Face Login - Identify user by face
router.post('/login-face', async (req, res) => {
    try {
        const { faceDescriptor } = req.body; // Expecting array of numbers

        if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
            return res.status(400).json({ 
                msg: 'No valid face descriptor provided',
                success: false
            });
        }

        // Normalize incoming descriptor
        const normalizedIncomingDescriptor = normalizeFaceDescriptor(faceDescriptor);
        if (!normalizedIncomingDescriptor || normalizedIncomingDescriptor.length !== 128) {
            return res.status(400).json({ 
                msg: 'Invalid face descriptor format. Expected 128-element array',
                success: false
            });
        }

        // Fetch all users with registered face descriptors
        // In production with millions of users, use vector database (Pinecone, Weaviate, etc.)
        const users = await User.find({ 
            isFaceRegistered: true,
            'faceDescriptor.data': { $exists: true, $ne: null }
        });

        if (users.length === 0) {
            return res.status(400).json({ 
                msg: 'No users with face recognition registered',
                success: false 
            });
        }

        console.log(`Searching among ${users.length} registered faces`);

        // Find best match with improved matching logic
        const DISTANCE_THRESHOLD = 0.6; // Standard threshold for face-api.js
        let bestMatch = null;
        let minDistance = DISTANCE_THRESHOLD;
        let matchDetails = [];

        users.forEach(user => {
            const storedDescriptor = user.faceDescriptor?.data;
            
            if (!storedDescriptor || !Array.isArray(storedDescriptor) || storedDescriptor.length !== 128) {
                return;
            }

            const distance = euclideanDistance(normalizedIncomingDescriptor, storedDescriptor);
            
            // Log top matches for debugging
            if (distance < 0.8) {
                matchDetails.push({
                    email: user.email,
                    distance: distance.toFixed(4)
                });
            }
            
            if (distance < minDistance) {
                minDistance = distance;
                bestMatch = user;
            }
        });

        console.log('Face matching results:', {
            totalUsersSearched: users.length,
            bestMatch: bestMatch ? bestMatch.email : 'none',
            distance: minDistance.toFixed(4),
            topMatches: matchDetails.slice(0, 5)
        });

        if (bestMatch) {
            // Return user without exposing sensitive descriptor
            const userResponse = bestMatch.toObject();
            delete userResponse.faceDescriptor;
            
            return res.json({ 
                msg: 'Face login successful',
                user: userResponse,
                success: true,
                matchDistance: minDistance
            });
        }

        res.status(400).json({ 
            msg: 'Face not recognized. Distance too high or no matching user found.',
            success: false,
            closestMatch: minDistance.toFixed(4)
        });
    } catch (err) {
        console.error('Face login error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Update User Profile (including face data)
router.put('/update/:userId', async (req, res) => {
    const { name, phone, licenseNumber, emergencyContact, profilePhoto, faceData, faceDescriptor } = req.body;
    try {
        const updateData = { name, phone, licenseNumber, emergencyContact, profilePhoto };
        
        if (faceData) updateData.faceData = faceData;
        
        // Normalize and store face descriptor if provided
        if (faceDescriptor) {
            const normalizedDescriptor = normalizeFaceDescriptor(faceDescriptor);
            if (normalizedDescriptor) {
                updateData.faceDescriptor = { type: 'Float32Array', data: normalizedDescriptor };
                updateData.isFaceRegistered = true;
            }
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            updateData,
            { new: true }
        );
        
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        // Return user without exposing sensitive descriptor
        const userResponse = user.toObject();
        delete userResponse.faceDescriptor;
        
        res.json({
            msg: 'Profile updated successfully',
            user: userResponse,
            faceRegistered: user.isFaceRegistered
        });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).send('Server Error: ' + err.message);
    }
});

// Get user profile (for authenticated requests)
router.get('/profile/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) return res.status(404).json({ msg: 'User not found' });
        
        const userResponse = user.toObject();
        delete userResponse.faceDescriptor;
        
        res.json({
            user: userResponse,
            faceRegistered: user.isFaceRegistered
        });
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
