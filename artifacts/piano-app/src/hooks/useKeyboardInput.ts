import { useEffect, useRef } from 'react';

type KeyboardInputProps = {
  onKeyDown: (code: string) => void;
  onKeyUp: (code: string) => void;
  onSustainDown: () => void;
  onSustainUp: () => void;
  onOctaveDown: () => void;
  onOctaveUp: () => void;
  onToggleMetronome: () => void;
};

export function useKeyboardInput({
  onKeyDown,
  onKeyUp,
  onSustainDown,
  onSustainUp,
  onOctaveDown,
  onOctaveUp,
  onToggleMetronome
}: KeyboardInputProps) {
  const pressedKeys = useRef(new Set<string>());

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return; // Prevent auto-repeat triggers

      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const code = e.shiftKey ? `Shift+${e.code}` : e.code;
      
      if (!pressedKeys.current.has(code)) {
        pressedKeys.current.add(code);

        if (e.code === 'Space') {
          e.preventDefault(); // Prevent scrolling
          onSustainDown();
        } else if (e.code === 'KeyZ') {
          onOctaveDown();
        } else if (e.code === 'KeyX') {
          onOctaveUp();
        } else if (e.code === 'KeyM') {
          onToggleMetronome();
        } else {
          onKeyDown(code);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      // Also release both with and without shift to be safe
      const codeWithShift = `Shift+${e.code}`;
      const codeWithoutShift = e.code;

      if (e.code === 'Space') {
        onSustainUp();
      }

      if (pressedKeys.current.has(codeWithShift)) {
        pressedKeys.current.delete(codeWithShift);
        onKeyUp(codeWithShift);
      }
      
      if (pressedKeys.current.has(codeWithoutShift)) {
        pressedKeys.current.delete(codeWithoutShift);
        onKeyUp(codeWithoutShift);
      }
      
      // Specifically for shift key release, we might want to clean up black keys
      if (e.code === 'ShiftLeft' || e.code === 'ShiftRight') {
         // It's tricky to handle shift release while keys are held, standard piano apps just expect users to hold shift or use caps lock.
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [onKeyDown, onKeyUp, onSustainDown, onSustainUp, onOctaveDown, onOctaveUp, onToggleMetronome]);
}
