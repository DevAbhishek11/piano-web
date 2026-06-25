import { useState } from 'react';
import { useProfiles } from '@/hooks/useProfiles';
import { downloadJson } from '@/lib/utils/downloadJson';
import { UserProfile } from '@/lib/profiles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { UserRound, Plus, Trash2, Check, Download, Upload, Clock, Award } from 'lucide-react';
import { LESSONS } from '@/lib/lessons/lessonData';

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

function formatMinutes(seconds: number) {
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  return `${h}h ${m % 60}m`;
}

function formatDate(iso?: string) {
  if (!iso) return 'Never';
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ProfilePage() {
  const {
    profiles, activeProfileId, activeProfile,
    createProfile, switchProfile, updateProfile, deleteProfile
  } = useProfiles();

  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');

  const handleCreate = () => {
    const name = newName.trim();
    if (!name) return;
    createProfile(name);
    setNewName('');
    setShowCreate(false);
  };

  const exportProfile = (profile: UserProfile) => {
    downloadJson({
      app: 'Web Piano',
      type: 'profile',
      version: 1,
      exportedAt: new Date().toISOString(),
      profile
    }, `${profile.name.replace(/[^a-z0-9]/gi, '_')}_profile.json`);
  };

  const importProfile = () => {
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
          if (parsed.type === 'profile' && parsed.profile) {
            const imported: UserProfile = {
              ...parsed.profile,
              id: `prof_imported_${Date.now()}`,
              name: `${parsed.profile.name} (imported)`,
              updatedAt: new Date().toISOString()
            };
            const stored = JSON.parse(localStorage.getItem('piano_profiles') || '[]');
            stored.push(imported);
            localStorage.setItem('piano_profiles', JSON.stringify(stored));
            window.location.reload();
          } else {
            alert('Invalid profile file.');
          }
        } catch {
          alert('Failed to parse profile file.');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const completedLessons = (() => {
    try {
      const stored = localStorage.getItem('piano_completed_lessons');
      return stored ? JSON.parse(stored) as string[] : [];
    } catch { return []; }
  })();

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <UserRound className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-bold">Profiles</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={importProfile} data-testid="button-import-profile">
            <Upload className="w-4 h-4 mr-2" /> Import
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} data-testid="button-new-profile">
            <Plus className="w-4 h-4 mr-2" /> New Profile
          </Button>
        </div>
      </div>

      {showCreate && (
        <div className="border rounded-xl p-4 bg-card mb-4 flex gap-2 items-center">
          <Input
            placeholder="Profile name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            autoFocus
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') { setShowCreate(false); setNewName(''); }
            }}
            data-testid="input-profile-name"
          />
          <Button onClick={handleCreate} disabled={!newName.trim()} data-testid="button-create-profile">Create</Button>
          <Button variant="ghost" onClick={() => { setShowCreate(false); setNewName(''); }}>Cancel</Button>
        </div>
      )}

      {profiles.length === 0 && !showCreate && (
        <div className="text-center py-16 text-muted-foreground">
          <UserRound className="w-12 h-12 mx-auto mb-4 opacity-20" />
          <p className="text-lg font-medium">No profiles yet</p>
          <p className="text-sm mt-1">Create a profile to track your progress and recordings.</p>
          <Button className="mt-4" onClick={() => setShowCreate(true)}>Create Profile</Button>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {profiles.map(profile => {
          const isActive = profile.id === activeProfileId;
          const lessonsDone = completedLessons.length;

          return (
            <div
              key={profile.id}
              className={cn(
                "border rounded-xl p-5 bg-card transition-all",
                isActive ? "border-primary/50 bg-primary/5" : "border-border"
              )}
              data-testid={`profile-card-${profile.id}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  style={{ background: profile.avatarColor }}
                >
                  {initials(profile.name)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold truncate">{profile.name}</span>
                    {isActive && <Badge className="text-xs">Active</Badge>}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatMinutes(profile.progress.totalPracticeTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      {lessonsDone}/{LESSONS.length} lessons
                    </span>
                    <span>Created {formatDate(profile.createdAt)}</span>
                  </div>

                  {lessonsDone > 0 && (
                    <div className="mb-3">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1">
                        <span>Lesson Progress</span>
                        <span>{Math.round((lessonsDone / LESSONS.length) * 100)}%</span>
                      </div>
                      <Progress value={(lessonsDone / LESSONS.length) * 100} className="h-1" />
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{profile.recordings.length} recordings</span>
                    <span>·</span>
                    <span>Theme: {profile.settings.theme}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  {!isActive && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => switchProfile(profile.id)}
                      data-testid={`button-switch-profile-${profile.id}`}
                    >
                      <Check className="w-3 h-3 mr-1" /> Select
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => exportProfile(profile)}
                    data-testid={`button-export-profile-${profile.id}`}
                  >
                    <Download className="w-3 h-3 mr-1" /> Export
                  </Button>
                  {profiles.length > 1 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Delete profile "${profile.name}"? This cannot be undone.`)) {
                          deleteProfile(profile.id);
                        }
                      }}
                      data-testid={`button-delete-profile-${profile.id}`}
                    >
                      <Trash2 className="w-3 h-3 text-destructive" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
