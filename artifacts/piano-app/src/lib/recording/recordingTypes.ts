export type RecordingEvent = 
  | { type: 'noteOn'; note: string; midi: number; time: number; velocity: number }
  | { type: 'noteOff'; note: string; midi: number; time: number }
  | { type: 'sustain'; enabled: boolean; time: number };

export type RecordingEventInput =
  | { type: 'noteOn'; note: string; midi: number; velocity: number }
  | { type: 'noteOff'; note: string; midi: number }
  | { type: 'sustain'; enabled: boolean };

export type Recording = {
  id: string;
  version: 1;
  name: string;
  createdAt: string;
  duration: number;
  events: RecordingEvent[];
};
