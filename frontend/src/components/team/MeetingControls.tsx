import { useState } from "react";
import type { ReactNode } from "react";
import {
  BarChart3,
  Camera,
  CameraOff,
  Hand,
  Lock,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  ScreenShare,
  Settings,
  ShieldCheck,
  Smile,
  Users,
  Video,
} from "lucide-react";

interface TeamMeetingControlsProps {
  durationLabel: string;
  participantsCount: number;
  isHost: boolean;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  meetingLocked: boolean;
  isRecording: boolean;
  chatVisible: boolean;
  participantsVisible: boolean;
  pollsVisible: boolean;
  unreadCount: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onRaiseHand: () => void;
  onSendReaction: (emoji: string) => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onTogglePolls: () => void;
  onToggleLock: () => void;
  onToggleRecording: () => void;
  onLeaveMeeting: () => void;
  onEndForAll: () => void;
}

function ControlBtn({
  title,
  active = false,
  danger = false,
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  danger?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`relative h-9 w-9 rounded-lg border inline-flex items-center justify-center transition-colors ${
        danger
          ? "bg-destructive border-destructive text-destructive-foreground"
          : active
            ? "bg-primary/20 border-primary/50 text-primary shadow-[0_0_12px_rgba(34,211,238,0.22)]"
            : "bg-secondary/70 border-border hover:bg-secondary"
      }`}
    >
      {children}
    </button>
  );
}

const REACTIONS = ["👍", "👏", "😂", "🔥"];

const MeetingControls = ({
  durationLabel,
  participantsCount,
  isHost,
  isMicOn,
  isCameraOn,
  isScreenSharing,
  meetingLocked,
  isRecording,
  chatVisible,
  participantsVisible,
  pollsVisible,
  unreadCount,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onRaiseHand,
  onSendReaction,
  onToggleChat,
  onToggleParticipants,
  onTogglePolls,
  onToggleLock,
  onToggleRecording,
  onLeaveMeeting,
  onEndForAll,
}: TeamMeetingControlsProps) => {
  const [showReactions, setShowReactions] = useState(false);

  return (
    <div className="fixed bottom-3 left-1/2 -translate-x-1/2 z-40 w-[96vw] max-w-[1080px]">
      <div className="glass-panel-strong border border-primary/18 rounded-2xl px-2.5 py-2 backdrop-blur-xl shadow-[0_14px_34px_rgba(0,0,0,0.34)]">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="w-full lg:w-auto flex flex-wrap items-center gap-1.5 justify-center lg:justify-start">
            <div className="px-2.5 py-1 rounded-md bg-secondary/70 border border-border text-[11px] font-mono">{durationLabel}</div>
            <div className="px-2.5 py-1 rounded-md bg-secondary/70 border border-border text-[11px] inline-flex items-center gap-1.5">
              <ShieldCheck className="w-3 h-3 text-primary" />
              Encrypted
            </div>
            <div className="px-2.5 py-1 rounded-md bg-secondary/70 border border-border text-[11px] inline-flex items-center gap-1.5">
              <Users className="w-3 h-3 text-primary" />
              {participantsCount}
            </div>
          </div>

          <div className="w-full lg:w-auto flex flex-wrap items-center gap-1.5 justify-center">
            <ControlBtn title="Toggle microphone" active={isMicOn} danger={!isMicOn} onClick={onToggleMic}>
              {isMicOn ? <Mic className="w-3.5 h-3.5" /> : <MicOff className="w-3.5 h-3.5" />}
            </ControlBtn>
            <ControlBtn title="Toggle camera" active={isCameraOn} onClick={onToggleCamera}>
              {isCameraOn ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
            </ControlBtn>
            <ControlBtn title="Share screen" active={isScreenSharing} onClick={onToggleScreenShare}>
              <ScreenShare className="w-3.5 h-3.5" />
            </ControlBtn>
            <ControlBtn title="Raise hand" onClick={onRaiseHand}>
              <Hand className="w-3.5 h-3.5" />
            </ControlBtn>
            <ControlBtn title="Reactions" active={showReactions} onClick={() => setShowReactions((prev) => !prev)}>
              <Smile className="w-3.5 h-3.5" />
            </ControlBtn>
          </div>

          <div className="w-full lg:w-auto flex flex-wrap items-center gap-1.5 justify-center lg:justify-end">
            <ControlBtn title="Chat" active={chatVisible} onClick={onToggleChat}>
              <MessageSquare className="w-3.5 h-3.5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px] font-semibold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </ControlBtn>
            <ControlBtn title="Participants" active={participantsVisible} onClick={onToggleParticipants}>
              <Users className="w-3.5 h-3.5" />
            </ControlBtn>
            <ControlBtn title="Polls" active={pollsVisible} onClick={onTogglePolls}>
              <BarChart3 className="w-3.5 h-3.5" />
            </ControlBtn>
            {isHost ? (
              <>
                <ControlBtn title="Lock meeting" active={meetingLocked} onClick={onToggleLock}>
                  <Lock className="w-3.5 h-3.5" />
                </ControlBtn>
                <ControlBtn title="Recording" active={isRecording} onClick={onToggleRecording}>
                  <Video className="w-3.5 h-3.5" />
                </ControlBtn>
              </>
            ) : (
              <ControlBtn title="Settings" onClick={() => undefined}>
                <Settings className="w-3.5 h-3.5" />
              </ControlBtn>
            )}
            <ControlBtn title="Leave meeting" danger onClick={onLeaveMeeting}>
              <PhoneOff className="w-3.5 h-3.5" />
            </ControlBtn>
            {isHost && (
              <button
                type="button"
                onClick={onEndForAll}
                className="h-9 px-3 rounded-lg border border-destructive bg-destructive text-destructive-foreground text-[11px] font-semibold"
              >
                End For All
              </button>
            )}
          </div>
        </div>

        {showReactions && (
          <div className="mt-2.5 pt-2.5 border-t border-border flex items-center justify-center gap-1.5">
            {REACTIONS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => {
                  onSendReaction(emoji);
                  setShowReactions(false);
                }}
                className="h-8 w-8 rounded-md border border-border bg-secondary/70 hover:bg-secondary text-base"
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MeetingControls;
