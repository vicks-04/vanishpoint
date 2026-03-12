import { Hand, MicOff, Shield, Users, VideoOff, X } from "lucide-react";
import type { RoomParticipant } from "@/hooks/useRoomRtc";

interface ParticipantsPanelProps {
  visible: boolean;
  participants: RoomParticipant[];
  isHost: boolean;
  raisedHands: string[];
  onClose: () => void;
  onMuteParticipant: (peerId: string) => void;
  title?: string;
  showCloseButton?: boolean;
}

const ParticipantsPanel = ({
  visible,
  participants,
  isHost,
  raisedHands,
  onClose,
  onMuteParticipant,
  title = "Participants",
  showCloseButton = true,
}: ParticipantsPanelProps) => {
  if (!visible) {
    return null;
  }

  return (
    <aside className="glass-panel border border-primary/20 rounded-2xl h-full min-h-[420px] flex flex-col">
      <div className="px-4 py-3 border-b border-border flex items-center justify-between">
        <h3 className="font-semibold inline-flex items-center gap-2">
          <Users className="w-4 h-4 text-primary" />
          {title} ({participants.length})
        </h3>
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-lg border border-border bg-secondary/70 hover:bg-secondary flex items-center justify-center"
            title="Close participants"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {participants.map((participant) => {
          const isRaised = raisedHands.includes(participant.peerId);
          return (
            <div
              key={participant.peerId}
              className="rounded-xl border border-border bg-secondary/40 p-3 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-full border border-border bg-background/70 flex items-center justify-center text-xs font-semibold text-muted-foreground">
                  {(participant.isSelf ? "Y" : participant.displayName || "P").charAt(0).toUpperCase()}
                </div>
                <div>
                <p className="text-sm font-medium">
                  {participant.isSelf ? "You" : participant.displayName}
                </p>
                <p className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-1">
                  {participant.role === "host" ? <Shield className="w-3.5 h-3.5 text-primary" /> : null}
                  {participant.role === "host" ? "Host" : "Guest"}
                </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isRaised && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-primary/15 border border-primary/35 text-primary text-xs">
                    <Hand className="w-3.5 h-3.5" />
                    Raised Hand
                  </span>
                )}

                {!participant.isMicOn && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-destructive/15 border border-destructive/35 text-destructive text-xs">
                    <MicOff className="w-3.5 h-3.5" />
                    Muted
                  </span>
                )}

                {!participant.isCameraOn && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary/60 border border-border text-xs">
                    <VideoOff className="w-3.5 h-3.5" />
                    Camera Off
                  </span>
                )}

                {isHost && !participant.isSelf && (
                  <button
                    type="button"
                    onClick={() => onMuteParticipant(participant.peerId)}
                    className="h-8 px-2.5 rounded-lg border border-border bg-background/70 hover:bg-background inline-flex items-center gap-1.5 text-xs"
                    title="Mute participant"
                  >
                    <MicOff className="w-3.5 h-3.5" />
                    Mute
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default ParticipantsPanel;
