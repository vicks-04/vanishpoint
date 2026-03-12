import { useEffect, useRef } from "react";
import { VideoOff, MicOff } from "lucide-react";

interface VideoPreviewProps {
  stream: MediaStream | null;
  mirror?: boolean;
  muted?: boolean;
  isCameraOn?: boolean;
  isMicOn?: boolean;
  label?: string;
  className?: string;
}

const VideoPreview = ({
  stream,
  mirror = true,
  muted = true,
  isCameraOn = true,
  isMicOn = true,
  label,
  className = "",
}: VideoPreviewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (videoEl.srcObject !== stream) {
      videoEl.srcObject = stream;
    }

    if (stream && isCameraOn) {
      videoEl.play().catch(() => null);
    }
  }, [stream, isCameraOn]);

  return (
    <div className={`relative bg-secondary rounded-xl overflow-hidden flex items-center justify-center ${className}`}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={muted}
        className={`w-full h-full object-cover ${mirror ? "scale-x-[-1]" : ""} ${stream && isCameraOn ? "block" : "hidden"}`}
      />

      {(!stream || !isCameraOn) && (
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <VideoOff className="w-8 h-8 opacity-40" />
          <span className="text-xs">Camera off</span>
        </div>
      )}

      {/* Indicators */}
      <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
        {label && (
          <span className="text-xs font-medium bg-background/70 backdrop-blur-sm px-2 py-0.5 rounded-md">
            {label}
          </span>
        )}
        {!isMicOn && (
          <span className="bg-destructive/80 backdrop-blur-sm p-1 rounded-md">
            <MicOff className="w-3 h-3 text-destructive-foreground" />
          </span>
        )}
      </div>
    </div>
  );
};

export default VideoPreview;
