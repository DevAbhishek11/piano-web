import { UserProfile } from './profileTypes';

const STORAGE_KEY = 'piano_profiles';
const ACTIVE_PROFILE_KEY = 'piano_active_profile_id';

export const profileStorage = {
  getProfiles(): UserProfile[] {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },
  
  saveProfiles(profiles: UserProfile[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  },
  
  getActiveProfileId(): string | null {
    return localStorage.getItem(ACTIVE_PROFILE_KEY);
  },
  
  setActiveProfileId(id: string) {
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
  },

  createProfile(name: string): UserProfile {
    const newProfile: UserProfile = {
      id: `prof_${Date.now()}`,
      name,
      avatarColor: `#${Math.floor(Math.random()*16777215).toString(16)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        theme: 'classic',
        volume: 0.8,
        reverb: 0.3,
        brightness: 0.7,
        showNoteLabels: true,
        showKeyboardLabels: true,
        metronomeBpm: 120,
      },
      progress: {
        completedLessons: [],
        lessonScores: {},
        totalPracticeTime: 0,
      },
      recordings: []
    };
    const profiles = this.getProfiles();
    profiles.push(newProfile);
    this.saveProfiles(profiles);
    return newProfile;
  }
};
