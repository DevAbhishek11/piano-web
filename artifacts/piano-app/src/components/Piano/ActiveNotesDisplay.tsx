import { Card, CardContent } from "@/components/ui/card";

export function ActiveNotesDisplay({
  activeNotes,
  sustain,
  isRecording,
}: {
  activeNotes: Set<string>;
  sustain: boolean;
  isRecording?: boolean;
}) {
  return (
    <Card className="w-full max-w-sm mx-auto bg-card text-card-foreground border-border">
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">Active Notes</span>
          <span className="font-mono text-lg font-medium text-primary h-7">
            {Array.from(activeNotes).join(', ') || 'None'}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium">
          <div className={`transition-opacity ${sustain ? 'opacity-100 text-accent' : 'opacity-30'}`}>
            SUSTAIN
          </div>
          {isRecording && (
            <div className="flex items-center gap-2 text-destructive animate-pulse">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              REC
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
