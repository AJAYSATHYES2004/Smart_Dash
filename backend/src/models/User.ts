import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    dateOfBirth?: Date;
    licenseNumber?: string;
    profilePhoto?: string;
    faceData?: string; // Base64 image
    faceDescriptor: number[]; // 128-length face vector
    isFaceRegistered: boolean;
    insuranceDetails?: {
        provider: string;
        policyNumber: string;
        validity: Date;
    };
    createdAt: Date;
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Optional if using only face login, but usually required
    phone: { type: String },
    dateOfBirth: { type: Date },
    licenseNumber: { type: String },
    profilePhoto: { type: String },
    faceData: { type: String },
    faceDescriptor: {
        type: [Number], // 128-length face vector
        required: false, // Optional initially
    },
    isFaceRegistered: { type: Boolean, default: false },
    insuranceDetails: {
        provider: String,
        policyNumber: String,
        validity: Date
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IUser>('User', UserSchema);
