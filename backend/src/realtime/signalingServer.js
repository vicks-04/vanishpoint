import { WebSocket, WebSocketServer } from "ws";

const rooms = new Map();
const sessionModes = new Map();
const meetingStates = new Map();
const pendingHostDisconnectTimers = new Map();
const pendingRoomStateCleanupTimers = new Map();

function safeSend(socket, payload) {
  if (socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
}

function getRoom(roomId) {
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }
  return rooms.get(roomId);
}

function getMeetingState(roomId) {
  if (!meetingStates.has(roomId)) {
    meetingStates.set(roomId, {
      locked: false,
      recording: false,
      pinnedMessageId: null,
      activePoll: null,
    });
  }
  return meetingStates.get(roomId);
}

function getHostPeerIds(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];

  const hostPeerIds = [];
  for (const [peerId, peerSocket] of room.entries()) {
    if (peerSocket.role === "host" && peerSocket.phase !== "gate") {
      hostPeerIds.push(peerId);
    }
  }
  return hostPeerIds;
}

function clearPendingHostDisconnect(roomId) {
  const timer = pendingHostDisconnectTimers.get(roomId);
  if (!timer) return;
  clearTimeout(timer);
  pendingHostDisconnectTimers.delete(roomId);
}

function scheduleHostDisconnect(roomId) {
  clearPendingHostDisconnect(roomId);
  const timer = setTimeout(() => {
    pendingHostDisconnectTimers.delete(roomId);
    const room = rooms.get(roomId);
    if (!room || room.size === 0) return;

    // Skip notify when a host rejoined during grace window.
    const hasActiveHost = getHostPeerIds(roomId).length > 0;
    if (hasActiveHost) return;

    relayToRoom(roomId, {
      type: "host_disconnected",
      roomId,
    });
  }, 2500);

  pendingHostDisconnectTimers.set(roomId, timer);
}

function clearPendingRoomStateCleanup(roomId) {
  const timer = pendingRoomStateCleanupTimers.get(roomId);
  if (!timer) return;
  clearTimeout(timer);
  pendingRoomStateCleanupTimers.delete(roomId);
}

function scheduleRoomStateCleanup(roomId) {
  clearPendingRoomStateCleanup(roomId);
  const timer = setTimeout(() => {
    pendingRoomStateCleanupTimers.delete(roomId);
    const room = rooms.get(roomId);
    if (room && room.size > 0) {
      return;
    }
    sessionModes.delete(roomId);
    meetingStates.delete(roomId);
  }, 5000);

  pendingRoomStateCleanupTimers.set(roomId, timer);
}

function removeFromRoom(socket) {
  if (!socket.roomId || !socket.peerId) return;
  const room = rooms.get(socket.roomId);
  if (!room) return;
  const isGateSocket = socket.phase === "gate";

  room.delete(socket.peerId);
  if (!isGateSocket) {
    relayToRoomExcept(socket.roomId, socket.peerId, {
      type: "peer-left",
      roomId: socket.roomId,
      peerId: socket.peerId,
      role: socket.role || "guest",
    });
  }

  if (socket.role === "host" && !isGateSocket && room.size > 0 && !socket.transitioning) {
    const hasAnotherActiveHost = getHostPeerIds(socket.roomId).length > 0;
    if (!hasAnotherActiveHost) {
      scheduleHostDisconnect(socket.roomId);
    }
  }

  if (room.size === 0) {
    clearPendingHostDisconnect(socket.roomId);
    rooms.delete(socket.roomId);
    // Preserve room state briefly to tolerate host/client reconnect churn.
    scheduleRoomStateCleanup(socket.roomId);
  }
}

function relayToPeer(roomId, targetPeerId, payload) {
  const room = rooms.get(roomId);
  if (!room) return;
  const targetSocket = room.get(targetPeerId);
  if (!targetSocket) return;
  safeSend(targetSocket, payload);
}

function relayToRoomExcept(roomId, excludedPeerId, payload) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const [peerId, peerSocket] of room.entries()) {
    if (peerId === excludedPeerId) continue;
    if (peerSocket.phase === "gate") continue;
    safeSend(peerSocket, payload);
  }
}

function relayToRoom(roomId, payload) {
  const room = rooms.get(roomId);
  if (!room) return;
  for (const peerSocket of room.values()) {
    if (peerSocket.phase === "gate") continue;
    safeSend(peerSocket, payload);
  }
}

function participantProfileForSocket(peerSocket) {
  return {
    role: peerSocket.role || "guest",
    displayName: peerSocket.displayName || "Guest",
    isMicOn: Boolean(peerSocket.mediaState?.isMicOn),
    isCameraOn: Boolean(peerSocket.mediaState?.isCameraOn),
    isScreenSharing: Boolean(peerSocket.mediaState?.isScreenSharing),
    raisedHand: Boolean(peerSocket.raisedHand),
  };
}

function broadcastSessionStarted(roomId, mode) {
  relayToRoom(roomId, {
    type: "session-started",
    roomId,
    mode,
  });

  // Backward-compatible event name for older clients.
  relayToRoom(roomId, {
    type: "session_started",
    roomId,
    mode,
  });
}

function handleJoin(socket, message) {
  const roomId = String(message.roomId || "").trim();
  const peerId = String(message.peerId || "").trim();
  if (!roomId || !peerId) return;
  const meetingState = getMeetingState(roomId);

  socket.roomId = roomId;
  socket.peerId = peerId;
  socket.role = String(message.role || "guest").trim().toLowerCase() === "host" ? "host" : "guest";
  socket.phase = String(message.phase || "").trim().toLowerCase() === "gate" ? "gate" : "active";
  socket.displayName = String(message.displayName || "").trim() || (socket.role === "host" ? "Host" : "Guest");
  socket.mediaState = {
    isMicOn: Boolean(message.isMicOn),
    isCameraOn: Boolean(message.isCameraOn),
    isScreenSharing: Boolean(message.isScreenSharing),
  };
  socket.raisedHand = Boolean(message.raisedHand);

  clearPendingRoomStateCleanup(roomId);

  if (socket.role === "host" && socket.phase === "active") {
    clearPendingHostDisconnect(roomId);
  }

  if (meetingState.locked && socket.role !== "host") {
    safeSend(socket, {
      type: "meeting_locked",
      roomId,
    });
    return;
  }

  const room = getRoom(roomId);
  const existingPeerIds =
    socket.phase === "active"
      ? [...room.entries()]
          .filter(([, peerSocket]) => peerSocket.phase !== "gate")
          .map(([existingPeerId]) => existingPeerId)
      : [];
  const existingPeerProfiles = {};
  for (const [existingPeerId, peerSocket] of room.entries()) {
    if (socket.phase !== "active" && peerSocket.phase === "gate") {
      continue;
    }
    if (socket.phase === "active" && peerSocket.phase === "gate") {
      continue;
    }
    existingPeerProfiles[existingPeerId] = participantProfileForSocket(peerSocket);
  }
  room.set(peerId, socket);

  safeSend(socket, {
    type: "joined-room",
    roomId,
    peerId,
    peers: existingPeerIds,
    peerProfiles: existingPeerProfiles,
    meetingState,
  });

  safeSend(socket, {
    type: "existing-peers",
    roomId,
    peers: existingPeerIds,
  });

  const currentMode = sessionModes.get(roomId);
  const hasActiveHost = getHostPeerIds(roomId).length > 0;
  if (currentMode && hasActiveHost) {
    safeSend(socket, {
      type: "session-already-started",
      roomId,
      mode: currentMode,
    });
  }

  if (socket.phase === "active") {
    const joinedPayload = {
      type: "peer-joined",
      roomId,
      peerId,
      role: socket.role,
      displayName: socket.displayName,
      isMicOn: socket.mediaState.isMicOn,
      isCameraOn: socket.mediaState.isCameraOn,
      isScreenSharing: socket.mediaState.isScreenSharing,
      raisedHand: socket.raisedHand,
    };
    relayToRoomExcept(roomId, peerId, joinedPayload);
    relayToRoomExcept(roomId, peerId, {
      ...joinedPayload,
      type: "user-joined",
    });
  }
}

function handleSyncPeers(socket) {
  if (!socket.roomId || !socket.peerId) return;
  const room = rooms.get(socket.roomId);
  if (!room) return;
  const currentMode = sessionModes.get(socket.roomId);
  const hasActiveHost = getHostPeerIds(socket.roomId).length > 0;

  const peers = [];
  const peerProfiles = {};

  for (const [peerId, peerSocket] of room.entries()) {
    if (peerId === socket.peerId) continue;
    if (peerSocket.phase === "gate") continue;
    peers.push(peerId);
    peerProfiles[peerId] = participantProfileForSocket(peerSocket);
  }

  safeSend(socket, {
    type: "peers_snapshot",
    roomId: socket.roomId,
    peers,
    peerProfiles,
    mode: hasActiveHost ? currentMode || null : null,
  });
}

function handleSignal(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  const targetPeerId = String(message.targetPeerId || "").trim();
  if (!targetPeerId) return;

  relayToPeer(socket.roomId, targetPeerId, {
    type: message.type,
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    payload: message.payload,
  });
}

function handleChatMessage(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  const text = String(message.message || "").trim();
  if (!text) return;
  const senderName = String(message.senderName || "").trim();
  const messageId = String(message.messageId || "").trim();

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "receive_message",
    roomId: socket.roomId,
    senderId: socket.peerId,
    senderName: senderName || undefined,
    messageId: messageId || undefined,
    message: text,
    timestamp: Number(message.timestamp || Date.now()),
  });
}

function handleFileMessage(socket, message) {
  if (!socket.roomId || !socket.peerId) return;

  const fileName = String(message.fileName || "").trim();
  const fileUrl = String(message.fileUrl || "").trim();
  const mimeType = String(message.mimeType || "").trim();
  const fileSize = Number(message.fileSize || 0);
  const messageId = String(message.messageId || "").trim();
  if (!fileName || !fileUrl || !mimeType || !messageId || !Number.isFinite(fileSize) || fileSize <= 0) {
    return;
  }

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "file_message",
    roomId: socket.roomId,
    senderId: socket.peerId,
    senderName: String(message.senderName || "").trim() || socket.displayName || "Guest",
    messageId,
    fileName,
    fileUrl,
    mimeType,
    fileSize,
    timestamp: Number(message.timestamp || Date.now()),
  });
}

function handleParticipantStateUpdate(socket, message) {
  if (!socket.roomId || !socket.peerId) return;

  if (
    typeof message.isMicOn === "boolean" ||
    typeof message.isCameraOn === "boolean" ||
    typeof message.isScreenSharing === "boolean"
  ) {
    socket.mediaState = {
      isMicOn: typeof message.isMicOn === "boolean" ? message.isMicOn : Boolean(socket.mediaState?.isMicOn),
      isCameraOn: typeof message.isCameraOn === "boolean" ? message.isCameraOn : Boolean(socket.mediaState?.isCameraOn),
      isScreenSharing:
        typeof message.isScreenSharing === "boolean"
          ? message.isScreenSharing
          : Boolean(socket.mediaState?.isScreenSharing),
    };
  }
  if (typeof message.raisedHand === "boolean") {
    socket.raisedHand = message.raisedHand;
  }

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "participant-state-update",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    isMicOn: socket.mediaState.isMicOn,
    isCameraOn: socket.mediaState.isCameraOn,
    isScreenSharing: socket.mediaState.isScreenSharing,
    raisedHand: Boolean(socket.raisedHand),
  });
}

function handleMediaStateUpdate(socket, message) {
  if (!socket.roomId || !socket.peerId) return;

  socket.mediaState = {
    isMicOn: Boolean(message.isMicOn),
    isCameraOn: Boolean(message.isCameraOn),
    isScreenSharing:
      typeof message.isScreenSharing === "boolean"
        ? message.isScreenSharing
        : Boolean(socket.mediaState?.isScreenSharing),
  };
  if (typeof message.raisedHand === "boolean") {
    socket.raisedHand = message.raisedHand;
  }

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "media_state_update",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    isMicOn: socket.mediaState.isMicOn,
    isCameraOn: socket.mediaState.isCameraOn,
    isScreenSharing: socket.mediaState.isScreenSharing,
    raisedHand: Boolean(socket.raisedHand),
  });

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "participant-state-update",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    isMicOn: socket.mediaState.isMicOn,
    isCameraOn: socket.mediaState.isCameraOn,
    isScreenSharing: socket.mediaState.isScreenSharing,
    raisedHand: Boolean(socket.raisedHand),
  });
}

function handleVideoCallRequest(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  const targetPeerId = String(message.targetPeerId || "").trim();
  if (!targetPeerId) return;

  relayToPeer(socket.roomId, targetPeerId, {
    type: "video_call_request",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleVideoCallResponse(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  const targetPeerId = String(message.targetPeerId || "").trim();
  if (!targetPeerId) return;

  const accepted = message.type === "video_call_accepted";
  relayToPeer(socket.roomId, targetPeerId, {
    type: accepted ? "video_call_accepted" : "video_call_declined",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleEndCall(socket) {
  if (!socket.roomId || !socket.peerId) return;
  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "end_call",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleSessionStarted(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const mode = String(message.mode || "video").trim();
  if (mode !== "chat" && mode !== "video") return;

  sessionModes.set(socket.roomId, mode);
  broadcastSessionStarted(socket.roomId, mode);
}

function handleSessionModeChange(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const mode = String(message.mode || "").trim();
  if (mode !== "chat" && mode !== "video") return;

  sessionModes.set(socket.roomId, mode);

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "session_mode_change",
    roomId: socket.roomId,
    mode,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleSessionClosed(socket) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  sessionModes.delete(socket.roomId);
  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "session_closed",
    roomId: socket.roomId,
  });
}

function handleRaiseHand(socket, message) {
  if (!socket.roomId || !socket.peerId) return;

  const raised = typeof message?.raised === "boolean" ? message.raised : !Boolean(socket.raisedHand);
  socket.raisedHand = raised;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "raise_hand",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    role: socket.role || "guest",
    raised,
    timestamp: Date.now(),
  });

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "raise-hand",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    role: socket.role || "guest",
    raised,
    timestamp: Date.now(),
  });
}

function handleParticipantMuteRequest(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const targetPeerId = String(message.targetPeerId || "").trim();
  if (!targetPeerId) return;

  relayToPeer(socket.roomId, targetPeerId, {
    type: "participant_mute_request",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleParticipantRemoveRequest(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const targetPeerId = String(message.targetPeerId || "").trim();
  if (!targetPeerId) return;

  relayToPeer(socket.roomId, targetPeerId, {
    type: "participant_removed",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleParticipantCameraDisableRequest(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const targetPeerId = String(message.targetPeerId || "").trim();
  if (!targetPeerId) return;

  relayToPeer(socket.roomId, targetPeerId, {
    type: "participant_camera_disable_request",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleMeetingLockChange(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const nextLocked = Boolean(message.locked);
  const meetingState = getMeetingState(socket.roomId);
  meetingState.locked = nextLocked;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "meeting_lock_change",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    locked: nextLocked,
    timestamp: Date.now(),
  });
}

function handleRecordingStateChange(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const recording = Boolean(message.recording);
  const meetingState = getMeetingState(socket.roomId);
  meetingState.recording = recording;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "recording_state_change",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    recording,
    timestamp: Date.now(),
  });
}

function handleMeetingEndAll(socket) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  sessionModes.delete(socket.roomId);
  const meetingState = getMeetingState(socket.roomId);
  meetingState.activePoll = null;
  meetingState.pinnedMessageId = null;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "meeting_end_all",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

function handleReaction(socket, message) {
  if (!socket.roomId || !socket.peerId) return;

  const emoji = String(message.emoji || "").trim();
  if (!emoji) return;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "reaction",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    emoji,
    timestamp: Date.now(),
  });
}

function handlePollCreate(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const pollId = String(message.pollId || "").trim();
  const question = String(message.question || "").trim();
  const options = Array.isArray(message.options) ? message.options.map((option) => String(option || "").trim()).filter(Boolean) : [];

  if (!pollId || !question || options.length < 2) return;

  const poll = {
    pollId,
    question,
    options,
    votes: {},
  };

  const meetingState = getMeetingState(socket.roomId);
  meetingState.activePoll = poll;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "poll_create",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    poll,
    timestamp: Date.now(),
  });
}

function handlePollVote(socket, message) {
  if (!socket.roomId || !socket.peerId) return;

  const pollId = String(message.pollId || "").trim();
  const option = String(message.option || "").trim();
  if (!pollId || !option) return;

  const meetingState = getMeetingState(socket.roomId);
  if (!meetingState.activePoll || meetingState.activePoll.pollId !== pollId) return;

  meetingState.activePoll.votes[socket.peerId] = option;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "poll_vote",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    pollId,
    option,
    timestamp: Date.now(),
  });
}

function handlePinMessage(socket, message) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const messageId = String(message.messageId || "").trim();
  if (!messageId) return;

  const meetingState = getMeetingState(socket.roomId);
  meetingState.pinnedMessageId = messageId;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "pin_message",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    messageId,
    timestamp: Date.now(),
  });
}

function handleUnpinMessage(socket) {
  if (!socket.roomId || !socket.peerId) return;
  if (socket.role !== "host") return;

  const meetingState = getMeetingState(socket.roomId);
  meetingState.pinnedMessageId = null;

  relayToRoomExcept(socket.roomId, socket.peerId, {
    type: "unpin_message",
    roomId: socket.roomId,
    fromPeerId: socket.peerId,
    timestamp: Date.now(),
  });
}

export function setupSignalingServer(httpServer) {
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (socket) => {
    socket.roomId = null;
    socket.peerId = null;
    socket.role = "guest";
    socket.phase = "active";
    socket.displayName = "Guest";
    socket.mediaState = { isMicOn: false, isCameraOn: false, isScreenSharing: false };
    socket.raisedHand = false;
    socket.transitioning = false;

    socket.on("message", (raw) => {
      let message;
      try {
        message = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (message.type === "join-room") {
        handleJoin(socket, message);
        return;
      }

      if (message.type === "sync_peers") {
        handleSyncPeers(socket);
        return;
      }

      if (message.type === "leave-room") {
        removeFromRoom(socket);
        socket.roomId = null;
        socket.peerId = null;
        return;
      }

      if (
        message.type === "webrtc-offer" ||
        message.type === "webrtc-answer" ||
        message.type === "webrtc-ice-candidate" ||
        message.type === "offer" ||
        message.type === "answer" ||
        message.type === "ice-candidate"
      ) {
        const normalizedType =
          message.type === "offer"
            ? "webrtc-offer"
            : message.type === "answer"
              ? "webrtc-answer"
              : message.type === "ice-candidate"
                ? "webrtc-ice-candidate"
                : message.type;
        handleSignal(socket, { ...message, type: normalizedType });
        return;
      }

      if (message.type === "send_message") {
        handleChatMessage(socket, message);
        return;
      }

      if (message.type === "send_file_message") {
        handleFileMessage(socket, message);
        return;
      }

      if (message.type === "media_state_update") {
        handleMediaStateUpdate(socket, message);
        return;
      }

      if (message.type === "participant-state-update") {
        handleParticipantStateUpdate(socket, message);
        return;
      }

      if (message.type === "video_call_request") {
        handleVideoCallRequest(socket, message);
        return;
      }

      if (message.type === "video_call_accepted" || message.type === "video_call_declined") {
        handleVideoCallResponse(socket, message);
        return;
      }

      if (message.type === "end_call") {
        handleEndCall(socket);
        return;
      }

      if (message.type === "session_started") {
        handleSessionStarted(socket, message);
        return;
      }

      if (message.type === "start-session") {
        if (!socket.roomId || socket.role !== "host") return;
        const mode = String(message.mode || "video").trim();
        if (mode !== "chat" && mode !== "video") return;
        sessionModes.set(socket.roomId, mode);
        broadcastSessionStarted(socket.roomId, mode);
        return;
      }

      if (message.type === "session_mode_change") {
        handleSessionModeChange(socket, message);
        return;
      }

      if (message.type === "session_closed") {
        handleSessionClosed(socket);
        return;
      }

      if (message.type === "raise_hand") {
        handleRaiseHand(socket, message);
        return;
      }

      if (message.type === "participant_mute_request") {
        handleParticipantMuteRequest(socket, message);
        return;
      }

      if (message.type === "participant_remove_request") {
        handleParticipantRemoveRequest(socket, message);
        return;
      }

      if (message.type === "participant_camera_disable_request") {
        handleParticipantCameraDisableRequest(socket, message);
        return;
      }

      if (message.type === "meeting_lock_change") {
        handleMeetingLockChange(socket, message);
        return;
      }

      if (message.type === "recording_state_change") {
        handleRecordingStateChange(socket, message);
        return;
      }

      if (message.type === "meeting_end_all") {
        handleMeetingEndAll(socket);
        return;
      }

      if (message.type === "reaction") {
        handleReaction(socket, message);
        return;
      }

      if (message.type === "poll_create") {
        handlePollCreate(socket, message);
        return;
      }

      if (message.type === "poll_vote") {
        handlePollVote(socket, message);
        return;
      }

      if (message.type === "pin_message") {
        handlePinMessage(socket, message);
        return;
      }

      if (message.type === "unpin_message") {
        handleUnpinMessage(socket);
        return;
      }

      if (message.type === "host_transition") {
        socket.transitioning = true;
      }
    });

    socket.on("close", () => {
      removeFromRoom(socket);
    });
  });

  return wss;
}
