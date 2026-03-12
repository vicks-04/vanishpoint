import mongoose from "mongoose";

const vaultFolderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [1, "Folder name must be between 1 and 255 characters"],
      maxlength: [255, "Folder name must be between 1 and 255 characters"],
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VaultFolder",
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export const VaultFolder = mongoose.model("VaultFolder", vaultFolderSchema);
