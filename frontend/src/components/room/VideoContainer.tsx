import { AnimatePresence, motion } from "framer-motion";
import { Maximize2, Minimize2, Repeat2, VideoOff } from "lucide-react";
import { useRef, useState } from "react";
import StreamVideo from "./StreamVideo";
import PiPVideo from "./PiPVideo";

interface VideoContainerProps {
  mainStream: MediaStream | null;
  pipStream: MediaStream | null;
  mainLabel: string;
  pipLabel: string;
  mainMuted?: boolean;
  connectionState: "connected" | "connecting" | "disconnected";
  emptyState: "waiting" | "camera-off" | "peer-disconnected";
  mainIsActiveSpeaker?: boolean;
  pipIsActiveSpeaker?: boolean;
  onSwap: () => void;
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

const EMPTY_STATE_LABELS = {
  waiting: "Waiting for peer to join...",
  "camera-off": "Camera Off",
  "peer-disconnected": "Peer disconnected.",
};

const VideoContainer = ({
  mainStream,
  pipStream,
  mainLabel,
  pipLabel,
  mainMuted = false,
  connectionState,
  emptyState,
  mainIsActiveSpeaker = false,
  pipIsActiveSpeaker = false,
  onSwap,
}: VideoContainerProps) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const status = STATUS_STYLES[connectionState];
  const isSwapDisabled = !pipStream && !mainStream;

  const handleToggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!document.fullscreenElement) {
      await containerRef.current.requestFullscreen();
      setIsFullscreen(true);
      return;
    }

    await document.exitFullscreen();
    setIsFullscreen(false);
  };

  return (
    <div
      ref={containerRef}
      className={`relative h-full min-h-[420px] rounded-3xl border bg-card/65 backdrop-blur-xl overflow-hidden shadow-[0_0_0_1px_rgba(34,211,238,0.15),0_0_40px_rgba(34,211,238,0.08)] ${
        mainIsActiveSpeaker
          ? "border-primary/70 shadow-[0_0_0_1px_rgba(34,211,238,0.5),0_0_40px_rgba(34,211,238,0.3)]"
          : "border-primary/35"
      }`}
    >
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-br from-primary/10 via-transparent to-cyan-400/5" />

      <div className="absolute top-3 left-3 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-background/80 text-[11px] font-medium backdrop-blur-md">
        <span className={`h-2.5 w-2.5 rounded-full ${status.dot} ${connectionState === "connecting" ? "animate-pulse" : ""}`} />
        <span>{status.label}</span>
      </div>

      <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
        <motion.button
          type="button"
          onClick={onSwap}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={isSwapDisabled}
          className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border border-primary/35 bg-background/75 hover:bg-background transition-colors shadow-[0_0_12px_rgba(34,211,238,0.2)] disabled:opacity-50 disabled:cursor-not-allowed"
          title="Swap local and remote view"
        >
          <Repeat2 className="w-3.5 h-3.5" />
          Swap View
        </motion.button>

        <button
          type="button"
          onClick={() => handleToggleFullscreen().catch(() => null)}
          className="h-9 w-9 rounded-xl border border-border bg-background/75 hover:bg-background transition-colors inline-flex items-center justify-center"
          title="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={mainStream ? `stream-${mainLabel}` : `empty-${emptyState}`}
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.985 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0"
        >
          {mainStream ? (
            <StreamVideo stream={mainStream} muted={mainMuted} />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground bg-gradient-to-br from-slate-900 via-slate-950 to-cyan-950/30">
              <VideoOff className="w-12 h-12 opacity-55" />
              <p className="text-sm sm:text-base font-medium">{EMPTY_STATE_LABELS[emptyState]}</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="absolute left-4 bottom-4 z-20 text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded bg-background/75 border border-border">
        {mainLabel}
      </div>

      <PiPVideo stream={pipStream} label={pipLabel} onClick={onSwap} activeSpeaker={pipIsActiveSpeaker} />
    </div>
  );
};

export default VideoContainer;