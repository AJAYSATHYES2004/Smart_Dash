const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test User',
            email: 'test' + Date.now() + '@example.com',
            password: 'password123',
            phone: '1234567890',
            licenseNumber: 'DL1234567890',
            faceDescriptor: Array(128).fill(0.1) // Mock descriptor
        });
        console.log('Register Success:', response.data);
    } catch (error) {
        if (error.response) {
            console.error('Register Failed:', error.response.status, error.response.data);
        } else {
            console.error('Register Network Error:', error.message);
        }
    }
}

testRegister();
