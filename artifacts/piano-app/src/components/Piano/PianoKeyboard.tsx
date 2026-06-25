import { useMemo, useCallback } from 'react';
import { PIANO_KEYS, PianoNote } from '@/lib/piano/notes';
import { cn } from '@/lib/utils';

interface PianoKeyboardProps {
  activeNotes: Set<string>;
  highlightedNote?: string;
  errorNote?: string;
  showNoteLabels: boolean;
  showKeyLabels: boolean;
  onPlayNote: (name: string, midi: number) => void;
  onReleaseNote: (name: string) => void;
}

const WHITE_NOTES = new Set(['C', 'D', 'E', 'F', 'G', 'A', 'B']);
const BLACK_KEY_PREV: Record<string, string> = {
  'C#': 'C', 'D#': 'D', 'F#': 'F', 'G#': 'G', 'A#': 'A',
  'Db': 'C', 'Eb': 'D', 'Gb': 'F', 'Ab': 'G', 'Bb': 'A',
};

// Slight horizontal nudge per black key type for realistic look
const BLACK_KEY_OFFSET: Record<string, number> = {
  'C#': 0.60, 'D#': 0.64, 'F#': 0.58, 'G#': 0.61, 'A#': 0.63,
};

export function PianoKeyboard({
  activeNotes,
  highlightedNote,
  errorNote,
  showNoteLabels,
  showKeyLabels,
  onPlayNote,
  onReleaseNote
}: PianoKeyboardProps) {
  const whiteKeys = useMemo(() => PIANO_KEYS.filter(k => !k.isBlack), []);
  const blackKeys = useMemo(() => PIANO_KEYS.filter(k => k.isBlack), []);
  const totalWhite = whiteKeys.length;

  const getBlackLeft = useCallback((bk: PianoNote): number => {
    const prevNoteName = BLACK_KEY_PREV[bk.note];
    if (!prevNoteName) return 0;
    const prevWhite = whiteKeys.find(k => k.note === prevNoteName && k.octave === bk.octave);
    if (!prevWhite) return 0;
    const idx = whiteKeys.indexOf(prevWhite);
    const offset = BLACK_KEY_OFFSET[bk.note] ?? 0.62;
    return ((idx + offset) / totalWhite) * 100;
  }, [whiteKeys, totalWhite]);

  const whiteWidthPct = 100 / totalWhite;
  const blackWidthPct = whiteWidthPct * 0.62;

  const handleDown = useCallback((e: React.PointerEvent, name: string, midi: number) => {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onPlayNote(name, midi);
  }, [onPlayNote]);

  const handleUp = useCallback((e: React.PointerEvent, name: string) => {
    e.preventDefault();
    onReleaseNote(name);
  }, [onReleaseNote]);

  const handleEnter = useCallback((e: React.PointerEvent, name: string, midi: number) => {
    if (e.buttons > 0) {
      e.preventDefault();
      onPlayNote(name, midi);
    }
  }, [onPlayNote]);

  const handleLeave = useCallback((e: React.PointerEvent, name: string) => {
    if (e.buttons > 0) {
      onReleaseNote(name);
    }
  }, [onReleaseNote]);

  return (
    <div className="relative w-full h-full select-none touch-none">
      {/* White keys */}
      <div className="flex w-full h-full">
        {whiteKeys.map((key) => {
          const isActive = activeNotes.has(key.name);
          const isHighlighted = highlightedNote === key.name;
          const isError = errorNote === key.name;
          const isC = key.note === 'C';
          const kbLabel = key.code?.replace('Digit', '').replace('Key', '');

          return (
            <div
              key={key.name}
              data-testid={`piano-key-${key.name}`}
              style={{ width: `${whiteWidthPct}%` }}
              onPointerDown={e => handleDown(e, key.name, key.midi)}
              onPointerUp={e => handleUp(e, key.name)}
              onPointerEnter={e => handleEnter(e, key.name, key.midi)}
              onPointerLeave={e => handleLeave(e, key.name)}
              className={cn(
                "relative h-full flex flex-col justify-end items-center pb-1",
                "border-x border-b border-black/30 rounded-b-md cursor-pointer",
                "transition-colors duration-75",
                isActive
                  ? "bg-[hsl(var(--piano-key-pressed-white))]"
                  : "bg-[hsl(var(--piano-key-white))]",
                isHighlighted && !isError && "ring-2 ring-primary ring-inset",
                isError && "!bg-red-400",
              )}
            >
              {/* Gradient shading for depth */}
              {!isActive && (
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 pointer-events-none rounded-b-md" />
              )}

              {/* Keyboard shortcut label (top) */}
              {showKeyLabels && kbLabel && (
                <span className={cn(
                  "absolute top-2 left-0 right-0 text-center font-mono select-none pointer-events-none",
                  "text-[9px] text-black/30"
                )}>
                  {kbLabel}
                </span>
              )}

              {/* Note name (bottom) — always show on C notes, others depend on toggle */}
              {(showNoteLabels || isC) && (
                <span className={cn(
                  "relative z-10 font-medium select-none pointer-events-none",
                  isC ? "text-[10px]" : "text-[9px]",
                  isHighlighted ? "text-primary font-bold" :
                  isActive ? "text-primary" :
                  isC ? "text-black/60" : "text-black/35"
                )}>
                  {isC ? key.name : (showNoteLabels ? key.note : '')}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Black keys — absolutely positioned */}
      {blackKeys.map((key) => {
        const isActive = activeNotes.has(key.name);
        const isHighlighted = highlightedNote === key.name;
        const isError = errorNote === key.name;
        const leftPct = getBlackLeft(key);
        const kbLabel = key.shiftCode?.replace('Digit', '').replace('Key', '');

        return (
          <div
            key={key.name}
            data-testid={`piano-key-${key.name}`}
            style={{
              left: `${leftPct}%`,
              width: `${blackWidthPct}%`,
              height: '62%',
              transform: 'translateX(-50%)',
            }}
            onPointerDown={e => handleDown(e, key.name, key.midi)}
            onPointerUp={e => handleUp(e, key.name)}
            onPointerEnter={e => handleEnter(e, key.name, key.midi)}
            onPointerLeave={e => handleLeave(e, key.name)}
            className={cn(
              "absolute top-0 z-10 flex flex-col justify-end items-center pb-1",
              "cursor-pointer rounded-b-md shadow-lg",
              "transition-colors duration-75",
              isActive
                ? "bg-[hsl(var(--piano-key-pressed-black))] translate-y-[2px]"
                : "bg-[hsl(var(--piano-key-black))]",
              isHighlighted && !isError && "ring-2 ring-primary ring-inset",
              isError && "!bg-red-500",
            )}
          >
            {/* Black key gloss highlight */}
            {!isActive && (
              <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/10 to-transparent rounded-t-sm pointer-events-none" />
            )}

            {/* Keyboard shortcut */}
            {showKeyLabels && kbLabel && (
              <span className="text-[8px] font-mono text-white/50 select-none pointer-events-none mb-0.5">
                {kbLabel}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
