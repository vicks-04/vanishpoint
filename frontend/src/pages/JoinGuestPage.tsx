import { useEffect, useMemo, useState } from "react";
import { Lock, Loader2, Mic, MicOff, ShieldCheck, Video, VideoOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import VideoPreview from "@/components/video/VideoPreview";
import { useMediaStream } from "@/hooks/useMediaStream";
import type { PrivateRoom } from "@/hooks/usePrivateRoomApi";

interface JoinGuestPageProps {
  room: PrivateRoom;
  answer: string;
  verifyLoading: boolean;
  verifyError: string | null;
  onAnswerChange: (value: string) => void;
  onJoin: () => void;
}

type JoinStatus = "waiting" | "available" | "joining";

const statusConfig: Record<JoinStatus, { label: string; dotClass: string }> = {
  waiting: {
    label: "Waiting for host",
    dotClass: "bg-amber-400",
  },
  available: {
    label: "Host available",
    dotClass: "bg-emerald-400",
  },
  joining: {
    label: "Joining session",
    dotClass: "bg-cyan-400",
  },
};

const JoinGuestPage = ({
  room,
  answer,
  verifyLoading,
  verifyError,
  onAnswerChange,
  onJoin,
}: JoinGuestPageProps) => {
  const { stream, isCameraOn, isMicOn, error, startMedia, toggleCamera, toggleMic } = useMediaStream();

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoDeviceId, setVideoDeviceId] = useState("");

  const joinStatus: JoinStatus = useMemo(() => {
    if (verifyLoading) return "joining";
    if (stream) return "available";
    return "waiting";
  }, [verifyLoading, stream]);

  useEffect(() => {
    startMedia().catch(() => null);

    const syncDevices = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const mics = devices.filter((d) => d.kind === "audioinput");
      const cams = devices.filter((d) => d.kind === "videoinput");
      setAudioDevices(mics);
      setVideoDevices(cams);

      if (mics.length > 0 && !audioDeviceId) {
        setAudioDeviceId(mics[0].deviceId);
      }
      if (cams.length > 0 && !videoDeviceId) {
        setVideoDeviceId(cams[0].deviceId);
      }
    };

    syncDevices().catch(() => null);

    const onDeviceChange = () => syncDevices().catch(() => null);
    navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);

    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
    };
  }, [startMedia, audioDeviceId, videoDeviceId]);

  useEffect(() => {
    if (!audioDeviceId && !videoDeviceId) return;

    startMedia(true, true, {
      audioDeviceId: audioDeviceId || undefined,
      videoDeviceId: videoDeviceId || undefined,
    }).catch(() => null);
  }, [audioDeviceId, videoDeviceId, startMedia]);

  const permissionDenied = (error || "").toLowerCase().includes("denied");

  const status = statusConfig[joinStatus];

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto glass-panel p-6 sm:p-8 rounded-2xl border border-primary/20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary/90">Your Camera Preview</p>

            <div className={`relative rounded-xl border ${isCameraOn ? "border-primary/45 shadow-[0_0_24px_rgba(34,211,238,0.18)]" : "border-border"}`}>
              <VideoPreview
                stream={stream}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                label="You"
                className="aspect-video w-full rounded-xl"
              />

              <div className="absolute top-3 right-3 flex items-center gap-2">
                <span className={`text-[11px] px-2 py-1 rounded-md border ${isCameraOn ? "border-primary/35 bg-primary/12 text-primary" : "border-border bg-background/70 text-muted-foreground"}`}>
                  {isCameraOn ? "Camera Active" : "Camera Off"}
                </span>
                {!isMicOn && (
                  <span className="text-[11px] px-2 py-1 rounded-md border border-destructive/40 bg-destructive/15 text-destructive">
                    Mic Muted
                  </span>
                )}
              </div>

              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-background/70 backdrop-blur-md rounded-full px-3 py-2 border border-border/70">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2 rounded-full transition-colors ${isMicOn ? "hover:bg-secondary" : "bg-destructive text-destructive-foreground"}`}
                >
                  {isMicOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={toggleCamera}
                  className={`p-2 rounded-full transition-colors ${isCameraOn ? "hover:bg-secondary" : "bg-destructive text-destructive-foreground"}`}
                >
                  {isCameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {permissionDenied && (
              <p className="text-sm text-destructive">Camera access required to join this session.</p>
            )}

            {!permissionDenied && error && (
              <p className="text-sm text-warning">{error}</p>
            )}

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Microphone Input</label>
              <select
                value={audioDeviceId}
                onChange={(e) => setAudioDeviceId(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {audioDevices.length === 0 && <option value="">No device detected</option>}
                {audioDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Microphone ${device.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Camera Source</label>
              <select
                value={videoDeviceId}
                onChange={(e) => setVideoDeviceId(e.target.value)}
                className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {videoDevices.length === 0 && <option value="">No device detected</option>}
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-xl border border-border space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h1 className="text-2xl font-bold">Join as Guest</h1>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-primary/35 bg-primary/10 text-primary text-xs font-medium cursor-default">
                      <Lock className="w-3.5 h-3.5" />
                      Encrypted Session
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">This meeting is secured with end-to-end encryption.</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground rounded-full border border-border px-2.5 py-1">
                <span className={`h-2.5 w-2.5 rounded-full ${status.dotClass} ${joinStatus !== "available" ? "animate-pulse" : ""}`} />
                {status.label}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.16em] text-primary/90">Security Verification</label>
              <div className="rounded-lg border border-primary/30 bg-primary/8 px-4 py-3 shadow-[0_0_16px_rgba(34,211,238,0.14)]">
                <p className="text-sm leading-relaxed">"{room.question}"</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Your Answer</label>
              <input
                value={answer}
                onChange={(e) => onAnswerChange(e.target.value)}
                placeholder="Enter the correct answer to join the session"
                className="w-full h-11 px-4 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {verifyError && (
              <p className="text-sm text-destructive">Incorrect answer. Please try again.</p>
            )}

            <Button
              variant="hero"
              className="w-full"
              onClick={onJoin}
              disabled={!answer.trim() || verifyLoading}
            >
              {verifyLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Join Now
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinGuestPage;