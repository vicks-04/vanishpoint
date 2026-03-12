import cors from "cors";
import express from "express";
import authRoutes from "./routes/authRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import sessionRoutes from "./routes/sessionRoutes.js";
import vaultRoutes from "./routes/vaultRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { env } from "./config/env.js";
import { roomAttachmentStorageRoot } from "./config/paths.js";

export const app = express();

app.use(
  cors({
    origin: env.frontendUrl,
  })
);
app.use(express.json({ limit: "5mb" }));

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/uploads/room-chat", express.static(roomAttachmentStorageRoot));

app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/vault", vaultRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
