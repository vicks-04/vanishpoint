import fs from "fs/promises";
import path from "path";
import mongoose from "mongoose";
import { VaultFolder } from "../models/VaultFolder.js";
import { VaultFile } from "../models/VaultFile.js";
import { VaultShare } from "../models/VaultShare.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { serializeFolder } from "../utils/serializers.js";
import { vaultStorageRoot } from "../config/paths.js";

function trimName(value) {
  return String(value || "").trim();
}

async function deleteStoredFile(storagePath) {
  const fullPath = path.join(vaultStorageRoot, storagePath);
  await fs.unlink(fullPath).catch(() => null);
}

async function getFolderAndDescendants(rootFolderId, userId) {
  const collected = [rootFolderId];

  for (let index = 0; index < collected.length; index += 1) {
    const parentId = collected[index];
    const children = await VaultFolder.find({
      userId,
      parentId,
    }).select("_id");
    for (const child of children) {
      collected.push(child._id);
    }
  }

  return collected;
}

export const getFolders = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const [folders, fileCounts] = await Promise.all([
    VaultFolder.find({ userId }).sort({ name: 1 }),
    VaultFile.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      { $match: { folderId: { $ne: null } } },
      { $group: { _id: "$folderId", count: { $sum: 1 } } },
    ]),
  ]);

  const countMap = new Map(fileCounts.map((entry) => [entry._id.toString(), entry.count]));

  res.json({
    folders: folders.map((folder) =>
      serializeFolder(folder, countMap.get(folder._id.toString()) || 0)
    ),
  });
});

export const createFolder = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const name = trimName(req.body.name);
  const parentId = req.body.parentId || null;

  if (!name || name.length > 255) {
    throw new AppError("Folder name must be between 1 and 255 characters", 400);
  }

  if (parentId) {
    const parent = await VaultFolder.findOne({ _id: parentId, userId });
    if (!parent) {
      throw new AppError("Parent folder not found", 404);
    }
  }

  const folder = await VaultFolder.create({
    userId,
    name,
    parentId,
  });

  res.status(201).json({ folder: serializeFolder(folder, 0) });
});

export const renameFolder = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const folderId = req.params.folderId;
  const name = trimName(req.body.name);

  if (!name || name.length > 255) {
    throw new AppError("Folder name must be between 1 and 255 characters", 400);
  }

  const folder = await VaultFolder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  folder.name = name;
  await folder.save();

  res.json({ folder: serializeFolder(folder, 0) });
});

export const deleteFolder = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const folderId = req.params.folderId;

  const folder = await VaultFolder.findOne({ _id: folderId, userId });
  if (!folder) {
    throw new AppError("Folder not found", 404);
  }

  const allFolderIds = await getFolderAndDescendants(folder._id, userId);
  const files = await VaultFile.find({
    userId,
    folderId: { $in: allFolderIds },
  });

  await Promise.all(files.map((file) => deleteStoredFile(file.storagePath)));
  await VaultShare.deleteMany({ fileId: { $in: files.map((f) => f._id) } });
  await VaultFile.deleteMany({
    userId,
    folderId: { $in: allFolderIds },
  });
  await VaultFolder.deleteMany({
    userId,
    _id: { $in: allFolderIds },
  });

  res.json({ message: "Folder deleted" });
});
