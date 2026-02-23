import dotenv from 'dotenv';
import mongoose from 'mongoose';
import app from './app';
import { killPort } from './utils/portUtils';

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/digital-drive';

async function startServer() {
    try {
        // Auto-stop any existing process on this port
        await killPort(PORT);

        await mongoose.connect(MONGO_URI);
        console.log('MongoDB Connected');

        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err: any) {
        console.error('Server startup error:', err);
        process.exit(1);
    }
}

startServer();
