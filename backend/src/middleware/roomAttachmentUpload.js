import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { roomAttachmentStorageRoot } from "../config/paths.js";

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

function ensureDirSync(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    const roomId = normalizeText(req.query.roomId || req.body?.roomId);
    const safeRoomId = sanitizeSegment(roomId, "room");
    const dir = path.join(roomAttachmentStorageRoot, safeRoomId);
    ensureDirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const originalName = sanitizeFileName(file.originalname || "attachment");
    const ext = path.extname(originalName).slice(0, 12);
    const baseName = path.basename(originalName, ext).slice(0, 80) || "attachment";
    const storedName = `${Date.now()}-${crypto.randomUUID()}-${baseName}${ext}`.slice(0, 180);
    req.vpAttachment = { originalName, storedName };
    cb(null, storedName);
  },
});

export const roomAttachmentUpload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 },
});

