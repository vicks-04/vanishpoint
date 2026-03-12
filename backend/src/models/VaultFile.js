import mongoose from "mongoose";

const vaultFileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    folderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VaultFolder",
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "File name must be between 1 and 255 characters"],
      maxlength: [255, "File name must be between 1 and 255 characters"],
    },
    encryptedName: {
      type: String,
      required: true,
      trim: true,
    },
    size: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    type: {
      type: String,
      required: true,
      default: "",
      trim: true,
    },
    encryptionSalt: {
      type: String,
      required: true,
      trim: true,
    },
    encryptionIv: {
      type: String,
      required: true,
      trim: true,
    },
    storagePath: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export const VaultFile = mongoose.model("VaultFile", vaultFileSchema);
