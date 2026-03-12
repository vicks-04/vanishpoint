import { Crown, MicOff, Sparkles, VideoOff } from "lucide-react";
import type { RoomParticipant } from "@/hooks/useRoomRtc";
import StreamVideo from "@/components/room/StreamVideo";

interface ReactionItem {
  id: string;
  emoji: string;
}

interface ParticipantGridProps {
  participants: RoomParticipant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  activeSpeakerPeerId: string | null;
  reactionsByPeer: Record<string, ReactionItem[]>;
}

function getGridClass(count: number) {
  if (count <= 1) return "grid-cols-1";
  if (count === 2) return "grid-cols-1 md:grid-cols-2";
  if (count <= 4) return "grid-cols-1 sm:grid-cols-2";
  if (count <= 6) return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
}

const ParticipantGrid = ({
  participants,
  localStream,
  remoteStreams,
  activeSpeakerPeerId,
  reactionsByPeer,
}: ParticipantGridProps) => {
  const items = participants;
  const isScrollable = items.length >= 7;
  const gridMaxWidthClass = items.length <= 2 ? "max-w-[1200px] mx-auto" : "";

  return (
    <section className="h-full rounded-2xl border border-primary/20 bg-card/65 backdrop-blur-xl overflow-hidden shadow-[0_0_0_1px_rgba(34,211,238,0.09),0_12px_30px_rgba(0,0,0,0.28)]">
      <div className={`h-full p-2.5 md:p-3 ${isScrollable ? "overflow-y-auto" : ""}`}>
        <div className={`${gridMaxWidthClass} grid ${getGridClass(items.length)} gap-2.5 auto-rows-[minmax(200px,1fr)] h-full`}>
          {items.map((participant) => {
            const stream = participant.isSelf ? localStream : remoteStreams[participant.peerId] || null;
            const isCameraOff = !participant.isCameraOn || !stream;
            const isActiveSpeaker = activeSpeakerPeerId === participant.peerId;
            const reactions = reactionsByPeer[participant.peerId] || [];

            return (
              <article
                key={participant.peerId}
                className="relative rounded-xl border border-border overflow-hidden min-h-[200px] bg-slate-950/70 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.03)]"
              >
                {isCameraOff ? (
                  <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-muted-foreground bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20">
                    <VideoOff className="w-8 h-8 opacity-60" />
                    <p className="text-xs">Camera Off</p>
                  </div>
                ) : (
                  <StreamVideo
                    stream={stream}
                    muted={participant.isSelf}
                    mirror={participant.isSelf}
                    className="object-contain bg-black/55"
                  />
                )}

                <div
                  className={`pointer-events-none absolute inset-0 rounded-xl border border-primary/60 transition-opacity duration-200 ${
                    isActiveSpeaker ? "opacity-100 shadow-[0_0_0_1px_rgba(34,211,238,0.24),0_0_14px_rgba(34,211,238,0.18)]" : "opacity-0"
                  }`}
                />

                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent">
                  <div className="flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-background/75 border border-border text-[11px]">
                      <span className="font-medium truncate max-w-[120px]">{participant.isSelf ? "You" : participant.displayName}</span>
                      {participant.role === "host" ? <Crown className="w-3 h-3 text-warning" /> : null}
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isActiveSpeaker && (
                        <span className="h-6 px-2 rounded-md border border-primary/50 bg-primary/16 text-primary inline-flex items-center justify-center text-[10px] font-semibold gap-1">
                          <Sparkles className="w-3 h-3" />
                          Speaking
                        </span>
                      )}
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
                    </div>
                  </div>
                </div>

                {reactions.length > 0 && (
                  <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
                    {reactions.map((reaction) => (
                      <span
                        key={reaction.id}
                        className="text-base px-1.5 py-0.5 rounded-md bg-background/75 border border-border"
                      >
                        {reaction.emoji}
                      </span>
                    ))}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ParticipantGrid;
