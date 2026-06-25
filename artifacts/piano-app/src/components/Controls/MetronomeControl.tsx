import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Play, Square } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetronomeControlProps {
  isPlaying: boolean;
  bpm: number;
  setBpm: (bpm: number) => void;
  toggle: () => void;
  beat: number;
}

export function MetronomeControl({ isPlaying, bpm, setBpm, toggle, beat }: MetronomeControlProps) {
  return (
    <div className="flex gap-4 items-center bg-card p-2 rounded-md border border-border">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggle} data-testid="button-metronome">
          {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </Button>
        <div className="flex flex-col">
          <Label className="text-xs text-muted-foreground">BPM</Label>
          <span className="font-mono text-sm w-8">{bpm}</span>
        </div>
      </div>
      <Slider 
        className="w-24"
        value={[bpm]} 
        min={40} max={240} step={1} 
        onValueChange={(v) => setBpm(v[0])} 
      />
      <div className="flex gap-1 h-3">
        {[0, 1, 2, 3].map(i => (
          <div 
            key={i} 
            className={`w-3 h-3 rounded-full transition-colors ${isPlaying && beat === i ? 'bg-primary' : 'bg-muted'}`}
          />
        ))}
      </div>
    </div>
  );
}
