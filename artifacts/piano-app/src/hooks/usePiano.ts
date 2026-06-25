import { useState, useRef, useCallback } from 'react';
import { engine } from '../lib/audio/AudioEngine';
import { KEYBOARD_MAPPING } from '../lib/piano/notes';

export function usePiano() {
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());
  const [sustain, setSustain] = useState(false);
  const [octaveShift, setOctaveShift] = useState(0);
  
  // Track active voices { noteName: voiceId }
  const voices = useRef(new Map<string, string>());
  
  const playNote = useCallback((note: string, midi: number, velocity: number = 0.8) => {
    // Shift octave logic could go here if we were generating the MIDI dynamically, 
    // but the keyboard mapping maps specific keys to specific notes. 
    // We'll apply the octave shift to the MIDI note and name.
    
    const shiftedMidi = midi + (octaveShift * 12);
    // Rough note name shift for display
    const match = note.match(/([A-G]#?)(\d)/);
    let shiftedNoteName = note;
    if (match) {
      shiftedNoteName = `${match[1]}${parseInt(match[2]) + octaveShift}`;
    }

    const voiceId = engine.noteOn(shiftedNoteName, shiftedMidi, velocity);
    voices.current.set(shiftedNoteName, voiceId);
    
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.add(shiftedNoteName);
      return next;
    });
    
    return { noteName: shiftedNoteName, midi: shiftedMidi, voiceId };
  }, [octaveShift]);

  const releaseNote = useCallback((note: string) => {
    // Determine the shifted note name
    const match = note.match(/([A-G]#?)(\d)/);
    let shiftedNoteName = note;
    if (match) {
      shiftedNoteName = `${match[1]}${parseInt(match[2]) + octaveShift}`;
    }

    const voiceId = voices.current.get(shiftedNoteName);
    if (voiceId) {
      engine.noteOff(voiceId);
      voices.current.delete(shiftedNoteName);
    }
    
    setActiveNotes(prev => {
      const next = new Set(prev);
      next.delete(shiftedNoteName);
      return next;
    });
    
    return { noteName: shiftedNoteName };
  }, [octaveShift]);

  const toggleSustain = useCallback((enabled: boolean) => {
    setSustain(enabled);
    engine.setSustain(enabled);
  }, []);

  const changeOctave = useCallback((delta: number) => {
    setOctaveShift(prev => {
      const next = prev + delta;
      return Math.max(-2, Math.min(2, next));
    });
  }, []);
  
  const stopAll = useCallback(() => {
    engine.stopAll();
    voices.current.clear();
    setActiveNotes(new Set());
  }, []);

  return {
    activeNotes,
    sustain,
    octaveShift,
    playNote,
    releaseNote,
    toggleSustain,
    changeOctave,
    stopAll,
    setOctaveShift
  };
}
