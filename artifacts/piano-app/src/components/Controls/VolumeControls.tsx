import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface VolumeControlsProps {
  volume: number;
  setVolume: (v: number) => void;
  reverb: number;
  setReverb: (v: number) => void;
  brightness: number;
  setBrightness: (v: number) => void;
}

export function VolumeControls({
  volume, setVolume,
  reverb, setReverb,
  brightness, setBrightness
}: VolumeControlsProps) {
  return (
    <div className="flex gap-6 items-center">
      <div className="flex flex-col gap-2 w-24">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Volume</Label>
        <Slider value={[volume]} min={0} max={1} step={0.01} onValueChange={(v) => setVolume(v[0])} />
      </div>
      <div className="flex flex-col gap-2 w-24">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Reverb</Label>
        <Slider value={[reverb]} min={0} max={1} step={0.01} onValueChange={(v) => setReverb(v[0])} />
      </div>
      <div className="flex flex-col gap-2 w-24">
        <Label className="text-xs text-muted-foreground uppercase tracking-wider">Brightness</Label>
        <Slider value={[brightness]} min={0} max={1} step={0.01} onValueChange={(v) => setBrightness(v[0])} />
      </div>
    </div>
  );
}
