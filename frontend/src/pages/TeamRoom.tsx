import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarChart3, Copy, Lock, MessageSquare, Users, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
<<<<<<< HEAD
=======
import { getTeamHostKey, setTeamHostKey } from "@/lib/roomAccess";
>>>>>>> origin/main
import { useRoomRtc } from "@/hooks/useRoomRtc";
import ParticipantGrid from "@/components/team/ParticipantGrid";
import MeetingControls from "@/components/team/MeetingControls";
import ParticipantsPanel from "@/components/team/ParticipantsPanel";
import ChatPanel from "@/components/team/ChatPanel";
import PollSystem from "@/components/team/PollSystem";

interface TileReaction {
  id: string;
  emoji: string;
}

function generateMeetingCode() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

function formatDuration(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function buildTeamMeetingLink(roomCode: string, meetingName: string) {
  const params = new URLSearchParams();
  params.set("room", roomCode);
  params.set("name", meetingName || "Team Meeting");
  return `${window.location.origin}/team?${params.toString()}`;
}

const TeamRoom = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();

  const roomId = searchParams.get("room") || "";
  const roomName = searchParams.get("name") || "Team Meeting";
  const isHost = searchParams.get("host") === "1";
  const inMeeting = Boolean(roomId);

  const [setupMode, setSetupMode] = useState<"create" | "join" | null>(null);
  const [meetingNameInput, setMeetingNameInput] = useState("Team Meeting");
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [createdCode, setCreatedCode] = useState(() => generateMeetingCode());

  const [activePanel, setActivePanel] = useState<"chat" | "participants" | "polls" | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [raisedHands, setRaisedHands] = useState<string[]>([]);
  const [reactionsByPeer, setReactionsByPeer] = useState<Record<string, TileReaction[]>>({});
  const [lockRejected, setLockRejected] = useState(false);

  const previousMessageCountRef = useRef(0);
  const selfDisplayName = useMemo(
    () => user?.display_name?.trim() || "Team User",
    [user?.display_name]
  );

<<<<<<< HEAD
=======
  useEffect(() => {
    if (!inMeeting || !isHost || !roomId) return;
    if (!getTeamHostKey(roomId)) {
      const hostKey = crypto.randomUUID();
      setTeamHostKey(roomId, hostKey);
    }
  }, [inMeeting, isHost, roomId]);

>>>>>>> origin/main
  const {
    localStream,
    remoteStreams,
    participants,
    selfPeerId,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    isSocketConnected,
    hasPeer,
    messages,
    activeSpeakerPeerId,
    meetingLocked,
    isRecording,
    pinnedMessageId,
    activePoll,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendMessage,
    raiseHand,
    muteParticipant,
    removeParticipant,
    disableParticipantCamera,
    setMeetingLock,
    setRecordingState,
    endMeetingForAll,
    sendReaction,
    createPoll,
    votePoll,
    pinMessage,
    unpinMessage,
  } = useRoomRtc({
    roomId,
    enabled: inMeeting,
    mode: "video",
    isHost,
<<<<<<< HEAD
=======
    hostKey: isHost ? getTeamHostKey(roomId) : null,
>>>>>>> origin/main
    displayName: selfDisplayName,
    onRaiseHandReceived: (fromPeerId) => {
      setRaisedHands((current) => (current.includes(fromPeerId) ? current : [...current, fromPeerId]));
      toast.info("A participant raised a hand.");
    },
    onMeetingLocked: (locked, fromPeerId) => {
      if (locked && !isHost && !fromPeerId) {
        setLockRejected(true);
        return;
      }
      toast.info(locked ? "Meeting locked by host." : "Meeting unlocked.");
    },
    onParticipantRemoved: () => {
      toast.error("You were removed from the meeting.");
      navigate("/team", { replace: true });
    },
    onCameraDisableRequested: () => {
      toast.info("Host turned off your camera.");
    },
    onMeetingEndedForAll: () => {
      toast.info("Host ended the meeting.");
      navigate("/team", { replace: true });
    },
    onReactionReceived: (emoji, fromPeerId) => {
      const reactionId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setReactionsByPeer((current) => ({
        ...current,
        [fromPeerId]: [...(current[fromPeerId] || []), { id: reactionId, emoji }],
      }));
      setTimeout(() => {
        setReactionsByPeer((current) => ({
          ...current,
          [fromPeerId]: (current[fromPeerId] || []).filter((item) => item.id !== reactionId),
        }));
      }, 2600);
    },
  });

  useEffect(() => {
    if (!lockRejected) return;
    toast.error("Meeting is locked by host.");
    navigate("/team", { replace: true });
  }, [lockRejected, navigate]);

  useEffect(() => {
    if (!inMeeting) {
      setLockRejected(false);
    }
  }, [inMeeting]);

  useEffect(() => {
<<<<<<< HEAD
=======
    if (!inMeeting) return;
    if (user) return;
    toast.error("Please sign in to join a team meeting.");
    navigate("/auth", { replace: true });
  }, [inMeeting, navigate, user]);

  useEffect(() => {
>>>>>>> origin/main
    if (!inMeeting) {
      setElapsedSeconds(0);
      return;
    }
    const startedAt = Date.now();
    const interval = window.setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [inMeeting]);

  useEffect(() => {
    const validPeerIds = new Set(participants.map((participant) => participant.peerId));
    setRaisedHands((current) => current.filter((peerId) => validPeerIds.has(peerId)));
  }, [participants]);

  useEffect(() => {
    if (messages.length <= previousMessageCountRef.current) return;

    const nextMessages = messages.slice(previousMessageCountRef.current);
    previousMessageCountRef.current = messages.length;

    if (activePanel === "chat") return;

    const peerMessages = nextMessages.filter((message) => message.sender === "peer").length;
    if (peerMessages > 0) {
      setUnreadCount((current) => current + peerMessages);
    }
  }, [messages, activePanel]);

  useEffect(() => {
    if (activePanel === "chat") {
      setUnreadCount(0);
    }
  }, [activePanel]);

  const durationLabel = useMemo(() => formatDuration(elapsedSeconds), [elapsedSeconds]);

  const handleCreateMeeting = () => {
    const roomCode = createdCode;
    const name = meetingNameInput.trim() || "Team Meeting";
    const params = new URLSearchParams();
    params.set("room", roomCode);
    params.set("host", "1");
    params.set("name", name);
    navigate(`/team?${params.toString()}`);
  };

  const handleCopyAndStartMeeting = async () => {
    const roomCode = createdCode;
    const name = meetingNameInput.trim() || "Team Meeting";
    const inviteLink = buildTeamMeetingLink(roomCode, name);

    try {
      await navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied.");
    } catch {
      toast.error("Could not copy invite link, starting meeting anyway.");
    }

    const params = new URLSearchParams();
    params.set("room", roomCode);
    params.set("host", "1");
    params.set("name", name);
    navigate(`/team?${params.toString()}`);
  };

  const handleJoinMeeting = () => {
    const code = joinCodeInput.trim().toUpperCase();
    if (!code) return;
    const params = new URLSearchParams();
    params.set("room", code);
    params.set("name", "Team Meeting");
    navigate(`/team?${params.toString()}`);
  };

  const handleLeaveMeeting = () => {
    navigate("/team");
  };

  const handleEndForAll = () => {
    const sent = endMeetingForAll();
    if (!sent) {
      toast.error("Only host can end meeting for all.");
      return;
    }
    navigate("/team");
  };

  const handleRaiseHand = () => {
    const sent = raiseHand();
    if (!sent) {
      toast.error("Unable to raise hand right now.");
      return;
    }
    setRaisedHands((current) => (current.includes(selfPeerId) ? current : [...current, selfPeerId]));
    toast.success("Hand raised.");
  };

  const handleReaction = (emoji: string) => {
    const sent = sendReaction(emoji);
    if (!sent) return;

    const reactionId = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    setReactionsByPeer((current) => ({
      ...current,
      [selfPeerId]: [...(current[selfPeerId] || []), { id: reactionId, emoji }],
    }));
    setTimeout(() => {
      setReactionsByPeer((current) => ({
        ...current,
        [selfPeerId]: (current[selfPeerId] || []).filter((item) => item.id !== reactionId),
      }));
    }, 2600);
  };

  const handleToggleLock = () => {
    const sent = setMeetingLock(!meetingLocked);
    if (!sent) {
      toast.error("Only host can change lock state.");
    }
  };

  const handleToggleRecording = () => {
    const sent = setRecordingState(!isRecording);
    if (!sent) {
      toast.error("Only host can change recording state.");
    }
  };

  const handleMuteParticipant = (peerId: string) => {
    if (!muteParticipant(peerId)) {
      toast.error("Unable to mute participant.");
      return;
    }
    toast.success("Mute request sent.");
  };

  const handleDisableCamera = (peerId: string) => {
    if (!disableParticipantCamera(peerId)) {
      toast.error("Unable to disable camera.");
      return;
    }
    toast.success("Camera disable request sent.");
  };

  const handleRemoveParticipant = (peerId: string) => {
    if (!removeParticipant(peerId)) {
      toast.error("Unable to remove participant.");
      return;
    }
    toast.success("Participant removed.");
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    const sent = createPoll(question, options);
    if (!sent) {
      toast.error("Unable to create poll.");
      return;
    }
    toast.success("Poll created.");
  };

  const handleCopyRoomCode = async () => {
    if (!roomId) return;
    try {
      await navigator.clipboard.writeText(roomId);
      toast.success("Room code copied.");
    } catch {
      toast.error("Could not copy room code.");
    }
  };

  const renderSidePanel = (onClose: () => void) => {
    if (activePanel === "chat") {
      return (
        <ChatPanel
          open
          messages={messages}
          isHost={isHost}
          pinnedMessageId={pinnedMessageId}
          onClose={onClose}
          onSendMessage={(text) => {
            const sent = sendMessage(text);
            if (!sent) toast.error("Unable to send message.");
          }}
          onPinMessage={(messageId) => {
            if (!pinMessage(messageId)) {
              toast.error("Only host can pin messages.");
            }
          }}
          onUnpinMessage={() => {
            if (!unpinMessage()) {
              toast.error("Only host can unpin messages.");
            }
          }}
        />
      );
    }

    if (activePanel === "participants") {
      return (
        <ParticipantsPanel
          open
          participants={participants}
          raisedHands={raisedHands}
          isHost={isHost}
          onClose={onClose}
          onMute={handleMuteParticipant}
          onDisableCamera={handleDisableCamera}
          onRemove={handleRemoveParticipant}
        />
      );
    }

    if (activePanel === "polls") {
      return (
        <PollSystem
          open
          isHost={isHost}
          activePoll={activePoll}
          selfPeerId={selfPeerId}
          onClose={onClose}
          onCreatePoll={handleCreatePoll}
          onVote={(pollId, option) => {
            if (!votePoll(pollId, option)) {
              toast.error("Unable to vote right now.");
            }
          }}
        />
      );
    }

    return null;
  };

  if (!inMeeting) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md glass-panel p-7 rounded-2xl border border-primary/20">
          <h1 className="text-2xl font-bold mb-2">Team Meeting</h1>
          <p className="text-sm text-muted-foreground mb-6">Create or join a professional multi-participant meeting.</p>

          {!setupMode && (
            <div className="grid grid-cols-2 gap-3">
              <Button variant="glass" className="h-20" onClick={() => setSetupMode("create")}>
                Create
              </Button>
              <Button variant="glass" className="h-20" onClick={() => setSetupMode("join")}>
                Join
              </Button>
            </div>
          )}

          {setupMode === "create" && (
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Meeting Name</label>
              <input
                value={meetingNameInput}
                onChange={(event) => setMeetingNameInput(event.target.value)}
                className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm"
              />

              <label className="text-sm text-muted-foreground">Meeting Code</label>
              <div className="h-10 px-3 rounded-lg bg-secondary border border-border text-sm font-mono tracking-widest flex items-center justify-between">
                <span>{createdCode}</span>
                <button
                  type="button"
                  onClick={() => {
                    setCreatedCode(generateMeetingCode());
                  }}
                  className="text-xs text-primary"
                >
                  Regenerate
                </button>
              </div>

              <Button variant="hero" className="w-full" onClick={handleCreateMeeting}>
                Start Team Meeting
              </Button>
              <Button variant="glass" className="w-full" onClick={() => void handleCopyAndStartMeeting()}>
                Copy Invite & Start
              </Button>
            </div>
          )}

          {setupMode === "join" && (
            <div className="space-y-3">
              <label className="text-sm text-muted-foreground">Meeting Code</label>
              <input
                value={joinCodeInput}
                onChange={(event) => setJoinCodeInput(event.target.value.toUpperCase())}
                className="w-full h-10 px-3 rounded-lg bg-secondary border border-border text-sm font-mono tracking-[0.2em]"
                placeholder="AB12CD"
                maxLength={12}
              />
              <Button variant="hero" className="w-full" onClick={handleJoinMeeting} disabled={!joinCodeInput.trim()}>
                Join Meeting
              </Button>
            </div>
          )}

          {setupMode && (
            <Button variant="glass" className="w-full mt-3" onClick={() => setSetupMode(null)}>
              Back
            </Button>
          )}
        </div>
      </div>
    );
  }

  const desktopPanelOpen = Boolean(activePanel);

  return (
    <div className="min-h-screen pt-[4.7rem] pb-20 px-3 md:px-4">
      <div className="max-w-[1520px] mx-auto h-[calc(100vh-7.25rem)] min-h-[560px] flex gap-3">
        <section
          className={`h-full min-w-0 flex flex-col gap-2.5 transition-all duration-200 ${
            desktopPanelOpen ? "lg:w-[calc(100%-338px)]" : "w-full"
          }`}
        >
          <div className="glass-panel border border-primary/18 rounded-2xl px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2.5">
            <div className="min-w-0">
              <h2 className="text-[17px] leading-tight font-semibold tracking-tight truncate">{roomName}</h2>
              <div className="mt-1 flex items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground rounded-md border border-border bg-secondary/50 px-2 py-0.5 inline-flex items-center gap-1.5">
                  Room ID
                  <span className="font-mono text-foreground/85">{roomId}</span>
                </span>
                <button
                  type="button"
                  onClick={() => void handleCopyRoomCode()}
                  className="h-6 w-6 rounded-md border border-border bg-secondary/50 hover:bg-secondary/80 inline-flex items-center justify-center"
                  title="Copy room code"
                >
                  <Copy className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 justify-end">
              <span
                className={`text-[11px] px-2 py-1 rounded-md border inline-flex items-center gap-1.5 ${
                  isSocketConnected ? "border-emerald-400/50 text-emerald-300" : "border-amber-400/40 text-amber-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSocketConnected ? "bg-emerald-300" : "bg-amber-300"}`} />
                {isSocketConnected ? "Connected" : "Connecting"}
              </span>
              {meetingLocked && (
                <span className="text-[11px] px-2 py-1 rounded-md border border-warning/40 text-warning inline-flex items-center gap-1">
                  <Lock className="w-3 h-3" />
                  Locked
                </span>
              )}
              {isRecording && (
                <span className="text-[11px] px-2 py-1 rounded-md border border-destructive/40 text-destructive inline-flex items-center gap-1">
                  <Video className="w-3 h-3" />
                  Recording
                </span>
              )}
              <div className="hidden xl:flex items-center gap-1 pl-1.5 border-l border-border/70">
                <button
                  type="button"
                  onClick={() => setActivePanel((current) => (current === "chat" ? null : "chat"))}
                  className={`h-7 px-2 rounded-md border text-[11px] inline-flex items-center gap-1 ${
                    activePanel === "chat"
                      ? "border-primary/45 bg-primary/15 text-primary"
                      : "border-border bg-secondary/55 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <MessageSquare className="w-3 h-3" />
                  Chat
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel((current) => (current === "participants" ? null : "participants"))}
                  className={`h-7 px-2 rounded-md border text-[11px] inline-flex items-center gap-1 ${
                    activePanel === "participants"
                      ? "border-primary/45 bg-primary/15 text-primary"
                      : "border-border bg-secondary/55 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <Users className="w-3 h-3" />
                  Members
                </button>
                <button
                  type="button"
                  onClick={() => setActivePanel((current) => (current === "polls" ? null : "polls"))}
                  className={`h-7 px-2 rounded-md border text-[11px] inline-flex items-center gap-1 ${
                    activePanel === "polls"
                      ? "border-primary/45 bg-primary/15 text-primary"
                      : "border-border bg-secondary/55 text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  <BarChart3 className="w-3 h-3" />
                  Polls
                </button>
              </div>
            </div>
          </div>

          <ParticipantGrid
            participants={participants}
            localStream={localStream}
            remoteStreams={remoteStreams}
            activeSpeakerPeerId={activeSpeakerPeerId}
            reactionsByPeer={reactionsByPeer}
          />

          {!hasPeer && (
            <div className="text-xs text-muted-foreground px-2.5">Waiting for participants to join...</div>
          )}
        </section>

        <section
          className={`hidden lg:block h-full shrink-0 transition-all duration-200 ${
            desktopPanelOpen ? "w-[326px] opacity-100" : "w-0 opacity-0 pointer-events-none"
          }`}
        >
          {desktopPanelOpen ? renderSidePanel(() => setActivePanel(null)) : null}
        </section>
      </div>

      {activePanel && (
        <>
          <button
            type="button"
            className="lg:hidden fixed inset-0 z-40 bg-black/50"
            onClick={() => setActivePanel(null)}
            aria-label="Close panel overlay"
          />
          <div className="lg:hidden fixed top-20 right-2 z-50 w-[92vw] max-w-[390px] h-[calc(100vh-8.5rem)]">
            {renderSidePanel(() => setActivePanel(null))}
          </div>
        </>
      )}

      <MeetingControls
        durationLabel={durationLabel}
        participantsCount={participants.length}
        isHost={isHost}
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
        meetingLocked={meetingLocked}
        isRecording={isRecording}
        chatVisible={activePanel === "chat"}
        participantsVisible={activePanel === "participants"}
        pollsVisible={activePanel === "polls"}
        unreadCount={unreadCount}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={toggleScreenShare}
        onRaiseHand={handleRaiseHand}
        onSendReaction={handleReaction}
        onToggleChat={() => setActivePanel((current) => (current === "chat" ? null : "chat"))}
        onToggleParticipants={() => setActivePanel((current) => (current === "participants" ? null : "participants"))}
        onTogglePolls={() => setActivePanel((current) => (current === "polls" ? null : "polls"))}
        onToggleLock={handleToggleLock}
        onToggleRecording={handleToggleRecording}
        onLeaveMeeting={handleLeaveMeeting}
        onEndForAll={handleEndForAll}
      />
    </div>
  );
};

export default TeamRoom;
