import fs from "fs/promises";
import http from "http";
import { app } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { env } from "./config/env.js";
import { roomAttachmentStorageRoot, vaultStorageRoot } from "./config/paths.js";
import { setupSignalingServer } from "./realtime/signalingServer.js";

async function start() {
  await connectDatabase();

  await fs.mkdir(vaultStorageRoot, { recursive: true });
  await fs.mkdir(roomAttachmentStorageRoot, { recursive: true });

  const httpServer = http.createServer(app);
  setupSignalingServer(httpServer);

  httpServer.listen(env.port, () => {
    console.log(`Backend running on http://localhost:${env.port}`);
  });
}

start().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
