import axios from 'axios';

const API = 'http://localhost:5000/api';

async function testSignup() {
    const testCarId = `CAR-TEST-${Date.now()}`;
    const testPlate = `KA-01-TEST-${Math.floor(Math.random() * 1000)}`;

    console.log(`Testing registration for ${testPlate}...`);

    try {
        const res = await axios.post(`${API}/cars/register`, {
            car_id: testCarId,
            number_plate: testPlate,
            secret_code: '9090',
            owner_details: {
                name: 'Signup Tester',
                contact: '1231231234'
            },
            car_details: {
                engine_number: `ENG-${testCarId}`
            },
            driving_data: {
                petrol: 100,
                oil: 100
            }
        });

        console.log('Registration Successful:', res.data.number_plate);

        // Verify login
        try {
            const loginRes = await axios.post(`${API}/cars/login`, {
                numberPlate: testPlate,
                secretCode: '9090'
            });
            console.log('Login Verification Successful for:', loginRes.data.number_plate);
        } catch (e) {
            console.error('Login Verification Failed:', e.message);
        }

    } catch (err) {
        console.error('Registration Failed:', err.response?.data || err.message);
    }
}

testSignup();
