import { Hand, MicOff, Shield, Users, VideoOff } from "lucide-react";
import type { RoomParticipant } from "@/hooks/useRoomRtc";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface ParticipantsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  participants: RoomParticipant[];
  isHost: boolean;
  onMuteParticipant: (peerId: string) => void;
}

const ParticipantsDrawer = ({
  open,
  onOpenChange,
  participants,
  isHost,
  onMuteParticipant,
}: ParticipantsDrawerProps) => {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[320px] sm:w-[360px] border-l border-primary/30 bg-slate-950/96 backdrop-blur-xl text-foreground p-0"
      >
        <SheetHeader className="px-4 py-4 border-b border-border space-y-1">
          <SheetTitle className="text-base inline-flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Participants ({participants.length})
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground">
            Meeting members and live states
          </SheetDescription>
        </SheetHeader>

        <div className="h-[calc(100%-72px)] overflow-y-auto p-3 space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.peerId}
              className="rounded-xl border border-border bg-secondary/35 p-3 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{participant.isSelf ? "You" : participant.displayName}</p>
                <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1 mt-1">
                  {participant.role === "host" ? <Shield className="w-3 h-3 text-primary" /> : null}
                  {participant.role === "host" ? "Host" : "Guest"}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {participant.raisedHand && (
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-primary/40 bg-primary/15 text-primary">
                    <Hand className="w-3.5 h-3.5" />
                  </span>
                )}
                {!participant.isMicOn && (
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-destructive/40 bg-destructive/15 text-destructive">
                    <MicOff className="w-3.5 h-3.5" />
                  </span>
                )}
                {!participant.isCameraOn && (
                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-lg border border-border bg-background/60 text-muted-foreground">
                    <VideoOff className="w-3.5 h-3.5" />
                  </span>
                )}
                {isHost && !participant.isSelf && (
                  <button
                    type="button"
                    onClick={() => onMuteParticipant(participant.peerId)}
                    className="h-7 px-2 rounded-lg border border-border bg-background/70 hover:bg-background text-[11px]"
                  >
                    Mute
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ParticipantsDrawer;
