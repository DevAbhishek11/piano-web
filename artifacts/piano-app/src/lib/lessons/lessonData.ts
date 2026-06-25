import { Lesson } from './lessonTypes';

export const LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    title: "Introduction to the Piano",
    description: "Get familiar with the layout of the piano keyboard and how keys are arranged.",
    steps: [
      { text: "Welcome! The piano keyboard is made of white keys and shorter black keys. Black keys are grouped in sets of 2 and 3 — this pattern repeats across the keyboard." },
      { text: "The note C always appears to the left of a group of two black keys. Find and press C4 (Middle C) to continue.", expectedNote: "C4" },
      { text: "Great! Now press D4 — the next white key to the right of C4.", expectedNote: "D4" },
      { text: "Now press E4 — two keys to the right of C4.", expectedNote: "E4" },
      { text: "You just played C-D-E, the first three notes of a scale! Press C4 one more time to finish.", expectedNote: "C4" }
    ]
  },
  {
    id: "lesson-2",
    title: "Note Names: C D E F G A B",
    description: "Learn the seven note names that make up the musical alphabet.",
    steps: [
      { text: "The musical alphabet has only 7 letters: C, D, E, F, G, A, B. Then they repeat! Press C4 to start.", expectedNote: "C4" },
      { text: "D4 — next white key to the right.", expectedNote: "D4" },
      { text: "E4.", expectedNote: "E4" },
      { text: "F4 — right after E.", expectedNote: "F4" },
      { text: "G4.", expectedNote: "G4" },
      { text: "A4.", expectedNote: "A4" },
      { text: "B4 — the last note before the alphabet repeats.", expectedNote: "B4" },
      { text: "Excellent! Now C5 — one octave above where we started.", expectedNote: "C5" }
    ]
  },
  {
    id: "lesson-3",
    title: "Finding Middle C",
    description: "Middle C is the most important reference point on the piano.",
    steps: [
      { text: "Middle C (C4) is near the center of a standard piano. It's the white key immediately to the LEFT of a group of TWO black keys." },
      { text: "Press Middle C (C4) now.", expectedNote: "C4" },
      { text: "Middle C is used to orient yourself on the keyboard. From here, notes get higher to the right and lower to the left. Press C3 (one octave lower).", expectedNote: "C3" },
      { text: "Now press C5 (one octave higher than Middle C).", expectedNote: "C5" },
      { text: "Return home to Middle C (C4).", expectedNote: "C4" }
    ]
  },
  {
    id: "lesson-4",
    title: "Playing a C Major Scale",
    description: "The C Major scale is the foundation of western music — all white keys!",
    steps: [
      { text: "A scale is a sequence of notes in order. The C Major scale uses only white keys. Play them one by one, starting with C4.", expectedNote: "C4" },
      { text: "D4", expectedNote: "D4" },
      { text: "E4", expectedNote: "E4" },
      { text: "F4", expectedNote: "F4" },
      { text: "G4", expectedNote: "G4" },
      { text: "A4", expectedNote: "A4" },
      { text: "B4", expectedNote: "B4" },
      { text: "C5 — the scale is complete! You played 8 notes, returning to C one octave higher.", expectedNote: "C5" }
    ]
  },
  {
    id: "lesson-5",
    title: "Black Keys and Sharps",
    description: "Learn what the black keys are called and when they're used.",
    steps: [
      { text: "Black keys are called sharps (#) or flats (b). A sharp raises a note by a half step. Press C4 first.", expectedNote: "C4" },
      { text: "Now press C#4 — the black key just to the RIGHT of C4. Use Shift+8 on keyboard.", expectedNote: "C#4" },
      { text: "Press D4 (white key).", expectedNote: "D4" },
      { text: "Now D#4 — the black key to the right of D4. Use Shift+9.", expectedNote: "D#4" },
      { text: "Notice there's no black key between E and F, or between B and C. Press F4 (skip E).", expectedNote: "F4" },
      { text: "F#4 — the black key to the right of F.", expectedNote: "F#4" },
      { text: "G4", expectedNote: "G4" },
      { text: "G#4 — the last black key in this group.", expectedNote: "G#4" }
    ]
  },
  {
    id: "lesson-6",
    title: "Basic Rhythm with Metronome",
    description: "Practice playing in time using the metronome.",
    steps: [
      { text: "Turn on the metronome using the M key or the metronome button in the controls panel. Set it to 60 BPM to start slowly." },
      { text: "Play one note per beat. Press C4 — try to land it exactly on the beat.", expectedNote: "C4" },
      { text: "Press E4 on the next beat.", expectedNote: "E4" },
      { text: "Press G4 on the next beat.", expectedNote: "G4" },
      { text: "Press C5 on the next beat.", expectedNote: "C5" },
      { text: "Great! Now try going back: C5, G4, E4, C4. Press C5.", expectedNote: "C5" },
      { text: "G4", expectedNote: "G4" },
      { text: "E4", expectedNote: "E4" },
      { text: "C4 — nice work playing with the metronome!", expectedNote: "C4" }
    ]
  },
  {
    id: "lesson-7",
    title: "C Major Chord",
    description: "Play your first chord — three notes at once!",
    steps: [
      { text: "A chord is multiple notes played at the same time. The C Major chord uses C, E, and G together. First, let's practice each note separately. Press C4.", expectedNote: "C4" },
      { text: "Press E4.", expectedNote: "E4" },
      { text: "Press G4.", expectedNote: "G4" },
      { text: "Now press F4 — this is the root of the F Major chord (F, A, C).", expectedNote: "F4" },
      { text: "Press A4.", expectedNote: "A4" },
      { text: "Press C5.", expectedNote: "C5" },
      { text: "Press G4 — root of G Major (G, B, D).", expectedNote: "G4" },
      { text: "Press B4.", expectedNote: "B4" },
      { text: "Press D5.", expectedNote: "D5" },
      { text: "Return to C4 — the home chord. Try holding C, E, and G together with the mouse.", expectedNote: "C4" }
    ]
  },
  {
    id: "lesson-8",
    title: "Twinkle Twinkle Little Star",
    description: "Practice your first melody — a classic beginner song.",
    steps: [
      { text: "Twinkle Twinkle uses just a few notes. Follow along note by note. Press C4.", expectedNote: "C4" },
      { text: "C4 again", expectedNote: "C4" },
      { text: "G4", expectedNote: "G4" },
      { text: "G4", expectedNote: "G4" },
      { text: "A4", expectedNote: "A4" },
      { text: "A4", expectedNote: "A4" },
      { text: "G4", expectedNote: "G4" },
      { text: "F4", expectedNote: "F4" },
      { text: "F4", expectedNote: "F4" },
      { text: "E4", expectedNote: "E4" },
      { text: "E4", expectedNote: "E4" },
      { text: "D4", expectedNote: "D4" },
      { text: "D4", expectedNote: "D4" },
      { text: "C4 — first phrase complete!", expectedNote: "C4" }
    ]
  },
  {
    id: "lesson-9",
    title: "Mary Had a Little Lamb",
    description: "A simple three-note melody to build your finger independence.",
    steps: [
      { text: "Mary Had a Little Lamb uses only E, D, C, and G. Press E4.", expectedNote: "E4" },
      { text: "D4", expectedNote: "D4" },
      { text: "C4", expectedNote: "C4" },
      { text: "D4", expectedNote: "D4" },
      { text: "E4", expectedNote: "E4" },
      { text: "E4", expectedNote: "E4" },
      { text: "E4", expectedNote: "E4" },
      { text: "D4", expectedNote: "D4" },
      { text: "D4", expectedNote: "D4" },
      { text: "D4", expectedNote: "D4" },
      { text: "E4", expectedNote: "E4" },
      { text: "G4", expectedNote: "G4" },
      { text: "G4 — phrase complete!", expectedNote: "G4" }
    ]
  },
  {
    id: "lesson-10",
    title: "Ode to Joy",
    description: "Beethoven's famous melody — a great beginner achievement.",
    steps: [
      { text: "Ode to Joy uses E, F, G, A, B, D. Press E4.", expectedNote: "E4" },
      { text: "E4", expectedNote: "E4" },
      { text: "F4", expectedNote: "F4" },
      { text: "G4", expectedNote: "G4" },
      { text: "G4", expectedNote: "G4" },
      { text: "F4", expectedNote: "F4" },
      { text: "E4", expectedNote: "E4" },
      { text: "D4", expectedNote: "D4" },
      { text: "C4", expectedNote: "C4" },
      { text: "C4", expectedNote: "C4" },
      { text: "D4", expectedNote: "D4" },
      { text: "E4", expectedNote: "E4" },
      { text: "E4", expectedNote: "E4" },
      { text: "D4", expectedNote: "D4" },
      { text: "D4 — Congratulations! You played Ode to Joy!", expectedNote: "D4" }
    ]
  }
];
