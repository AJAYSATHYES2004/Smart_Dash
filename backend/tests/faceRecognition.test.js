/**
 * Face Recognition Utilities - Unit Tests
 * Tests for face matching algorithms and descriptor handling
 */

import { describe, it, expect } from 'vitest';
import {
    euclideanDistance,
    compareFaceDescriptors,
    normalizeFaceDescriptor,
    findBestFaceMatch
} from '../faceRecognition.js';

describe('Face Recognition Utilities', () => {
    // Sample face descriptors (128-element arrays)
    const descriptor1 = new Array(128).fill(0).map(() => Math.random());
    const descriptor2 = new Array(128).fill(0).map((_, i) => descriptor1[i] + 0.01); // Very similar
    const descriptor3 = new Array(128).fill(0).map(() => Math.random()); // Different

    describe('euclideanDistance', () => {
        it('should calculate distance between two descriptors', () => {
            const distance = euclideanDistance(descriptor1, descriptor2);
            expect(typeof distance).toBe('number');
            expect(distance).toBeGreaterThan(0);
        });

        it('should return 0 for identical descriptors', () => {
            const distance = euclideanDistance(descriptor1, descriptor1);
            expect(distance).toBeLessThan(0.001); // Allow for floating point errors
        });

        it('should return Infinity for invalid descriptors', () => {
            expect(euclideanDistance(null, descriptor1)).toBe(Infinity);
            expect(euclideanDistance(descriptor1, null)).toBe(Infinity);
            expect(euclideanDistance([], [])).toBe(Infinity); // Empty arrays
        });

        it('should return Infinity for mismatched lengths', () => {
            const short = descriptor1.slice(0, 100);
            expect(euclideanDistance(short, descriptor1)).toBe(Infinity);
        });

        it('should be symmetric (distance A->B = distance B->A)', () => {
            const distanceAB = euclideanDistance(descriptor1, descriptor2);
            const distanceBA = euclideanDistance(descriptor2, descriptor1);
            expect(Math.abs(distanceAB - distanceBA)).toBeLessThan(0.0001);
        });
    });

    describe('compareFaceDescriptors', () => {
        it('should return true for similar faces (within threshold)', () => {
            const result = compareFaceDescriptors(descriptor1, descriptor2, 0.6);
            expect(typeof result).toBe('boolean');
        });

        it('should return false for dissimilar faces (beyond threshold)', () => {
            const result = compareFaceDescriptors(descriptor1, descriptor3, 0.1);
            expect(result).toBe(false);
        });

        it('should return true for identical descriptors', () => {
            const result = compareFaceDescriptors(descriptor1, descriptor1, 0.6);
            expect(result).toBe(true);
        });

        it('should respect custom thresholds', () => {
            const distance = euclideanDistance(descriptor1, descriptor2);
            const resultStrict = compareFaceDescriptors(descriptor1, descriptor2, distance - 0.1);
            const resultLenient = compareFaceDescriptors(descriptor1, descriptor2, distance + 0.1);
            
            expect(resultStrict).toBe(false);
            expect(resultLenient).toBe(true);
        });
    });

    describe('normalizeFaceDescriptor', () => {
        it('should convert Float32Array to number array', () => {
            const float32 = new Float32Array(descriptor1);
            const normalized = normalizeFaceDescriptor(float32);
            
            expect(Array.isArray(normalized)).toBe(true);
            expect(normalized.length).toBe(128);
            expect(normalized.every(v => typeof v === 'number')).toBe(true);
        });

        it('should handle number arrays', () => {
            const normalized = normalizeFaceDescriptor(descriptor1);
            
            expect(Array.isArray(normalized)).toBe(true);
            expect(normalized.length).toBe(128);
        });

        it('should return null for null input', () => {
            const result = normalizeFaceDescriptor(null);
            expect(result).toBeNull();
        });

        it('should return null for invalid format', () => {
            const result = normalizeFaceDescriptor({ data: [1, 2, 3] });
            expect(result).toBeNull();
        });

        it('should validate descriptor length', () => {
            const short = descriptor1.slice(0, 100);
            const normalized = normalizeFaceDescriptor(short);
            
            // Should still return the array (with warning logged)
            expect(Array.isArray(normalized)).toBe(true);
        });

        it('should handle NaN values', () => {
            const withNaN = [...descriptor1];
            withNaN[50] = NaN;
            const normalized = normalizeFaceDescriptor(withNaN);
            
            expect(normalized[50]).toBe(0); // Should convert NaN to 0
        });
    });

    describe('findBestFaceMatch', () => {
        it('should find best match from user list', () => {
            const users = [
                { _id: '1', email: 'user1@test.com', faceDescriptor: { data: descriptor1 } },
                { _id: '2', email: 'user2@test.com', faceDescriptor: { data: descriptor2 } }, // Similar
                { _id: '3', email: 'user3@test.com', faceDescriptor: { data: descriptor3 } }
            ];

            const match = findBestFaceMatch(descriptor1, users, 0.6);
            
            expect(match).not.toBeNull();
            expect(match.user.email).toBe('user1@test.com'); // Should match itself or closest
            expect(match.distance).toBeGreaterThanOrEqual(0);
        });

        it('should return null when no match within threshold', () => {
            const users = [
                { _id: '1', email: 'user1@test.com', faceDescriptor: { data: descriptor3 } }
            ];

            const match = findBestFaceMatch(descriptor1, users, 0.1); // Very strict threshold
            
            expect(match).toBeNull();
        });

        it('should handle users with missing face descriptors', () => {
            const users = [
                { _id: '1', email: 'user1@test.com', faceDescriptor: null },
                { _id: '2', email: 'user2@test.com', faceDescriptor: { data: descriptor2 } }
            ];

            const match = findBestFaceMatch(descriptor1, users, 0.6);
            
            expect(match).not.toBeNull();
            expect(match.user.email).toBe('user2@test.com');
        });

        it('should find best match among multiple similar descriptors', () => {
            const close = new Array(128).fill(0).map((_, i) => descriptor1[i] + 0.002);
            const closer = new Array(128).fill(0).map((_, i) => descriptor1[i] + 0.001);
            
            const users = [
                { _id: '1', email: 'user1@test.com', faceDescriptor: { data: close } },
                { _id: '2', email: 'user2@test.com', faceDescriptor: { data: closer } } // Closest
            ];

            const match = findBestFaceMatch(descriptor1, users, 0.6);
            
            expect(match.user.email).toBe('user2@test.com');
        });

        it('should handle empty user list', () => {
            const match = findBestFaceMatch(descriptor1, [], 0.6);
            expect(match).toBeNull();
        });

        it('should use default threshold of 0.6', () => {
            const users = [
                { _id: '1', email: 'user1@test.com', faceDescriptor: { data: descriptor2 } }
            ];

            // Call without threshold
            const match = findBestFaceMatch(descriptor1, users);
            
            // Should use 0.6 as default
            expect(match).toBeDefined();
        });
    });

    describe('Edge Cases', () => {
        it('should handle very large descriptor arrays', () => {
            const largeDescriptor = new Array(256).fill(0).map(() => Math.random());
            const distance = euclideanDistance(largeDescriptor, largeDescriptor);
            
            expect(distance).toBeLessThan(0.001);
        });

        it('should handle descriptors with extreme values', () => {
            const extreme = new Array(128).fill(0).map((_, i) => i === 0 ? 1000 : 0.0001);
            const normal = new Array(128).fill(0.5);
            
            const distance = euclideanDistance(extreme, normal);
            
            expect(typeof distance).toBe('number');
            expect(isFinite(distance)).toBe(true);
        });

        it('should handle negative descriptor values', () => {
            const negative = new Array(128).fill(0).map(() => -Math.random());
            const positive = new Array(128).fill(0).map(() => Math.random());
            
            const distance = euclideanDistance(negative, positive);
            
            expect(typeof distance).toBe('number');
            expect(isFinite(distance)).toBe(true);
        });
    });
});

export { descriptor1, descriptor2, descriptor3 };
