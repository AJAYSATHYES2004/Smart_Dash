/**
 * Face Recognition Utility Functions
 * Handles face descriptor comparison and matching
 */

/**
 * Calculate Euclidean distance between two face descriptors
 * @param {number[]} descriptor1 - First 128-element face descriptor array
 * @param {number[]} descriptor2 - Second 128-element face descriptor array
 * @returns {number} Euclidean distance between the two descriptors
 */
const euclideanDistance = (descriptor1, descriptor2) => {
    if (!descriptor1 || !descriptor2 || descriptor1.length !== descriptor2.length) {
        return Infinity;
    }

    let sum = 0;
    for (let i = 0; i < descriptor1.length; i++) {
        const diff = (descriptor1[i] || 0) - (descriptor2[i] || 0);
        sum += diff * diff;
    }
    return Math.sqrt(sum);
};

/**
 * Compare two face descriptors and determine if they match
 * @param {number[]} descriptor1 - First descriptor
 * @param {number[]} descriptor2 - Second descriptor
 * @param {number} threshold - Distance threshold for matching (default: 0.6)
 * @returns {boolean} True if faces match within threshold
 */
const compareFaceDescriptors = (descriptor1, descriptor2, threshold = 0.6) => {
    const distance = euclideanDistance(descriptor1, descriptor2);
    return distance <= threshold;
};

/**
 * Find best matching user from a list based on face descriptor
 * @param {number[]} faceDescriptor - Query face descriptor
 * @param {Array} users - Array of users with faceDescriptor.data
 * @param {number} threshold - Distance threshold (default: 0.6)
 * @returns {Object} { user, distance } or null if no match found
 */
const findBestFaceMatch = (faceDescriptor, users, threshold = 0.6) => {
    let bestMatch = null;
    let minDistance = threshold;

    users.forEach(user => {
        // Support both old format (direct array) and new format (nested object)
        const storedDescriptor = user.faceDescriptor?.data || user.faceDescriptor;
        
        if (!storedDescriptor || !Array.isArray(storedDescriptor) || storedDescriptor.length !== 128) {
            return;
        }

        const distance = euclideanDistance(faceDescriptor, storedDescriptor);
        
        if (distance < minDistance) {
            minDistance = distance;
            bestMatch = {
                user,
                distance
            };
        }
    });

    return bestMatch;
};

/**
 * Normalize face descriptor to ensure consistent format
 * @param {Float32Array|number[]} descriptor - Raw descriptor from face-api
 * @returns {number[]} Normalized 128-element number array
 */
const normalizeFaceDescriptor = (descriptor) => {
    if (!descriptor) return null;
    
    // Convert Float32Array to regular array
    if (descriptor instanceof Float32Array) {
        return Array.from(descriptor);
    }
    
    // If already array, validate it
    if (Array.isArray(descriptor)) {
        if (descriptor.length !== 128) {
            console.warn(`Warning: Face descriptor has ${descriptor.length} elements, expected 128`);
        }
        return descriptor.map(val => Number(val) || 0);
    }
    
    return null;
};

module.exports = {
    euclideanDistance,
    compareFaceDescriptors,
    findBestFaceMatch,
    normalizeFaceDescriptor
};
