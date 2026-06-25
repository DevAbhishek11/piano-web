import React from 'react';
import { cn } from '@/lib/utils';

interface PianoKeyProps {
  note: string;
  name: string;
  isBlack: boolean;
  isActive: boolean;
  isHighlighted?: boolean;
  isError?: boolean;
  code?: string;
  shiftCode?: string;
  showNoteLabel: boolean;
  showKeyLabel: boolean;
  onPointerDown: (name: string) => void;
  onPointerUp: (name: string) => void;
  onPointerEnter: (name: string, buttons: number) => void;
}

export const PianoKey = React.memo(({
  name,
  isBlack,
  isActive,
  isHighlighted,
  isError,
  code,
  shiftCode,
  showNoteLabel,
  showKeyLabel,
  onPointerDown,
  onPointerUp,
  onPointerEnter
}: PianoKeyProps) => {
  
  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    onPointerDown(name);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    e.preventDefault();
    onPointerUp(name);
  };

  const handlePointerEnter = (e: React.PointerEvent) => {
    e.preventDefault();
    onPointerEnter(name, e.buttons);
  };

  const keyLabel = isBlack ? shiftCode : code;
  const displayKey = keyLabel?.replace('Digit', '')?.replace('Key', '');

  return (
    <div
      data-testid={`piano-key-${name}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      onPointerEnter={handlePointerEnter}
      className={cn(
        "relative flex flex-col justify-end pb-2 select-none touch-none transition-all duration-75",
        isBlack
          ? "w-[3%]- ml-[-1.5%] mr-[-1.5%] h-3/5 z-10 rounded-b-sm border border-t-0 shadow-sm"
          : "w-[calc(100%/52)] h-full z-0 rounded-b-md border border-t-0 shadow-md",
        
        // Base Colors
        isBlack ? "bg-[hsl(var(--piano-key-black))] border-[hsl(var(--piano-body-border))]" : "bg-[hsl(var(--piano-key-white))] border-[hsl(var(--piano-body-border))]",
        
        // Active states
        isActive && isBlack && "bg-[hsl(var(--piano-key-pressed-black))] translate-y-[2px]",
        isActive && !isBlack && "bg-[hsl(var(--piano-key-pressed-white))] translate-y-[2px]",
        
        // Highlight states (Lesson)
        isHighlighted && "ring-2 ring-[hsl(var(--primary))] ring-inset",
        isError && "bg-destructive text-destructive-foreground",
      )}
      style={{
        flexShrink: 0,
        width: isBlack ? '2%' : '1.923%', // approx 100/52 for white keys
        marginLeft: isBlack ? '-1%' : '0',
        marginRight: isBlack ? '-1%' : '0',
      }}
    >
      {/* Keyboard shortcut label */}
      {showKeyLabel && displayKey && (
        <span className={cn(
          "absolute top-4 w-full text-center text-[10px] opacity-40 font-mono",
          isBlack ? "text-white" : "text-black"
        )}>
          {displayKey}
        </span>
      )}
      
      {/* Note label */}
      {showNoteLabel && !isBlack && (
        <span className={cn(
          "w-full text-center text-xs font-medium",
          isActive ? "text-primary" : "text-black/50"
        )}>
          {name}
        </span>
      )}
    </div>
  );
});

PianoKey.displayName = 'PianoKey';
