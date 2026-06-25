import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function PianoBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn(
      "w-full h-full flex flex-col rounded-t-xl overflow-hidden",
      "shadow-[0_-4px_32px_rgba(0,0,0,0.6)]",
      "border border-b-0 border-[hsl(var(--piano-body-border))]",
      "bg-[hsl(var(--piano-body-bg))]",
      className
    )}>
      {/* Top lid / rail */}
      <div className="shrink-0 h-3 bg-gradient-to-b from-black/50 to-transparent" />
      {/* Key area — grows to fill all remaining height */}
      <div className="flex-1 min-h-0 px-2 pb-3">
        {children}
      </div>
    </div>
  );
}
