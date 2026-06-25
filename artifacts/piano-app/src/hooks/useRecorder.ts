import { useState, useRef, useCallback } from 'react';
import { Recording, RecordingEvent, RecordingEventInput } from '../lib/recording/recordingTypes';
import { RecordingPlayer } from '../lib/recording/recordingPlayer';
import { engine } from '../lib/audio/AudioEngine';

export function useRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  
  const startTime = useRef<number>(0);
  const events = useRef<RecordingEvent[]>([]);
  const player = useRef(new RecordingPlayer(engine));

  const startRecording = useCallback(() => {
    events.current = [];
    startTime.current = performance.now();
    setIsRecording(true);
  }, []);

  const stopRecording = useCallback(() => {
    setIsRecording(false);
    if (events.current.length > 0) {
      const recording: Recording = {
        id: `rec_${Date.now()}`,
        version: 1,
        name: `Recording ${new Date().toLocaleString()}`,
        createdAt: new Date().toISOString(),
        duration: performance.now() - startTime.current,
        events: [...events.current]
      };
      setCurrentRecording(recording);
      return recording;
    }
    return null;
  }, []);

  const recordEvent = useCallback((event: RecordingEventInput) => {
    if (!isRecording) return;
    events.current.push({
      ...event,
      time: performance.now() - startTime.current
    } as RecordingEvent);
  }, [isRecording]);

  const playRecording = useCallback((recording: Recording, onComplete?: () => void) => {
    player.current.play(recording, onComplete);
  }, []);

  const stopPlayback = useCallback(() => {
    player.current.stop();
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    recordEvent,
    currentRecording,
    playRecording,
    stopPlayback
  };
}
