import { Router } from "express";
import {
  createSession,
  getSessionByCode,
  verifySessionAnswer,
} from "../controllers/sessionController.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

router.post("/create", optionalAuth, createSession);
router.get("/:code", getSessionByCode);
router.post("/verify", verifySessionAnswer);

export default router;

