import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token if we had one (for future)
// api.interceptors.request.use((config) => {
//   const token = localStorage.getItem('token');
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

export const authService = {
    register: (userData: any) => api.post('/auth/signup', userData),
    login: (credentials: any) => api.post('/auth/login', credentials),
    loginFace: (data: { faceData: string; faceDescriptor?: number[] }) => api.post('/auth/login/face', data),
    updateProfile: (userId: string, data: any) => api.put(`/auth/update/${userId}`, data),
};

export const carService = {
    register: (carData: any) => api.post('/cars/register', carData),
    login: (credentials: { numberPlate: string; secretCode: string }) => api.post('/cars/login', credentials),
    getDetails: (plate: string) => api.get(`/cars/${plate}`),
    addFine: (plate: string, fine: any) => api.post(`/cars/${plate}/fine`, fine),
    updateData: (plate: string, data: any) => api.post(`/cars/${plate}/update`, data),
    updateDetails: (plate: string, data: any) => api.put(`/cars/${plate}/details`, data),
    uploadDocuments: (plate: string, docs: any) => api.post(`/cars/${plate}/documents`, docs),
    payFine: (plate: string, fineId: string) => api.post(`/cars/${plate}/fine/${fineId}/pay`, {}),
};

export default api;
