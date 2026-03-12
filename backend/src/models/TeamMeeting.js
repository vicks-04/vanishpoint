import mongoose from "mongoose";

const teamMeetingSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    hostId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      default: null,
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

// Meetings are ephemeral; TTL cleanup.
teamMeetingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const TeamMeeting = mongoose.model("TeamMeeting", teamMeetingSchema);
