import mongoose from "mongoose";

const privateSessionSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
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
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

privateSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const PrivateSession = mongoose.model("PrivateSession", privateSessionSchema);
