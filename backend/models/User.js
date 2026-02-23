const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Hashed password
    phone: { type: String },
    dateOfBirth: { type: Date },
    licenseNumber: { type: String },
    profilePhoto: { type: String }, // URL or Base64
    faceData: { type: String }, // Base64 encoded face image for visual reference
    faceDescriptor: {
        type: {
            type: String,
            enum: ['Float32Array'],
            default: 'Float32Array'
        },
        data: [Number] // 128-element array for face recognition
    },
    isFaceRegistered: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
