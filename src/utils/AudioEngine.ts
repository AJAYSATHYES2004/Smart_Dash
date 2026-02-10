class AudioEngine {
    private ctx: AudioContext | null = null;
    private osc1: OscillatorNode | null = null;
    private osc2: OscillatorNode | null = null;
    private gainNode: GainNode | null = null;
    private lowPass: BiquadFilterNode | null = null;
    private isRunning: boolean = false;

    private async init() {
        if (!this.ctx) {
            this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        if (this.ctx.state === 'suspended') {
            await this.ctx.resume();
        }
    }

    public async start() {
        await this.init();
        if (!this.ctx || this.isRunning) return;

        this.isRunning = true;
        const ctx = this.ctx;

        this.gainNode = ctx.createGain();
        this.lowPass = ctx.createBiquadFilter();
        this.lowPass.type = 'lowpass';
        this.lowPass.frequency.value = 400;

        this.osc1 = ctx.createOscillator();
        this.osc1.type = 'sawtooth';
        this.osc1.frequency.value = 50;

        this.osc2 = ctx.createOscillator();
        this.osc2.type = 'triangle';
        this.osc2.frequency.value = 52; // Slight detune for richness

        this.osc1.connect(this.gainNode);
        this.osc2.connect(this.gainNode);
        this.gainNode.connect(this.lowPass);
        this.lowPass.connect(ctx.destination);

        // Startup sequence
        this.gainNode.gain.setValueAtTime(0, ctx.currentTime);
        this.gainNode.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.1);
        this.gainNode.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.5);

        this.osc1.start();
        this.osc2.start();
    }

    public stop() {
        if (!this.ctx || !this.osc1 || !this.osc2 || !this.gainNode) return;

        const ctx = this.ctx;
        this.gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

        setTimeout(() => {
            if (this.osc1) this.osc1.stop();
            if (this.osc2) this.osc2.stop();
            this.isRunning = false;
        }, 500);
    }

    public setSpeed(speed: number) {
        if (!this.isRunning || !this.osc1 || !this.osc2 || !this.gainNode) return;

        const baseFreq = 50;
        const maxFreq = 150;
        const speedFactor = speed / 240;

        if (this.osc1) this.osc1.frequency.setTargetAtTime(baseFreq + (speedFactor * (maxFreq - baseFreq)), this.ctx!.currentTime, 0.1);
        if (this.osc2) this.osc2.frequency.setTargetAtTime(baseFreq + 2 + (speedFactor * (maxFreq - baseFreq)), this.ctx!.currentTime, 0.1);

        // Increase volume slightly with speed
        this.gainNode.gain.setTargetAtTime(0.05 + (speedFactor * 0.05), this.ctx!.currentTime, 0.1);
    }

    public speak(text: string) {
        if (!window.speechSynthesis) return;

        // Stop any current speech to avoid overlapping
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        window.speechSynthesis.speak(utterance);
    }
}

export const audioEngine = new AudioEngine();
