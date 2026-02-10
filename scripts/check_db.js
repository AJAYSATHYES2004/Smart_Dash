import axios from 'axios';

async function check() {
    try {
        const carRes = await axios.get('http://localhost:5000/api/cars/KA-01-AB-1234');
        console.log('Car Found:', carRes.data.number_plate);

        // Can't easily list users without a route, but if car is there, seed likely worked partially.
        // Let's try to login with the user
        try {
            const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
                email: 'test@example.com',
                password: 'password123'
            });
            console.log('User Login Successful:', loginRes.data.user.email);
        } catch (e) {
            console.log('User Login Failed:', e.message);
        }

    } catch (err) {
        console.error('Check failed:', err.message);
        if (err.response) console.error(err.response.data);
    }
}

check();
