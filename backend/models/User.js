const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    phone: { type: String },
    dateOfBirth: { type: Date },
    licenseNumber: { type: String },
    profilePhoto: { type: String }, // URL or Base64
    faceData: { type: String }, // Base64 encoded face descriptor or image for recognition
    emergencyContact: { type: String },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
