import { useState, useEffect, useRef } from 'react';
import { engine } from '../lib/audio/AudioEngine';

export function useAudioEngine() {
  const [isReady, setIsReady] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.8);
  const [audioReverb, setAudioReverb] = useState(0.3);
  const [audioBrightness, setAudioBrightness] = useState(0.7);

  const initAudio = async () => {
    if (!isReady) {
      await engine.init();
      engine.setVolume(audioVolume);
      engine.setReverb(audioReverb);
      engine.setBrightness(audioBrightness);
      setIsReady(true);
    }
  };

  useEffect(() => {
    if (isReady) {
      engine.setVolume(audioVolume);
    }
  }, [audioVolume, isReady]);

  useEffect(() => {
    if (isReady) {
      engine.setReverb(audioReverb);
    }
  }, [audioReverb, isReady]);

  useEffect(() => {
    if (isReady) {
      engine.setBrightness(audioBrightness);
    }
  }, [audioBrightness, isReady]);

  return {
    engine,
    isReady,
    initAudio,
    audioVolume,
    setAudioVolume,
    audioReverb,
    setAudioReverb,
    audioBrightness,
    setAudioBrightness,
  };
}
