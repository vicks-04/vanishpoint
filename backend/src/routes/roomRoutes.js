import { Router } from "express";
import { optionalAuth } from "../middleware/auth.js";
import {
  createRoomHandler,
  getRoomHandler,
  uploadRoomAttachmentHandler,
  verifyRoomHandler,
} from "../controllers/roomController.js";
import { upload } from "../middleware/upload.js";

const router = Router();

router.post("/create", optionalAuth, createRoomHandler);
router.get("/:roomId", getRoomHandler);
router.post("/verify", verifyRoomHandler);
router.post("/attachment", optionalAuth, upload.single("file"), uploadRoomAttachmentHandler);

export default router;
