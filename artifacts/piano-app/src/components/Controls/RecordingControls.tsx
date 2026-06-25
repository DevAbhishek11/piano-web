import { Button } from "@/components/ui/button";
import { Circle, Square, Play, Download, Upload, Trash } from "lucide-react";
import { Recording } from "@/lib/recording/recordingTypes";

interface RecordingControlsProps {
  isRecording: boolean;
  onStartRecord: () => void;
  onStopRecord: () => void;
  currentRecording: Recording | null;
  onPlayRecording: () => void;
  onStopPlayback: () => void;
  onClearRecording: () => void;
  onExportRecording: () => void;
}

export function RecordingControls({
  isRecording,
  onStartRecord,
  onStopRecord,
  currentRecording,
  onPlayRecording,
  onStopPlayback,
  onClearRecording,
  onExportRecording
}: RecordingControlsProps) {
  return (
    <div className="flex gap-2 items-center">
      {isRecording ? (
        <Button variant="destructive" size="sm" onClick={onStopRecord} data-testid="button-stop-record">
          <Square className="w-4 h-4 mr-2" /> Stop
        </Button>
      ) : (
        <Button variant="outline" size="sm" onClick={onStartRecord} data-testid="button-start-record">
          <Circle className="w-4 h-4 mr-2 text-destructive fill-current" /> Record
        </Button>
      )}

      {currentRecording && (
        <>
          <Button variant="secondary" size="sm" onClick={onPlayRecording}>
            <Play className="w-4 h-4 mr-2" /> Play
          </Button>
          <Button variant="ghost" size="icon" onClick={onClearRecording} title="Clear">
            <Trash className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onExportRecording} title="Export">
            <Download className="w-4 h-4" />
          </Button>
        </>
      )}
    </div>
  );
}
