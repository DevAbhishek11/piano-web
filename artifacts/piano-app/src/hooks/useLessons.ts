import { useState, useCallback } from 'react';
import { Lesson } from '../lib/lessons/lessonTypes';
import { LESSONS } from '../lib/lessons/lessonData';

export function useLessons() {
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const activeLesson = LESSONS.find(l => l.id === activeLessonId) || null;
  const currentStep = activeLesson ? activeLesson.steps[currentStepIndex] : null;

  const startLesson = useCallback((id: string) => {
    setActiveLessonId(id);
    setCurrentStepIndex(0);
  }, []);

  const nextStep = useCallback(() => {
    if (activeLesson && currentStepIndex < activeLesson.steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [activeLesson, currentStepIndex]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);

  const stopLesson = useCallback(() => {
    setActiveLessonId(null);
    setCurrentStepIndex(0);
  }, []);

  return {
    lessons: LESSONS,
    activeLesson,
    currentStepIndex,
    currentStep,
    startLesson,
    nextStep,
    prevStep,
    stopLesson,
  };
}
