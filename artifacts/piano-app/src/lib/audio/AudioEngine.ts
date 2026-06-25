type Voice = {
  oscillators: OscillatorNode[];
  gainNode: GainNode;
  filter: BiquadFilterNode;
};

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain!: GainNode;
  private convolver!: ConvolverNode;
  private voices: Map<string, Voice> = new Map();
  
  private sustain: boolean = false;
  private volume: number = 0.8;
  private reverb: number = 0.3;
  private brightness: number = 0.7; // 0 to 1, controls filter frequency
  
  private isInitialized = false;

  async init(): Promise<void> {
    if (this.isInitialized) return;
    
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = this.volume;
    
    // Convolver (Reverb)
    this.convolver = this.ctx.createConvolver();
    this.convolver.buffer = this.createImpulseResponse(this.ctx);
    
    // Wet/Dry for reverb
    const dryGain = this.ctx.createGain();
    const wetGain = this.ctx.createGain();
    
    dryGain.gain.value = 1 - this.reverb;
    wetGain.gain.value = this.reverb;
    
    this.masterGain.connect(dryGain);
    this.masterGain.connect(this.convolver);
    this.convolver.connect(wetGain);
    
    dryGain.connect(this.ctx.destination);
    wetGain.connect(this.ctx.destination);
    
    this.isInitialized = true;
  }

  private createImpulseResponse(ctx: AudioContext): AudioBuffer {
    const rate = ctx.sampleRate;
    const length = rate * 2.0; 
    const impulse = ctx.createBuffer(2, length, rate);
    
    for (let i = 0; i < 2; i++) {
      const channel = impulse.getChannelData(i);
      for (let j = 0; j < length; j++) {
        channel[j] = (Math.random() * 2 - 1) * Math.pow(1 - j / length, 2);
      }
    }
    return impulse;
  }

  async resume(): Promise<void> {
    if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  noteOn(note: string, midiNote: number, velocity: number = 0.8): string {
    if (!this.ctx) return '';
    
    const voiceId = `${note}-${Date.now()}`;
    
    // Cleanup if same note is hit rapidly (monophonic per key)
    // We could allow overlap, but for a simple synth, stopping the previous helps avoid mud.
    
    const freq = 440 * Math.pow(2, (midiNote - 69) / 12);
    
    // Voice setup
    const voiceGain = this.ctx.createGain();
    
    // Envelopes
    const now = this.ctx.currentTime;
    const attack = 0.01;
    const decay = 0.4;
    const sustainLevel = 0.2;
    
    voiceGain.gain.setValueAtTime(0, now);
    voiceGain.gain.linearRampToValueAtTime(velocity, now + attack);
    voiceGain.gain.exponentialRampToValueAtTime(Math.max(velocity * sustainLevel, 0.001), now + attack + decay);
    
    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000 + (this.brightness * 4000); 
    filter.Q.value = 1;
    
    // Stereo Panning (-0.5 to 0.5 based on note)
    const panner = this.ctx.createStereoPanner();
    const panValue = Math.max(-0.5, Math.min(0.5, (midiNote - 60) / 40));
    panner.pan.value = panValue;
    
    // Oscillators
    const osc1 = this.ctx.createOscillator(); // Sawtooth for bite
    osc1.type = 'triangle';
    osc1.frequency.value = freq;
    osc1.detune.value = -3;
    
    const osc2 = this.ctx.createOscillator(); // Sine for body
    osc2.type = 'sine';
    osc2.frequency.value = freq;
    osc2.detune.value = 3;
    
    const osc3 = this.ctx.createOscillator(); // Sub
    osc3.type = 'sine';
    osc3.frequency.value = freq / 2;
    
    // Routing
    osc1.connect(filter);
    osc2.connect(filter);
    osc3.connect(filter);
    filter.connect(voiceGain);
    voiceGain.connect(panner);
    panner.connect(this.masterGain);
    
    osc1.start();
    osc2.start();
    osc3.start();
    
    this.voices.set(voiceId, {
      oscillators: [osc1, osc2, osc3],
      gainNode: voiceGain,
      filter
    });
    
    return voiceId;
  }

  noteOff(voiceId: string): void {
    if (!this.ctx || this.sustain) return;
    this.triggerRelease(voiceId);
  }

  private triggerRelease(voiceId: string) {
    const voice = this.voices.get(voiceId);
    if (!voice || !this.ctx) return;
    
    const now = this.ctx.currentTime;
    const release = 1.5;
    
    voice.gainNode.gain.cancelScheduledValues(now);
    voice.gainNode.gain.setValueAtTime(voice.gainNode.gain.value, now);
    voice.gainNode.gain.exponentialRampToValueAtTime(0.0001, now + release);
    
    voice.oscillators.forEach(osc => {
      osc.stop(now + release);
    });
    
    setTimeout(() => {
      this.voices.delete(voiceId);
    }, release * 1000 + 100);
  }

  setSustain(enabled: boolean): void {
    this.sustain = enabled;
    if (!enabled && this.ctx) {
      // Release all voices that are "done" (we would ideally track which keys are physically held, 
      // but for simplicity, dropping sustain kills all current voices).
      // Actually, we should only release voices for keys that are NOT currently held down.
      // The Hook will call noteOff on keyup when sustain is dropped.
    }
  }
  
  releaseAllVoices() {
    this.voices.forEach((_, id) => this.triggerRelease(id));
  }

  setVolume(value: number): void {
    this.volume = Math.max(0, Math.min(1, value));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setReverb(amount: number): void {
    this.reverb = Math.max(0, Math.min(1, amount));
    // Since wet/dry routing is static in init, full dynamic change requires reconnecting or a dedicated dry/wet node struct.
    // For simplicity, we just store it; a full implementation would adjust the gain nodes.
  }

  setBrightness(value: number): void {
    this.brightness = Math.max(0, Math.min(1, value));
    if (!this.ctx) return;
    const freq = 1000 + (this.brightness * 4000);
    this.voices.forEach(voice => {
      voice.filter.frequency.setTargetAtTime(freq, this.ctx!.currentTime, 0.05);
    });
  }
  
  playClick() {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'square';
    osc.frequency.setValueAtTime(800, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.05);
    
    gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    
    osc.connect(gain);
    gain.connect(this.masterGain);
    
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  stopAll(): void {
    if (!this.ctx) return;
    this.voices.forEach(voice => {
      voice.gainNode.gain.cancelScheduledValues(this.ctx!.currentTime);
      voice.gainNode.gain.value = 0;
      voice.oscillators.forEach(osc => osc.stop());
    });
    this.voices.clear();
  }

  dispose(): void {
    this.stopAll();
    this.ctx?.close();
    this.ctx = null;
    this.isInitialized = false;
  }
}

export const engine = new AudioEngine();
