const mongoose = require('mongoose');

const carSchema = new mongoose.Schema({
    car_id: { type: String, required: true, unique: true },
    number_plate: { type: String, required: true, unique: true },
    secret_code: { type: String, required: true }, // For car login

    owner_details: {
        owner_id: { type: String }, // Could be linked to User _id
        name: { type: String },
        contact: { type: String },
        proof_image: { type: String }
    },

    car_details: {
        engine_number: { type: String },
        insurance: { type: String },
        rc_book: { type: String }
    },

    // Authorized drivers/users for this car
    users: {
        user_id: { type: String }, // Reference to User model _id optionally
        name: { type: String },
        license_no: { type: String },
        role: { type: String, enum: ['owner', 'driver', 'guest'], default: 'driver' },
        emergency_contact: { type: String },
        face_data: { type: String } // Stored here for verifying driver against this car
    },

    fine_details: {
        amount: { type: Number },
        reason: { type: String },
        date: { type: Date, default: Date.now },
        time: { type: String },
        last_date: { type: Date }
    },

    driving_data: {
        speed: { type: Number, default: 0 },
        kilometers: { type: Number, default: 0 },
        petrol: { type: Number, default: 0 },
        oil: { type: Number, default: 0 }
    },

    safety_logs: {
        emotion_alerts: [{ type: mongoose.Schema.Types.Mixed }], // Flexible for now
        drowsiness_events: [{ type: mongoose.Schema.Types.Mixed }]
    }
}, { timestamps: true });

module.exports = mongoose.model('Car', carSchema);
