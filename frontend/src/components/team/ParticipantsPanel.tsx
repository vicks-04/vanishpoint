import { Crown, Hand, MicOff, UserX, VideoOff, X } from "lucide-react";
import type { RoomParticipant } from "@/hooks/useRoomRtc";

interface ParticipantsPanelProps {
  open: boolean;
  participants: RoomParticipant[];
  raisedHands: string[];
  isHost: boolean;
  onClose: () => void;
  onMute: (peerId: string) => void;
  onDisableCamera: (peerId: string) => void;
  onRemove: (peerId: string) => void;
}

const ParticipantsPanel = ({
  open,
  participants,
  raisedHands,
  isHost,
  onClose,
  onMute,
  onDisableCamera,
  onRemove,
}: ParticipantsPanelProps) => {
  if (!open) return null;

  return (
    <aside className="h-full min-h-0 glass-panel border border-primary/18 rounded-2xl flex flex-col overflow-hidden shadow-[0_12px_30px_rgba(0,0,0,0.28)]">
      <div className="px-3 py-2.5 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-background/70 to-secondary/30">
        <h3 className="font-semibold text-sm tracking-tight">Participants ({participants.length})</h3>
        <button
          type="button"
          onClick={onClose}
          className="h-7 w-7 rounded-lg border border-border bg-secondary/60 hover:bg-secondary inline-flex items-center justify-center"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {participants.map((participant) => {
          const isRaised = raisedHands.includes(participant.peerId);

          return (
            <div
              key={participant.peerId}
              className="rounded-xl border border-border/90 bg-secondary/28 p-2.5 space-y-2 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.02)]"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[12.5px] font-medium inline-flex items-center gap-1.5">
                    {participant.isSelf ? "You" : participant.displayName}
                    {participant.role === "host" ? <Crown className="w-3 h-3 text-warning" /> : null}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {participant.role === "host" ? "Host" : "Participant"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {!participant.isMicOn && (
                    <span className="h-6 w-6 rounded-md border border-destructive/60 bg-destructive/20 text-destructive inline-flex items-center justify-center">
                      <MicOff className="w-3 h-3" />
                    </span>
                  )}
                  {!participant.isCameraOn && (
                    <span className="h-6 w-6 rounded-md border border-border bg-background/70 text-muted-foreground inline-flex items-center justify-center">
                      <VideoOff className="w-3 h-3" />
                    </span>
                  )}
                  {isRaised && (
                    <span className="h-6 px-2 rounded-md border border-primary/50 bg-primary/15 text-primary inline-flex items-center justify-center text-[10px] font-semibold gap-1">
                      <Hand className="w-3 h-3" />
                      Hand
                    </span>
                  )}
                </div>
              </div>

              {isHost && !participant.isSelf && (
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onMute(participant.peerId)}
                    className="h-7 px-2 rounded-md border border-border bg-background/65 hover:bg-background text-[10px] inline-flex items-center gap-1.5"
                  >
                    <MicOff className="w-3 h-3" />
                    Mute
                  </button>
                  <button
                    type="button"
                    onClick={() => onDisableCamera(participant.peerId)}
                    className="h-7 px-2 rounded-md border border-border bg-background/65 hover:bg-background text-[10px] inline-flex items-center gap-1.5"
                  >
                    <VideoOff className="w-3 h-3" />
                    Camera Off
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(participant.peerId)}
                    className="h-7 px-2 rounded-md border border-destructive/50 bg-destructive/10 text-destructive hover:bg-destructive/20 text-[10px] inline-flex items-center gap-1.5"
                  >
                    <UserX className="w-3 h-3" />
                    Remove
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ParticipantsPanel;
