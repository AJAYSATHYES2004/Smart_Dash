import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        include: ['tests/**/*.test.js'],
        exclude: ['node_modules'],
        testTimeout: 30000,
        hookTimeout: 30000,
        coverage: {
            provider: 'v8',
            reporter: ['text', 'json', 'html'],
            include: ['utils/**/*.js', 'routes/**/*.js'],
            exclude: ['tests/**', 'node_modules/**']
        }
    }
});
