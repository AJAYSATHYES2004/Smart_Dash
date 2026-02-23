/**
 * Quick Test Runner - Face Recognition System
 * Simple script to run all tests with better output
 */

import { spawn } from 'child_process';
import { platform } from 'os';

const isDev = process.argv.includes('--watch');
const isCoverage = process.argv.includes('--coverage');
const isUI = process.argv.includes('--ui');

let command = 'npm';
let args = ['test'];

if (isDev) {
    console.log('📺 Starting test watcher...');
    args.push('--watch');
} else if (isCoverage) {
    console.log('📊 Running tests with coverage...');
    args.push('--coverage');
} else if (isUI) {
    console.log('🎨 Starting Vitest UI...');
    args.push('--ui');
} else {
    console.log('🧪 Running test suite...');
}

console.log('');
console.log('Command:', command, args.join(' '));
console.log('');

const test = spawn(command, args, {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
});

test.on('close', (code) => {
    console.log('');
    if (code === 0) {
        console.log('✅ All tests passed!');
    } else {
        console.log('❌ Some tests failed');
    }
    process.exit(code);
});

test.on('error', (err) => {
    console.error('Error running tests:', err);
    process.exit(1);
});
