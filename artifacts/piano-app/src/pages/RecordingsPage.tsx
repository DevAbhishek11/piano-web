import { useState, useRef, useCallback } from 'react';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { Recording } from '@/lib/recording/recordingTypes';
import { RecordingPlayer } from '@/lib/recording/recordingPlayer';
import { engine } from '@/lib/audio/AudioEngine';
import { downloadJson } from '@/lib/utils/downloadJson';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Play, Square, Trash2, Download, Upload, Music, Pencil, Check, X } from 'lucide-react';

const STORAGE_KEY = 'piano_recordings';

function formatDuration(ms: number) {
  const secs = Math.floor(ms / 1000);
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function RecordingsPage() {
  const audio = useAudioEngine();
  const playerRef = useRef(new RecordingPlayer(engine));

  const [recordings, setRecordings] = useState<Recording[]>(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');

  const save = useCallback((recs: Recording[]) => {
    setRecordings(recs);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(recs)); } catch {}
  }, []);

  const playRecording = useCallback(async (rec: Recording) => {
    if (!audio.isReady) await audio.initAudio();
    playerRef.current.stop();
    setPlayingId(rec.id);
    playerRef.current.play(rec, () => setPlayingId(null));
  }, [audio]);

  const stopPlayback = useCallback(() => {
    playerRef.current.stop();
    setPlayingId(null);
  }, []);

  const deleteRecording = useCallback((id: string) => {
    if (playingId === id) stopPlayback();
    save(recordings.filter(r => r.id !== id));
  }, [recordings, playingId, stopPlayback, save]);

  const renameRecording = useCallback((id: string, name: string) => {
    save(recordings.map(r => r.id === id ? { ...r, name } : r));
    setEditingId(null);
  }, [recordings, save]);

  const exportRecording = useCallback((rec: Recording) => {
    downloadJson({
      app: 'Web Piano',
      type: 'recording',
      version: 1,
      exportedAt: new Date().toISOString(),
      recording: rec
    }, `${rec.name.replace(/[^a-z0-9]/gi, '_')}.json`);
  }, []);

  const exportAll = useCallback(() => {
    downloadJson({
      app: 'Web Piano',
      type: 'recordings-export',
      version: 1,
      exportedAt: new Date().toISOString(),
      recordings
    }, 'all_recordings.json');
  }, [recordings]);

  const importRecordings = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target?.result as string);
          let imported: Recording[] = [];
          if (parsed.type === 'recording' && parsed.recording) {
            imported = [parsed.recording];
          } else if (parsed.type === 'recordings-export' && Array.isArray(parsed.recordings)) {
            imported = parsed.recordings;
          } else {
            alert('Invalid file format.');
            return;
          }
          const existing = new Set(recordings.map(r => r.id));
          const newOnes = imported
            .filter(r => r.id && r.version === 1 && Array.isArray(r.events))
            .map(r => existing.has(r.id) ? { ...r, id: `${r.id}_${Date.now()}` } : r);
          save([...recordings, ...newOnes]);
        } catch {
          alert('Failed to parse recording file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }, [recordings, save]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Music className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold">Recordings</h1>
          </div>
          <p className="text-muted-foreground text-sm">{recordings.length} recording{recordings.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={importRecordings} data-testid="button-import-recordings">
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          {recordings.length > 0 && (
            <Button variant="outline" size="sm" onClick={exportAll} data-testid="button-export-all-recordings">
              <Download className="w-4 h-4 mr-2" /> Export All
            </Button>
          )}
        </div>
      </div>

      {recordings.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground">
          <Music className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No recordings yet</p>
          <p className="text-sm mt-1">Go to Free Play and press Record to capture a performance.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {recordings.map(rec => (
            <div
              key={rec.id}
              className={cn(
                "border rounded-xl p-4 bg-card transition-all",
                playingId === rec.id ? "border-primary/50 bg-primary/5" : "border-border"
              )}
              data-testid={`recording-item-${rec.id}`}
            >
              <div className="flex items-center gap-3">
                <Button
                  variant={playingId === rec.id ? "default" : "outline"}
                  size="icon"
                  onClick={() => playingId === rec.id ? stopPlayback() : playRecording(rec)}
                  data-testid={`button-play-${rec.id}`}
                >
                  {playingId === rec.id
                    ? <Square className="w-4 h-4" />
                    : <Play className="w-4 h-4" />
                  }
                </Button>

                <div className="flex-1 min-w-0">
                  {editingId === rec.id ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="h-7 text-sm"
                        autoFocus
                        onKeyDown={e => {
                          if (e.key === 'Enter') renameRecording(rec.id, editName);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        data-testid={`input-rename-${rec.id}`}
                      />
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => renameRecording(rec.id, editName)}>
                        <Check className="w-3 h-3" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => setEditingId(null)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{rec.name}</span>
                      <button
                        onClick={() => { setEditingId(rec.id); setEditName(rec.name); }}
                        className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition"
                        data-testid={`button-rename-${rec.id}`}
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatDate(rec.createdAt)}</span>
                    <Badge variant="outline" className="text-xs px-1.5 py-0">{formatDuration(rec.duration)}</Badge>
                    <span className="text-xs text-muted-foreground">{rec.events.length} events</span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => exportRecording(rec)}
                    title="Export"
                    data-testid={`button-export-${rec.id}`}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete "${rec.name}"?`)) deleteRecording(rec.id);
                    }}
                    title="Delete"
                    data-testid={`button-delete-${rec.id}`}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
