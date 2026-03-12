import { Router } from "express";
import {
  forgotPassword,
  googleAuthCallback,
  googleAuthStart,
  googleLoginWithIdToken,
<<<<<<< HEAD
=======
  exchangeAuthCode,
>>>>>>> origin/main
  login,
  logout,
  me,
  resetPassword,
  signUp,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.post("/signup", signUp);
router.post("/login", login);
router.post("/google", googleLoginWithIdToken);
<<<<<<< HEAD
=======
router.post("/exchange", exchangeAuthCode);
>>>>>>> origin/main
router.get("/google", googleAuthStart);
router.get("/google/callback", googleAuthCallback);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);
router.get("/me", requireAuth, me);
router.post("/logout", requireAuth, logout);

export default router;
