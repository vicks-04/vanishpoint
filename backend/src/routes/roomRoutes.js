import { Router } from "express";
<<<<<<< HEAD
import { optionalAuth } from "../middleware/auth.js";
=======
>>>>>>> origin/main
import {
  createRoomHandler,
  getRoomHandler,
  uploadRoomAttachmentHandler,
  verifyRoomHandler,
} from "../controllers/roomController.js";
<<<<<<< HEAD
import { upload } from "../middleware/upload.js";
=======
import { optionalAuth } from "../middleware/auth.js";
import { requireRoomAccess } from "../middleware/roomAccess.js";
import { createInMemoryRateLimiter } from "../middleware/rateLimit.js";
import { roomAttachmentUpload } from "../middleware/roomAttachmentUpload.js";
>>>>>>> origin/main

const router = Router();

router.post("/create", optionalAuth, createRoomHandler);
router.get("/:roomId", getRoomHandler);
router.post("/verify", verifyRoomHandler);
<<<<<<< HEAD
router.post("/attachment", optionalAuth, upload.single("file"), uploadRoomAttachmentHandler);
=======

const attachmentRateLimit = createInMemoryRateLimiter({
  windowMs: 60_000,
  max: 10,
  keyFn: (req) => `${req.ip || "ip"}:${String(req.query.roomId || "")}`,
});

router.post(
  "/attachment",
  attachmentRateLimit,
  requireRoomAccess,
  roomAttachmentUpload.single("file"),
  uploadRoomAttachmentHandler
);
>>>>>>> origin/main

export default router;
