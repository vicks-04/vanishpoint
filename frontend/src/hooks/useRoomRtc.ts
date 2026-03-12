import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useSocket } from "./useSocket";
<<<<<<< HEAD
=======
import { getAuthToken } from "@/lib/api";
import { getRoomAccessToken } from "@/lib/roomAccess";
>>>>>>> origin/main

type ChatSender = "me" | "peer" | "system";
type ParticipantRole = "host" | "guest";
type ConnectionQuality = "excellent" | "medium" | "poor";

interface PeerMediaState {
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  raisedHand: boolean;
}

interface PeerProfile {
  role: ParticipantRole;
  displayName: string;
}

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  senderId?: string;
  senderName?: string;
  messageType: "text" | "file";
  text: string;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  timestamp: number;
}

export interface RoomParticipant {
  peerId: string;
  role: ParticipantRole;
  isSelf: boolean;
  displayName: string;
  isMicOn: boolean;
  isCameraOn: boolean;
  isScreenSharing: boolean;
  raisedHand: boolean;
  muted: boolean;
  cameraOff: boolean;
}

interface UseRoomRtcOptions {
  roomId: string;
  enabled: boolean;
  mode: "video" | "chat";
  preferredLocalStream?: MediaStream | null;
  isHost?: boolean;
  displayName?: string;
<<<<<<< HEAD
=======
  hostKey?: string | null;
>>>>>>> origin/main
  onVideoCallRequested?: (fromPeerId: string) => void;
  onVideoCallAccepted?: (fromPeerId: string) => void;
  onVideoCallDeclined?: (fromPeerId: string) => void;
  onEndCallReceived?: (fromPeerId: string) => void;
  onSessionModeChange?: (mode: "video" | "chat", fromPeerId?: string) => void;
  onHostDisconnected?: () => void;
  onSessionClosed?: () => void;
  onRaiseHandReceived?: (fromPeerId: string) => void;
  onMuteRequested?: (fromPeerId?: string) => void;
  onMeetingLocked?: (locked: boolean, fromPeerId?: string) => void;
  onRecordingStateChanged?: (recording: boolean, fromPeerId?: string) => void;
  onMeetingEndedForAll?: (fromPeerId?: string) => void;
  onParticipantRemoved?: (fromPeerId?: string) => void;
  onCameraDisableRequested?: (fromPeerId?: string) => void;
  onReactionReceived?: (emoji: string, fromPeerId: string) => void;
  onPollCreated?: (poll: any, fromPeerId?: string) => void;
  onPollVoted?: (payload: { pollId: string; option: string; fromPeerId: string }) => void;
  onMessagePinned?: (messageId: string, fromPeerId?: string) => void;
  onMessageUnpinned?: (fromPeerId?: string) => void;
}

interface SignalMessage {
  type: string;
  roomId?: string;
  peerId?: string;
  peers?: string[];
  peerProfiles?: Record<
    string,
    {
      role?: ParticipantRole;
      displayName?: string;
      isMicOn?: boolean;
      isCameraOn?: boolean;
      isScreenSharing?: boolean;
      raisedHand?: boolean;
    }
  >;
  targetPeerId?: string;
  fromPeerId?: string;
  mode?: "chat" | "video";
  role?: ParticipantRole;
  displayName?: string;
  payload?: any;
  senderId?: string;
  senderName?: string;
  messageId?: string;
  message?: string;
  timestamp?: number;
  isMicOn?: boolean;
  isCameraOn?: boolean;
  isScreenSharing?: boolean;
  locked?: boolean;
  recording?: boolean;
  emoji?: string;
  poll?: any;
  pollId?: string;
  option?: string;
  raisedHand?: boolean;
  raised?: boolean;
  fileName?: string;
  fileUrl?: string;
  mimeType?: string;
  fileSize?: number;
  meetingState?: {
    locked?: boolean;
    recording?: boolean;
    pinnedMessageId?: string | null;
    activePoll?: any;
  };
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function toWsUrl() {
  const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
  const url = new URL(base);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.pathname = "/ws";
  url.search = "";
  url.hash = "";
  return url.toString();
}

function toApiBaseUrl() {
  return import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
}

async function uploadRoomAttachment(roomId: string, file: File) {
  const body = new FormData();
<<<<<<< HEAD
  body.append("roomId", roomId);
  body.append("file", file);

  const response = await fetch(`${toApiBaseUrl()}/room/attachment`, {
    method: "POST",
=======
  body.append("file", file);

  const roomAccess = getRoomAccessToken(roomId);
  const token = getAuthToken();

  const headers: Record<string, string> = {};
  if (roomAccess) headers["X-Room-Access"] = roomAccess;
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${toApiBaseUrl()}/room/attachment?roomId=${encodeURIComponent(roomId)}`, {
    method: "POST",
    headers,
>>>>>>> origin/main
    body,
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => null);
    throw new Error(payload?.error || "Unable to upload attachment.");
  }
  const payload = await response.json();
  const attachment = payload?.attachment;
  if (!attachment?.fileName || !attachment?.fileUrl || !attachment?.mimeType || !attachment?.fileSize) {
    throw new Error("Attachment upload response is invalid.");
  }
  return {
    fileName: String(attachment.fileName),
    fileUrl: String(attachment.fileUrl),
    mimeType: String(attachment.mimeType),
    fileSize: Number(attachment.fileSize),
  };
}

function appendMessage(
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>,
  sender: ChatSender,
  text: string,
  options?: {
    id?: string;
    senderId?: string;
    senderName?: string;
    timestamp?: number;
    messageType?: "text" | "file";
    fileName?: string;
    fileUrl?: string;
    mimeType?: string;
    fileSize?: number;
  }
) {
  setMessages((prev) => [
    ...prev,
    {
      id: options?.id || generateId(),
      sender,
      senderId: options?.senderId,
      senderName: options?.senderName,
      messageType: options?.messageType || "text",
      text,
      fileName: options?.fileName,
      fileUrl: options?.fileUrl,
      mimeType: options?.mimeType,
      fileSize: options?.fileSize,
      timestamp: options?.timestamp ?? Date.now(),
    },
  ]);
}

function firstPeerId(peers: Set<string>) {
  for (const peerId of peers.values()) {
    return peerId;
  }
  return null;
}

function normalizeDisplayName(name: string | undefined, fallback: string) {
  const value = String(name || "").trim();
  return value || fallback;
}

function debugRtc(event: string, payload?: unknown) {
  if (!import.meta.env.DEV) return;
  if (payload === undefined) {
    console.debug(`[VP RTC] ${event}`);
    return;
  }
  console.debug(`[VP RTC] ${event}`, payload);
}

const SPEAKING_ON_THRESHOLD = 0.04;
const SPEAKING_OFF_THRESHOLD = 0.02;
const SPEAKING_HOLD_MS = 650;
const SPEAKER_SWITCH_DELAY_MS = 180;
const SPEAKER_CLEAR_DELAY_MS = 700;

export function useRoomRtc({
  roomId,
  enabled,
  mode,
  preferredLocalStream = null,
  isHost = false,
<<<<<<< HEAD
=======
  hostKey = null,
>>>>>>> origin/main
  displayName,
  onVideoCallRequested,
  onVideoCallAccepted,
  onVideoCallDeclined,
  onEndCallReceived,
  onSessionModeChange,
  onHostDisconnected,
  onSessionClosed,
  onRaiseHandReceived,
  onMuteRequested,
  onMeetingLocked,
  onRecordingStateChanged,
  onMeetingEndedForAll,
  onParticipantRemoved,
  onCameraDisableRequested,
  onReactionReceived,
  onPollCreated,
  onPollVoted,
  onMessagePinned,
  onMessageUnpinned,
}: UseRoomRtcOptions) {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});
  const [isMicOn, setIsMicOn] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const [connectionQuality, setConnectionQuality] = useState<ConnectionQuality>("medium");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingPeerIds, setSpeakingPeerIds] = useState<string[]>([]);
  const [activeSpeakerPeerId, setActiveSpeakerPeerId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [peerIds, setPeerIds] = useState<string[]>([]);
  const [participants, setParticipants] = useState<RoomParticipant[]>([]);
  const [videoRequestPending, setVideoRequestPending] = useState(false);
  const [meetingLocked, setMeetingLocked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [pinnedMessageId, setPinnedMessageId] = useState<string | null>(null);
  const [activePoll, setActivePoll] = useState<any | null>(null);
  const [sessionActive, setSessionActive] = useState(false);
  const [communicationMode, setCommunicationMode] = useState<"video" | "chat" | null>(null);
  const [hasJoinedRoom, setHasJoinedRoom] = useState(false);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const pendingIceCandidatesRef = useRef<Map<string, RTCIceCandidateInit[]>>(new Map());
  const peerIdRef = useRef<string>(crypto.randomUUID());
  const cameraTrackRef = useRef<MediaStreamTrack | null>(null);
  const cameraWasEnabledBeforeShareRef = useRef(true);
  const screenShareStreamRef = useRef<MediaStream | null>(null);
  const usesExternalLocalStreamRef = useRef(false);
  const peersRef = useRef<Set<string>>(new Set());
  const peerProfilesRef = useRef<Map<string, PeerProfile>>(new Map());
  const peerMediaStateRef = useRef<Map<string, PeerMediaState>>(new Map());
  const pendingRequestFromRef = useRef<string | null>(null);
  const modeRef = useRef<"video" | "chat" | null>(null);
  const hasJoinedRoomRef = useRef(false);
  const pendingStartModeRef = useRef<"video" | "chat" | null>(null);
  const lastAnnouncedModeRef = useRef<"video" | "chat" | null>(null);
  const selfDisplayNameRef = useRef<string>(normalizeDisplayName(displayName, isHost ? "Host" : "Guest"));
<<<<<<< HEAD
=======
  const hostKeyRef = useRef<string | null>(hostKey || null);
>>>>>>> origin/main
  const mediaInitPromiseRef = useRef<Promise<boolean> | null>(null);
  const pendingSocketEventsRef = useRef<MessageEvent[]>([]);
  const pendingHostDisconnectedTimerRef = useRef<number | null>(null);
  const activeSpeakerUpdateTimerRef = useRef<number | null>(null);
  const inboundTextMessageKeysRef = useRef<Set<string>>(new Set());
  const inboundFileMessageKeysRef = useRef<Set<string>>(new Set());
  const socketMessageHandlerRef = useRef<(event: MessageEvent) => void>((event: MessageEvent) => {
    pendingSocketEventsRef.current.push(event);
  });

  const registerInboundKey = useCallback((store: Set<string>, key: string) => {
    if (!key) return false;
    if (store.has(key)) return true;
    store.add(key);
    if (store.size > 600) {
      const oldest = store.values().next().value as string | undefined;
      if (oldest) {
        store.delete(oldest);
      }
    }
    return false;
  }, []);

  const clearPendingHostDisconnectedTimer = useCallback(() => {
    if (pendingHostDisconnectedTimerRef.current === null) return;
    window.clearTimeout(pendingHostDisconnectedTimerRef.current);
    pendingHostDisconnectedTimerRef.current = null;
  }, []);

  const clearActiveSpeakerUpdateTimer = useCallback(() => {
    if (activeSpeakerUpdateTimerRef.current === null) return;
    window.clearTimeout(activeSpeakerUpdateTimerRef.current);
    activeSpeakerUpdateTimerRef.current = null;
  }, []);

  const syncRemoteStreamsState = useCallback(() => {
    const next: Record<string, MediaStream> = {};
    for (const [peerId, stream] of remoteStreamsRef.current.entries()) {
      next[peerId] = stream;
    }
    setRemoteStreams(next);
  }, []);

  const syncPeersState = useCallback(() => {
    setPeerIds(Array.from(peersRef.current));
  }, []);

  const syncParticipantsState = useCallback(() => {
    const selfRole: ParticipantRole = isHost ? "host" : "guest";
    const nextParticipants: RoomParticipant[] = [
      {
        peerId: peerIdRef.current,
        role: selfRole,
        isSelf: true,
        displayName: normalizeDisplayName(selfDisplayNameRef.current, selfRole === "host" ? "Host" : "Guest"),
        isMicOn,
        isCameraOn,
        isScreenSharing,
        raisedHand: isHandRaised,
        muted: !isMicOn,
        cameraOff: !isCameraOn,
      },
    ];

    for (const peerId of peersRef.current.values()) {
      const profile = peerProfilesRef.current.get(peerId);
      const media =
        peerMediaStateRef.current.get(peerId) || { isMicOn: false, isCameraOn: false, isScreenSharing: false, raisedHand: false };
      nextParticipants.push({
        peerId,
        role: profile?.role || "guest",
        isSelf: false,
        displayName: normalizeDisplayName(profile?.displayName, "Guest"),
        isMicOn: Boolean(media.isMicOn),
        isCameraOn: Boolean(media.isCameraOn),
        isScreenSharing: Boolean(media.isScreenSharing),
        raisedHand: Boolean(media.raisedHand),
        muted: !Boolean(media.isMicOn),
        cameraOff: !Boolean(media.isCameraOn),
      });
    }

    setParticipants(nextParticipants);
  }, [isCameraOn, isHandRaised, isHost, isMicOn, isScreenSharing]);

  const setRemoteStreamForPeer = useCallback(
    (peerId: string, stream: MediaStream) => {
      remoteStreamsRef.current.set(peerId, stream);
      syncRemoteStreamsState();
    },
    [syncRemoteStreamsState]
  );

  const removeRemoteStreamForPeer = useCallback(
    (peerId: string) => {
      remoteStreamsRef.current.delete(peerId);
      syncRemoteStreamsState();
    },
    [syncRemoteStreamsState]
  );

  const clearRemoteStreams = useCallback(() => {
    remoteStreamsRef.current.clear();
    syncRemoteStreamsState();
  }, [syncRemoteStreamsState]);

  const updateConnectionStatus = useCallback(() => {
    if (!modeRef.current) {
      setConnectionStatus("connecting");
      return;
    }

    if (peersRef.current.size === 0) {
      setConnectionStatus("connecting");
      return;
    }

    if (modeRef.current !== "video") {
      setConnectionStatus("connected");
      return;
    }

    for (const pc of peerConnectionsRef.current.values()) {
      if (pc.connectionState === "connected") {
        setConnectionStatus("connected");
        return;
      }
    }

    setConnectionStatus("connecting");
  }, []);

  const addPeer = useCallback(
    (
      peerId: string,
      profile?: {
        role?: ParticipantRole;
        displayName?: string;
        isMicOn?: boolean;
        isCameraOn?: boolean;
        isScreenSharing?: boolean;
        raisedHand?: boolean;
      }
    ) => {
      peersRef.current.add(peerId);

      peerProfilesRef.current.set(peerId, {
        role: profile?.role || "guest",
        displayName: normalizeDisplayName(profile?.displayName, "Guest"),
      });

      peerMediaStateRef.current.set(peerId, {
        isMicOn: Boolean(profile?.isMicOn),
        isCameraOn: Boolean(profile?.isCameraOn),
        isScreenSharing: Boolean(profile?.isScreenSharing),
        raisedHand: Boolean(profile?.raisedHand),
      });

      syncPeersState();
      syncParticipantsState();
      updateConnectionStatus();
    },
    [syncPeersState, syncParticipantsState, updateConnectionStatus]
  );

  const removePeer = useCallback(
    (peerId: string) => {
      peersRef.current.delete(peerId);
      peerProfilesRef.current.delete(peerId);
      peerMediaStateRef.current.delete(peerId);
      removeRemoteStreamForPeer(peerId);

      syncPeersState();
      syncParticipantsState();
      updateConnectionStatus();
    },
    [removeRemoteStreamForPeer, syncPeersState, syncParticipantsState, updateConnectionStatus]
  );

  const clearPeers = useCallback(() => {
    peersRef.current.clear();
    peerProfilesRef.current.clear();
    peerMediaStateRef.current.clear();
    syncPeersState();
    syncParticipantsState();
  }, [syncPeersState, syncParticipantsState]);

  const cleanupPeerConnection = useCallback(
    (peerId: string) => {
      const pc = peerConnectionsRef.current.get(peerId);
      if (!pc) return;

      pc.getSenders().forEach((sender) => sender.replaceTrack(null).catch(() => null));
      pc.close();
      peerConnectionsRef.current.delete(peerId);
      pendingIceCandidatesRef.current.delete(peerId);
      removeRemoteStreamForPeer(peerId);
      updateConnectionStatus();
    },
    [removeRemoteStreamForPeer, updateConnectionStatus]
  );

  const cleanupAllPeerConnections = useCallback(() => {
    for (const pc of peerConnectionsRef.current.values()) {
      pc.getSenders().forEach((sender) => sender.replaceTrack(null).catch(() => null));
      pc.close();
    }
    peerConnectionsRef.current.clear();
    pendingIceCandidatesRef.current.clear();
    clearRemoteStreams();
    updateConnectionStatus();
  }, [clearRemoteStreams, updateConnectionStatus]);

  const stopLocalMedia = useCallback(() => {
    if (!usesExternalLocalStreamRef.current) {
      localStreamRef.current?.getTracks().forEach((track) => track.stop());
    }
    screenShareStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenShareStreamRef.current = null;
    localStreamRef.current = null;
    cameraTrackRef.current = null;
    usesExternalLocalStreamRef.current = false;
    setLocalStream(null);
    setIsMicOn(false);
    setIsCameraOn(false);
    setIsScreenSharing(false);
    setIsHandRaised(false);
    setIsSpeaking(false);
    setMediaError(null);
  }, []);

  useEffect(() => {
    if (mode === "chat" || mode === "video") {
      modeRef.current = mode;
      if (isHost || sessionActive) {
        setCommunicationMode(mode);
      }
    }
  }, [isHost, mode, sessionActive]);

  useEffect(() => {
    selfDisplayNameRef.current = normalizeDisplayName(displayName, isHost ? "Host" : "Guest");
<<<<<<< HEAD
    syncParticipantsState();
  }, [displayName, isHost, syncParticipantsState]);
=======
    hostKeyRef.current = hostKey || null;
    syncParticipantsState();
  }, [displayName, hostKey, isHost, syncParticipantsState]);
>>>>>>> origin/main

  const { sendJson: sendSignal, readyState } = useSocket({
    enabled: enabled && Boolean(roomId),
    url: toWsUrl(),
    onOpen: (socket) => {
      clearPendingHostDisconnectedTimer();
      hasJoinedRoomRef.current = false;
      setHasJoinedRoom(false);
      debugRtc("socket-open", { roomId, peerId: peerIdRef.current, role: isHost ? "host" : "guest" });
      socket.send(
        JSON.stringify({
          type: "join-room",
          roomId,
          peerId: peerIdRef.current,
          role: isHost ? "host" : "guest",
          phase: "active",
<<<<<<< HEAD
=======
          authToken: getAuthToken() || undefined,
          roomAccessToken: getRoomAccessToken(roomId) || undefined,
          hostKey: hostKeyRef.current || undefined,
>>>>>>> origin/main
          displayName: selfDisplayNameRef.current,
          isMicOn,
          isCameraOn,
          isScreenSharing,
          raisedHand: isHandRaised,
        })
      );
      setConnectionStatus("connecting");
    },
    onClose: () => {
      debugRtc("socket-close", { roomId, peerId: peerIdRef.current, role: isHost ? "host" : "guest" });
      clearPendingHostDisconnectedTimer();
      clearActiveSpeakerUpdateTimer();
      setConnectionStatus("idle");
      setConnectionQuality("medium");
      clearPeers();
      cleanupAllPeerConnections();
      stopLocalMedia();
      setVideoRequestPending(false);
      setSpeakingPeerIds([]);
      setMeetingLocked(false);
      setIsRecording(false);
      setPinnedMessageId(null);
      setActivePoll(null);
      setHasJoinedRoom(false);
      hasJoinedRoomRef.current = false;
      pendingRequestFromRef.current = null;
      setActiveSpeakerPeerId(null);
      inboundTextMessageKeysRef.current.clear();
      inboundFileMessageKeysRef.current.clear();
    },
    onMessage: (event) => {
      socketMessageHandlerRef.current(event);
    },
  });

  const broadcastLocalParticipantState = useCallback(
    (overrides?: {
      isMicOn?: boolean;
      isCameraOn?: boolean;
      isScreenSharing?: boolean;
      raisedHand?: boolean;
    }) => {
      const payload = {
        roomId,
        isMicOn: overrides?.isMicOn ?? isMicOn,
        isCameraOn: overrides?.isCameraOn ?? isCameraOn,
        isScreenSharing: overrides?.isScreenSharing ?? isScreenSharing,
        raisedHand: overrides?.raisedHand ?? isHandRaised,
      };

      sendSignal({
        type: "media_state_update",
        ...payload,
      });
      sendSignal({
        type: "participant-state-update",
        ...payload,
      });
    },
    [isCameraOn, isHandRaised, isMicOn, isScreenSharing, roomId, sendSignal]
  );

  const attachLocalTracks = useCallback((pc: RTCPeerConnection) => {
    const stream = localStreamRef.current;
    if (!stream) return;

    for (const track of stream.getTracks()) {
      const sender = pc.getSenders().find((item) => item.track?.kind === track.kind);
      if (sender) {
        sender.replaceTrack(track).catch(() => null);
      } else {
        pc.addTrack(track, stream);
      }
    }
  }, []);

  const adoptLocalStream = useCallback(
    (mediaStream: MediaStream, options?: { external?: boolean }) => {
      localStreamRef.current = mediaStream;
      usesExternalLocalStreamRef.current = Boolean(options?.external);
      cameraTrackRef.current = mediaStream.getVideoTracks()[0] || null;
      setLocalStream(mediaStream);

      const audioTrack = mediaStream.getAudioTracks()[0];
      const videoTrack = mediaStream.getVideoTracks()[0];
      setIsMicOn(Boolean(audioTrack && audioTrack.readyState === "live" && audioTrack.enabled));
      setIsCameraOn(Boolean(videoTrack && videoTrack.readyState === "live" && videoTrack.enabled));
      setMediaError(null);

      for (const pc of peerConnectionsRef.current.values()) {
        attachLocalTracks(pc);
      }
    },
    [attachLocalTracks]
  );

  const ensureNegotiationTransceivers = useCallback((pc: RTCPeerConnection) => {
    const transceivers = pc.getTransceivers();
    const hasAudio = transceivers.some(
      (transceiver) =>
        transceiver.sender.track?.kind === "audio" || transceiver.receiver.track?.kind === "audio"
    );
    const hasVideo = transceivers.some(
      (transceiver) =>
        transceiver.sender.track?.kind === "video" || transceiver.receiver.track?.kind === "video"
    );

    if (!hasAudio) {
      pc.addTransceiver("audio", { direction: "recvonly" });
    }
    if (!hasVideo) {
      pc.addTransceiver("video", { direction: "recvonly" });
    }
  }, []);

  const queueIceCandidate = useCallback((peerId: string, candidate: RTCIceCandidateInit) => {
    const queued = pendingIceCandidatesRef.current.get(peerId) || [];
    queued.push(candidate);
    pendingIceCandidatesRef.current.set(peerId, queued);
  }, []);

  const flushPendingIceCandidates = useCallback(async (peerId: string, pc: RTCPeerConnection) => {
    const queued = pendingIceCandidatesRef.current.get(peerId);
    if (!queued || queued.length === 0) return;

    for (const candidate of queued) {
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch {
        // Ignore invalid/stale candidates.
      }
    }
    pendingIceCandidatesRef.current.delete(peerId);
  }, []);

  const ensureLocalMedia = useCallback(async () => {
    if (mediaInitPromiseRef.current) {
      return mediaInitPromiseRef.current;
    }

    const initPromise = (async () => {
    try {
      const videoModeActive = modeRef.current === "video" || mode === "video";
      if (!videoModeActive) return false;
      if (!navigator.mediaDevices?.getUserMedia) {
        setMediaError("Camera API unavailable in this browser context.");
        return false;
      }

      const preferredVideoTrack = preferredLocalStream?.getVideoTracks()[0];
      const preferredAudioTrack = preferredLocalStream?.getAudioTracks()[0];
      const hasPreferredVideo = Boolean(
        preferredVideoTrack && preferredVideoTrack.readyState === "live"
      );
      const hasPreferredAudio = Boolean(
        preferredAudioTrack && preferredAudioTrack.readyState === "live"
      );

      if (preferredLocalStream && (hasPreferredVideo || hasPreferredAudio)) {
        adoptLocalStream(preferredLocalStream, { external: true });
        return true;
      }

      const existingStream = localStreamRef.current;
      if (existingStream) {
        const currentAudioTrack = existingStream.getAudioTracks()[0];
        const currentVideoTrack = existingStream.getVideoTracks()[0];
        const hasLiveAudioTrack = Boolean(currentAudioTrack && currentAudioTrack.readyState === "live");
        const hasLiveVideoTrack = Boolean(currentVideoTrack && currentVideoTrack.readyState === "live");
        setIsMicOn(Boolean(hasLiveAudioTrack && currentAudioTrack?.enabled));
        setIsCameraOn(Boolean(hasLiveVideoTrack && currentVideoTrack?.enabled));

        // Keep trying when we only have audio. This allows recovery from camera race/permission glitches.
        if (hasLiveVideoTrack) {
          return true;
        }

        if (currentVideoTrack && currentVideoTrack.readyState !== "live") {
          existingStream.removeTrack(currentVideoTrack);
          try {
            currentVideoTrack.stop();
          } catch {
            // Ignore stale track stop failures.
          }
          setLocalStream(existingStream);
        }
      }

      let mediaStream: MediaStream | null = null;
      let lastMediaError: unknown = null;
      const tryGetMedia = async (constraints: MediaStreamConstraints) => {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        return stream;
      };

      // Primary path requested by spec.
      try {
        mediaStream = await tryGetMedia({ video: true, audio: true });
      } catch (error) {
        lastMediaError = error;
      }

      // Fallback to video-only if audio blocks startup.
      if (!mediaStream) {
        try {
          mediaStream = await tryGetMedia({ video: true, audio: false });
        } catch (error) {
          lastMediaError = error;
        }
      }

      // Final fallback audio-only (join in degraded mode).
      if (!mediaStream) {
        try {
          mediaStream = await tryGetMedia({ video: false, audio: true });
        } catch (error) {
          lastMediaError = error;
        }
      }

      // Device-level fallback for drivers that fail on default camera.
      if (!mediaStream) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((device) => device.kind === "videoinput");
          for (const videoInput of videoInputs) {
            try {
              mediaStream = await tryGetMedia({
                video: { deviceId: { exact: videoInput.deviceId } },
                audio: true,
              });
              if (mediaStream) break;
            } catch (error) {
              lastMediaError = error;
            }

            try {
              mediaStream = await tryGetMedia({
                video: { deviceId: { exact: videoInput.deviceId } },
                audio: false,
              });
              if (mediaStream) break;
            } catch (error) {
              lastMediaError = error;
            }
          }
        } catch {
          // Ignore enumerate failure; reason is derived from last media error.
        }
      }

      if (!mediaStream) {
        const reason = (() => {
          if (typeof DOMException !== "undefined" && lastMediaError instanceof DOMException) {
            if (lastMediaError.name === "NotAllowedError") {
              return "Camera or microphone permission denied.";
            }
            if (lastMediaError.name === "NotFoundError") {
              return "No camera or microphone device detected.";
            }
            if (lastMediaError.name === "NotReadableError") {
              return "Camera or microphone is busy in another app.";
            }
          }

          if (lastMediaError instanceof Error && /timed out/i.test(lastMediaError.message)) {
            return "Camera permission request timed out.";
          }

          return "Unable to access camera or microphone. Please allow permissions.";
        })();

        setMediaError(reason);
        appendMessage(setMessages, "system", reason);
        return false;
      }

      if (modeRef.current !== "video") {
        mediaStream.getTracks().forEach((track) => track.stop());
        return false;
      }

      adoptLocalStream(mediaStream, { external: false });

      const hasVideo = mediaStream.getVideoTracks().length > 0;
      const hasAudio = mediaStream.getAudioTracks().length > 0;
      if (hasVideo && !hasAudio) {
        setMediaError("Microphone unavailable. Video started without audio.");
      } else if (!hasVideo && hasAudio) {
        setMediaError("Camera unavailable. Joined with audio only.");
      }

      return true;
    } catch {
      setMediaError("Unexpected camera initialization error.");
      appendMessage(setMessages, "system", "Unexpected camera initialization error.");
      return false;
    }
    })();

    mediaInitPromiseRef.current = initPromise;
    try {
      return await initPromise;
    } finally {
      if (mediaInitPromiseRef.current === initPromise) {
        mediaInitPromiseRef.current = null;
      }
    }
  }, [adoptLocalStream, mode, preferredLocalStream]);

  useEffect(() => {
    const preferredVideoTrack = preferredLocalStream?.getVideoTracks()[0];
    const preferredAudioTrack = preferredLocalStream?.getAudioTracks()[0];
    const hasPreferredTrack = Boolean(
      (preferredVideoTrack && preferredVideoTrack.readyState === "live") ||
      (preferredAudioTrack && preferredAudioTrack.readyState === "live")
    );

    if (!enabled || mode !== "video" || !preferredLocalStream || !hasPreferredTrack) {
      return;
    }

    adoptLocalStream(preferredLocalStream, { external: true });
  }, [adoptLocalStream, enabled, mode, preferredLocalStream]);

  const createPeerConnection = useCallback(
    (targetPeerId: string) => {
      const existing = peerConnectionsRef.current.get(targetPeerId);
      if (existing) {
        attachLocalTracks(existing);
        return existing;
      }

      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      peerConnectionsRef.current.set(targetPeerId, pc);
      attachLocalTracks(pc);
      updateConnectionStatus();

      pc.ontrack = (event) => {
        const [stream] = event.streams;
        if (stream) {
          if (!peersRef.current.has(targetPeerId)) {
            addPeer(targetPeerId);
          }
          setRemoteStreamForPeer(targetPeerId, stream);
          syncParticipantsState();
        }
      };

      pc.onicecandidate = (event) => {
        if (!event.candidate) return;
        sendSignal({
          type: "webrtc-ice-candidate",
          targetPeerId,
          payload: event.candidate,
        });
      };

      pc.onconnectionstatechange = () => {
        if (
          pc.connectionState === "disconnected" ||
          pc.connectionState === "failed" ||
          pc.connectionState === "closed"
        ) {
          removeRemoteStreamForPeer(targetPeerId);
        }
        updateConnectionStatus();
      };

      return pc;
    },
    [addPeer, attachLocalTracks, ensureNegotiationTransceivers, removeRemoteStreamForPeer, sendSignal, setRemoteStreamForPeer, syncParticipantsState, updateConnectionStatus]
  );

  const shouldCreateOffer = useCallback((targetPeerId: string) => peerIdRef.current > targetPeerId, []);

  const createAndSendOffer = useCallback(
    async (targetPeerId: string, force: boolean = false) => {
      if (modeRef.current !== "video" && mode !== "video") return;
      if (!force && !shouldCreateOffer(targetPeerId)) return;

      // Best effort media start. Offer/answer must continue even if local media is unavailable.
      await ensureLocalMedia();

      const pc = createPeerConnection(targetPeerId);
      ensureNegotiationTransceivers(pc);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      sendSignal({
        type: "webrtc-offer",
        targetPeerId,
        payload: offer,
      });
    },
    [createPeerConnection, ensureLocalMedia, ensureNegotiationTransceivers, mode, sendSignal, shouldCreateOffer]
  );

  const applyPeerSnapshot = useCallback(
    async (
      nextPeers: string[],
      nextProfiles?: Record<
        string,
        {
          role?: ParticipantRole;
          displayName?: string;
          isMicOn?: boolean;
          isCameraOn?: boolean;
          isScreenSharing?: boolean;
          raisedHand?: boolean;
        }
      >
    ) => {
      const previousPeers = new Set(peersRef.current);
      const normalizedPeers = nextPeers.filter((peerId) => peerId && peerId !== peerIdRef.current);
      const nextSet = new Set(normalizedPeers);

      for (const existingPeerId of peerConnectionsRef.current.keys()) {
        if (!nextSet.has(existingPeerId)) {
          cleanupPeerConnection(existingPeerId);
        }
      }

      peersRef.current = new Set(normalizedPeers);
      peerProfilesRef.current.clear();
      peerMediaStateRef.current.clear();

      for (const peerId of normalizedPeers) {
        const profile = nextProfiles?.[peerId];
        peerProfilesRef.current.set(peerId, {
          role: profile?.role || "guest",
          displayName: normalizeDisplayName(profile?.displayName, "Guest"),
        });
        peerMediaStateRef.current.set(peerId, {
          isMicOn: Boolean(profile?.isMicOn),
          isCameraOn: Boolean(profile?.isCameraOn),
          isScreenSharing: Boolean(profile?.isScreenSharing),
          raisedHand: Boolean(profile?.raisedHand),
        });
      }

      syncPeersState();
      syncParticipantsState();
      updateConnectionStatus();

      if (modeRef.current === "video" || mode === "video") {
        for (const peerId of normalizedPeers) {
          const hasPeerConnection = peerConnectionsRef.current.has(peerId);
          if (!hasPeerConnection || !previousPeers.has(peerId)) {
            await createAndSendOffer(peerId);
          }
        }
      }
    },
    [cleanupPeerConnection, createAndSendOffer, mode, syncParticipantsState, syncPeersState, updateConnectionStatus]
  );

  const replaceVideoTrack = useCallback(async (newTrack: MediaStreamTrack, options?: { stopOld?: boolean }) => {
    const stopOld = options?.stopOld ?? true;
    const stream = localStreamRef.current;
    if (!stream) return;

    const oldVideoTracks = stream.getVideoTracks();
    oldVideoTracks.forEach((track) => {
      stream.removeTrack(track);
      if (stopOld && track.id !== newTrack.id) {
        track.stop();
      }
    });

    stream.addTrack(newTrack);
    setLocalStream(stream);

    for (const pc of peerConnectionsRef.current.values()) {
      const sender = pc.getSenders().find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(newTrack);
      } else {
        pc.addTrack(newTrack, stream);
      }
    }

    setIsCameraOn(newTrack.enabled);
  }, []);

  const restoreCameraAfterScreenShare = useCallback(async () => {
    let cameraTrack = cameraTrackRef.current;

    if (!cameraTrack || cameraTrack.readyState !== "live") {
      try {
        const cameraStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        cameraTrack = cameraStream.getVideoTracks()[0] || null;
      } catch {
        cameraTrack = null;
      }
    }

    if (!cameraTrack) {
      const stream = localStreamRef.current;
      if (stream) {
        for (const track of stream.getVideoTracks()) {
          if (track.readyState !== "live") {
            stream.removeTrack(track);
          }
        }
        setLocalStream(stream);
      }
      setIsCameraOn(false);
      setMediaError("Unable to restore camera after screen share. Turn camera on.");
      return false;
    }

    const restoreEnabled = cameraWasEnabledBeforeShareRef.current;
    cameraTrack.enabled = restoreEnabled;
    cameraTrackRef.current = cameraTrack;
    await replaceVideoTrack(cameraTrack, { stopOld: true });
    setIsCameraOn(restoreEnabled);
    setMediaError(null);
    return restoreEnabled;
  }, [replaceVideoTrack]);

  const toggleScreenShare = useCallback(async () => {
    if (modeRef.current !== "video" && mode !== "video") return;

    let stream = localStreamRef.current;
    if (!stream) {
      await ensureLocalMedia();
      stream = localStreamRef.current;
    }
    if (!stream) {
      stream = new MediaStream();
      localStreamRef.current = stream;
      setLocalStream(stream);
    }

    if (!isScreenSharing) {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      if (!screenTrack) {
        screenStream.getTracks().forEach((track) => track.stop());
        return;
      }

      const cameraTrack = stream.getVideoTracks()[0] || null;
      if (cameraTrack) {
        cameraTrackRef.current = cameraTrack;
        cameraWasEnabledBeforeShareRef.current = cameraTrack.enabled;
      } else {
        cameraWasEnabledBeforeShareRef.current = isCameraOn;
      }

      screenTrack.onended = () => {
        void (async () => {
          const restoredCameraOn = await restoreCameraAfterScreenShare();
          screenTrack.onended = null;
          screenShareStreamRef.current?.getTracks().forEach((track) => track.stop());
          screenShareStreamRef.current = null;
          setIsScreenSharing(false);
          broadcastLocalParticipantState({ isScreenSharing: false, isCameraOn: restoredCameraOn });
        })();
      };

      screenShareStreamRef.current = screenStream;
      await replaceVideoTrack(screenTrack, { stopOld: false });
      setIsScreenSharing(true);
      setIsCameraOn(true);
      setMediaError(null);
      broadcastLocalParticipantState({ isScreenSharing: true });
      return;
    }

    const activeScreenTrack = screenShareStreamRef.current?.getVideoTracks()[0] || null;
    if (activeScreenTrack) {
      activeScreenTrack.onended = null;
    }
    const restoredCameraOn = await restoreCameraAfterScreenShare();
    screenShareStreamRef.current?.getTracks().forEach((track) => track.stop());
    screenShareStreamRef.current = null;
    setIsScreenSharing(false);
    broadcastLocalParticipantState({ isScreenSharing: false, isCameraOn: restoredCameraOn });
  }, [broadcastLocalParticipantState, ensureLocalMedia, isCameraOn, isScreenSharing, mode, replaceVideoTrack, restoreCameraAfterScreenShare]);

  const toggleMic = useCallback(async () => {
    const videoModeActive = modeRef.current === "video" || mode === "video";

    let track = localStreamRef.current?.getAudioTracks()[0] || null;
    let initializedOnDemand = false;
    if (!track && videoModeActive) {
      const mediaReady = await ensureLocalMedia();
      if (!mediaReady) {
        setMediaError("Microphone access is required to enable audio.");
        appendMessage(setMessages, "system", "Microphone access is required to enable audio.");
        return;
      }
      track = localStreamRef.current?.getAudioTracks()[0] || null;
      if (!track) {
        try {
          const audioStream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          const audioTrack = audioStream.getAudioTracks()[0];
          if (!audioTrack) {
            appendMessage(setMessages, "system", "Microphone access is required to enable audio.");
            setMediaError("Microphone access is required to enable audio.");
            return;
          }

          const stream = localStreamRef.current ?? new MediaStream();
          stream.addTrack(audioTrack);
          localStreamRef.current = stream;
          usesExternalLocalStreamRef.current = false;
          setLocalStream(stream);

          for (const pc of peerConnectionsRef.current.values()) {
            const sender = pc.getSenders().find((s) => s.track?.kind === "audio");
            if (sender) {
              await sender.replaceTrack(audioTrack);
            } else {
              pc.addTrack(audioTrack, stream);
            }
          }

          track = audioTrack;
          initializedOnDemand = true;
          setIsMicOn(Boolean(audioTrack.enabled));
        } catch {
          appendMessage(setMessages, "system", "Microphone access is required to enable audio.");
          setMediaError("Microphone access is required to enable audio.");
          return;
        }
      }
      for (const peerId of peersRef.current.values()) {
        createAndSendOffer(peerId).catch(() => null);
      }
    }

    const localAudioTracks = localStreamRef.current?.getAudioTracks() || [];
    const preferredAudioTracks = preferredLocalStream?.getAudioTracks() || [];
    const allAudioTracks = [...localAudioTracks, ...preferredAudioTracks];

    if (!track && allAudioTracks.length === 0) return;
    if (initializedOnDemand) {
      allAudioTracks.forEach((audioTrack) => {
        audioTrack.enabled = true;
      });
      setIsMicOn(true);
      broadcastLocalParticipantState({ isMicOn: true });
      return;
    }

    const nextMicEnabled = !(allAudioTracks.length > 0
      ? allAudioTracks.some((audioTrack) => audioTrack.enabled)
      : track?.enabled);

    if (allAudioTracks.length > 0) {
      allAudioTracks.forEach((audioTrack) => {
        audioTrack.enabled = nextMicEnabled;
      });
    } else if (track) {
      track.enabled = nextMicEnabled;
    }

    setIsMicOn(nextMicEnabled);
    broadcastLocalParticipantState({ isMicOn: nextMicEnabled });
  }, [broadcastLocalParticipantState, createAndSendOffer, ensureLocalMedia, mode, preferredLocalStream]);

  const toggleCamera = useCallback(async () => {
    const videoModeActive = modeRef.current === "video" || mode === "video";

    let track = localStreamRef.current?.getVideoTracks()[0] || null;
    let initializedOnDemand = false;
    if (!track && videoModeActive) {
      const mediaReady = await ensureLocalMedia();
      if (!mediaReady) {
        setMediaError("Camera access is required to enable video.");
        appendMessage(setMessages, "system", "Camera access is required to enable video.");
        return;
      }
      track = localStreamRef.current?.getVideoTracks()[0] || null;
      if (!track) {
        try {
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
          const videoTrack = videoStream.getVideoTracks()[0];
          if (!videoTrack) {
            appendMessage(setMessages, "system", "Camera access is required to enable video.");
            setMediaError("Camera access is required to enable video.");
            return;
          }

          const stream = localStreamRef.current ?? new MediaStream();
          stream.addTrack(videoTrack);
          localStreamRef.current = stream;
          usesExternalLocalStreamRef.current = false;
          cameraTrackRef.current = videoTrack;
          setLocalStream(stream);

          for (const pc of peerConnectionsRef.current.values()) {
            const sender = pc.getSenders().find((s) => s.track?.kind === "video");
            if (sender) {
              await sender.replaceTrack(videoTrack);
            } else {
              pc.addTrack(videoTrack, stream);
            }
          }

          track = videoTrack;
          initializedOnDemand = true;
          setIsCameraOn(Boolean(videoTrack.enabled));
        } catch {
          appendMessage(setMessages, "system", "Camera access is required to enable video.");
          setMediaError("Camera access is required to enable video.");
          return;
        }
      }
      for (const peerId of peersRef.current.values()) {
        createAndSendOffer(peerId).catch(() => null);
      }
    }

    const localVideoTracks = localStreamRef.current?.getVideoTracks() || [];
    const preferredVideoTracks = preferredLocalStream?.getVideoTracks() || [];
    const allVideoTracks = [...localVideoTracks, ...preferredVideoTracks];

    if (!track && allVideoTracks.length === 0) return;
    if (initializedOnDemand) {
      allVideoTracks.forEach((videoTrack) => {
        videoTrack.enabled = true;
      });
      setIsCameraOn(true);
      broadcastLocalParticipantState({ isCameraOn: true });
      return;
    }

    const nextCameraEnabled = !(allVideoTracks.length > 0
      ? allVideoTracks.some((videoTrack) => videoTrack.enabled)
      : track?.enabled);

    if (allVideoTracks.length > 0) {
      allVideoTracks.forEach((videoTrack) => {
        videoTrack.enabled = nextCameraEnabled;
      });
    } else if (track) {
      track.enabled = nextCameraEnabled;
    }

    setIsCameraOn(nextCameraEnabled);
    broadcastLocalParticipantState({ isCameraOn: nextCameraEnabled });
  }, [broadcastLocalParticipantState, createAndSendOffer, ensureLocalMedia, mode, preferredLocalStream]);

  const sendMessage = useCallback(
    (text: string) => {
      const value = text.trim();
      if (!value) return false;
      const messageId = generateId();

      appendMessage(setMessages, "me", value, {
        id: messageId,
        senderId: peerIdRef.current,
        senderName: selfDisplayNameRef.current,
      });

      return sendSignal({
        type: "send_message",
        roomId,
        senderId: peerIdRef.current,
        senderName: selfDisplayNameRef.current,
        messageId,
        message: value,
        timestamp: Date.now(),
      });
    },
    [roomId, sendSignal]
  );

  const sendFileMessage = useCallback(
    async (file: File) => {
      if (!file) return false;
      const uploaded = await uploadRoomAttachment(roomId, file);
      const messageId = generateId();

      appendMessage(setMessages, "me", uploaded.fileName, {
        id: messageId,
        senderId: peerIdRef.current,
        senderName: selfDisplayNameRef.current,
        messageType: "file",
        fileName: uploaded.fileName,
        fileUrl: uploaded.fileUrl,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
      });

      return sendSignal({
        type: "send_file_message",
        roomId,
        senderId: peerIdRef.current,
        senderName: selfDisplayNameRef.current,
        messageId,
        fileName: uploaded.fileName,
        fileUrl: uploaded.fileUrl,
        mimeType: uploaded.mimeType,
        fileSize: uploaded.fileSize,
        timestamp: Date.now(),
      });
    },
    [roomId, sendSignal]
  );

  const requestVideoCall = useCallback(() => {
    const targetPeerId = firstPeerId(peersRef.current);
    if (!targetPeerId) {
      appendMessage(setMessages, "system", "No peer available for video request.");
      return false;
    }

    const sent = sendSignal({
      type: "video_call_request",
      roomId,
      targetPeerId,
    });

    if (sent) {
      setVideoRequestPending(true);
      appendMessage(setMessages, "system", "Video call request sent.");
    }

    return sent;
  }, [roomId, sendSignal]);

  const respondToVideoCall = useCallback(
    (accept: boolean, targetPeerId?: string) => {
      const peerId = targetPeerId || pendingRequestFromRef.current;
      if (!peerId) return false;

      const sent = sendSignal({
        type: accept ? "video_call_accepted" : "video_call_declined",
        roomId,
        targetPeerId: peerId,
      });

      if (sent) {
        pendingRequestFromRef.current = null;
      }

      return sent;
    },
    [roomId, sendSignal]
  );

  const endVideoCall = useCallback(() => {
    sendSignal({
      type: "end_call",
      roomId,
    });
    cleanupAllPeerConnections();
    stopLocalMedia();
  }, [cleanupAllPeerConnections, roomId, sendSignal, stopLocalMedia]);

  const toggleMute = useCallback(() => {
    toggleMic().catch(() => null);
  }, [toggleMic]);

  const shareScreen = useCallback(async () => {
    await toggleScreenShare();
  }, [toggleScreenShare]);

  const leaveMeeting = useCallback(() => {
    clearPendingHostDisconnectedTimer();
    clearActiveSpeakerUpdateTimer();
    sendSignal({
      type: "leave-room",
      roomId,
    });
    sendSignal({
      type: "end_call",
      roomId,
    });
    cleanupAllPeerConnections();
    stopLocalMedia();
    clearPeers();
    setSessionActive(false);
    setCommunicationMode(null);
    setHasJoinedRoom(false);
    hasJoinedRoomRef.current = false;
    pendingStartModeRef.current = null;
    lastAnnouncedModeRef.current = null;
    modeRef.current = null;
    setIsHandRaised(false);
    setIsSpeaking(false);
    setSpeakingPeerIds([]);
    setActiveSpeakerPeerId(null);
    return true;
  }, [cleanupAllPeerConnections, clearPeers, clearActiveSpeakerUpdateTimer, clearPendingHostDisconnectedTimer, roomId, sendSignal, stopLocalMedia]);

  const sendSessionStart = useCallback(
    (nextMode: "chat" | "video") => {
      const sentMode = sendSignal({
        type: "session_mode_change",
        roomId,
        mode: nextMode,
      });
      const sentStart = sendSignal({
        type: "start-session",
        roomId,
        mode: nextMode,
      });
      if (sentMode || sentStart) {
        setSessionActive(true);
        setCommunicationMode(nextMode);
        modeRef.current = nextMode;
        lastAnnouncedModeRef.current = nextMode;
      }
      return sentMode || sentStart;
    },
    [roomId, sendSignal]
  );

  const applySessionMode = useCallback(
    (nextMode: "chat" | "video", options?: { fromPeerId?: string; announceForGuests?: boolean }) => {
      const previousMode = modeRef.current;
      const modeChanged = previousMode !== nextMode;

      clearPendingHostDisconnectedTimer();
      setSessionActive(true);
      modeRef.current = nextMode;
      setCommunicationMode((current) => (current === nextMode ? current : nextMode));

      if (modeChanged) {
        onSessionModeChange?.(nextMode, options?.fromPeerId);
      }

      if (!isHost && options?.announceForGuests && modeChanged && lastAnnouncedModeRef.current !== nextMode) {
        appendMessage(
          setMessages,
          "system",
          nextMode === "chat" ? "Host switched the session to chat mode." : "Host switched the session to video mode."
        );
      }

      if (modeChanged) {
        lastAnnouncedModeRef.current = nextMode;
      }
    },
    [clearPendingHostDisconnectedTimer, isHost, onSessionModeChange]
  );

  const handleSocketMessage = useCallback(
    async (event: MessageEvent) => {
      let message: SignalMessage;
      try {
        message = JSON.parse(String(event.data));
      } catch {
        return;
      }
      debugRtc("ws-message", {
        type: message.type,
        roomId: message.roomId,
        peerId: message.peerId,
        fromPeerId: message.fromPeerId,
        mode: message.mode,
        peers: Array.isArray(message.peers) ? message.peers.length : undefined,
      });

      if (message.type === "meeting_locked") {
        setMeetingLocked(true);
        onMeetingLocked?.(true, message.fromPeerId);
        appendMessage(setMessages, "system", "Meeting is locked by host.");
        return;
      }

      if (message.type === "host_disconnected") {
        if (isHost) {
          // Host clients should never downgrade themselves on host_disconnected.
          return;
        }
        clearPendingHostDisconnectedTimer();
        pendingHostDisconnectedTimerRef.current = window.setTimeout(() => {
          if (isHost) {
            return;
          }
          const hasActiveHost = Array.from(peerProfilesRef.current.values()).some((profile) => profile.role === "host");
          if (hasActiveHost) {
            return;
          }
          setSessionActive(false);
          setCommunicationMode(null);
          modeRef.current = null;
          lastAnnouncedModeRef.current = null;
          onHostDisconnected?.();
          appendMessage(setMessages, "system", "Host disconnected.");
        }, 1800);
        return;
      }

      if (message.type === "session_closed") {
        if (isHost) {
          // Ignore stale/duplicate close signals on the host client.
          return;
        }
        onSessionClosed?.();
        setSessionActive(false);
        setCommunicationMode(null);
        modeRef.current = null;
        lastAnnouncedModeRef.current = null;
        appendMessage(setMessages, "system", "Session has ended.");
        return;
      }

      if (
        message.type === "session_started" ||
        message.type === "session-started" ||
        message.type === "session-already-started"
      ) {
        const nextMode = message.mode === "chat" || message.mode === "video" ? message.mode : "video";
        applySessionMode(nextMode, { fromPeerId: message.fromPeerId, announceForGuests: false });
        return;
      }

      if (message.type === "joined-room" || message.type === "existing-peers") {
        clearPendingHostDisconnectedTimer();
        const isJoinAck = message.type === "joined-room";
        if (isJoinAck) {
          hasJoinedRoomRef.current = true;
          setHasJoinedRoom(true);
        }

        const peers = (message.peers || []).filter((id) => id && id !== peerIdRef.current);

        peersRef.current = new Set(peers);
        if (message.peerProfiles) {
          peerProfilesRef.current.clear();
          peerMediaStateRef.current.clear();

          for (const peerId of peers) {
            const profile = message.peerProfiles?.[peerId];
            peerProfilesRef.current.set(peerId, {
              role: profile?.role || "guest",
              displayName: normalizeDisplayName(profile?.displayName, "Guest"),
            });
            peerMediaStateRef.current.set(peerId, {
              isMicOn: Boolean(profile?.isMicOn),
              isCameraOn: Boolean(profile?.isCameraOn),
              isScreenSharing: Boolean(profile?.isScreenSharing),
              raisedHand: Boolean(profile?.raisedHand),
            });
          }
        }

        syncPeersState();
        syncParticipantsState();
        updateConnectionStatus();

        if (message.meetingState) {
          const locked = Boolean(message.meetingState.locked);
          const recording = Boolean(message.meetingState.recording);
          const nextPinnedMessageId =
            typeof message.meetingState.pinnedMessageId === "string" ? message.meetingState.pinnedMessageId : null;

          setMeetingLocked(locked);
          setIsRecording(recording);
          setPinnedMessageId(nextPinnedMessageId);
          setActivePoll(message.meetingState.activePoll || null);
        }

        // Connect to existing peers
        peers.forEach((peerId) => {
          createPeerConnection(peerId);
          if (modeRef.current === "video" || mode === "video") {
            createAndSendOffer(peerId).catch(() => null);
          }
        });

        if (isJoinAck && isHost && pendingStartModeRef.current) {
          const queuedMode = pendingStartModeRef.current;
          pendingStartModeRef.current = null;
          sendSessionStart(queuedMode);
        }
        return;
      }

      if (message.type === "peers_snapshot") {
        const hasHostInSnapshot = Object.values(message.peerProfiles || {}).some(
          (profile) => profile?.role === "host"
        );
        if (hasHostInSnapshot) {
          clearPendingHostDisconnectedTimer();
        }
        if (message.mode === "chat" || message.mode === "video") {
          applySessionMode(message.mode, { fromPeerId: message.fromPeerId, announceForGuests: false });
        }
        await applyPeerSnapshot(message.peers || [], message.peerProfiles);
        return;
      }

      if ((message.type === "peer-joined" || message.type === "user-joined") && message.peerId) {
        if (message.role === "host") {
          clearPendingHostDisconnectedTimer();
        }
        addPeer(message.peerId, {
          role: message.role,
          displayName: message.displayName,
          isMicOn: message.isMicOn,
          isCameraOn: message.isCameraOn,
          isScreenSharing: message.isScreenSharing,
          raisedHand: message.raisedHand,
        });

        // Handle new peer joining
        createPeerConnection(message.peerId);
        if (modeRef.current === "video" || mode === "video") {
          createAndSendOffer(message.peerId).catch(() => null);
        }
        return;
      }

      if (message.type === "peer-left" && message.peerId) {
        const leftPeerName = peerProfilesRef.current.get(message.peerId)?.displayName || "Peer";
        removePeer(message.peerId);
        cleanupPeerConnection(message.peerId);

        setVideoRequestPending(false);
        if (pendingRequestFromRef.current === message.peerId) {
          pendingRequestFromRef.current = null;
        }

        appendMessage(setMessages, "system", `${leftPeerName} disconnected.`);
        return;
      }

      if (message.type === "receive_message" || message.type === "chat-message") {
        const text = String(message.message || "").trim();
        if (!text) return;

        const senderId = String(message.senderId || message.fromPeerId || "peer");
        const senderName =
          String(message.senderName || "").trim() ||
          peerProfilesRef.current.get(senderId)?.displayName ||
          "Peer";
        const messageId = String(message.messageId || "").trim();
        const timestamp = Number(message.timestamp || Date.now());
        const dedupeKey = messageId ? `text:${senderId}:${messageId}` : `text:${senderId}:${timestamp}:${text}`;
        if (registerInboundKey(inboundTextMessageKeysRef.current, dedupeKey)) {
          return;
        }

        appendMessage(setMessages, "peer", text, {
          id: messageId || undefined,
          senderId,
          senderName,
          timestamp,
        });
        return;
      }

      if (message.type === "file_message" || message.type === "file-message") {
        const fileName = String(message.fileName || "").trim();
        const fileUrl = String(message.fileUrl || "").trim();
        const mimeType = String(message.mimeType || "").trim();
        const fileSize = Number(message.fileSize || 0);
        if (!fileName || !fileUrl || !mimeType || !Number.isFinite(fileSize) || fileSize <= 0) {
          return;
        }

        const senderId = String(message.senderId || message.fromPeerId || "peer");
        const senderName =
          String(message.senderName || "").trim() ||
          peerProfilesRef.current.get(senderId)?.displayName ||
          "Peer";
        const messageId = String(message.messageId || "").trim();
        const timestamp = Number(message.timestamp || Date.now());
        const dedupeKey = messageId
          ? `file:${senderId}:${messageId}`
          : `file:${senderId}:${timestamp}:${fileName}:${fileUrl}`;
        if (registerInboundKey(inboundFileMessageKeysRef.current, dedupeKey)) {
          return;
        }

        appendMessage(setMessages, "peer", fileName, {
          id: messageId || undefined,
          senderId,
          senderName,
          messageType: "file",
          fileName,
          fileUrl,
          mimeType,
          fileSize,
          timestamp,
        });
        return;
      }

      if (message.type === "media_state_update" && message.fromPeerId) {
        const currentMedia = peerMediaStateRef.current.get(message.fromPeerId) || {
          isMicOn: false,
          isCameraOn: false,
          isScreenSharing: false,
          raisedHand: false,
        };
        peerMediaStateRef.current.set(message.fromPeerId, {
          isMicOn: Boolean(message.isMicOn),
          isCameraOn: Boolean(message.isCameraOn),
          isScreenSharing:
            typeof message.isScreenSharing === "boolean" ? message.isScreenSharing : currentMedia.isScreenSharing,
          raisedHand: typeof message.raisedHand === "boolean" ? message.raisedHand : currentMedia.raisedHand,
        });
        syncParticipantsState();
        return;
      }

      if (message.type === "participant-state-update" && message.fromPeerId) {
        const currentMedia = peerMediaStateRef.current.get(message.fromPeerId) || {
          isMicOn: false,
          isCameraOn: false,
          isScreenSharing: false,
          raisedHand: false,
        };

        peerMediaStateRef.current.set(message.fromPeerId, {
          isMicOn: typeof message.isMicOn === "boolean" ? message.isMicOn : currentMedia.isMicOn,
          isCameraOn: typeof message.isCameraOn === "boolean" ? message.isCameraOn : currentMedia.isCameraOn,
          isScreenSharing:
            typeof message.isScreenSharing === "boolean" ? message.isScreenSharing : currentMedia.isScreenSharing,
          raisedHand: typeof message.raisedHand === "boolean" ? message.raisedHand : currentMedia.raisedHand,
        });
        syncParticipantsState();
        return;
      }

      if (message.type === "video_call_request" && message.fromPeerId) {
        pendingRequestFromRef.current = message.fromPeerId;
        onVideoCallRequested?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Incoming request to start video call.");
        return;
      }

      if (message.type === "video_call_accepted" && message.fromPeerId) {
        setVideoRequestPending(false);
        if (isHost && modeRef.current !== "video") {
          sendSessionStart("video");
        }
        onVideoCallAccepted?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Video call request accepted.");
        return;
      }

      if (message.type === "video_call_declined" && message.fromPeerId) {
        setVideoRequestPending(false);
        onVideoCallDeclined?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Video call request declined.");
        return;
      }

      if (message.type === "end_call" && message.fromPeerId) {
        cleanupAllPeerConnections();
        stopLocalMedia();
        onEndCallReceived?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Peer ended the video call. Back to chat mode.");
        return;
      }

      if (message.type === "session_mode_change" && (message.mode === "chat" || message.mode === "video")) {
        applySessionMode(message.mode, {
          fromPeerId: message.fromPeerId,
          announceForGuests: true,
        });
        return;
      }

      if ((message.type === "raise_hand" || message.type === "raise-hand") && message.fromPeerId) {
        const currentMedia = peerMediaStateRef.current.get(message.fromPeerId) || {
          isMicOn: false,
          isCameraOn: false,
          isScreenSharing: false,
          raisedHand: false,
        };
        const raised = typeof message.raisedHand === "boolean" ? message.raisedHand : Boolean(message.raised);
        peerMediaStateRef.current.set(message.fromPeerId, {
          ...currentMedia,
          raisedHand: raised,
        });
        syncParticipantsState();
        if (raised) {
          onRaiseHandReceived?.(message.fromPeerId);
        }
        return;
      }

      if (message.type === "participant_mute_request") {
        const audioTrack = localStreamRef.current?.getAudioTracks()[0];
        if (audioTrack) {
          audioTrack.enabled = false;
          setIsMicOn(false);
          broadcastLocalParticipantState({ isMicOn: false });
        }
        onMuteRequested?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Host muted your microphone.");
        return;
      }

      if (message.type === "participant_removed") {
        if (isHost) {
          return;
        }
        onParticipantRemoved?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Host removed you from the meeting.");
        sendSignal({ type: "leave-room" });
        cleanupAllPeerConnections();
        stopLocalMedia();
        clearPeers();
        setSessionActive(false);
        setCommunicationMode(null);
        modeRef.current = null;
        lastAnnouncedModeRef.current = null;
        setIsHandRaised(false);
        return;
      }

      if (message.type === "participant_camera_disable_request") {
        const videoTrack = localStreamRef.current?.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.enabled = false;
          setIsCameraOn(false);
          broadcastLocalParticipantState({ isCameraOn: false });
        }
        onCameraDisableRequested?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Host turned off your camera.");
        return;
      }

      if (message.type === "meeting_lock_change") {
        const locked = Boolean(message.locked);
        setMeetingLocked(locked);
        onMeetingLocked?.(locked, message.fromPeerId);
        appendMessage(setMessages, "system", locked ? "Host locked the meeting." : "Host unlocked the meeting.");
        return;
      }

      if (message.type === "recording_state_change") {
        const recording = Boolean(message.recording);
        setIsRecording(recording);
        onRecordingStateChanged?.(recording, message.fromPeerId);
        appendMessage(setMessages, "system", recording ? "Recording started." : "Recording stopped.");
        return;
      }

      if (message.type === "meeting_end_all") {
        if (isHost) {
          return;
        }
        onMeetingEndedForAll?.(message.fromPeerId);
        appendMessage(setMessages, "system", "Host ended the meeting.");
        sendSignal({ type: "leave-room" });
        cleanupAllPeerConnections();
        stopLocalMedia();
        clearPeers();
        setSessionActive(false);
        setCommunicationMode(null);
        modeRef.current = null;
        lastAnnouncedModeRef.current = null;
        setIsHandRaised(false);
        return;
      }

      if (message.type === "reaction" && message.fromPeerId) {
        const emoji = String(message.emoji || "").trim();
        if (emoji) {
          onReactionReceived?.(emoji, message.fromPeerId);
        }
        return;
      }

      if (message.type === "poll_create") {
        const poll = message.poll || null;
        setActivePoll(poll);
        if (poll) {
          onPollCreated?.(poll, message.fromPeerId);
          appendMessage(setMessages, "system", "Host created a new poll.");
        }
        return;
      }

      if (message.type === "poll_vote" && message.fromPeerId) {
        const pollId = String(message.pollId || "").trim();
        const option = String(message.option || "").trim();
        if (!pollId || !option) return;

        setActivePoll((current: any) => {
          if (!current || current.pollId !== pollId) return current;
          return {
            ...current,
            votes: {
              ...(current.votes || {}),
              [message.fromPeerId as string]: option,
            },
          };
        });
        onPollVoted?.({
          pollId,
          option,
          fromPeerId: message.fromPeerId,
        });
        return;
      }

      if (message.type === "pin_message") {
        const messageId = String(message.messageId || "").trim();
        if (!messageId) return;
        setPinnedMessageId(messageId);
        onMessagePinned?.(messageId, message.fromPeerId);
        return;
      }

      if (message.type === "unpin_message") {
        setPinnedMessageId(null);
        onMessageUnpinned?.(message.fromPeerId);
        return;
      }

      if (message.type === "webrtc-offer" && message.fromPeerId && message.payload) {
        if (modeRef.current !== "video" && mode !== "video") {
          console.warn("Offer ignored because mode =", modeRef.current);
          return;
        }

        // Best effort media start. We should still answer even without local tracks.
        await ensureLocalMedia();

        const pc = createPeerConnection(message.fromPeerId);
        await pc.setRemoteDescription(new RTCSessionDescription(message.payload));
        await flushPendingIceCandidates(message.fromPeerId, pc);

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        sendSignal({
          type: "webrtc-answer",
          targetPeerId: message.fromPeerId,
          payload: answer,
        });
        return;
      }

      if (message.type === "webrtc-answer" && message.fromPeerId && message.payload) {
        const pc = peerConnectionsRef.current.get(message.fromPeerId);
        if (!pc) return;
        await pc.setRemoteDescription(new RTCSessionDescription(message.payload));
        await flushPendingIceCandidates(message.fromPeerId, pc);
        return;
      }

      if (message.type === "webrtc-ice-candidate" && message.fromPeerId && message.payload) {
        const pc = peerConnectionsRef.current.get(message.fromPeerId);
        if (!pc) {
          queueIceCandidate(message.fromPeerId, message.payload);
          return;
        }

        if (!pc.remoteDescription || !pc.remoteDescription.type) {
          queueIceCandidate(message.fromPeerId, message.payload);
          return;
        }

        await pc.addIceCandidate(new RTCIceCandidate(message.payload));
      }
    },
    [
      addPeer,
      applySessionMode,
      applyPeerSnapshot,
      broadcastLocalParticipantState,
      cleanupAllPeerConnections,
      cleanupPeerConnection,
      clearPeers,
      clearPendingHostDisconnectedTimer,
      createAndSendOffer,
      createPeerConnection,
      ensureLocalMedia,
      mode,
      isHost,
      onCameraDisableRequested,
      onEndCallReceived,
      onMeetingEndedForAll,
      onMeetingLocked,
      onMessagePinned,
      onMessageUnpinned,
      onMuteRequested,
      onPollCreated,
      onPollVoted,
      onRaiseHandReceived,
      onReactionReceived,
      onRecordingStateChanged,
      onParticipantRemoved,
      onVideoCallAccepted,
      onVideoCallDeclined,
      onVideoCallRequested,
      flushPendingIceCandidates,
      queueIceCandidate,
      registerInboundKey,
      removePeer,
      sendSessionStart,
      sendSignal,
      stopLocalMedia,
      syncParticipantsState,
      syncPeersState,
      updateConnectionStatus,
    ]
  );

  useEffect(() => {
    socketMessageHandlerRef.current = (event) => {
      handleSocketMessage(event).catch(() => null);
    };

    if (pendingSocketEventsRef.current.length > 0) {
      const buffered = [...pendingSocketEventsRef.current];
      pendingSocketEventsRef.current = [];
      for (const bufferedEvent of buffered) {
        handleSocketMessage(bufferedEvent).catch(() => null);
      }
    }
  }, [handleSocketMessage]);

  useEffect(() => {
    if (!enabled) return;

    if (mode !== "video") {
      cleanupAllPeerConnections();
      stopLocalMedia();
      return;
    }

    let cancelled = false;

    const startVideoMode = async () => {
      const mediaReady = await ensureLocalMedia();
      if (!mediaReady || cancelled) return;

      for (const peerId of peersRef.current.values()) {
        await createAndSendOffer(peerId);
      }
    };

    startVideoMode().catch(() => null);

    return () => {
      cancelled = true;
    };
  }, [enabled, mode, ensureLocalMedia, createAndSendOffer, cleanupAllPeerConnections, stopLocalMedia]);

  useEffect(() => {
    if (!enabled || !roomId) return;

    return () => {
      clearPendingHostDisconnectedTimer();
      clearActiveSpeakerUpdateTimer();
      sendSignal({ type: "leave-room" });
      cleanupAllPeerConnections();
      stopLocalMedia();
      peersRef.current.clear();
      peerProfilesRef.current.clear();
      peerMediaStateRef.current.clear();
      setPeerIds([]);
      setParticipants([]);
      setVideoRequestPending(false);
      setHasJoinedRoom(false);
      hasJoinedRoomRef.current = false;
      pendingStartModeRef.current = null;
      pendingRequestFromRef.current = null;
      lastAnnouncedModeRef.current = null;
      inboundTextMessageKeysRef.current.clear();
      inboundFileMessageKeysRef.current.clear();
      setIsSpeaking(false);
      setSpeakingPeerIds([]);
      setActiveSpeakerPeerId(null);
    };
  }, [enabled, roomId, sendSignal, cleanupAllPeerConnections, stopLocalMedia, clearActiveSpeakerUpdateTimer, clearPendingHostDisconnectedTimer]);

  useEffect(() => {
    if (!enabled || !roomId || readyState !== WebSocket.OPEN) {
      return;
    }

    sendSignal({ type: "sync_peers", roomId });
    const interval = window.setInterval(() => {
      sendSignal({ type: "sync_peers", roomId });
    }, 2500);

    return () => {
      clearInterval(interval);
    };
  }, [enabled, readyState, roomId, sendSignal]);

  useEffect(() => {
    if (!isHost) return;
    if (communicationMode !== "chat" && communicationMode !== "video") return;
    if (!sessionActive) {
      setSessionActive(true);
    }
  }, [communicationMode, isHost, sessionActive]);

  const retryLocalMedia = useCallback(async () => {
    if (modeRef.current !== "video" && mode !== "video") return false;
    const mediaReady = await ensureLocalMedia();
    if (!mediaReady) return false;
    for (const peerId of peersRef.current.values()) {
      await createAndSendOffer(peerId);
    }
    return true;
  }, [createAndSendOffer, ensureLocalMedia, mode]);

  useEffect(() => {
    syncParticipantsState();
  }, [syncParticipantsState]);

  useEffect(() => {
    if (!enabled || readyState !== WebSocket.OPEN || !roomId) {
      return;
    }

    sendSignal({
      type: "media_state_update",
      roomId,
      isMicOn,
      isCameraOn,
      isScreenSharing,
      raisedHand: isHandRaised,
    });
    sendSignal({
      type: "participant-state-update",
      roomId,
      isMicOn,
      isCameraOn,
      isScreenSharing,
      raisedHand: isHandRaised,
    });
  }, [enabled, isCameraOn, isHandRaised, isMicOn, isScreenSharing, readyState, roomId, sendSignal]);

  useEffect(() => {
    if (mode !== "video" || !localStream || !isMicOn) {
      setIsSpeaking(false);
      return;
    }

    const AudioContextRef =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextRef) {
      setIsSpeaking(false);
      return;
    }

    const audioContext = new AudioContextRef();
    const source = audioContext.createMediaStreamSource(localStream);
    const analyser = audioContext.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const buffer = new Uint8Array(analyser.fftSize);
    let localSpeaking = false;
    let lastAboveThresholdAt = 0;

    const interval = window.setInterval(() => {
      analyser.getByteTimeDomainData(buffer);
      let sumSquares = 0;
      for (let i = 0; i < buffer.length; i += 1) {
        const value = (buffer[i] - 128) / 128;
        sumSquares += value * value;
      }
      const rms = Math.sqrt(sumSquares / buffer.length);
      const now = Date.now();

      if (rms >= SPEAKING_ON_THRESHOLD) {
        lastAboveThresholdAt = now;
        if (!localSpeaking) {
          localSpeaking = true;
          setIsSpeaking(true);
        }
        return;
      }

      if (localSpeaking && rms <= SPEAKING_OFF_THRESHOLD && now - lastAboveThresholdAt > SPEAKING_HOLD_MS) {
        localSpeaking = false;
        setIsSpeaking(false);
      }
    }, 180);

    return () => {
      clearInterval(interval);
      source.disconnect();
      analyser.disconnect();
      audioContext.close().catch(() => null);
      setIsSpeaking(false);
    };
  }, [mode, localStream, isMicOn]);

  useEffect(() => {
    if (mode !== "video") {
      setSpeakingPeerIds([]);
      return;
    }

    const entries = Object.entries(remoteStreams);
    if (entries.length === 0) {
      setSpeakingPeerIds([]);
      return;
    }

    const AudioContextRef =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextRef) {
      setSpeakingPeerIds([]);
      return;
    }

    const contexts: AudioContext[] = [];
    const intervals: number[] = [];
    const speakingMap = new Map<string, boolean>();
    const lastAboveThresholdMap = new Map<string, number>();
    let lastCommittedKey = "";

    const commitSpeakingMap = () => {
      const active = Array.from(speakingMap.entries())
        .filter(([, speaking]) => speaking)
        .map(([peerId]) => peerId);
      const nextKey = active.join("|");
      if (nextKey === lastCommittedKey) return;
      lastCommittedKey = nextKey;
      setSpeakingPeerIds(active);
    };

    for (const [peerId, stream] of entries) {
      const hasAudioTrack = stream.getAudioTracks().length > 0;
      if (!hasAudioTrack) {
        speakingMap.set(peerId, false);
        continue;
      }

      const audioContext = new AudioContextRef();
      contexts.push(audioContext);

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      const buffer = new Uint8Array(analyser.fftSize);
      lastAboveThresholdMap.set(peerId, 0);
      const interval = window.setInterval(() => {
        analyser.getByteTimeDomainData(buffer);
        let sumSquares = 0;
        for (let i = 0; i < buffer.length; i += 1) {
          const value = (buffer[i] - 128) / 128;
          sumSquares += value * value;
        }
        const rms = Math.sqrt(sumSquares / buffer.length);
        const now = Date.now();
        const prevSpeaking = Boolean(speakingMap.get(peerId));
        let nextSpeaking = prevSpeaking;

        if (rms >= SPEAKING_ON_THRESHOLD) {
          lastAboveThresholdMap.set(peerId, now);
          nextSpeaking = true;
        } else if (
          prevSpeaking &&
          rms <= SPEAKING_OFF_THRESHOLD &&
          now - (lastAboveThresholdMap.get(peerId) || 0) > SPEAKING_HOLD_MS
        ) {
          nextSpeaking = false;
        }

        if (prevSpeaking !== nextSpeaking) {
          speakingMap.set(peerId, nextSpeaking);
        }
      }, 200);

      intervals.push(interval);
    }

    const commitInterval = window.setInterval(commitSpeakingMap, 320);

    return () => {
      for (const interval of intervals) {
        clearInterval(interval);
      }
      clearInterval(commitInterval);

      for (const context of contexts) {
        context.close().catch(() => null);
      }

      setSpeakingPeerIds([]);
    };
  }, [mode, remoteStreams]);

  useEffect(() => {
    if (mode !== "video") {
      setConnectionQuality("medium");
      return;
    }

    const interval = window.setInterval(async () => {
      const connectedPeerConnection = Array.from(peerConnectionsRef.current.values()).find(
        (pc) => pc.connectionState === "connected"
      );

      if (!connectedPeerConnection) {
        setConnectionQuality("medium");
        return;
      }

      try {
        const stats = await connectedPeerConnection.getStats();
        let rttMs = 0;
        let packetsLost = 0;
        let packetsReceived = 0;

        stats.forEach((report: any) => {
          if (report.type === "candidate-pair" && report.state === "succeeded" && report.nominated) {
            rttMs = (report.currentRoundTripTime || 0) * 1000;
          }

          if (report.type === "inbound-rtp" && !report.isRemote) {
            packetsLost += report.packetsLost || 0;
            packetsReceived += report.packetsReceived || 0;
          }
        });

        const total = packetsLost + packetsReceived;
        const lossRatio = total > 0 ? packetsLost / total : 0;

        if (rttMs < 120 && lossRatio < 0.02) {
          setConnectionQuality("excellent");
          return;
        }

        if (rttMs < 250 && lossRatio < 0.08) {
          setConnectionQuality("medium");
          return;
        }

        setConnectionQuality("poor");
      } catch {
        setConnectionQuality("medium");
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [mode, connectionStatus]);

  useEffect(() => {
    if (mode !== "video" || connectionStatus !== "connecting" || peersRef.current.size === 0) {
      return;
    }

    const interval = window.setInterval(() => {
      for (const peerId of peersRef.current.values()) {
        createAndSendOffer(peerId).catch(() => null);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [mode, connectionStatus, createAndSendOffer]);

  const hasPeer = useMemo(() => peerIds.length > 0, [peerIds]);

  const remoteStream = useMemo(() => {
    const firstPeer = peerIds[0];
    if (!firstPeer) return null;
    return remoteStreams[firstPeer] || null;
  }, [peerIds, remoteStreams]);

  const rawActiveSpeakerPeerId = useMemo(() => {
    if (speakingPeerIds.length > 0) {
      return speakingPeerIds[0];
    }
    if (isSpeaking) {
      return peerIdRef.current;
    }
    return null;
  }, [isSpeaking, speakingPeerIds]);

  useEffect(() => {
    clearActiveSpeakerUpdateTimer();

    if (rawActiveSpeakerPeerId === activeSpeakerPeerId) {
      return;
    }

    const delay = rawActiveSpeakerPeerId ? SPEAKER_SWITCH_DELAY_MS : SPEAKER_CLEAR_DELAY_MS;
    activeSpeakerUpdateTimerRef.current = window.setTimeout(() => {
      setActiveSpeakerPeerId(rawActiveSpeakerPeerId);
      activeSpeakerUpdateTimerRef.current = null;
    }, delay);

    return () => {
      clearActiveSpeakerUpdateTimer();
    };
  }, [activeSpeakerPeerId, clearActiveSpeakerUpdateTimer, rawActiveSpeakerPeerId]);

  const activeSpeaker = useMemo<"local" | "remote" | null>(() => {
    if (!activeSpeakerPeerId) return null;
    return activeSpeakerPeerId === peerIdRef.current ? "local" : "remote";
  }, [activeSpeakerPeerId]);

  const changeSessionMode = useCallback(
    (nextMode: "chat" | "video") => {
      if (!isHost) return false;
      if (!hasJoinedRoomRef.current) {
        // Host selected a mode before join ACK. Queue it and flush on joined-room.
        pendingStartModeRef.current = nextMode;
        setSessionActive(true);
        setCommunicationMode(nextMode);
        modeRef.current = nextMode;
        return true;
      }
      pendingStartModeRef.current = null;
      return sendSessionStart(nextMode);
    },
    [isHost, sendSessionStart]
  );

  const raiseHand = useCallback(() => {
    const nextRaised = !isHandRaised;
    setIsHandRaised(nextRaised);
    syncParticipantsState();

    broadcastLocalParticipantState({ raisedHand: nextRaised });

    const signalSent = sendSignal({
      type: "raise_hand",
      roomId,
      raised: nextRaised,
    });

    return signalSent;
  }, [broadcastLocalParticipantState, isHandRaised, roomId, sendSignal, syncParticipantsState]);

  const muteParticipant = useCallback(
    (targetPeerId: string) => {
      if (!isHost || !targetPeerId) return false;
      return sendSignal({
        type: "participant_mute_request",
        roomId,
        targetPeerId,
      });
    },
    [isHost, roomId, sendSignal]
  );

  const removeParticipant = useCallback(
    (targetPeerId: string) => {
      if (!isHost || !targetPeerId) return false;
      return sendSignal({
        type: "participant_remove_request",
        roomId,
        targetPeerId,
      });
    },
    [isHost, roomId, sendSignal]
  );

  const disableParticipantCamera = useCallback(
    (targetPeerId: string) => {
      if (!isHost || !targetPeerId) return false;
      return sendSignal({
        type: "participant_camera_disable_request",
        roomId,
        targetPeerId,
      });
    },
    [isHost, roomId, sendSignal]
  );

  const setMeetingLock = useCallback(
    (locked: boolean) => {
      if (!isHost) return false;
      const sent = sendSignal({
        type: "meeting_lock_change",
        roomId,
        locked,
      });
      if (sent) {
        setMeetingLocked(locked);
      }
      return sent;
    },
    [isHost, roomId, sendSignal]
  );

  const setRecordingState = useCallback(
    (recording: boolean) => {
      if (!isHost) return false;
      const sent = sendSignal({
        type: "recording_state_change",
        roomId,
        recording,
      });
      if (sent) {
        setIsRecording(recording);
      }
      return sent;
    },
    [isHost, roomId, sendSignal]
  );

  const endMeetingForAll = useCallback(() => {
    if (!isHost) return false;
    const sent = sendSignal({
      type: "meeting_end_all",
      roomId,
    });
    return sent;
  }, [isHost, roomId, sendSignal]);

  const sendReaction = useCallback(
    (emoji: string) => {
      const value = emoji.trim();
      if (!value) return false;
      return sendSignal({
        type: "reaction",
        roomId,
        emoji: value,
      });
    },
    [roomId, sendSignal]
  );

  const createPoll = useCallback(
    (question: string, options: string[]) => {
      if (!isHost) return false;
      const cleanQuestion = question.trim();
      const cleanOptions = options.map((option) => option.trim()).filter(Boolean);
      if (!cleanQuestion || cleanOptions.length < 2) return false;

      const poll = {
        pollId: generateId(),
        question: cleanQuestion,
        options: cleanOptions,
        votes: {},
      };

      const sent = sendSignal({
        type: "poll_create",
        roomId,
        pollId: poll.pollId,
        question: poll.question,
        options: poll.options,
      });

      if (sent) {
        setActivePoll(poll);
      }

      return sent;
    },
    [isHost, roomId, sendSignal]
  );

  const votePoll = useCallback(
    (pollId: string, option: string) => {
      const cleanPollId = pollId.trim();
      const cleanOption = option.trim();
      if (!cleanPollId || !cleanOption) return false;

      const sent = sendSignal({
        type: "poll_vote",
        roomId,
        pollId: cleanPollId,
        option: cleanOption,
      });

      if (sent) {
        setActivePoll((current: any) => {
          if (!current || current.pollId !== cleanPollId) return current;
          return {
            ...current,
            votes: {
              ...(current.votes || {}),
              [peerIdRef.current]: cleanOption,
            },
          };
        });
      }

      return sent;
    },
    [roomId, sendSignal]
  );

  const pinMessage = useCallback(
    (messageId: string) => {
      if (!isHost) return false;
      const value = messageId.trim();
      if (!value) return false;
      const sent = sendSignal({
        type: "pin_message",
        roomId,
        messageId: value,
      });
      if (sent) {
        setPinnedMessageId(value);
      }
      return sent;
    },
    [isHost, roomId, sendSignal]
  );

  const unpinMessage = useCallback(() => {
    if (!isHost) return false;
    const sent = sendSignal({
      type: "unpin_message",
      roomId,
    });
    if (sent) {
      setPinnedMessageId(null);
    }
    return sent;
  }, [isHost, roomId, sendSignal]);

  return {
    localStream,
    remoteStream,
    remoteStreams,
    hasPeer,
    peerIds,
    participants,
    selfPeerId: peerIdRef.current,
    isMicOn,
    isCameraOn,
    isScreenSharing,
    isHandRaised,
    connectionStatus,
    connectionQuality,
    isSpeaking,
    activeSpeaker,
    activeSpeakerPeerId,
    mediaError,
    messages,
    isSocketConnected: readyState === WebSocket.OPEN,
    hasJoinedRoom,
    videoRequestPending,
    meetingLocked,
    isRecording,
    pinnedMessageId,
    activePoll,
    sessionActive,
    communicationMode,
    toggleMute,
    shareScreen,
    leaveMeeting,
    toggleMic,
    toggleCamera,
    toggleScreenShare,
    sendMessage,
    sendFileMessage,
    requestVideoCall,
    respondToVideoCall,
    endVideoCall,
    changeSessionMode,
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
    retryLocalMedia,
  };
}
