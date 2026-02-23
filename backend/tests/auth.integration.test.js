/**
 * Authentication API Tests
 * Tests for user registration, login, and face-based login
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';
const api = axios.create({ baseURL: API_URL });

// Test data
const testUser = {
    name: 'Test User',
    email: `test-${Date.now()}@example.com`,
    password: 'TestPassword123',
    phone: '1234567890',
    licenseNumber: 'DL-2024-001'
};

const faceDescriptor = new Array(128).fill(0).map(() => Math.random() * 0.5 + 0.25);
const faceDataMock = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDA...'; // Mock base64

let createdUserId = null;

describe('Authentication API - Integration Tests', () => {
    // Note: These tests require the backend server to be running
    // Start the backend with: npm run dev (from backend directory)

    describe('POST /auth/register', () => {
        it('should register a new user without face data', async () => {
            const response = await api.post('/auth/register', {
                ...testUser
            });

            expect(response.status).toBe(200);
            expect(response.data.user).toBeDefined();
            expect(response.data.user.email).toBe(testUser.email);
            expect(response.data.faceRegistered).toBe(false);
            expect(response.data.user.faceDescriptor).toBeUndefined(); // Should not be returned

            createdUserId = response.data.user._id;
        });

        it('should register a new user with face data', async () => {
            const userWithFace = {
                ...testUser,
                email: `test-face-${Date.now()}@example.com`,
                faceData: faceDataMock,
                faceDescriptor: faceDescriptor
            };

            const response = await api.post('/auth/register', userWithFace);

            expect(response.status).toBe(200);
            expect(response.data.user).toBeDefined();
            expect(response.data.faceRegistered).toBe(true);
            expect(response.data.user.faceDescriptor).toBeUndefined();
        });

        it('should reject duplicate email', async () => {
            try {
                await api.post('/auth/register', testUser);
                // Try to register with same email
                await api.post('/auth/register', testUser);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.msg).toContain('exists');
            }
        });

        it('should validate required fields', async () => {
            const invalid = { name: 'Test' }; // Missing email and password

            try {
                await api.post('/auth/register', invalid);
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBeGreaterThanOrEqual(400);
            }
        });

        it('should normalize face descriptor on registration', async () => {
            const userWithFloat32 = {
                ...testUser,
                email: `test-float-${Date.now()}@example.com`,
                faceData: faceDataMock,
                faceDescriptor: new Float32Array(faceDescriptor)
            };

            const response = await api.post('/auth/register', userWithFloat32);

            expect(response.status).toBe(200);
            expect(response.data.faceRegistered).toBe(true);
        });
    });

    describe('POST /auth/login', () => {
        beforeEach(async () => {
            // Register a fresh user for each test
            const response = await api.post('/auth/register', {
                ...testUser,
                email: `login-test-${Date.now()}@example.com`
            });
            testUser.email = response.data.user.email;
        });

        it('should login with correct credentials', async () => {
            const response = await api.post('/auth/login', {
                email: testUser.email,
                password: testUser.password
            });

            expect(response.status).toBe(200);
            expect(response.data.user).toBeDefined();
            expect(response.data.user.email).toBe(testUser.email);
            expect(response.data.faceRegistered).toBe(false);
        });

        it('should reject invalid email', async () => {
            try {
                await api.post('/auth/login', {
                    email: 'nonexistent@example.com',
                    password: testUser.password
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBe(400);
            }
        });

        it('should reject incorrect password', async () => {
            try {
                await api.post('/auth/login', {
                    email: testUser.email,
                    password: 'WrongPassword123'
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBe(400);
            }
        });

        it('should not return face descriptor in response', async () => {
            const response = await api.post('/auth/login', {
                email: testUser.email,
                password: testUser.password
            });

            expect(response.data.user.faceDescriptor).toBeUndefined();
        });
    });

    describe('POST /auth/login-face', () => {
        let userWithFace = null;
        let faceDescriptorToMatch = null;

        beforeEach(async () => {
            // Create a user with face data
            const uniqueEmail = `face-login-${Date.now()}@example.com`;
            faceDescriptorToMatch = new Array(128).fill(0).map(() => Math.random() * 0.5 + 0.25);
            
            const response = await api.post('/auth/register', {
                ...testUser,
                email: uniqueEmail,
                faceData: faceDataMock,
                faceDescriptor: faceDescriptorToMatch
            });

            userWithFace = response.data.user;
        });

        it('should login with matching face descriptor', async () => {
            const response = await api.post('/auth/login-face', {
                faceDescriptor: faceDescriptorToMatch
            });

            expect(response.status).toBe(200);
            expect(response.data.user).toBeDefined();
            expect(response.data.user.email).toBe(userWithFace.email);
            expect(response.data.success).toBe(true);
            expect(response.data.matchDistance).toBeDefined();
        });

        it('should reject invalid descriptor format', async () => {
            try {
                await api.post('/auth/login-face', {
                    faceDescriptor: 'not-an-array'
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBe(400);
            }
        });

        it('should reject descriptor with wrong length', async () => {
            try {
                await api.post('/auth/login-face', {
                    faceDescriptor: new Array(100).fill(0.5) // Wrong length
                });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBe(400);
            }
        });

        it('should handle non-matching faces gracefully', async () => {
            const differentDescriptor = new Array(128).fill(0.1); // Completely different

            try {
                await api.post('/auth/login-face', {
                    faceDescriptor: differentDescriptor
                });
                expect.fail('Should not match');
            } catch (error) {
                expect(error.response.status).toBe(400);
                expect(error.response.data.success).toBe(false);
            }
        });

        it('should not return face descriptor in response', async () => {
            const response = await api.post('/auth/login-face', {
                faceDescriptor: faceDescriptorToMatch
            });

            expect(response.data.user.faceDescriptor).toBeUndefined();
        });

        it('should include match distance in response', async () => {
            const response = await api.post('/auth/login-face', {
                faceDescriptor: faceDescriptorToMatch
            });

            expect(response.data.matchDistance).toBeDefined();
            expect(typeof response.data.matchDistance).toBe('number');
            expect(response.data.matchDistance).toBeGreaterThanOrEqual(0);
            expect(response.data.matchDistance).toBeLessThan(0.6); // Should match
        });
    });

    describe('PUT /auth/update/:userId', () => {
        let userId = null;

        beforeEach(async () => {
            const response = await api.post('/auth/register', {
                ...testUser,
                email: `update-test-${Date.now()}@example.com`
            });
            userId = response.data.user._id;
        });

        it('should update user profile', async () => {
            const updateData = {
                name: 'Updated Name',
                phone: '9876543210'
            };

            const response = await api.put(`/auth/update/${userId}`, updateData);

            expect(response.status).toBe(200);
            expect(response.data.user.name).toBe('Updated Name');
            expect(response.data.user.phone).toBe('9876543210');
        });

        it('should update face data', async () => {
            const newDescriptor = new Array(128).fill(0).map(() => Math.random());
            const updateData = {
                faceData: faceDataMock,
                faceDescriptor: newDescriptor
            };

            const response = await api.put(`/auth/update/${userId}`, updateData);

            expect(response.status).toBe(200);
            expect(response.data.faceRegistered).toBe(true);
            expect(response.data.user.faceDescriptor).toBeUndefined();
        });

        it('should return 404 for non-existent user', async () => {
            try {
                await api.put('/auth/update/invalid-id', { name: 'Test' });
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBe(404);
            }
        });
    });

    describe('GET /auth/profile/:userId', () => {
        let userId = null;

        beforeEach(async () => {
            const response = await api.post('/auth/register', {
                ...testUser,
                email: `profile-test-${Date.now()}@example.com`
            });
            userId = response.data.user._id;
        });

        it('should get user profile', async () => {
            const response = await api.get(`/auth/profile/${userId}`);

            expect(response.status).toBe(200);
            expect(response.data.user).toBeDefined();
            expect(response.data.user._id).toBe(userId);
        });

        it('should not return face descriptor', async () => {
            const response = await api.get(`/auth/profile/${userId}`);

            expect(response.data.user.faceDescriptor).toBeUndefined();
        });

        it('should include face registration status', async () => {
            const response = await api.get(`/auth/profile/${userId}`);

            expect(response.data.faceRegistered).toBeDefined();
            expect(typeof response.data.faceRegistered).toBe('boolean');
        });

        it('should return 404 for non-existent user', async () => {
            try {
                await api.get('/auth/profile/invalid-id');
                expect.fail('Should have thrown an error');
            } catch (error) {
                expect(error.response.status).toBe(404);
            }
        });
    });

    describe('Data Security Tests', () => {
        it('should never expose face descriptor in any response', async () => {
            const userWithFace = {
                ...testUser,
                email: `security-${Date.now()}@example.com`,
                faceData: faceDataMock,
                faceDescriptor: new Array(128).fill(0.5)
            };

            // Register
            const registerRes = await api.post('/auth/register', userWithFace);
            expect(registerRes.data.user.faceDescriptor).toBeUndefined();

            // Login
            const loginRes = await api.post('/auth/login', {
                email: userWithFace.email,
                password: testUser.password
            });
            expect(loginRes.data.user.faceDescriptor).toBeUndefined();

            // Get profile
            const profileRes = await api.get(`/auth/profile/${registerRes.data.user._id}`);
            expect(profileRes.data.user.faceDescriptor).toBeUndefined();
        });

        it('should validate descriptor format prevents injection', async () => {
            try {
                await api.post('/auth/login-face', {
                    faceDescriptor: { $where: 'return true' } // MongoDB injection attempt
                });
                expect.fail('Should have rejected');
            } catch (error) {
                expect(error.response.status).toBe(400);
            }
        });
    });
});

export { testUser, faceDescriptor };
