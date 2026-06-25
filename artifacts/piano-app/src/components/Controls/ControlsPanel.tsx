import { VolumeControls } from "./VolumeControls";
import { MetronomeControl } from "./MetronomeControl";
import { RecordingControls } from "./RecordingControls";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Maximize, Minimize, ZapOff } from "lucide-react";

interface ControlsPanelProps {
  audio: any;
  piano: any;
  recorder: any;
  metronome: any;
  showNoteLabels: boolean;
  setShowNoteLabels: (v: boolean) => void;
  showKeyLabels: boolean;
  setShowKeyLabels: (v: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  onExportRecording?: () => void;
}

export function ControlsPanel({
  audio,
  piano,
  recorder,
  metronome,
  showNoteLabels,
  setShowNoteLabels,
  showKeyLabels,
  setShowKeyLabels,
  isFullscreen,
  toggleFullscreen,
  onExportRecording
}: ControlsPanelProps) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-lg w-full">
      {/* Row 1: Volume + Sustain + Panic */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-4 py-2.5 border-b border-border">
        <VolumeControls
          volume={audio.audioVolume} setVolume={audio.setAudioVolume}
          reverb={audio.audioReverb} setReverb={audio.setAudioReverb}
          brightness={audio.audioBrightness} setBrightness={audio.setAudioBrightness}
        />
        <div className="ml-auto flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Switch
              checked={piano.sustain}
              onCheckedChange={piano.toggleSustain}
              id="sustain-toggle"
            />
            <Label htmlFor="sustain-toggle" className="text-sm cursor-pointer select-none">Sustain</Label>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={piano.stopAll}
            className="gap-1.5"
            data-testid="button-panic"
          >
            <ZapOff className="w-3.5 h-3.5" />
            Panic
          </Button>
        </div>
      </div>

      {/* Row 2: Octave + Metronome */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5 border-b border-border">
        {/* Octave Shift */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium w-12">Octave</span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 text-base font-bold"
            onClick={() => piano.changeOctave(-1)}
            data-testid="button-octave-down"
          >
            −
          </Button>
          <span className={`font-mono text-sm w-6 text-center font-semibold ${piano.octaveShift !== 0 ? 'text-primary' : 'text-foreground'}`}>
            {piano.octaveShift > 0 ? `+${piano.octaveShift}` : piano.octaveShift}
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 text-base font-bold"
            onClick={() => piano.changeOctave(1)}
            data-testid="button-octave-up"
          >
            +
          </Button>
        </div>

        <div className="w-px h-6 bg-border hidden sm:block" />

        {/* Metronome */}
        <MetronomeControl
          isPlaying={metronome.isPlaying}
          bpm={metronome.bpm}
          setBpm={metronome.setBpm}
          toggle={metronome.toggle}
          beat={metronome.beat}
        />
      </div>

      {/* Row 3: Recording + Display toggles + Fullscreen */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-2.5">
        <RecordingControls
          isRecording={recorder.isRecording}
          onStartRecord={recorder.startRecording}
          onStopRecord={recorder.stopRecording}
          currentRecording={recorder.currentRecording}
          onPlayRecording={() => recorder.playRecording(recorder.currentRecording)}
          onStopPlayback={recorder.stopPlayback}
          onClearRecording={() => recorder.stopPlayback()}
          onExportRecording={onExportRecording ?? (() => {})}
        />

        <div className="ml-auto flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Switch
              checked={showNoteLabels}
              onCheckedChange={setShowNoteLabels}
              id="notes-toggle"
              className="scale-90"
            />
            <Label htmlFor="notes-toggle" className="text-xs text-muted-foreground cursor-pointer select-none">Notes</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <Switch
              checked={showKeyLabels}
              onCheckedChange={setShowKeyLabels}
              id="keys-toggle"
              className="scale-90"
            />
            <Label htmlFor="keys-toggle" className="text-xs text-muted-foreground cursor-pointer select-none">Keys</Label>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={toggleFullscreen}
            data-testid="button-fullscreen"
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}
