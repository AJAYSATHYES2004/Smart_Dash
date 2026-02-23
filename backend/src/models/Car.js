const mongoose = require('mongoose');
const { Schema } = mongoose;

/* ===================== CAR ===================== */
const CarSchema = new Schema({
    car_id: { type: String, required: true, unique: true },
    number_plate: { type: String, required: true, unique: true },
    secret_code: { type: String, required: true },
    engine_number: String
}, { timestamps: true });

/* ===================== OWNER ===================== */
const OwnerDetailSchema = new Schema({
    car_id: { type: String, required: true },
    owner_id: String,
    name: String,
    contact: String,
    proof_image: String
}, { timestamps: true });

/* ===================== EMERGENCY CONTACT ===================== */
const EmergencyContactSchema = new Schema({
    car_id: { type: String, required: true },
    name: String,
    phone: String,
    relation: String
}, { timestamps: true });

/* ===================== USER ===================== */
const UserDetailSchema = new Schema({
    car_id: { type: String, required: true },
    user_id: String,
    name: String,
    license_no: String,
    role: { type: String, enum: ['owner', 'driver', 'guest'], default: 'driver' },
    face_data: String
}, { timestamps: true });

/* ===================== INSURANCE ===================== */
const InsuranceSchema = new Schema({
    car_id: { type: String, required: true },
    policyNumber: String,
    validity: Date,
    providerName: String,
    premium: Number,
    coverageAmount: Number
}, { timestamps: true });

/* ===================== RC BOOK ===================== */
const RCBookSchema = new Schema({
    car_id: { type: String, required: true },
    registrationDate: { type: Date, immutable: true },
    image: { type: String, immutable: true }
}, { timestamps: true });

/* ===================== FINE ===================== */
const FineSchema = new Schema({
    car_id: { type: String, required: true },
    type: String,
    amount: Number,
    description: String,
    location: String,
    status: { type: String, enum: ['unpaid', 'paid'], default: 'unpaid' },
    reference_id: { type: String, unique: true, sparse: true },
    date: { type: Date, default: Date.now },
    last_date: Date
}, { timestamps: true });

/* ===================== DRIVING DATA ===================== */
const DrivingDataSchema = new Schema({
    car_id: { type: String, required: true },
    speed: { type: Number, default: 0 },
    kilometers: { type: Number, default: 0 },
    petrol: { type: Number, default: 0 },
    oil: { type: Number, default: 0 },
    engineTemp: { type: Number, default: 90 }
}, { timestamps: true });

/* ===================== SAFETY LOGS ===================== */
const SafetyLogsSchema = new Schema({
    car_id: { type: String, required: true },
    emotion_alerts: [{ type: Schema.Types.Mixed }],
    drowsiness_events: [{ type: Schema.Types.Mixed }],
    distraction_events: [{ type: Schema.Types.Mixed }],
    monitor_active: { type: Boolean, default: false }
}, { timestamps: true });

/* ===================== EXPORT MODELS ===================== */
module.exports = {
    Car: mongoose.model('Car', CarSchema),
    OwnerDetail: mongoose.model('OwnerDetail', OwnerDetailSchema),
    EmergencyContact: mongoose.model('EmergencyContact', EmergencyContactSchema),
    UserDetail: mongoose.model('UserDetail', UserDetailSchema),
    Insurance: mongoose.model('Insurance', InsuranceSchema),
    RCBook: mongoose.model('RCBook', RCBookSchema),
    Fine: mongoose.model('Fine', FineSchema),
    DrivingData: mongoose.model('DrivingData', DrivingDataSchema),
    SafetyLog: mongoose.model('SafetyLog', SafetyLogsSchema)
};
