import crypto from "crypto";
import { hashAnswer } from "./sessionUtils.js";

const ROOM_TTL_MS = 2 * 60 * 60 * 1000;
const roomsById = new Map();

function cleanupExpiredRooms() {
  const now = Date.now();
  for (const [roomId, room] of roomsById.entries()) {
    if (now - new Date(room.createdAt).getTime() > ROOM_TTL_MS) {
      roomsById.delete(roomId);
    }
  }
}

function toPublicRoom(room) {
  return {
    roomId: room.roomId,
    question: room.question,
    createdAt: room.createdAt,
    hostId: room.hostId || null,
  };
}

export function createRoom({ question, answer, hostId = null }) {
  cleanupExpiredRooms();

  const room = {
    roomId: crypto.randomUUID(),
    question,
    answerHash: hashAnswer(answer),
    createdAt: new Date().toISOString(),
    hostId,
  };

  roomsById.set(room.roomId, room);
  return toPublicRoom(room);
}

export function getRoomById(roomId) {
  cleanupExpiredRooms();
  const room = roomsById.get(roomId);
  if (!room) return null;
  return toPublicRoom(room);
}

export function verifyRoomAccess(roomId, answer) {
  cleanupExpiredRooms();
  const room = roomsById.get(roomId);
  if (!room) return { room: null, valid: false };
  const valid = hashAnswer(answer) === room.answerHash;
  return { room: toPublicRoom(room), valid };
}

