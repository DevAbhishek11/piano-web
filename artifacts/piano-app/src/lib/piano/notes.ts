export type PianoNote = {
  note: string;     // e.g. "C", "C#"
  octave: number;   // e.g. 3, 4
  name: string;     // e.g. "C4"
  midi: number;     // e.g. 60
  isBlack: boolean;
  code?: string;    // event.code like "Digit1"
  shiftCode?: string; // event.code with shift, for black keys
};

// Map based on user's table
export const KEYBOARD_MAPPING: Record<string, { note: string; isShift: boolean }> = {
  "Digit1": { note: "C3", isShift: false },
  "Digit2": { note: "D3", isShift: false },
  "Digit3": { note: "E3", isShift: false },
  "Digit4": { note: "F3", isShift: false },
  "Digit5": { note: "G3", isShift: false },
  "Digit6": { note: "A3", isShift: false },
  "Digit7": { note: "B3", isShift: false },
  "Digit8": { note: "C4", isShift: false },
  "Digit9": { note: "D4", isShift: false },
  "Digit0": { note: "E4", isShift: false },
  "KeyQ": { note: "F4", isShift: false },
  "KeyW": { note: "G4", isShift: false },
  "KeyE": { note: "A4", isShift: false },
  "KeyR": { note: "B4", isShift: false },
  "KeyT": { note: "C5", isShift: false },
  "KeyY": { note: "D5", isShift: false },
  "KeyU": { note: "E5", isShift: false },
  "KeyI": { note: "F5", isShift: false },
  "KeyO": { note: "G5", isShift: false },
  "KeyP": { note: "A5", isShift: false },
  "KeyA": { note: "B5", isShift: false },
  "KeyS": { note: "C6", isShift: false },
  "KeyD": { note: "D6", isShift: false },
  "KeyF": { note: "E6", isShift: false },
  "KeyG": { note: "F6", isShift: false },
  "KeyH": { note: "G6", isShift: false },
  "KeyJ": { note: "A6", isShift: false },
  "KeyK": { note: "B6", isShift: false },
  "KeyL": { note: "C7", isShift: false },

  // Blacks
  "Shift+Digit1": { note: "C#3", isShift: true },
  "Shift+Digit2": { note: "D#3", isShift: true },
  "Shift+Digit4": { note: "F#3", isShift: true },
  "Shift+Digit5": { note: "G#3", isShift: true },
  "Shift+Digit6": { note: "A#3", isShift: true },
  "Shift+Digit8": { note: "C#4", isShift: true },
  "Shift+Digit9": { note: "D#4", isShift: true },
  "Shift+KeyQ": { note: "F#4", isShift: true },
  "Shift+KeyW": { note: "G#4", isShift: true },
  "Shift+KeyE": { note: "A#4", isShift: true },
  "Shift+KeyT": { note: "C#5", isShift: true },
  "Shift+KeyY": { note: "D#5", isShift: true },
  "Shift+KeyI": { note: "F#5", isShift: true },
  "Shift+KeyO": { note: "G#5", isShift: true },
  "Shift+KeyP": { note: "A#5", isShift: true },
  "Shift+KeyS": { note: "C#6", isShift: true },
  "Shift+KeyD": { note: "D#6", isShift: true },
  "Shift+KeyG": { note: "F#6", isShift: true },
  "Shift+KeyH": { note: "G#6", isShift: true },
  "Shift+KeyJ": { note: "A#6", isShift: true },
};

export const REVERSE_KEYBOARD_MAPPING: Record<string, string> = {};
Object.entries(KEYBOARD_MAPPING).forEach(([code, { note }]) => {
  REVERSE_KEYBOARD_MAPPING[note] = code;
});

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

export function generatePianoNotes(): PianoNote[] {
  const notes: PianoNote[] = [];
  
  // C3 (midi 48) to C7 (midi 96)
  for (let midi = 48; midi <= 96; midi++) {
    const noteIdx = (midi - 12) % 12; // MIDI 60 is C4. 60-12=48. 48%12 = 0 (C)
    const noteName = NOTE_NAMES[noteIdx];
    const octave = Math.floor(midi / 12) - 1;
    const name = `${noteName}${octave}`;
    const isBlack = noteName.includes("#");
    
    notes.push({
      note: noteName,
      octave,
      name,
      midi,
      isBlack,
      code: !isBlack ? REVERSE_KEYBOARD_MAPPING[name] : undefined,
      shiftCode: isBlack ? REVERSE_KEYBOARD_MAPPING[name]?.replace("Shift+", "") : undefined
    });
  }
  
  return notes;
}

export const PIANO_KEYS = generatePianoNotes();
