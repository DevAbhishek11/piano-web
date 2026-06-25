import { useState, useEffect } from 'react';
import { UserProfile, profileStorage } from '../lib/profiles';

export function useProfiles() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  useEffect(() => {
    setProfiles(profileStorage.getProfiles());
    setActiveProfileId(profileStorage.getActiveProfileId());
  }, []);

  const createProfile = (name: string) => {
    const newProfile = profileStorage.createProfile(name);
    setProfiles(profileStorage.getProfiles());
    switchProfile(newProfile.id);
  };

  const switchProfile = (id: string) => {
    profileStorage.setActiveProfileId(id);
    setActiveProfileId(id);
  };

  const updateProfile = (id: string, updates: Partial<UserProfile>) => {
    const all = profileStorage.getProfiles();
    const idx = all.findIndex(p => p.id === id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
      profileStorage.saveProfiles(all);
      setProfiles(all);
    }
  };

  const deleteProfile = (id: string) => {
    const all = profileStorage.getProfiles();
    const filtered = all.filter(p => p.id !== id);
    profileStorage.saveProfiles(filtered);
    setProfiles(filtered);
    if (activeProfileId === id) {
      const nextActive = filtered.length > 0 ? filtered[0].id : null;
      if (nextActive) {
        switchProfile(nextActive);
      } else {
        profileStorage.setActiveProfileId('');
        setActiveProfileId(null);
      }
    }
  };

  const activeProfile = profiles.find(p => p.id === activeProfileId);

  return {
    profiles,
    activeProfileId,
    activeProfile,
    createProfile,
    switchProfile,
    updateProfile,
    deleteProfile
  };
}
