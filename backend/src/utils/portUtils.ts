import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Automatically kills any process running on the specified port.
 * Specifically designed for Windows environments as per user's OS.
 * @param port The port number to clear.
 */
export async function killPort(port: number | string): Promise<void> {
    try {
        console.log(`Checking for processes on port ${port}...`);

        // Find PID using netstat (Windows)
        const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);

        if (!stdout) {
            console.log(`Port ${port} is clear.`);
            return;
        }

        // Get the last column which is the PID
        const lines = stdout.trim().split('\n');
        const pids = new Set<string>();

        lines.forEach(line => {
            const parts = line.trim().split(/\s+/);
            const pid = parts[parts.length - 1];
            if (pid && pid !== '0' && /^\d+$/.test(pid)) {
                pids.add(pid);
            }
        });

        if (pids.size === 0) {
            console.log(`No active PID found for port ${port}.`);
            return;
        }

        for (const pid of pids) {
            try {
                console.log(`Killing process with PID ${pid} on port ${port}...`);
                // /F forces the termination, /T terminates child processes
                await execAsync(`taskkill /F /T /PID ${pid}`);
                console.log(`Successfully killed process ${pid}.`);
            } catch (killError: any) {
                // If the process is already gone or access is denied
                console.warn(`Could not kill process ${pid}: ${killError.message}`);
            }
        }

        // Wait a small amount of time for OS to release the port
        await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error: any) {
        // findstr returns exit code 1 if no match is found
        if (error.code === 1) {
            console.log(`Port ${port} is already free.`);
        } else {
            console.error(`Error while trying to clear port ${port}:`, error.message);
        }
    }
}
