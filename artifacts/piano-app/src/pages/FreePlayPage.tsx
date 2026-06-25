import { useCallback, useEffect, useState } from "react";
import { usePiano } from "@/hooks/usePiano";
import { useAudioEngine } from "@/hooks/useAudioEngine";
import { useKeyboardInput } from "@/hooks/useKeyboardInput";
import { useMetronome } from "@/hooks/useMetronome";
import { useRecorder } from "@/hooks/useRecorder";
import { useFullscreen } from "@/hooks/useFullscreen";
import { KEYBOARD_MAPPING, PIANO_KEYS } from "@/lib/piano/notes";
import { PianoKeyboard } from "@/components/Piano/PianoKeyboard";
import { PianoBody } from "@/components/Piano/PianoBody";
import { ControlsPanel } from "@/components/Controls/ControlsPanel";
import { downloadJson } from "@/lib/utils/downloadJson";
import { Recording } from "@/lib/recording/recordingTypes";
import { Music } from "lucide-react";
import { cn } from "@/lib/utils";

const RECORDINGS_KEY = "piano_recordings";
const SETTINGS_KEY = "piano_settings";

function loadSettings() {
  try {
    return JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveRecording(recording: Recording) {
  try {
    const list: Recording[] = JSON.parse(
      localStorage.getItem(RECORDINGS_KEY) || "[]",
    );
    list.push(recording);
    localStorage.setItem(RECORDINGS_KEY, JSON.stringify(list));
  } catch {}
}

export default function FreePlayPage() {
  const audio = useAudioEngine();
  const piano = usePiano();
  const metronome = useMetronome();
  const recorder = useRecorder();
  const { isFullscreen, toggleFullscreen } = useFullscreen();

  const stored = loadSettings();
  const [showNoteLabels, setShowNoteLabels] = useState<boolean>(
    stored.showNoteLabels ?? true,
  );
  const [showKeyLabels, setShowKeyLabels] = useState<boolean>(
    stored.showKeyLabels ?? true,
  );

  useEffect(() => {
    const handler = (e: Event) => {
      const d = (e as CustomEvent).detail;
      if (typeof d?.showNoteLabels === "boolean")
        setShowNoteLabels(d.showNoteLabels);
      if (typeof d?.showKeyLabels === "boolean")
        setShowKeyLabels(d.showKeyLabels);
    };
    window.addEventListener("piano-settings-change", handler);
    return () => window.removeEventListener("piano-settings-change", handler);
  }, []);

  const handlePlayNote = useCallback(
    (name: string, midi: number) => {
      const res = piano.playNote(name, midi);
      if (recorder.isRecording) {
        recorder.recordEvent({
          type: "noteOn",
          note: res.noteName,
          midi: res.midi,
          velocity: 0.8,
        });
      }
    },
    [piano, recorder],
  );

  const handleReleaseNote = useCallback(
    (name: string) => {
      const res = piano.releaseNote(name);
      const keyInfo = PIANO_KEYS.find((k) => k.name === name);
      if (keyInfo && recorder.isRecording) {
        recorder.recordEvent({
          type: "noteOff",
          note: res.noteName,
          midi: keyInfo.midi,
        });
      }
    },
    [piano, recorder],
  );

  const handleKeyDown = useCallback(
    (code: string) => {
      if (!audio.isReady) audio.initAudio();
      const mapped = KEYBOARD_MAPPING[code];
      if (mapped) {
        const key = PIANO_KEYS.find((k) => k.name === mapped.note);
        if (key) handlePlayNote(key.name, key.midi);
      }
    },
    [audio, handlePlayNote],
  );

  const handleKeyUp = useCallback(
    (code: string) => {
      const mapped = KEYBOARD_MAPPING[code];
      if (mapped) handleReleaseNote(mapped.note);
    },
    [handleReleaseNote],
  );

  const handleSustainDown = useCallback(() => {
    piano.toggleSustain(true);
    if (recorder.isRecording)
      recorder.recordEvent({ type: "sustain", enabled: true });
  }, [piano, recorder]);

  const handleSustainUp = useCallback(() => {
    piano.toggleSustain(false);
    if (recorder.isRecording)
      recorder.recordEvent({ type: "sustain", enabled: false });
  }, [piano, recorder]);

  const handleStopRecord = useCallback(() => {
    const rec = recorder.stopRecording();
    if (rec) saveRecording(rec);
  }, [recorder]);

  const handleExportRecording = useCallback(() => {
    if (!recorder.currentRecording) return;
    downloadJson(
      {
        app: "Web Piano",
        type: "recording",
        version: 1,
        exportedAt: new Date().toISOString(),
        recording: recorder.currentRecording,
      },
      `${recorder.currentRecording.name.replace(/[^a-z0-9]/gi, "_")}.json`,
    );
  }, [recorder.currentRecording]);

  useKeyboardInput({
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onSustainDown: handleSustainDown,
    onSustainUp: handleSustainUp,
    onOctaveDown: () => piano.changeOctave(-1),
    onOctaveUp: () => piano.changeOctave(1),
    onToggleMetronome: metronome.toggle,
  });

  return (
    /* h-full works because App.tsx gives main a proper height via h-[100dvh] + min-h-0 */
    <div
      className="h-full flex flex-col overflow-hidden"
      onClick={() => {
        if (!audio.isReady) audio.initAudio();
      }}
    >
      {/* Audio init overlay */}
      {!audio.isReady && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm cursor-pointer">
          <div className="bg-card border border-border rounded-2xl px-10 py-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Music className="w-7 h-7 text-primary" />
            </div>
            <h2 className="text-xl font-bold mb-2">Click to Start Playing</h2>
            <p className="text-sm text-muted-foreground">
              Browser requires a click before audio can play
            </p>
          </div>
        </div>
      )}

      {/* Controls panel — fixed height */}
      <div className="shrink-0 px-3 pt-3 pb-2">
        <ControlsPanel
          audio={audio}
          piano={piano}
          recorder={{ ...recorder, stopRecording: handleStopRecord }}
          metronome={metronome}
          showNoteLabels={showNoteLabels}
          setShowNoteLabels={setShowNoteLabels}
          showKeyLabels={showKeyLabels}
          setShowKeyLabels={setShowKeyLabels}
          isFullscreen={isFullscreen}
          toggleFullscreen={toggleFullscreen}
          onExportRecording={handleExportRecording}
        />
      </div>

      {/* Active notes status bar — fixed height */}
      <div className="shrink-0 px-3 pb-2">
        <div className="flex items-center justify-between px-4 py-2 rounded-lg bg-card border border-border">
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground uppercase tracking-wider font-medium">
              Notes
            </span>
            <div className="flex items-center gap-1 min-w-[80px]">
              {Array.from(piano.activeNotes).length === 0 ? (
                <span className="text-muted-foreground/40 text-xs">—</span>
              ) : (
                Array.from(piano.activeNotes).map((n) => (
                  <span
                    key={n}
                    className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-xs font-mono font-semibold"
                  >
                    {n}
                  </span>
                ))
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            {piano.octaveShift !== 0 && (
              <span className="text-xs text-muted-foreground font-mono">
                OCT {piano.octaveShift > 0 ? "+" : ""}
                {piano.octaveShift}
              </span>
            )}
            <div
              className={cn(
                "text-xs font-bold tracking-widest transition-opacity",
                piano.sustain
                  ? "text-primary opacity-100"
                  : "text-muted-foreground opacity-30",
              )}
            >
              SUSTAIN
            </div>
            {recorder.isRecording && (
              <div className="flex items-center gap-1.5 text-destructive animate-pulse">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <span className="text-xs font-bold tracking-widest">REC</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Piano — fills all remaining vertical space */}
      <div className="flex-1 min-h-0 px-3 pb-3">
        <PianoBody className="h-full">
          <PianoKeyboard
            activeNotes={piano.activeNotes}
            showNoteLabels={showNoteLabels}
            showKeyLabels={showKeyLabels}
            onPlayNote={handlePlayNote}
            onReleaseNote={handleReleaseNote}
          />
        </PianoBody>
      </div>
    </div>
  );
}
