import axios from 'axios';

const API = 'http://localhost:5000/api';

async function seed() {
    try {
        // 1. Register User
        try {
            await axios.post(`${API}/auth/register`, {
                name: 'Test User',
                email: 'test@example.com',
                password: 'password123',
                phone: '1234567890'
            });
            console.log('User registered');
        } catch (e) {
            console.log('User might already exist:', e.response?.data?.msg || e.message);
        }

        // 2. Register Car
        try {
            await axios.post(`${API}/cars/register`, {
                car_id: 'CAR-TEST-001',
                number_plate: 'KA-01-AB-1234',
                secret_code: '1234',
                owner_details: {
                    name: 'Test Owner',
                    contact: '9999999999'
                },
                car_details: {
                    engine_number: 'ENG-TEST-001'
                },
                driving_data: {
                    speed: 0,
                    petrol: 80
                }
            });
            console.log('Car registered');
        } catch (e) {
            console.log('Car might already exist:', e.response?.data?.msg || e.message);
        }

    } catch (err) {
        console.error('Seed execution error:', err.message);
    }
}

seed();
