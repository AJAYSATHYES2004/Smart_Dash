import { Request, Response } from 'express';
import User, { IUser } from '../models/User';
import bcrypt from 'bcryptjs'; // Assuming bcryptjs is used or will be used
import jwt from 'jsonwebtoken'; // Assuming jwt is used

// Helper for Euclidean distance
const euclideanDistance = (a: number[], b: number[]) => {
    return Math.sqrt(
        a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0)
    );
};

/* SIGN-UP with Face */
export const signUpFace = async (req: Request, res: Response) => {
    try {
        const { name, email, password, faceDescriptor, faceData, profilePhoto, insuranceDetails } = req.body;

        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Hash password if provided
        let hashedPassword = '';
        if (password) {
            const salt = await bcrypt.genSalt(10);
            hashedPassword = await bcrypt.hash(password, salt);
        }

        user = new User({
            name,
            email,
            password: hashedPassword,
            faceDescriptor,
            faceData,
            profilePhoto,
            isFaceRegistered: !!faceDescriptor,
            insuranceDetails,
            phone: req.body.phone,
            dateOfBirth: req.body.dateOfBirth,
            licenseNumber: req.body.licenseNumber
        });

        await user.save();

        // Create JWT payload
        const payload = {
            user: {
                id: user.id
            }
        };

        // Sign Token
        jwt.sign(
            payload,
            process.env.JWT_SECRET || 'secret',
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.status(201).json({ token, user, message: 'Sign-up successful' });
            }
        );
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/* LOGIN with Password */
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid Credentials' });

        // Compare passwords
        if (user.password) {
            const isMatch = await bcrypt.compare(password, user.password as string);
            if (!isMatch) return res.status(400).json({ message: 'Invalid Credentials' });
        } else {
            return res.status(400).json({ message: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: 360000 }, (err, token) => {
            if (err) throw err;
            res.json({ token, user, message: 'Login successful' });
        });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/* UPDATE PROFILE (including Face Data) */
export const updateProfile = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const updates = req.body;

        // If updating face descriptor, ensure it's valid
        if (updates.faceDescriptor) {
            if (!Array.isArray(updates.faceDescriptor) || updates.faceDescriptor.length !== 128) {
                return res.status(400).json({ message: "Invalid face descriptor" });
            }
            updates.isFaceRegistered = true;
        }

        const user = await User.findByIdAndUpdate(userId, { $set: updates }, { new: true });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user, message: 'Profile updated successfully' });
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

/* LOGIN with Face */
export const loginFace = async (req: Request, res: Response) => {
    try {
        const { faceDescriptor } = req.body;

        if (!faceDescriptor || !Array.isArray(faceDescriptor) || faceDescriptor.length !== 128) {
            return res.status(400).json({ message: "Invalid face descriptor" });
        }

        // Get all users with face data
        // Optimization: In a real app, you might want to filter or use a vector DB.
        // For now, iterate all users as per the prompt's example.
        const users = await User.find({ isFaceRegistered: true });

        let foundUser: IUser | null = null;
        let minDistance = Infinity;

        for (const user of users) {
            if (user.faceDescriptor && user.faceDescriptor.length === 128) {
                const distance = euclideanDistance(user.faceDescriptor, faceDescriptor);
                if (distance < 0.5 && distance < minDistance) { // Threshold 0.5
                    minDistance = distance;
                    foundUser = user;
                }
            }
        }

        if (foundUser) {
            const payload = {
                user: {
                    id: foundUser.id
                }
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || 'secret',
                { expiresIn: 360000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        message: "Login successful",
                        user: foundUser,
                        token
                    });
                }
            );
        } else {
            res.status(401).json({ message: "Face not recognized" });
        }

    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};
