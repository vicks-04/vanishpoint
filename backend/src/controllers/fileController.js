import fs from "fs/promises";
import path from "path";
import { VaultFile } from "../models/VaultFile.js";
import { VaultFolder } from "../models/VaultFolder.js";
import { VaultShare } from "../models/VaultShare.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { serializeFile } from "../utils/serializers.js";
import { vaultStorageRoot } from "../config/paths.js";

function trimName(value) {
  return String(value || "").trim();
}

function getStorageRoot() {
  return vaultStorageRoot;
}

function getAbsolutePath(storagePath) {
  return path.join(getStorageRoot(), storagePath);
}

export const getFiles = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const folderId = req.query.folderId || null;

  if (folderId) {
    const folder = await VaultFolder.findOne({ _id: folderId, userId });
    if (!folder) {
      throw new AppError("Folder not found", 404);
    }
  }

  const query = { userId };
  if (folderId) query.folderId = folderId;

  const files = await VaultFile.find(query).sort({ createdAt: -1 });
  res.json({ files: files.map(serializeFile) });
});

export const uploadFile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const uploaded = req.file;

  if (!uploaded) {
    throw new AppError("No file uploaded", 400);
  }

  const folderId = req.body.folderId || null;
  const name = trimName(req.body.name);
  const encryptedName = trimName(req.body.encryptedName);
  const size = Number(req.body.size ?? uploaded.size);
  const type = trimName(req.body.type);
  const encryptionSalt = trimName(req.body.encryptionSalt);
  const encryptionIv = trimName(req.body.encryptionIv);

  if (!name || name.length > 255) {
    throw new AppError("File name must be between 1 and 255 characters", 400);
  }
  if (!encryptedName) {
    throw new AppError("Encrypted file name is required", 400);
  }
  if (!encryptionSalt || !encryptionIv) {
    throw new AppError("Encryption metadata is required", 400);
  }
  if (Number.isNaN(size) || size < 0) {
    throw new AppError("Invalid file size", 400);
  }

  if (folderId) {
    const folder = await VaultFolder.findOne({ _id: folderId, userId });
    if (!folder) {
      throw new AppError("Folder not found", 404);
    }
  }

  const userFolder = path.join(getStorageRoot(), userId.toString());
  await fs.mkdir(userFolder, { recursive: true });
  const storagePath = `${userId}/${encryptedName}`;
  const absolutePath = getAbsolutePath(storagePath);
  await fs.writeFile(absolutePath, uploaded.buffer);

  const file = await VaultFile.create({
    userId,
    folderId,
    name,
    encryptedName,
    size,
    type: type || "FILE",
    encryptionSalt,
    encryptionIv,
    storagePath,
  });

  res.status(201).json({ file: serializeFile(file) });
});

export const downloadFile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.fileId;

  const file = await VaultFile.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  const absolutePath = getAbsolutePath(file.storagePath);
  const content = await fs.readFile(absolutePath).catch(() => null);
  if (!content) {
    throw new AppError("Stored file not found", 404);
  }

  res.setHeader("Content-Type", "application/octet-stream");
  res.setHeader("Content-Disposition", `attachment; filename="${file.encryptedName}"`);
  res.send(content);
});

export const deleteFile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const fileId = req.params.fileId;

  const file = await VaultFile.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  await fs.unlink(getAbsolutePath(file.storagePath)).catch(() => null);
  await VaultShare.deleteMany({ fileId: file._id });
  await file.deleteOne();

  res.json({ message: "File deleted" });
});
