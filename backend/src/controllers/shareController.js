import { VaultFile } from "../models/VaultFile.js";
import { VaultShare } from "../models/VaultShare.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { serializeShare } from "../utils/serializers.js";

export const createShare = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const fileId = req.body.fileId;
  const expiresInHours = Number(req.body.expiresInHours || 24);

  if (!fileId) {
    throw new AppError("fileId is required", 400);
  }

  const file = await VaultFile.findOne({ _id: fileId, userId });
  if (!file) {
    throw new AppError("File not found", 404);
  }

  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  const share = await VaultShare.create({
    fileId,
    createdBy: userId,
    expiresAt,
  });

  res.status(201).json({ share: serializeShare(share) });
});

export const getShares = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const fileId = req.query.fileId || null;
  const query = { createdBy: userId };
  if (fileId) query.fileId = fileId;

  const shares = await VaultShare.find(query).sort({ createdAt: -1 });
  res.json({ shares: shares.map(serializeShare) });
});

export const deleteShare = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const shareId = req.params.shareId;

  const share = await VaultShare.findOne({ _id: shareId, createdBy: userId });
  if (!share) {
    throw new AppError("Share not found", 404);
  }

  await share.deleteOne();
  res.json({ message: "Share revoked" });
});
