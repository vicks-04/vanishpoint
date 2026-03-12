import { useEffect, useRef } from "react";
import { VideoOff } from "lucide-react";

interface StreamVideoProps {
  stream: MediaStream | null;
  muted?: boolean;
  mirror?: boolean;
  isLocal?: boolean;
  isScreenShare?: boolean;
  className?: string;
  fallbackText?: string;
}

const StreamVideo = ({
  stream,
  muted = false,
  mirror = false,
  isLocal = false,
  isScreenShare = false,
  className = "",
  fallbackText = "Waiting for Peer...",
}: StreamVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }

    if (stream) {
      videoEl
        .play()
        .catch(() => null);
    }
  }, [stream]);

  if (!stream) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center gap-3 text-muted-foreground ${className}`}>
        <VideoOff className="w-10 h-10 opacity-40" />
        <p className="text-sm">{fallbackText}</p>
      </div>
    );
  }

  const shouldMirror = mirror && isLocal && !isScreenShare;

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted}
      className={`w-full h-full object-contain bg-black/60 ${shouldMirror ? "scale-x-[-1]" : ""} ${className}`}
    />
  );
};

export default StreamVideo;
