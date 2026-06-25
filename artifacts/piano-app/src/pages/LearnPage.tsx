import { useState, useCallback } from 'react';
import { useLessons } from '@/hooks/useLessons';
import { usePiano } from '@/hooks/usePiano';
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { useKeyboardInput } from '@/hooks/useKeyboardInput';
import { useMetronome } from '@/hooks/useMetronome';
import { PIANO_KEYS, KEYBOARD_MAPPING } from '@/lib/piano/notes';
import { PianoKeyboard } from '@/components/Piano/PianoKeyboard';
import { PianoBody } from '@/components/Piano/PianoBody';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, BookOpen, CheckCircle, XCircle, Trophy } from 'lucide-react';

function LessonCard({ lesson, isCompleted, onStart }: {
  lesson: { id: string; title: string; description: string; steps: any[] };
  isCompleted: boolean;
  onStart: () => void;
}) {
  return (
    <div
      className={cn(
        "border rounded-xl p-5 bg-card transition-all hover:border-primary/50 hover:shadow-lg cursor-pointer group",
        isCompleted ? "border-primary/30 bg-primary/5" : "border-border"
      )}
      onClick={onStart}
      data-testid={`lesson-card-${lesson.id}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            {isCompleted && <CheckCircle className="w-4 h-4 text-primary shrink-0" />}
            <h3 className="font-semibold text-sm text-foreground truncate">{lesson.title}</h3>
          </div>
          <p className="text-xs text-muted-foreground">{lesson.description}</p>
          <div className="mt-2 text-xs text-muted-foreground">{lesson.steps.length} steps</div>
        </div>
        <Button size="sm" variant={isCompleted ? "outline" : "default"} className="shrink-0" data-testid={`button-start-lesson-${lesson.id}`}>
          {isCompleted ? "Replay" : "Start"}
        </Button>
      </div>
    </div>
  );
}

export default function LearnPage() {
  const audio = useAudioEngine();
  const piano = usePiano();
  const metronome = useMetronome();
  const {
    lessons, activeLesson, currentStepIndex, currentStep,
    startLesson, nextStep, prevStep, stopLesson
  } = useLessons();

  const [completedLessons, setCompletedLessons] = useState<Set<string>>(() => {
    try {
      const stored = localStorage.getItem('piano_completed_lessons');
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch { return new Set(); }
  });
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [feedbackNote, setFeedbackNote] = useState<string | null>(null);
  const [wrongNote, setWrongNote] = useState<string | null>(null);

  const markComplete = useCallback((lessonId: string) => {
    setCompletedLessons(prev => {
      const next = new Set(prev);
      next.add(lessonId);
      try { localStorage.setItem('piano_completed_lessons', JSON.stringify([...next])); } catch {}
      return next;
    });
  }, []);

  const handleNotePlay = useCallback((noteName: string, midi: number) => {
    if (!audio.isReady) audio.initAudio();
    piano.playNote(noteName, midi);

    if (!currentStep?.expectedNote) return;

    if (noteName === currentStep.expectedNote) {
      setFeedback('correct');
      setFeedbackNote(noteName);
      setWrongNote(null);
      setTimeout(() => {
        setFeedback(null);
        setFeedbackNote(null);
        if (activeLesson && currentStepIndex >= activeLesson.steps.length - 1) {
          markComplete(activeLesson.id);
        } else {
          nextStep();
        }
      }, 600);
    } else {
      setFeedback('wrong');
      setWrongNote(noteName);
      setTimeout(() => {
        setFeedback(null);
        setWrongNote(null);
      }, 500);
    }
  }, [audio, piano, currentStep, nextStep, activeLesson, currentStepIndex, markComplete]);

  const handleKeyDown = useCallback((code: string) => {
    if (!audio.isReady) audio.initAudio();
    const mapped = KEYBOARD_MAPPING[code];
    if (mapped) {
      const keyInfo = PIANO_KEYS.find(k => k.name === mapped.note);
      if (keyInfo) handleNotePlay(keyInfo.name, keyInfo.midi);
    }
  }, [audio, handleNotePlay]);

  const handleKeyUp = useCallback((code: string) => {
    const mapped = KEYBOARD_MAPPING[code];
    if (mapped) piano.releaseNote(mapped.note);
  }, [piano]);

  useKeyboardInput({
    onKeyDown: handleKeyDown,
    onKeyUp: handleKeyUp,
    onSustainDown: () => piano.toggleSustain(true),
    onSustainUp: () => piano.toggleSustain(false),
    onOctaveDown: () => piano.changeOctave(-1),
    onOctaveUp: () => piano.changeOctave(1),
    onToggleMetronome: metronome.toggle
  });

  const progress = activeLesson
    ? Math.round((currentStepIndex / activeLesson.steps.length) * 100)
    : 0;

  const isLessonComplete = activeLesson && currentStepIndex >= activeLesson.steps.length;

  if (!activeLesson) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold">Learn Piano</h1>
          </div>
          <p className="text-muted-foreground text-sm">
            {completedLessons.size}/{lessons.length} lessons completed
          </p>
          <Progress value={(completedLessons.size / lessons.length) * 100} className="mt-2 h-1.5" />
        </div>
        <div className="grid gap-3">
          {lessons.map(lesson => (
            <LessonCard
              key={lesson.id}
              lesson={lesson}
              isCompleted={completedLessons.has(lesson.id)}
              onStart={() => startLesson(lesson.id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col h-full"
      onClick={() => { if (!audio.isReady) audio.initAudio(); }}
    >
      <div className="flex-1 flex flex-col p-4 max-w-4xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-4">
          <Button variant="ghost" size="sm" onClick={stopLesson} data-testid="button-exit-lesson">
            <ChevronLeft className="w-4 h-4 mr-1" /> All Lessons
          </Button>
          <span className="text-sm font-medium flex-1 text-center truncate">{activeLesson.title}</span>
          <Badge variant="outline" className="text-xs">
            {Math.min(currentStepIndex + 1, activeLesson.steps.length)}/{activeLesson.steps.length}
          </Badge>
        </div>

        <Progress value={progress} className="h-1 mb-6" />

        {isLessonComplete ? (
          <div className="flex flex-col items-center justify-center flex-1 text-center gap-4">
            <Trophy className="w-16 h-16 text-primary" />
            <h2 className="text-2xl font-bold">Lesson Complete!</h2>
            <p className="text-muted-foreground">You finished "{activeLesson.title}"</p>
            <div className="flex gap-3">
              <Button onClick={stopLesson} variant="outline" data-testid="button-finish-lesson">Back to Lessons</Button>
              <Button onClick={() => {
                const idx = lessons.findIndex(l => l.id === activeLesson.id);
                if (idx < lessons.length - 1) startLesson(lessons[idx + 1].id);
                else stopLesson();
              }} data-testid="button-next-lesson">Next Lesson</Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 flex-1">
            <div className={cn(
              "p-5 rounded-xl border text-sm leading-relaxed transition-all duration-200",
              feedback === 'correct' ? "bg-green-500/10 border-green-500/40 text-green-400" :
              feedback === 'wrong' ? "bg-red-500/10 border-red-500/40 text-red-400" :
              "bg-card border-border text-foreground"
            )}>
              {feedback === 'correct' && <CheckCircle className="inline w-4 h-4 mr-2" />}
              {feedback === 'wrong' && <XCircle className="inline w-4 h-4 mr-2" />}
              {currentStep?.text}
              {currentStep?.expectedNote && (
                <div className="mt-2 font-semibold text-primary">
                  Play: {currentStep.expectedNote}
                </div>
              )}
            </div>

            {!currentStep?.expectedNote && (
              <div className="flex gap-2 justify-center">
                <Button variant="outline" size="sm" onClick={prevStep} disabled={currentStepIndex === 0} data-testid="button-prev-step">
                  <ChevronLeft className="w-4 h-4" /> Prev
                </Button>
                <Button size="sm" onClick={nextStep} data-testid="button-next-step">
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {!isLessonComplete && (
        <div className="w-full max-w-6xl mx-auto px-4 pb-4">
          <PianoBody>
            <PianoKeyboard
              activeNotes={piano.activeNotes}
              highlightedNote={currentStep?.expectedNote}
              errorNote={wrongNote ?? undefined}
              showNoteLabels={true}
              showKeyLabels={false}
              onPlayNote={handleNotePlay}
              onReleaseNote={(name) => piano.releaseNote(name)}
            />
          </PianoBody>
        </div>
      )}
    </div>
  );
}
