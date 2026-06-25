import { useState, useEffect } from 'react';
import { engine } from '@/lib/audio/AudioEngine';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Volume2, Piano, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

type Theme = 'classic' | 'darkStudio' | 'warmWood';

const THEMES: { id: Theme; label: string; description: string; accent: string }[] = [
  { id: 'classic', label: 'Classic Piano', description: 'Dark & elegant with warm gold accents', accent: '#c8a84b' },
  { id: 'darkStudio', label: 'Dark Studio', description: 'Deep dark with purple highlights', accent: '#7c3aed' },
  { id: 'warmWood', label: 'Warm Wood', description: 'Rich mahogany with amber tones', accent: '#b45309' },
];

function getStoredSettings() {
  try {
    return JSON.parse(localStorage.getItem('piano_settings') || '{}');
  } catch { return {}; }
}

function saveSettings(updates: Record<string, unknown>) {
  try {
    const current = getStoredSettings();
    localStorage.setItem('piano_settings', JSON.stringify({ ...current, ...updates }));
  } catch {}
}

export default function SettingsPage() {
  const stored = getStoredSettings();

  const [theme, setTheme] = useState<Theme>(stored.theme ?? 'classic');
  const [volume, setVolume] = useState<number>(stored.volume ?? 0.8);
  const [reverb, setReverb] = useState<number>(stored.reverb ?? 0.3);
  const [brightness, setBrightness] = useState<number>(stored.brightness ?? 0.7);
  const [showNoteLabels, setShowNoteLabels] = useState<boolean>(stored.showNoteLabels ?? true);
  const [showKeyLabels, setShowKeyLabels] = useState<boolean>(stored.showKeyLabels ?? true);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-darkStudio', 'theme-warmWood');
    if (theme === 'darkStudio') root.classList.add('theme-darkStudio');
    else if (theme === 'warmWood') root.classList.add('theme-warmWood');
    saveSettings({ theme });
  }, [theme]);

  useEffect(() => {
    engine.setVolume(volume);
    saveSettings({ volume });
  }, [volume]);

  useEffect(() => {
    engine.setReverb(reverb);
    saveSettings({ reverb });
  }, [reverb]);

  useEffect(() => {
    engine.setBrightness(brightness);
    saveSettings({ brightness });
  }, [brightness]);

  useEffect(() => {
    saveSettings({ showNoteLabels });
    window.dispatchEvent(new CustomEvent('piano-settings-change', { detail: { showNoteLabels } }));
  }, [showNoteLabels]);

  useEffect(() => {
    saveSettings({ showKeyLabels });
    window.dispatchEvent(new CustomEvent('piano-settings-change', { detail: { showKeyLabels } }));
  }, [showKeyLabels]);

  const resetSettings = () => {
    setTheme('classic');
    setVolume(0.8);
    setReverb(0.3);
    setBrightness(0.7);
    setShowNoteLabels(true);
    setShowKeyLabels(true);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-8">
        <Settings className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>

      {/* Theme */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Palette className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Theme</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={cn(
                "border rounded-xl p-4 text-left transition-all",
                theme === t.id
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-border bg-card hover:border-primary/50"
              )}
              data-testid={`button-theme-${t.id}`}
            >
              <div className="w-6 h-6 rounded-full mb-2 border-2 border-white/20" style={{ background: t.accent }} />
              <div className="font-medium text-sm">{t.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{t.description}</div>
              {theme === t.id && (
                <Badge className="mt-2 text-xs" variant="default">Active</Badge>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Audio */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Audio</h2>
        </div>
        <div className="flex flex-col gap-5 border rounded-xl p-5 bg-card border-border">
          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium text-sm">Volume</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Overall output level</p>
            </div>
            <div className="flex items-center gap-3 w-48">
              <Slider
                value={[volume]}
                min={0} max={1} step={0.01}
                onValueChange={v => setVolume(v[0])}
                data-testid="slider-volume"
              />
              <span className="text-sm font-mono w-9 text-right">{Math.round(volume * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium text-sm">Reverb</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Room ambience / echo</p>
            </div>
            <div className="flex items-center gap-3 w-48">
              <Slider
                value={[reverb]}
                min={0} max={1} step={0.01}
                onValueChange={v => setReverb(v[0])}
                data-testid="slider-reverb"
              />
              <span className="text-sm font-mono w-9 text-right">{Math.round(reverb * 100)}%</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <Label className="font-medium text-sm">Brightness</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Tone character (mellow → bright)</p>
            </div>
            <div className="flex items-center gap-3 w-48">
              <Slider
                value={[brightness]}
                min={0} max={1} step={0.01}
                onValueChange={v => setBrightness(v[0])}
                data-testid="slider-brightness"
              />
              <span className="text-sm font-mono w-9 text-right">{Math.round(brightness * 100)}%</span>
            </div>
          </div>
        </div>
      </section>

      {/* Display */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Piano className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Display</h2>
        </div>
        <div className="flex flex-col gap-4 border rounded-xl p-5 bg-card border-border">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-sm">Note Labels</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show note names on piano keys</p>
            </div>
            <Switch
              checked={showNoteLabels}
              onCheckedChange={setShowNoteLabels}
              data-testid="switch-note-labels"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium text-sm">Keyboard Labels</Label>
              <p className="text-xs text-muted-foreground mt-0.5">Show keyboard shortcut letters on keys</p>
            </div>
            <Switch
              checked={showKeyLabels}
              onCheckedChange={setShowKeyLabels}
              data-testid="switch-keyboard-labels"
            />
          </div>
        </div>
      </section>

      {/* Keyboard shortcuts */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Keyboard className="w-4 h-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Keyboard Shortcuts</h2>
        </div>
        <div className="border rounded-xl p-5 bg-card border-border">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm">
            {[
              ['A S D F G H J K L', 'White keys (C4–D5)'],
              ['W E T Y U O P', 'Black keys (#)'],
              ['Space', 'Sustain pedal'],
              ['Z / X', 'Octave down / up'],
              ['M', 'Toggle metronome'],
              ['R', 'Toggle recording'],
              ['Esc', 'Stop playback / metronome'],
            ].map(([key, desc]) => (
              <div key={key} className="flex items-center gap-2 py-0.5">
                <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono text-primary shrink-0">{key}</code>
                <span className="text-muted-foreground text-xs">{desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={resetSettings} data-testid="button-reset-settings">
          Reset to Defaults
        </Button>
      </div>
    </div>
  );
}
