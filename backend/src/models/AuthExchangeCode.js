import mongoose from "mongoose";

const authExchangeCodeSchema = new mongoose.Schema(
  {
    codeHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    provider: {
      type: String,
      enum: ["google"],
      required: true,
    },
    consumedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

authExchangeCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const AuthExchangeCode = mongoose.model("AuthExchangeCode", authExchangeCodeSchema);
