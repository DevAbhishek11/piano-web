import { Recording } from "../recording/recordingTypes";

export type UserProfile = {
  id: string;
  name: string;
  avatarColor: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    theme: 'classic' | 'darkStudio' | 'warmWood';
    volume: number;
    reverb: number;
    brightness: number;
    showNoteLabels: boolean;
    showKeyboardLabels: boolean;
    metronomeBpm: number;
  };
  progress: {
    completedLessons: string[];
    lessonScores: Record<string, number>;
    totalPracticeTime: number;
    lastPracticedAt?: string;
  };
  recordings: Recording[];
};
