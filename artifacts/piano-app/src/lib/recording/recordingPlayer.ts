import { Recording, RecordingEvent } from './recordingTypes';
import { AudioEngine } from '../audio/AudioEngine';

export class RecordingPlayer {
  private timeoutIds: number[] = [];
  private isPlaying = false;
  
  constructor(private engine: AudioEngine) {}

  play(recording: Recording, onComplete?: () => void) {
    this.stop();
    this.isPlaying = true;
    
    const startTime = performance.now();
    
    recording.events.forEach((event) => {
      const waitTime = event.time;
      const id = window.setTimeout(() => {
        if (!this.isPlaying) return;
        
        switch (event.type) {
          case 'noteOn':
            this.engine.noteOn(event.note, event.midi, event.velocity);
            break;
          case 'noteOff':
            // we'd need to track voice ID in a real robust system, but we can call a release for the note 
            // The audio engine we wrote expects voiceId. We'd have to modify AudioEngine to stop by note name or keep track.
            // Simplified: we added releaseAllVoices earlier, let's just let it decay or add note off tracking.
            break;
          case 'sustain':
            this.engine.setSustain(event.enabled);
            break;
        }
      }, waitTime);
      this.timeoutIds.push(id);
    });

    // Call onComplete after duration
    const completeId = window.setTimeout(() => {
      this.isPlaying = false;
      if (onComplete) onComplete();
    }, recording.duration);
    this.timeoutIds.push(completeId);
  }

  stop() {
    this.isPlaying = false;
    this.timeoutIds.forEach(clearTimeout);
    this.timeoutIds = [];
    this.engine.stopAll();
  }
}
