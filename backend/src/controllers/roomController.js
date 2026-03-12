<<<<<<< HEAD
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { AppError, asyncHandler } from "../utils/errors.js";
import { createRoom, getRoomById, verifyRoomAccess } from "../utils/roomStore.js";
import { roomAttachmentStorageRoot } from "../config/paths.js";
=======
import path from "path";
import crypto from "crypto";
import { AppError, asyncHandler } from "../utils/errors.js";
import { PrivateRoom } from "../models/PrivateRoom.js";
import { hashAnswer } from "../utils/sessionUtils.js";
import { signRoomAccessToken } from "../utils/roomAccess.js";
import { randomHex, sha256 } from "../utils/crypto.js";
>>>>>>> origin/main

function normalizeText(value) {
  return String(value || "").trim();
}

function sanitizeSegment(value, fallback) {
  const clean = normalizeText(value).replace(/[^a-zA-Z0-9-_]/g, "");
  return clean || fallback;
}

function sanitizeFileName(name) {
  const baseName = path.basename(String(name || ""));
  return baseName.replace(/[^a-zA-Z0-9._-]/g, "_");
}

<<<<<<< HEAD
=======
function toPublicRoom(room) {
  return {
    roomId: room.roomId,
    question: room.question,
    createdAt: room.createdAt?.toISOString?.() || room.createdAt,
    hostId: room.hostId ? room.hostId.toString() : null,
  };
}

>>>>>>> origin/main
export const createRoomHandler = asyncHandler(async (req, res) => {
  const question = normalizeText(req.body.question);
  const answer = normalizeText(req.body.answer);
  const hostId = req.userId || null;

  if (!question || question.length > 200) {
    throw new AppError("Security question must be between 1 and 200 characters", 400);
  }
  if (!answer || answer.length > 100) {
    throw new AppError("Expected answer must be between 1 and 100 characters", 400);
  }

<<<<<<< HEAD
  const room = createRoom({ question, answer, hostId });

  res.status(201).json({
    room,
=======
  const roomId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000);
  const hostKey = hostId ? null : randomHex(24);
  const room = await PrivateRoom.create({
    roomId,
    question,
    answerHash: hashAnswer(answer),
    hostId,
    hostKeyHash: hostKey ? sha256(hostKey) : null,
    expiresAt,
  });

  res.status(201).json({
    room: toPublicRoom(room),
    roomAccessToken: signRoomAccessToken(room.roomId),
    roomHostKey: hostKey || undefined,
>>>>>>> origin/main
  });
});

export const getRoomHandler = asyncHandler(async (req, res) => {
  const roomId = normalizeText(req.params.roomId);
  if (!roomId) {
    throw new AppError("roomId is required", 400);
  }

<<<<<<< HEAD
  const room = getRoomById(roomId);
=======
  const room = await PrivateRoom.findOne({ roomId, expiresAt: { $gt: new Date() } });
>>>>>>> origin/main
  if (!room) {
    throw new AppError("Room not found or expired", 404);
  }

<<<<<<< HEAD
  res.json({ room });
=======
  res.json({ room: toPublicRoom(room) });
>>>>>>> origin/main
});

export const verifyRoomHandler = asyncHandler(async (req, res) => {
  const roomId = normalizeText(req.body.roomId);
  const answer = normalizeText(req.body.answer);

  if (!roomId) {
    throw new AppError("roomId is required", 400);
  }
  if (!answer) {
    throw new AppError("Security answer is required", 400);
  }

<<<<<<< HEAD
  const result = verifyRoomAccess(roomId, answer);
  if (!result.room) {
    throw new AppError("Room not found or expired", 404);
  }
  if (!result.valid) {
=======
  const room = await PrivateRoom.findOne({ roomId, expiresAt: { $gt: new Date() } });
  if (!room) {
    throw new AppError("Room not found or expired", 404);
  }

  const valid = hashAnswer(answer) === room.answerHash;
  if (!valid) {
>>>>>>> origin/main
    throw new AppError("Incorrect security answer", 401);
  }

  res.json({
    verified: true,
<<<<<<< HEAD
    room: result.room,
=======
    room: toPublicRoom(room),
    roomAccessToken: signRoomAccessToken(room.roomId),
>>>>>>> origin/main
  });
});

export const uploadRoomAttachmentHandler = asyncHandler(async (req, res) => {
<<<<<<< HEAD
  const roomId = normalizeText(req.body.roomId);
=======
  const roomId = normalizeText(req.roomId || req.query.roomId || req.body.roomId);
>>>>>>> origin/main
  if (!roomId) {
    throw new AppError("roomId is required", 400);
  }

  const file = req.file;
  if (!file) {
    throw new AppError("Attachment file is required", 400);
  }

<<<<<<< HEAD
=======
  const room = await PrivateRoom.findOne({ roomId, expiresAt: { $gt: new Date() } });
  if (!room) {
    throw new AppError("Room not found or expired", 404);
  }

>>>>>>> origin/main
  const allowedMimeTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "application/pdf",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ]);

  if (!allowedMimeTypes.has(file.mimetype)) {
    throw new AppError("Unsupported file type", 400);
  }

  const safeRoomId = sanitizeSegment(roomId, "room");
<<<<<<< HEAD
  const roomDir = path.join(roomAttachmentStorageRoot, safeRoomId);
  await fs.mkdir(roomDir, { recursive: true });

  const originalName = sanitizeFileName(file.originalname || "attachment");
  const ext = path.extname(originalName).slice(0, 12);
  const baseName = path.basename(originalName, ext).slice(0, 80) || "attachment";
  const storedName = `${Date.now()}-${crypto.randomUUID()}-${baseName}${ext}`.slice(0, 180);
  const filePath = path.join(roomDir, storedName);

  await fs.writeFile(filePath, file.buffer);
=======

  const originalName = sanitizeFileName(req.vpAttachment?.originalName || file.originalname || "attachment");
  const storedName = sanitizeFileName(req.vpAttachment?.storedName || file.filename || file.originalname || "attachment");
>>>>>>> origin/main

  const encodedRoomId = encodeURIComponent(safeRoomId);
  const encodedFileName = encodeURIComponent(storedName);
  const fileUrl = `${req.protocol}://${req.get("host")}/uploads/room-chat/${encodedRoomId}/${encodedFileName}`;

  res.status(201).json({
    attachment: {
      roomId,
      fileName: originalName,
      fileUrl,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploadedAt: Date.now(),
    },
  });
});
