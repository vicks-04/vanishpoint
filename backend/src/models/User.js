import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      trim: true,
      maxlength: [100, "Full name must be 100 characters or less"],
      default: null,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      default: null,
    },
    avatarUrl: {
      type: String,
      default: null,
    },
    provider: {
      type: String,
      enum: ["local", "google"],
      default: "local",
    },
    googleId: {
      type: String,
<<<<<<< HEAD
      default: null,
=======
>>>>>>> origin/main
      unique: true,
      sparse: true,
    },
    roles: {
      type: [String],
      enum: ["admin", "user"],
      default: ["user"],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
  }
);

export const User = mongoose.model("User", userSchema);
