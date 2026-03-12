import { motion } from "framer-motion";
import type { ReactNode } from "react";
import {
  BarChart3,
  AlertTriangle,
  ArrowLeftRight,
  Copy,
  Focus,
  Hand,
  LayoutGrid,
  Lock,
  MessageSquare,
  Mic,
  MicOff,
  MonitorUp,
  PhoneOff,
  Repeat2,
  Signal,
  Timer,
  Users,
  Video,
  VideoOff,
  Settings2,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ConnectionQuality = "excellent" | "medium" | "poor";

interface MeetingControlsProps {
  durationLabel: string;
  currentMode: "chat" | "video";
  connectionQuality: ConnectionQuality;
  isHost: boolean;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  isHandRaised: boolean;
  layoutMode: "grid" | "focus-remote" | "screen-share";
  canFocusRemote: boolean;
  videoControlsEnabled: boolean;
  chatVisible: boolean;
  participantsVisible: boolean;
  pollsVisible: boolean;
  participantsCount: number;
  unreadCount: number;
  showChatToggle?: boolean;
  onOpenModeSwitch: () => void;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onToggleScreenShare: () => void;
  onToggleFocusRemote: () => void;
  onSwapView: () => void;
  onToggleChat: () => void;
  onToggleParticipants: () => void;
  onTogglePolls: () => void;
  onCopyInviteLink: () => void;
  onRaiseHand: () => void;
  onSafety: () => void;
  onOpenSettings: () => void;
  onEndCall: () => void;
}

const buttonHover = { y: -1, scale: 1.02 };
const buttonTap = { scale: 0.98 };

const qualityMap: Record<ConnectionQuality, { label: string; dot: string }> = {
  excellent: { label: "Excellent", dot: "bg-emerald-400" },
  medium: { label: "Medium", dot: "bg-amber-400" },
  poor: { label: "Poor", dot: "bg-rose-400" },
};

function ControlButton({
  title,
  tooltip,
  className,
  onClick,
  children,
  disabled,
}: {
  title: string;
  tooltip: string;
  className: string;
  onClick: () => void;
  children: ReactNode;
  disabled?: boolean;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <motion.button
          type="button"
          whileHover={buttonHover}
          whileTap={buttonTap}
          onClick={onClick}
          disabled={disabled}
          title={title}
          className={className}
        >
          {children}
        </motion.button>
      </TooltipTrigger>
      <TooltipContent>
        <p className="text-xs">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

const MeetingControls = ({
  durationLabel,
  currentMode,
  connectionQuality,
  isHost,
  isMicOn,
  isCameraOn,
  isScreenSharing,
  isHandRaised,
  layoutMode,
  canFocusRemote,
  videoControlsEnabled,
  chatVisible,
  participantsVisible,
  pollsVisible,
  participantsCount,
  unreadCount,
  showChatToggle = true,
  onOpenModeSwitch,
  onToggleMic,
  onToggleCamera,
  onToggleScreenShare,
  onToggleFocusRemote,
  onSwapView,
  onToggleChat,
  onToggleParticipants,
  onTogglePolls,
  onCopyInviteLink,
  onRaiseHand,
  onSafety,
  onOpenSettings,
  onEndCall,
}: MeetingControlsProps) => {
  const quality = qualityMap[connectionQuality];

  return (
    <div className="fixed inset-x-0 bottom-2 z-40 flex justify-center px-1.5 md:px-2 pointer-events-none">
      <div className="pointer-events-auto glass-panel-strong border border-primary/15 rounded-xl px-1.5 py-1 shadow-[0_8px_24px_rgba(0,0,0,0.34)] backdrop-blur-xl max-w-[min(860px,100%)] overflow-x-auto">
        <div className="flex items-center justify-center gap-1 md:gap-1.5 whitespace-nowrap">
          <div className="flex items-center justify-center gap-1 whitespace-nowrap shrink-0">
            <div className="px-2 py-0.5 rounded-lg bg-secondary/60 border border-border/80 text-[10px] font-mono flex items-center gap-1">
              <Timer className="w-3 h-3 text-primary" />
              {durationLabel}
            </div>

            <Tooltip>
              <TooltipTrigger asChild>
                <div className="px-2 py-0.5 rounded-lg bg-secondary/60 border border-border/80 text-[10px] font-medium flex items-center gap-1 cursor-default">
                  <Lock className="w-3 h-3 text-primary" />
                  Encrypted
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">End-to-end encrypted session.</p>
              </TooltipContent>
            </Tooltip>

            <div className="px-2 py-0.5 rounded-lg bg-secondary/60 border border-border/80 text-[10px] font-medium flex items-center gap-1">
              <Signal className="w-3 h-3 text-primary" />
              <span className={`h-1.5 w-1.5 rounded-full ${quality.dot}`} />
              {quality.label}
            </div>

            <div className="px-2 py-0.5 rounded-lg bg-primary/12 border border-primary/35 text-[10px] font-semibold tracking-wide text-primary uppercase">
              {currentMode === "video" ? "Video Mode" : "Chat Mode"}
            </div>
          </div>

          {currentMode === "video" && (
            <div className="flex items-center justify-center gap-1 whitespace-nowrap shrink-0">
              <ControlButton
                title="Microphone"
                tooltip="Mute microphone"
                onClick={onToggleMic}
                disabled={!videoControlsEnabled}
                className={`relative h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                  !videoControlsEnabled
                    ? "bg-secondary/40 border-border/50 opacity-50 cursor-not-allowed"
                    : isMicOn
                      ? "bg-secondary/70 border-border hover:bg-secondary"
                      : "bg-destructive/85 border-destructive shadow-[0_0_10px_rgba(239,68,68,0.26)]"
                }`}
              >
                {isMicOn ? <Mic className="w-3 h-3" /> : <MicOff className="w-3 h-3" />}
              </ControlButton>

              <ControlButton
                title="Camera"
                tooltip="Toggle camera"
                onClick={onToggleCamera}
                disabled={!videoControlsEnabled}
                className={`h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                  !videoControlsEnabled
                    ? "bg-secondary/40 border-border/50 opacity-50 cursor-not-allowed"
                    : isCameraOn
                      ? "bg-secondary/70 border-border hover:bg-secondary"
                      : "bg-muted/40 border-border text-muted-foreground"
                }`}
              >
                {isCameraOn ? <Video className="w-3 h-3" /> : <VideoOff className="w-3 h-3" />}
              </ControlButton>

              <ControlButton
                title="Screen Share"
                tooltip="Share screen"
                onClick={onToggleScreenShare}
                disabled={!videoControlsEnabled}
                className={`h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                  !videoControlsEnabled
                    ? "bg-secondary/40 border-border/50 opacity-50 cursor-not-allowed"
                    : isScreenSharing
                      ? "bg-primary/20 border-primary/45 shadow-[0_0_10px_rgba(34,211,238,0.2)]"
                      : "bg-secondary/70 border-border hover:bg-secondary"
                }`}
              >
                <MonitorUp className="w-3 h-3" />
              </ControlButton>

              <ControlButton
                title={layoutMode === "focus-remote" ? "Grid View" : "Focus Remote"}
                tooltip={layoutMode === "focus-remote" ? "Switch to grid view" : "Focus on guest with local PiP"}
                onClick={onToggleFocusRemote}
                disabled={!videoControlsEnabled || !canFocusRemote}
                className={`h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                  !videoControlsEnabled || !canFocusRemote
                    ? "bg-secondary/40 border-border/50 opacity-50 cursor-not-allowed"
                    : layoutMode === "focus-remote"
                      ? "bg-primary/25 border-primary/45 text-primary"
                      : "bg-secondary/70 border-border hover:bg-secondary"
                }`}
              >
                {layoutMode === "focus-remote" ? <LayoutGrid className="w-3 h-3" /> : <Focus className="w-3 h-3" />}
              </ControlButton>

              <ControlButton
                title="Swap Main/PiP"
                tooltip="Swap main and PiP view"
                onClick={onSwapView}
                disabled={!videoControlsEnabled || !canFocusRemote}
                className={`h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                  !videoControlsEnabled || !canFocusRemote
                    ? "bg-secondary/40 border-border/50 opacity-50 cursor-not-allowed"
                    : "bg-secondary/70 border-border hover:bg-secondary"
                }`}
              >
                <Repeat2 className="w-3 h-3" />
              </ControlButton>
            </div>
          )}

          <div className="hidden md:block h-5 w-px bg-border/70" />

          <div className="flex items-center justify-center gap-1 whitespace-nowrap shrink-0">
            <ControlButton
              title="Participants"
              tooltip="View participants"
              onClick={onToggleParticipants}
              className={`relative h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                participantsVisible ? "bg-primary/25 border-primary/45" : "bg-secondary/70 border-border hover:bg-secondary"
              }`}
            >
              <Users className="w-3 h-3" />
              <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-primary text-primary-foreground text-[8px] font-semibold flex items-center justify-center">
                {participantsCount > 99 ? "99+" : participantsCount}
              </span>
            </ControlButton>

            <ControlButton
              title="Copy Invite Link"
              tooltip="Copy invite link"
              onClick={onCopyInviteLink}
              className="h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm bg-secondary/70 border-border hover:bg-secondary"
            >
              <Copy className="w-3 h-3" />
            </ControlButton>

            <ControlButton
              title="Raise Hand"
              tooltip="Raise hand"
              onClick={onRaiseHand}
              className={`h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                isHandRaised ? "bg-primary/25 border-primary/45 text-primary" : "bg-secondary/70 border-border hover:bg-secondary"
              }`}
            >
              <Hand className="w-3 h-3" />
            </ControlButton>

            {currentMode === "video" && (
              <ControlButton
                title="Polls"
                tooltip="Open polls and tools"
                onClick={onTogglePolls}
                className={`h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                  pollsVisible ? "bg-primary/25 border-primary/45" : "bg-secondary/70 border-border hover:bg-secondary"
                }`}
              >
                <BarChart3 className="w-3 h-3" />
              </ControlButton>
            )}

            <ControlButton
              title="Switch Mode"
              tooltip={isHost ? "Switch session mode" : "Only the host can change session mode."}
              onClick={onOpenModeSwitch}
              className={`h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                isHost
                  ? "bg-secondary/70 border-border hover:bg-secondary"
                  : "bg-secondary/40 border-border/50 text-muted-foreground"
              }`}
            >
              <ArrowLeftRight className="w-3 h-3" />
            </ControlButton>

            <ControlButton
              title={currentMode === "chat" ? "Chat Settings" : "Safety"}
              tooltip={currentMode === "chat" ? "Open chat settings" : "Safety tools"}
              onClick={currentMode === "chat" ? onOpenSettings : onSafety}
              className="h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm bg-secondary/70 border-border hover:bg-secondary"
            >
              {currentMode === "chat" ? <Settings2 className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            </ControlButton>

            {showChatToggle && (
              <ControlButton
                title="Chat"
                tooltip="Toggle chat panel"
                onClick={onToggleChat}
                className={`relative h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm ${
                  chatVisible ? "bg-primary/25 border-primary/45" : "bg-secondary/70 border-border hover:bg-secondary"
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[14px] h-[14px] px-1 rounded-full bg-primary text-primary-foreground text-[8px] font-semibold flex items-center justify-center">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </ControlButton>
            )}

            <ControlButton
              title="End Session"
              tooltip="End session"
              onClick={onEndCall}
              className="h-7 w-7 rounded-lg flex items-center justify-center border shadow-sm bg-destructive border-destructive text-destructive-foreground shadow-[0_0_10px_rgba(239,68,68,0.24)]"
            >
              <PhoneOff className="w-3 h-3" />
            </ControlButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MeetingControls;
