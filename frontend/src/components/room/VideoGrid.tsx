import { Hand, MicOff, Shield, VideoOff } from "lucide-react";
import type { CSSProperties } from "react";
import type { RoomParticipant } from "@/hooks/useRoomRtc";
import StreamVideo from "./StreamVideo";

type LayoutMode = "grid" | "focus-remote" | "screen-share";
type FocusPrimary = "remote" | "local";

interface VideoGridProps {
  participants: RoomParticipant[];
  localStream: MediaStream | null;
  remoteStreams: Record<string, MediaStream>;
  mode: "chat" | "video";
  activeSpeakerPeerId: string | null;
  connectionState: "connected" | "connecting" | "disconnected";
  layoutMode: LayoutMode;
  focusedPeerId: string | null;
  focusPrimary: FocusPrimary;
  activeScreenSharePeerId: string | null;
  onSelectFocusPeer: (peerId: string) => void;
  onSwapFocus: () => void;
}

interface TileModel {
  participant: RoomParticipant;
  stream: MediaStream | null;
  isCameraOn: boolean;
  isMicOn: boolean;
  isCameraOff: boolean;
  isActiveSpeaker: boolean;
  isHost: boolean;
  isLocal: boolean;
  isScreenShare: boolean;
}

const STATUS_STYLES = {
  connected: {
    dot: "bg-emerald-400",
    label: "Connected",
  },
  connecting: {
    dot: "bg-amber-400",
    label: "Connecting",
  },
  disconnected: {
    dot: "bg-rose-400",
    label: "Disconnected",
  },
};

function getGridLayout(count: number): { className: string; style?: CSSProperties } {
  if (count <= 1) {
    return {
      className: "grid-cols-1",
      style: {
        gridTemplateRows: "minmax(0, 1fr)",
      },
    };
  }
  if (count === 2) {
    return {
      className: "grid-cols-1 md:grid-cols-2",
      style: {
        gridTemplateRows: "minmax(0, 1fr)",
      },
    };
  }
  if (count <= 4) {
    return {
      className: "grid-cols-1 sm:grid-cols-2",
      style: {
        gridTemplateRows: "repeat(2, minmax(0, 1fr))",
      },
    };
  }
  return {
    className: "",
    style: {
      gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    },
  };
}

function TileCard({
  tile,
  mode,
  compact = false,
  fitContain = false,
  singleFit = false,
  onClick,
}: {
  tile: TileModel;
  mode: "chat" | "video";
  compact?: boolean;
  fitContain?: boolean;
  singleFit?: boolean;
  onClick?: () => void;
}) {
  const containerClasses = compact
    ? "relative rounded-lg border overflow-hidden bg-slate-950/70 h-20 cursor-pointer"
    : singleFit
      ? "relative rounded-xl border overflow-hidden bg-slate-950/70 w-full h-full max-h-full aspect-video mx-auto"
      : "relative rounded-xl border overflow-hidden bg-slate-950/70 h-full min-h-0";
  const activeOverlayRadiusClass = compact ? "rounded-lg" : "rounded-xl";

  return (
    <div
      className={`${containerClasses} border-border`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {tile.isCameraOff ? (
        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted-foreground bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/20">
          <VideoOff className={compact ? "w-6 h-6 opacity-60" : "w-10 h-10 opacity-60"} />
          <p className={compact ? "text-[11px]" : "text-sm"}>{mode === "chat" ? "Chat mode active" : "Camera Off"}</p>
        </div>
      ) : (
        <StreamVideo
          stream={tile.stream}
          muted={tile.isLocal}
          mirror={tile.isLocal}
          isLocal={tile.isLocal}
          isScreenShare={tile.isScreenShare}
          className={fitContain ? "object-contain bg-black/60" : "object-contain bg-black/55"}
          fallbackText="Waiting for stream..."
        />
      )}

      <div
        className={`pointer-events-none absolute inset-0 ${activeOverlayRadiusClass} border border-primary/65 transition-opacity duration-200 ${
          tile.isActiveSpeaker ? "opacity-100 shadow-[0_0_0_1px_rgba(34,211,238,0.26),0_0_14px_rgba(34,211,238,0.16)]" : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute top-2 right-2 z-10 h-2 w-2 rounded-full bg-cyan-300 transition-opacity duration-200 ${
          tile.isActiveSpeaker ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className={`absolute inset-x-0 bottom-0 ${compact ? "p-1" : "p-1.5"} bg-gradient-to-t from-black/80 via-black/45 to-transparent`}>
        <div className="flex items-center justify-between gap-1.5">
          <div className={`inline-flex items-center gap-1 ${compact ? "px-1 py-0.5 text-[9px]" : "px-1.5 py-0.5 text-[11px]"} rounded-md bg-background/75 border border-border`}>
            <span className="font-medium truncate max-w-[130px]">
              {tile.isLocal ? "You" : tile.participant.displayName}
            </span>
            {tile.isHost ? <Shield className="w-3 h-3 text-primary" /> : null}
          </div>

          <div className="flex items-center gap-1">
            {tile.participant.raisedHand && (
              <span className={`${compact ? "h-4 w-4" : "h-6 w-6"} rounded-md border border-primary/60 bg-primary/20 text-primary inline-flex items-center justify-center`}>
                <Hand className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
              </span>
            )}
            {!tile.isMicOn && (
              <span className={`${compact ? "h-4 w-4" : "h-6 w-6"} rounded-md border border-destructive/60 bg-destructive/20 text-destructive inline-flex items-center justify-center`}>
                <MicOff className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
              </span>
            )}
            {!tile.isCameraOn && (
              <span className={`${compact ? "h-4 w-4" : "h-6 w-6"} rounded-md border border-border bg-background/70 text-muted-foreground inline-flex items-center justify-center`}>
                <VideoOff className={compact ? "w-2.5 h-2.5" : "w-3 h-3"} />
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const VideoGrid = ({
  participants,
  localStream,
  remoteStreams,
  mode,
  activeSpeakerPeerId,
  connectionState,
  layoutMode,
  focusedPeerId,
  focusPrimary,
  activeScreenSharePeerId,
  onSelectFocusPeer,
  onSwapFocus,
}: VideoGridProps) => {
  const safeParticipants = participants.length > 0 ? participants : [];
  const status = STATUS_STYLES[connectionState];

  const tiles: TileModel[] = safeParticipants.map((participant) => {
    const stream = participant.isSelf ? localStream : remoteStreams[participant.peerId] || null;
    const localVideoTrack = participant.isSelf ? stream?.getVideoTracks()[0] : null;
    const localAudioTrack = participant.isSelf ? stream?.getAudioTracks()[0] : null;
    const isCameraOn = participant.isSelf
      ? Boolean(localVideoTrack && localVideoTrack.readyState === "live" && localVideoTrack.enabled)
      : participant.isCameraOn;
    const isMicOn = participant.isSelf
      ? Boolean(localAudioTrack && localAudioTrack.readyState === "live" && localAudioTrack.enabled)
      : participant.isMicOn;
    const isScreenShare = Boolean(participant.isScreenSharing);

    return {
      participant,
      stream,
      isCameraOn,
      isMicOn,
      isCameraOff: mode !== "video" || !isCameraOn || !stream,
      isActiveSpeaker: activeSpeakerPeerId === participant.peerId,
      isHost: participant.role === "host",
      isLocal: participant.isSelf,
      isScreenShare,
    };
  });

  const localTile = tiles.find((tile) => tile.isLocal) || null;
  const remoteTiles = tiles.filter((tile) => !tile.isLocal);
  const selectedRemoteTile =
    remoteTiles.find((tile) => tile.participant.peerId === focusedPeerId) || remoteTiles[0] || null;
  const screenShareTile =
    tiles.find((tile) => tile.participant.peerId === activeScreenSharePeerId) ||
    tiles.find((tile) => tile.isScreenShare) ||
    null;

  const renderGrid = () => {
    const gridLayout = getGridLayout(tiles.length);
    const isScrollable = tiles.length >= 7;
    const isSingleParticipant = tiles.length === 1;
    const isSoloLocal = isSingleParticipant && Boolean(tiles[0]?.isLocal);
    const gridStyle: CSSProperties = {
      ...(gridLayout.style || {}),
      ...(isSingleParticipant
        ? {
            maxWidth: "min(1080px, 94%)",
            marginInline: "auto",
          }
        : {}),
    };

    return (
      <div className={`h-full min-h-0 pt-9 pb-1.5 px-2 md:px-2.5 ${isScrollable ? "overflow-y-auto" : "overflow-hidden"}`}>
        <div
          className={`grid ${gridLayout.className} w-full gap-2 ${isSingleParticipant ? "place-items-center" : ""} ${
            isSingleParticipant
              ? "auto-rows-[minmax(0,1fr)]"
              : tiles.length <= 4
                ? "auto-rows-[minmax(0,1fr)]"
                : "auto-rows-[minmax(180px,1fr)]"
          } h-full min-h-0`}
          style={gridStyle}
        >
          {tiles.map((tile) => (
            <TileCard
              key={tile.participant.peerId}
              tile={tile}
              mode={mode}
              fitContain={isSoloLocal && tile.isLocal}
              singleFit={isSingleParticipant}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderScreenShare = () => {
    if (!screenShareTile) {
      return renderGrid();
    }

    const localSecondaryTile =
      localTile && localTile.participant.peerId !== screenShareTile.participant.peerId ? localTile : null;
    const secondaryTiles = tiles.filter(
      (tile) =>
        tile.participant.peerId !== screenShareTile.participant.peerId &&
        (!localSecondaryTile || tile.participant.peerId !== localSecondaryTile.participant.peerId)
    );

    return (
      <div className="h-full min-h-0 pt-9 pb-1.5 px-2 md:px-2.5 flex flex-col gap-2">
        <div className="relative flex-1 min-h-0">
          <TileCard tile={screenShareTile} mode={mode} />

          {localSecondaryTile && (
            <div className="absolute bottom-3 right-3 w-40 h-24 z-30">
              <TileCard tile={localSecondaryTile} mode={mode} compact onClick={onSwapFocus} />
            </div>
          )}
        </div>
        {secondaryTiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {secondaryTiles.map((tile) => (
              <TileCard
                key={tile.participant.peerId}
                tile={tile}
                mode={mode}
                compact
                onClick={!tile.isLocal ? () => onSelectFocusPeer(tile.participant.peerId) : undefined}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderFocus = () => {
    if (!selectedRemoteTile || !localTile) {
      return renderGrid();
    }

    const mainTile = focusPrimary === "local" ? localTile : selectedRemoteTile;
    const pipTile = focusPrimary === "local" ? selectedRemoteTile : localTile;
    const stripTiles = remoteTiles.filter((tile) => tile.participant.peerId !== selectedRemoteTile.participant.peerId);

    return (
      <div className="h-full min-h-0 pt-9 pb-1.5 px-2 md:px-2.5 flex flex-col gap-2">
        <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden">
          <TileCard tile={mainTile} mode={mode} />

          {pipTile && (
            <div className="absolute bottom-3 right-3 w-40 h-24 z-30">
              <TileCard tile={pipTile} mode={mode} compact onClick={onSwapFocus} />
            </div>
          )}
        </div>

        {stripTiles.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {stripTiles.map((tile) => (
              <TileCard
                key={tile.participant.peerId}
                tile={tile}
                mode={mode}
                compact
                onClick={() => onSelectFocusPeer(tile.participant.peerId)}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderByMode = () => {
    if (layoutMode === "screen-share") {
      return renderScreenShare();
    }
    if (layoutMode === "focus-remote") {
      return renderFocus();
    }
    return renderGrid();
  };

  return (
    <div className="relative h-full min-h-0 rounded-xl border border-primary/22 bg-card/65 backdrop-blur-xl overflow-hidden shadow-[0_0_0_1px_rgba(34,211,238,0.10),0_0_18px_rgba(34,211,238,0.05)]">
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/5" />

      <div className="absolute top-2 left-2 z-20 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-border bg-background/80 text-[9px] font-medium backdrop-blur-md">
        <span className={`h-2 w-2 rounded-full ${status.dot} ${connectionState === "connecting" ? "animate-pulse" : ""}`} />
        <span>{status.label}</span>
      </div>

      {renderByMode()}
    </div>
  );
};

export default VideoGrid;
