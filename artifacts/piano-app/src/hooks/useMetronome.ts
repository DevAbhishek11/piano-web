import { useState, useRef, useCallback } from 'react';

export function useMetronome() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpmState] = useState(120);
  const [beat, setBeat] = useState(0);

  const bpmRef = useRef(120);
  const nextNoteTimeRef = useRef(0);
  const currentBeatRef = useRef(0);
  const timerIDRef = useRef<number | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = (): AudioContext => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return ctxRef.current;
  };

  const scheduleClick = useCallback((beatNumber: number, time: number) => {
    const ctx = getCtx();
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.frequency.value = beatNumber === 0 ? 880 : 440;
    gainNode.gain.setValueAtTime(0.5, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.start(time);
    osc.stop(time + 0.05);

    const delay = Math.max(0, (time - ctx.currentTime) * 1000);
    setTimeout(() => setBeat(beatNumber), delay);
  }, []);

  const scheduler = useCallback(() => {
    const ctx = getCtx();
    while (nextNoteTimeRef.current < ctx.currentTime + 0.1) {
      scheduleClick(currentBeatRef.current, nextNoteTimeRef.current);
      const secondsPerBeat = 60.0 / bpmRef.current;
      nextNoteTimeRef.current += secondsPerBeat;
      currentBeatRef.current = (currentBeatRef.current + 1) % 4;
    }
    timerIDRef.current = window.setTimeout(scheduler, 25);
  }, [scheduleClick]);

  const startMetronome = useCallback(() => {
    const ctx = getCtx();
    if (ctx.state === 'suspended') ctx.resume();
    currentBeatRef.current = 0;
    nextNoteTimeRef.current = ctx.currentTime + 0.05;
    scheduler();
    setIsPlaying(true);
  }, [scheduler]);

  const stopMetronome = useCallback(() => {
    if (timerIDRef.current !== null) {
      clearTimeout(timerIDRef.current);
      timerIDRef.current = null;
    }
    setBeat(0);
    currentBeatRef.current = 0;
    setIsPlaying(false);
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      stopMetronome();
    } else {
      startMetronome();
    }
  }, [isPlaying, startMetronome, stopMetronome]);

  const setBpm = useCallback((newBpm: number) => {
    bpmRef.current = newBpm;
    setBpmState(newBpm);
  }, []);

  return { isPlaying, bpm, setBpm, beat, toggle };
}
