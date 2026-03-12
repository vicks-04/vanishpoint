import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Mic, MicOff, Video, VideoOff, Copy, HelpCircle, Link2 } from "lucide-react";
import QRCode from "qrcode";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useMediaStream } from "@/hooks/useMediaStream";
import { usePrivateRoomApi } from "@/hooks/usePrivateRoomApi";
import VideoPreview from "@/components/video/VideoPreview";

const SAMPLE_QUESTIONS = [
  "What city did we first meet in?",
  "What is our project codename?",
  "Which team are we discussing today?",
];

const PrivateMode = () => {
  const navigate = useNavigate();
  const { stream, isCameraOn, isMicOn, error, startMedia, toggleCamera, toggleMic } = useMediaStream();
  const { createRoom } = usePrivateRoomApi();

  const [securityQuestion, setSecurityQuestion] = useState("");
  const [expectedAnswer, setExpectedAnswer] = useState("");
  const [roomId, setRoomId] = useState("");
  const [lastGeneratedKey, setLastGeneratedKey] = useState("");
  const [roomLoading, setRoomLoading] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);

  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDeviceId, setAudioDeviceId] = useState("");
  const [videoDeviceId, setVideoDeviceId] = useState("");

  const roomLink = useMemo(() => {
    if (!roomId) return "";
    return `${window.location.origin}/room/${roomId}`;
  }, [roomId]);

  useEffect(() => {
    startMedia().then(() => {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
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
      });
    });

    const onDeviceChange = async () => {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
      setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
    };

    navigator.mediaDevices.addEventListener("devicechange", onDeviceChange);
    return () => navigator.mediaDevices.removeEventListener("devicechange", onDeviceChange);
  }, [startMedia]);

  useEffect(() => {
    if (!audioDeviceId && !videoDeviceId) return;
    startMedia(true, true, {
      audioDeviceId: audioDeviceId || undefined,
      videoDeviceId: videoDeviceId || undefined,
    }).catch(() => null);
  }, [audioDeviceId, videoDeviceId, startMedia]);

  useEffect(() => {
    const q = securityQuestion.trim();
    const a = expectedAnswer.trim();

    if (!q || !a) {
      setRoomId("");
      setQrCodeDataUrl("");
      setLastGeneratedKey("");
      setLinkCopied(false);
      return;
    }

    const key = `${q}::${a}`;
    if (lastGeneratedKey === key) {
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        setRoomLoading(true);
        const response = await createRoom(q, a);
        setRoomId(response.room.roomId);
        setLastGeneratedKey(key);
        setLinkCopied(false);
      } catch (err: any) {
        toast.error(err.message || "Failed to generate room link");
        setRoomId("");
      } finally {
        setRoomLoading(false);
      }
    }, 350);

    return () => clearTimeout(timeout);
  }, [securityQuestion, expectedAnswer, createRoom, lastGeneratedKey]);

  useEffect(() => {
    if (!roomLink) {
      setQrCodeDataUrl("");
      return;
    }

    QRCode.toDataURL(roomLink, {
      margin: 1,
      width: 160,
      color: {
        dark: "#22d3ee",
        light: "#00000000",
      },
    })
      .then(setQrCodeDataUrl)
      .catch(() => setQrCodeDataUrl(""));
  }, [roomLink]);

  const handleStartSecureSession = () => {
    if (!roomId || !linkCopied) return;
    navigate(`/room/${roomId}?host=1`);
  };

  const handleCopyLink = async () => {
    if (!roomLink) return;
    await navigator.clipboard.writeText(roomLink);
    setLinkCopied(true);
    toast.success("Room link copied");
  };

  return (
    <div className="min-h-screen pt-20 pb-4 px-3 md:px-4 overflow-hidden">
      <div className="max-w-6xl mx-auto glass-panel p-4 md:p-5 rounded-2xl border border-primary/20 h-[calc(100vh-6.5rem)] flex flex-col">
        <div className="text-center mb-4 shrink-0">
          <h1 className="text-2xl font-bold">Get Ready</h1>
          <p className="text-xs text-muted-foreground mt-1">Check your camera and microphone before joining.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-4 flex-1 min-h-0">
          <div className="space-y-3 min-h-0 overflow-y-auto pr-1">
            <div className="relative">
              <VideoPreview
                stream={stream}
                isCameraOn={isCameraOn}
                isMicOn={isMicOn}
                label="You"
                className="aspect-video w-full max-h-[320px] lg:max-h-[300px] rounded-xl"
              />

              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-background/70 backdrop-blur-md rounded-full px-2.5 py-1.5 border border-border/70">
                <button
                  onClick={toggleMic}
                  className={`p-1.5 rounded-full transition-colors ${isMicOn ? "hover:bg-secondary" : "bg-destructive text-destructive-foreground"}`}
                  type="button"
                >
                  {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={toggleCamera}
                  className={`p-1.5 rounded-full transition-colors ${isCameraOn ? "hover:bg-secondary" : "bg-destructive text-destructive-foreground"}`}
                  type="button"
                >
                  {isCameraOn ? <Video className="w-3.5 h-3.5" /> : <VideoOff className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {error && <p className="text-xs text-destructive text-center">{error}</p>}

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Microphone Input</label>
              <select
                value={audioDeviceId}
                onChange={(e) => setAudioDeviceId(e.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {audioDevices.length === 0 && <option value="">No microphone found</option>}
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
                className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {videoDevices.length === 0 && <option value="">No camera found</option>}
                {videoDevices.map((device) => (
                  <option key={device.deviceId} value={device.deviceId}>
                    {device.label || `Camera ${device.deviceId.slice(0, 6)}`}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="glass-panel p-4 rounded-xl border border-border space-y-3 min-h-0 overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold">Host Session</h2>
              <p className="text-xs text-muted-foreground mt-1">Start your private room. Your settings are verified.</p>
            </div>

            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Sample Questions</label>
              <div className="flex flex-wrap gap-2">
                {SAMPLE_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setSecurityQuestion(q)}
                    className={`text-[11px] px-2.5 py-1.5 rounded-full border transition-colors ${securityQuestion === q ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/60"}`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                Security question
              </label>
              <input
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                placeholder="Security question"
                maxLength={200}
                className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Expected answer</label>
              <input
                value={expectedAnswer}
                onChange={(e) => setExpectedAnswer(e.target.value)}
                placeholder="Expected answer"
                maxLength={100}
                className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {roomLink && (
              <div className="rounded-lg border border-primary/25 bg-primary/5 p-3 space-y-3">
                <p className="text-xs font-medium text-muted-foreground">Room link (share with your guests)</p>
                <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/60 p-2">
                  <Link2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-[11px] font-mono truncate flex-1">{roomLink}</span>
                  <button type="button" onClick={handleCopyLink} className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                    <Copy className="w-3 h-3" /> {linkCopied ? "Copied" : "Copy"}
                  </button>
                </div>

                {qrCodeDataUrl && (
                  <div className="flex flex-col items-center gap-2">
                    <img src={qrCodeDataUrl} alt="Room QR Code" className="w-28 h-28 rounded-md border border-border/70 bg-background/40 p-1" />
                    <p className={`text-[11px] ${linkCopied ? "text-primary" : "text-warning"}`}>
                      {linkCopied ? "Link copied. You can start the session." : "Copy the link before starting the session"}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              variant="hero"
              className="w-full"
              onClick={handleStartSecureSession}
              disabled={!roomId || roomLoading || !linkCopied}
            >
              {roomLoading ? "Generating room..." : linkCopied ? "Start Secure Session" : "Copy link to continue"}
            </Button>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PrivateMode;
