import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { usePrivateRoomApi, type PrivateRoom } from "@/hooks/usePrivateRoomApi";
import { useRoomRtc } from "@/hooks/useRoomRtc";
import { useMediaStream } from "@/hooks/useMediaStream";
import { useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/contexts/AuthContext";
import VideoGrid from "@/components/room/VideoGrid";
import ChatPanel from "@/components/ChatPanel";
import MeetingControls from "@/components/MeetingControls";
import ChatOnlyRoomLayout from "@/components/ChatOnlyRoomLayout";
import ModeSwitchModal from "@/components/room/ModeSwitchModal";
import ParticipantsDrawer from "@/components/room/ParticipantsDrawer";
import JoinGuestPage from "./JoinGuestPage";
import WaitingForHost from "./WaitingForHost";
<<<<<<< HEAD
=======
import { getRoomHostKey } from "@/lib/roomAccess";
>>>>>>> origin/main

function toWsUrl() {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const url = new URL(base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
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

const Room = () => {
  const navigate = useNavigate();
  const { roomId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const isHost = searchParams.get("host") === "1";
<<<<<<< HEAD
  const { user } = useAuth();
=======
  const { user, token } = useAuth();
>>>>>>> origin/main

  const { getRoom, verifyRoom } = usePrivateRoomApi();

  const [room, setRoom] = useState<PrivateRoom | null>(null);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(isHost);
  const [answer, setAnswer] = useState("");
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);

  const [communicationMode, setCommunicationMode] = useState<"video" | "chat" | null>(null);
  const [waitingMessage, setWaitingMessage] = useState<string | null>(null);
  const [sessionEnded, setSessionEnded] = useState(false);

  const [activePanel, setActivePanel] = useState<"chat" | "tools" | null>(null);
  const [participantsDrawerOpen, setParticipantsDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [incomingVideoRequestFrom, setIncomingVideoRequestFrom] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isModeSwitchOpen, setIsModeSwitchOpen] = useState(false);
  const [messageReactions, setMessageReactions] = useState<Record<string, string[]>>({});
  const [layoutMode, setLayoutMode] = useState<"grid" | "focus-remote">("grid");
  const [focusPrimary, setFocusPrimary] = useState<"remote" | "local">("remote");
  const [focusedPeerId, setFocusedPeerId] = useState<string | null>(null);

  const previousMessageCountRef = useRef(0);
  const lastModeToastRef = useRef<"video" | "chat" | null>(null);
  const isMobile = useIsMobile();

  const chatVisible = activePanel === "chat";
  const participantsVisible = participantsDrawerOpen;
  const toolsVisible = activePanel === "tools";

  const sessionReady = verified && communicationMode !== null;
  const rtcEnabled = verified && !sessionEnded;
  const previewMedia = useMediaStream({ autoStart: sessionReady && communicationMode === "video" });
  const selfDisplayName = useMemo(
    () => user?.display_name?.trim() || (isHost ? "Host" : "Guest"),
    [isHost, user?.display_name]
  );

  const {
    localStream,
    remoteStreams,
    hasPeer,
    participants,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    isHandRaised,
    activeSpeakerPeerId,
    connectionStatus,
    connectionQuality,
    mediaError,
    messages,
    isSocketConnected,
    hasJoinedRoom,
    videoRequestPending,
    activePoll,
    sessionActive,
    toggleMic,
    toggleCamera,
    shareScreen,
    sendMessage,
    sendFileMessage,
    requestVideoCall,
    respondToVideoCall,
    leaveMeeting,
    changeSessionMode,
    raiseHand,
    muteParticipant,
    sendReaction,
    createPoll,
    votePoll,
    retryLocalMedia,
  } = useRoomRtc({
    roomId,
    enabled: rtcEnabled,
    mode: communicationMode || "chat",
    preferredLocalStream: previewMedia.stream,
    isHost,
<<<<<<< HEAD
=======
    hostKey: isHost ? getRoomHostKey(roomId) : null,
>>>>>>> origin/main
    displayName: selfDisplayName,
    onVideoCallRequested: (fromPeerId) => {
      setIncomingVideoRequestFrom(fromPeerId);
      toast.info("User wants to start a video call.");
    },
    onVideoCallAccepted: () => {
      setCommunicationMode("video");
      setLayoutMode("focus-remote");
      setFocusPrimary("remote");
      setActivePanel(null);
      toast.success("Video call request accepted.");
    },
    onVideoCallDeclined: () => {
      toast.error("Video call request declined.");
    },
    onEndCallReceived: () => {
      setCommunicationMode("chat");
      setLayoutMode("grid");
      setFocusPrimary("remote");
      setFocusedPeerId(null);
      toast.info("Peer ended the call. You are back in chat mode.");
    },
    onSessionModeChange: (nextMode) => {
      setCommunicationMode(nextMode);
      setActivePanel(null);
      if (nextMode === "chat") {
        setLayoutMode("grid");
        setFocusPrimary("remote");
      }
      setParticipantsDrawerOpen(false);
      setWaitingMessage(null);
      setSessionEnded(false);
      if (lastModeToastRef.current !== nextMode) {
        toast.info(nextMode === "chat" ? "Host switched the session to chat mode." : "Host switched the session to video mode.");
        lastModeToastRef.current = nextMode;
      }
    },
    onHostDisconnected: () => {
      setWaitingMessage("Host disconnected. Waiting for reconnection.");
      setCommunicationMode(null);
      setLayoutMode("grid");
      setFocusPrimary("remote");
      setFocusedPeerId(null);
      lastModeToastRef.current = null;
    },
    onSessionClosed: () => {
      setWaitingMessage("Session has ended.");
      setSessionEnded(true);
      setCommunicationMode(null);
      setLayoutMode("grid");
      setFocusPrimary("remote");
      setFocusedPeerId(null);
      lastModeToastRef.current = null;
    },
    onRaiseHandReceived: () => {
      toast.info("A participant raised their hand.");
    },
    onMuteRequested: () => {
      toast.info("Host muted your microphone.");
    },
  });

  const remoteParticipants = useMemo(
    () => participants.filter((participant) => !participant.isSelf),
    [participants]
  );

  useEffect(() => {
    if (!roomId) return;
    setLoading(true);
    getRoom(roomId)
      .then((response) => {
        setRoom(response.room);
      })
      .catch((err: any) => {
        toast.error(err.message || "Room not found or expired");
        navigate("/private");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [roomId, getRoom, navigate]);

  useEffect(() => {
    if (!verified || communicationMode !== null || isHost) return;
    setWaitingMessage((current) => current || "Host is choosing chat or video mode for this session.");
  }, [verified, communicationMode, isHost]);

  useEffect(() => {
    if (!sessionReady) {
      setElapsedSeconds(0);
      return;
    }

    const startedAt = Date.now();
    const timer = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => clearInterval(timer);
  }, [sessionReady]);

  useEffect(() => {
    if (communicationMode === "chat") {
      setUnreadCount(0);
      previousMessageCountRef.current = messages.length;
      return;
    }

    if (messages.length <= previousMessageCountRef.current) return;

    const nextMessages = messages.slice(previousMessageCountRef.current);
    previousMessageCountRef.current = messages.length;

    if (chatVisible) {
      return;
    }

    const unreadPeerMessages = nextMessages.filter((message) => message.sender === "peer").length;
    if (unreadPeerMessages > 0) {
      setUnreadCount((current) => current + unreadPeerMessages);
    }
  }, [messages, chatVisible, communicationMode]);

  useEffect(() => {
    if (!chatVisible) return;
    setUnreadCount(0);
  }, [chatVisible]);

  useEffect(() => {
    if (remoteParticipants.length === 0) {
      setLayoutMode("grid");
      setFocusPrimary("remote");
      setFocusedPeerId(null);
      return;
    }

    if (focusedPeerId && remoteParticipants.some((participant) => participant.peerId === focusedPeerId)) {
      return;
    }
    setFocusedPeerId(remoteParticipants[0].peerId);
  }, [focusedPeerId, remoteParticipants]);

  const handleVerify = async () => {
    if (!roomId || !answer.trim()) return;
    setVerifyLoading(true);
    setVerifyError(null);
    try {
      await verifyRoom(roomId, answer);
      navigate(`/room/${roomId}`, { replace: true });
      setVerified(true);
      setSessionEnded(false);
      setWaitingMessage("Host is choosing chat or video mode for this session.");
      toast.success("Access granted");
    } catch (err: any) {
      setVerifyError(err.message || "Incorrect answer");
    } finally {
      setVerifyLoading(false);
    }
  };

  const emitSessionClosed = () => {
    if (!isHost || !roomId) return;

    const socket = new WebSocket(toWsUrl());
    const peerId = `host-close-${crypto.randomUUID()}`;
<<<<<<< HEAD
=======
    const hostKey = getRoomHostKey(roomId);
>>>>>>> origin/main

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
            type: "join-room",
            roomId,
            peerId,
            role: "host",
            phase: "gate",
<<<<<<< HEAD
=======
            authToken: token || undefined,
            hostKey: hostKey || undefined,
>>>>>>> origin/main
          })
        );
      socket.send(JSON.stringify({ type: "session_closed" }));
      socket.send(JSON.stringify({ type: "leave-room" }));
      socket.close();
    };
  };

  const handleEndCall = () => {
    if (isHost) {
      emitSessionClosed();
    }
    setParticipantsDrawerOpen(false);
    setActivePanel(null);
    setLayoutMode("grid");
    setFocusPrimary("remote");
    setFocusedPeerId(null);
    leaveMeeting();
    setSessionEnded(true);
    navigate(isHost ? "/private" : "/");
  };

  const handleStartSessionMode = (mode: "chat" | "video") => {
    const started = changeSessionMode(mode);
    if (!started) {
      toast.error("Room connection is not ready yet. Try again in a second.");
      return;
    }

    setSessionEnded(false);
    setWaitingMessage(null);
    setCommunicationMode(mode);
    setParticipantsDrawerOpen(false);
    lastModeToastRef.current = mode;
    setLayoutMode(mode === "video" ? "focus-remote" : "grid");
    setFocusPrimary("remote");
    setActivePanel(null);
  };

  const handleSafety = () => {
    toast.warning("Safety mode flagged. You can end the session immediately if needed.");
  };

  const handleToggleChat = () => {
    setActivePanel((current) => {
      if (current === "chat") return null;
      setUnreadCount(0);
      return "chat";
    });
  };

  const handleToggleParticipants = () => {
    setParticipantsDrawerOpen((current) => !current);
  };

  const handleToggleTools = () => {
    setActivePanel((current) => (current === "tools" ? null : "tools"));
    toast.info("Polls and advanced tools are coming soon.");
  };

  const handleToggleFocusRemote = () => {
    if (!canFocusRemote) {
      toast.info("Focus mode will activate when a guest joins.");
      return;
    }
    setLayoutMode((current) => (current === "focus-remote" ? "grid" : "focus-remote"));
    if (!focusedPeerId && remoteParticipants[0]) {
      setFocusedPeerId(remoteParticipants[0].peerId);
    }
  };

  const handleSwapView = () => {
    if (!canFocusRemote) {
      return;
    }
    if (layoutMode !== "focus-remote") {
      setLayoutMode("focus-remote");
    }
    setFocusPrimary((current) => (current === "remote" ? "local" : "remote"));
  };

  const handleSelectFocusPeer = (peerId: string) => {
    setFocusedPeerId(peerId);
    if (layoutMode !== "focus-remote") {
      setLayoutMode("focus-remote");
    }
    setFocusPrimary("remote");
  };

  const handleOpenChatSettings = () => {
    toast.info("Chat settings will be expanded in the next iteration.");
  };

  const handleSendMessage = (text: string) => {
    const sent = sendMessage(text);
    if (!sent) {
      toast.error("Unable to send message. Waiting for peer connection.");
    }
  };

  const handleSendFile = async (file: File) => {
    try {
      const sent = await sendFileMessage(file);
      if (!sent) {
        toast.error("Unable to share file right now.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Unable to upload file.");
    }
  };

  const handleReactToMessage = (messageId: string, emoji: string) => {
    setMessageReactions((current) => {
      const reactions = current[messageId] || [];
      return {
        ...current,
        [messageId]: [...reactions, emoji],
      };
    });
  };

  const handleRequestVideoCall = () => {
    if (communicationMode !== "chat") {
      toast.info("Video call is already active.");
      return;
    }

    const sent = requestVideoCall();
    if (!sent) {
      toast.error("No peer available to request video call.");
    }
  };

  const handleAcceptVideoRequest = () => {
    if (!incomingVideoRequestFrom) return;
    const sent = respondToVideoCall(true, incomingVideoRequestFrom);
    if (!sent) {
      toast.error("Unable to accept request. Connection is not ready.");
      return;
    }
    if (isHost) {
      changeSessionMode("video");
    }
    setIncomingVideoRequestFrom(null);
    setCommunicationMode("video");
    setActivePanel(null);
    toast.success("Video call accepted.");
  };

  const handleDeclineVideoRequest = () => {
    if (!incomingVideoRequestFrom) return;
    const sent = respondToVideoCall(false, incomingVideoRequestFrom);
    if (!sent) {
      toast.error("Unable to decline request. Connection is not ready.");
      return;
    }
    setIncomingVideoRequestFrom(null);
    toast.info("Video call request declined.");
  };

  const handleOpenModeSwitch = () => {
    if (!isHost) return;
    setIsModeSwitchOpen(true);
  };

  const handleModeSwitch = (nextMode: "chat" | "video") => {
    if (!isHost || !communicationMode) return;

    if (nextMode === communicationMode) {
      setIsModeSwitchOpen(false);
      return;
    }

    const sent = changeSessionMode(nextMode);
    if (!sent) {
      toast.error("Unable to switch mode right now.");
      return;
    }

    setCommunicationMode(nextMode);
    lastModeToastRef.current = nextMode;
    setParticipantsDrawerOpen(false);
    setLayoutMode(nextMode === "video" ? "focus-remote" : "grid");
    setFocusPrimary("remote");
    setActivePanel(null);
    setIsModeSwitchOpen(false);
    toast.success(nextMode === "chat" ? "Session switched to chat mode." : "Session switched to video mode.");
  };

  const handleCopyInviteLink = async () => {
    if (!roomId) return;
    const roomLink = `${window.location.origin}/room/${roomId}`;
    await navigator.clipboard.writeText(roomLink);
    toast.success("Link copied.");
  };

  const handleRaiseHand = () => {
    const nextRaised = !isHandRaised;
    const sent = raiseHand();
    if (!sent) {
      toast.error("Unable to raise hand right now.");
      return;
    }
    toast.success(nextRaised ? "Hand raised." : "Hand lowered.");
  };

  const handleMuteParticipant = (peerId: string) => {
    const sent = muteParticipant(peerId);
    if (!sent) {
      toast.error("Unable to mute participant.");
      return;
    }
    toast.success("Mute request sent.");
  };

  const handleCreatePoll = (question: string, options: string[]) => {
    const sent = createPoll(question, options);
    if (!sent) {
      toast.error("Unable to create poll right now.");
      return;
    }
    toast.success("Poll created.");
  };

  const handleVotePoll = (pollId: string, option: string) => {
    const sent = votePoll(pollId, option);
    if (!sent) {
      toast.error("Unable to submit vote.");
    }
  };

  const uiConnectionState = useMemo<"connected" | "connecting" | "disconnected">(() => {
    if (!isSocketConnected) {
      return "disconnected";
    }

    if (!hasPeer) {
      return "connecting";
    }

    if (communicationMode === "video" && connectionStatus !== "connected") {
      return "connecting";
    }

    return "connected";
  }, [isSocketConnected, hasPeer, communicationMode, connectionStatus]);

  const activeScreenSharePeerId = useMemo(() => {
    const remoteSharing = remoteParticipants.find((participant) => participant.isScreenSharing);
    if (remoteSharing) return remoteSharing.peerId;
    const localSharing = participants.find((participant) => participant.isSelf && participant.isScreenSharing);
    return localSharing?.peerId || null;
  }, [participants, remoteParticipants]);

  const effectiveLayoutMode = useMemo<"grid" | "focus-remote" | "screen-share">(() => {
    if (activeScreenSharePeerId) {
      return "screen-share";
    }
    return layoutMode;
  }, [activeScreenSharePeerId, layoutMode]);

  const canFocusRemote = remoteParticipants.length > 0;

  const effectiveFocusedPeerId = useMemo(() => {
    if (!canFocusRemote) return null;
    if (focusedPeerId && remoteParticipants.some((participant) => participant.peerId === focusedPeerId)) {
      return focusedPeerId;
    }
    return remoteParticipants[0]?.peerId || null;
  }, [canFocusRemote, focusedPeerId, remoteParticipants]);

  const durationLabel = useMemo(() => formatDuration(elapsedSeconds), [elapsedSeconds]);
  const isChatMode = communicationMode === "chat";
  const effectiveChatVisible = isChatMode ? true : chatVisible;
  const displayLocalStream = useMemo(() => localStream || previewMedia.stream || null, [localStream, previewMedia.stream]);
  const hasLocalLiveVideo = useMemo(
    () => Boolean(displayLocalStream?.getVideoTracks().some((track) => track.readyState === "live" && track.enabled)),
    [displayLocalStream]
  );

  if (loading) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="glass-panel p-8 rounded-xl text-sm text-muted-foreground">Loading room...</div>
      </div>
    );
  }

  if (!room) {
    return null;
  }

  if (!verified) {
    return (
      <JoinGuestPage
        room={room}
        answer={answer}
        verifyLoading={verifyLoading}
        verifyError={verifyError}
        onAnswerChange={setAnswer}
        onJoin={handleVerify}
      />
    );
  }

  if (isHost && communicationMode === null) {
    return (
      <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center">
        <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-primary/20">
          <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-2">Session Setup</p>
          <h1 className="text-4xl font-bold leading-tight mb-3">Choose Communication Mode</h1>
          <p className="text-sm text-muted-foreground mb-6">Start with chat only or launch directly into video call.</p>
          {!isSocketConnected && (
            <p className="text-xs text-warning mb-4">Connecting to room. Wait a second before starting the session.</p>
          )}
          {isSocketConnected && !hasJoinedRoom && (
            <p className="text-xs text-warning mb-4">Joining room. Wait a second before starting the session.</p>
          )}
          <div className="space-y-3">
            <Button
              variant="hero"
              className="w-full"
              onClick={() => handleStartSessionMode("video")}
              disabled={!isSocketConnected || !hasJoinedRoom}
            >
              Video Call (Priority)
            </Button>
            <Button
              variant="glass"
              className="w-full"
              onClick={() => handleStartSessionMode("chat")}
              disabled={!isSocketConnected || !hasJoinedRoom}
            >
              Chat Only
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!isHost && !sessionActive) {
    return (
      <WaitingForHost
        message={waitingMessage || undefined}
        sessionEnded={sessionEnded}
        onReturnHome={() => navigate("/")}
      />
    );
  }

  return (
    <div className="h-[100dvh] max-h-[100dvh] pt-20 pb-2 px-2 md:px-3 relative flex flex-col overflow-hidden">
      {isChatMode ? (
        <div className="flex-1 min-h-0 pb-[68px] w-full max-w-[1540px] mx-auto overflow-hidden">
          <ChatOnlyRoomLayout
            messages={messages}
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onRequestVideoCall={handleRequestVideoCall}
            canRequestVideoCall={hasPeer && communicationMode === "chat"}
            requestPending={videoRequestPending}
            messageReactions={messageReactions}
            onReactToMessage={handleReactToMessage}
          />
        </div>
      ) : (
        <div
          className={`flex-1 min-h-0 pb-[68px] grid gap-2 lg:gap-2.5 w-full max-w-[1540px] mx-auto overflow-hidden ${
            chatVisible ? "grid-cols-1 lg:grid-cols-[minmax(0,1fr)_255px]" : "grid-cols-1"
          }`}
        >
          <section className="min-w-0 min-h-0 h-full relative">
            <VideoGrid
              participants={participants}
              localStream={displayLocalStream}
              remoteStreams={remoteStreams}
              mode={communicationMode || "chat"}
              activeSpeakerPeerId={activeSpeakerPeerId}
              connectionState={uiConnectionState}
              layoutMode={effectiveLayoutMode}
              focusedPeerId={effectiveFocusedPeerId}
              focusPrimary={focusPrimary}
              activeScreenSharePeerId={activeScreenSharePeerId}
              onSelectFocusPeer={handleSelectFocusPeer}
              onSwapFocus={handleSwapView}
            />

            {communicationMode === "video" && hasPeer && connectionStatus === "connecting" && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-warning/40 bg-warning/10 text-xs font-medium text-warning backdrop-blur-md shadow-lg">
                Reconnecting to peers...
              </div>
            )}

            {communicationMode === "video" && (!hasLocalLiveVideo || mediaError) && (
              <div className="absolute bottom-4 left-4 right-4 z-30 mt-2 flex items-center justify-between gap-3 rounded-xl border border-warning/40 bg-background/90 backdrop-blur px-4 py-3 text-sm text-warning shadow-lg">
                <div className="min-w-0">
                  <p className="font-medium truncate">{mediaError || previewMedia.error || "Camera is not active. Enable camera to start video."}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() => {
                      if (displayLocalStream?.getVideoTracks().length) {
                        toggleCamera();
                        return;
                      }
                      previewMedia.startMedia().catch(() => null);
                    }}
                  >
                    Enable Camera
                  </Button>
                  <Button
                    variant="glass"
                    size="sm"
                    onClick={() =>
                      retryLocalMedia().then((ok) => {
                        if (!ok) toast.error("Camera retry failed.");
                      })
                    }
                  >
                    Retry Camera
                  </Button>
                </div>
              </div>
            )}
          </section>

          <AnimatePresence>
            {chatVisible && !isMobile && (
              <motion.section
                className="hidden lg:flex h-full flex-col max-w-[255px]"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 18 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <ChatPanel
                  messages={messages}
                  onSendMessage={handleSendMessage}
                  onSendFile={handleSendFile}
                  onRequestVideoCall={handleRequestVideoCall}
                  onCollapse={handleToggleChat}
                  showCollapse={communicationMode === "video"}
                  canRequestVideoCall={hasPeer && communicationMode === "chat"}
                  requestPending={videoRequestPending}
                  visible={true}
                  messageReactions={messageReactions}
                  onReactToMessage={handleReactToMessage}
                />
              </motion.section>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {chatVisible && isMobile && (
              <>
                <motion.button
                  type="button"
                  className="lg:hidden fixed inset-0 z-40 bg-black/45 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setActivePanel(null)}
                  aria-label="Close side panel"
                />

                <motion.section
                  className="lg:hidden fixed top-0 right-0 z-50 h-screen w-[90vw] max-w-[340px] p-2.5 flex flex-col gap-2.5"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", stiffness: 280, damping: 30 }}
                >
                  <ChatPanel
                    messages={messages}
                    onSendMessage={handleSendMessage}
                    onSendFile={handleSendFile}
                    onRequestVideoCall={handleRequestVideoCall}
                    onCollapse={() => setActivePanel(null)}
                    canRequestVideoCall={hasPeer && communicationMode === "chat"}
                    requestPending={videoRequestPending}
                    visible={true}
                    messageReactions={messageReactions}
                    onReactToMessage={handleReactToMessage}
                  />
                </motion.section>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      <ParticipantsDrawer
        open={participantsDrawerOpen}
        onOpenChange={setParticipantsDrawerOpen}
        participants={participants}
        isHost={isHost}
        onMuteParticipant={handleMuteParticipant}
      />

      <MeetingControls
        durationLabel={durationLabel}
        currentMode={communicationMode || "chat"}
        connectionQuality={connectionQuality}
        isHost={isHost}
        isMicOn={isMicOn}
        isCameraOn={isCameraOn}
        isScreenSharing={isScreenSharing}
        isHandRaised={isHandRaised}
        layoutMode={effectiveLayoutMode}
        canFocusRemote={canFocusRemote}
        videoControlsEnabled={communicationMode === "video"}
        chatVisible={effectiveChatVisible}
        participantsVisible={participantsVisible}
        pollsVisible={toolsVisible}
        participantsCount={participants.length}
        unreadCount={unreadCount}
        showChatToggle={!isChatMode}
        onOpenModeSwitch={handleOpenModeSwitch}
        onToggleMic={toggleMic}
        onToggleCamera={toggleCamera}
        onToggleScreenShare={shareScreen}
        onToggleFocusRemote={handleToggleFocusRemote}
        onSwapView={handleSwapView}
        onToggleChat={handleToggleChat}
        onToggleParticipants={handleToggleParticipants}
        onTogglePolls={handleToggleTools}
        onCopyInviteLink={() => handleCopyInviteLink().catch(() => toast.error("Unable to copy link."))}
        onRaiseHand={handleRaiseHand}
        onSafety={handleSafety}
        onOpenSettings={handleOpenChatSettings}
        onEndCall={handleEndCall}
      />

      <ModeSwitchModal
        open={isModeSwitchOpen}
        currentMode={communicationMode || "chat"}
        onClose={() => setIsModeSwitchOpen(false)}
        onSelectMode={handleModeSwitch}
      />

      {!isChatMode && !hasPeer && (
        <div className="hidden lg:flex absolute top-24 right-8 items-center gap-2 text-xs px-3 py-2 rounded-lg border border-warning/30 bg-warning/10 text-warning">
          <AlertTriangle className="w-3.5 h-3.5" />
          Waiting for peer connection. Share your invite link.
        </div>
      )}

      <AnimatePresence>
        {incomingVideoRequestFrom && (
          <motion.div
            className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-md glass-panel-strong border border-primary/30 rounded-2xl p-6"
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
            >
              <h2 className="text-xl font-bold mb-2">Video Call Request</h2>
              <p className="text-sm text-muted-foreground mb-6">User wants to start a video call.</p>
              <div className="flex items-center gap-3">
                <Button variant="hero" className="flex-1" onClick={handleAcceptVideoRequest}>
                  Accept
                </Button>
                <Button variant="glass" className="flex-1" onClick={handleDeclineVideoRequest}>
                  Decline
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Room;
