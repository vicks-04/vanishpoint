import mongoose from "mongoose";

const privateRoomSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    question: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    answerHash: {
      type: String,
      required: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    hostKeyHash: {
      type: String,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

// TTL cleanup for expired rooms.
privateRoomSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PrivateRoom = mongoose.model("PrivateRoom", privateRoomSchema);
