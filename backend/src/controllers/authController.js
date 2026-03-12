import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { PasswordResetToken } from "../models/PasswordResetToken.js";
import { env } from "../config/env.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import { randomHex, sha256 } from "../utils/crypto.js";
import { serializeUser } from "../utils/serializers.js";
import { signAuthToken } from "../middleware/auth.js";

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function normalizeFullName(fullName) {
  return String(fullName || "").trim();
}

function isGoogleAuthConfigured() {
  return Boolean(env.googleClientId && env.googleClientSecret && env.googleCallbackUrl);
}

function ensureGoogleAuthConfigured() {
  if (!isGoogleAuthConfigured()) {
    throw new AppError("Google authentication is not configured", 503);
  }
}

function issueAuthResponse(res, user, statusCode = 200) {
  const token = signAuthToken(user._id);
  return res.status(statusCode).json({
    token,
    user: serializeUser(user),
  });
}

function buildAuthRedirectUrl(params = {}) {
  const redirectUrl = new URL(`${env.frontendUrl.replace(/\/$/, "")}/auth`);

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    redirectUrl.searchParams.set(key, String(value));
  });

  return redirectUrl.toString();
}

function redirectAuthError(res, message) {
  const errorMessage = message || "Google authentication failed";
  return res.redirect(302, buildAuthRedirectUrl({ google_error: errorMessage }));
}

async function exchangeGoogleCodeForTokens(code) {
  const payload = new URLSearchParams({
    code,
    client_id: env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri: env.googleCallbackUrl,
    grant_type: "authorization_code",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: payload,
  });

  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.id_token) {
    throw new AppError("Invalid Google authorization code", 401);
  }

  return data;
}

async function getGoogleProfileFromIdToken(idToken) {
  const response = await fetch(
    `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(idToken)}`
  );
  const profile = await response.json().catch(() => null);

  if (!response.ok || !profile) {
    throw new AppError("Invalid Google identity token", 401);
  }

  if (profile.aud !== env.googleClientId) {
    throw new AppError("Google token audience mismatch", 401);
  }

  if (!profile.email || profile.email_verified !== "true") {
    throw new AppError("Google account email is not verified", 401);
  }

  if (!profile.sub) {
    throw new AppError("Google user identifier is missing", 401);
  }

  return profile;
}

async function findOrCreateGoogleUser(googleProfile) {
  const email = normalizeEmail(googleProfile.email);
  const fullName = normalizeFullName(googleProfile.name) || email.split("@")[0];

  let user = await User.findOne({ googleId: googleProfile.sub });
  if (!user) {
    user = await User.findOne({ email });
  }

  if (!user) {
    return User.create({
      fullName,
      email,
      avatarUrl: googleProfile.picture || null,
      provider: "google",
      googleId: googleProfile.sub,
      passwordHash: null,
    });
  }

  let changed = false;

  if (!user.googleId) {
    user.googleId = googleProfile.sub;
    changed = true;
  }

  if (!user.fullName && fullName) {
    user.fullName = fullName;
    changed = true;
  }

  if (!user.avatarUrl && googleProfile.picture) {
    user.avatarUrl = googleProfile.picture;
    changed = true;
  }

  if (!user.provider || (user.provider === "local" && !user.passwordHash)) {
    user.provider = "google";
    changed = true;
  }

  if (changed) {
    await user.save();
  }

  return user;
}

export const signUp = asyncHandler(async (req, res) => {
  const fullName = normalizeFullName(req.body.fullName || req.body.displayName);
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");
  const confirmPassword = String(req.body.confirmPassword || "");

  if (!fullName) {
    throw new AppError("Full name is required", 400);
  }
  if (fullName.length > 100) {
    throw new AppError("Full name must be 100 characters or less", 400);
  }
  if (!email) {
    throw new AppError("Email is required", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }
  if (confirmPassword && password !== confirmPassword) {
    throw new AppError("Confirm password does not match", 400);
  }

  const existing = await User.findOne({ email });
  if (existing) {
    throw new AppError("Email is already in use", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    fullName,
    email,
    passwordHash,
    provider: "local",
  });

  return issueAuthResponse(res, user, 201);
});

export const login = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  if (!email || !password) {
    throw new AppError("Email and password are required", 400);
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new AppError("Invalid email or password", 401);
  }

  if (!user.passwordHash) {
    throw new AppError("This account uses Google sign-in", 401);
  }

  const matches = await bcrypt.compare(password, user.passwordHash);
  if (!matches) {
    throw new AppError("Invalid email or password", 401);
  }

  return issueAuthResponse(res, user);
});

export const googleLoginWithIdToken = asyncHandler(async (req, res) => {
  ensureGoogleAuthConfigured();

  const idToken = String(req.body.idToken || "");
  if (!idToken) {
    throw new AppError("Google identity token is required", 400);
  }

  const googleProfile = await getGoogleProfileFromIdToken(idToken);
  const user = await findOrCreateGoogleUser(googleProfile);
  return issueAuthResponse(res, user);
});

export const googleAuthStart = asyncHandler(async (_req, res) => {
  ensureGoogleAuthConfigured();

  const state = jwt.sign(
    {
      type: "google_oauth_state",
      nonce: randomHex(16),
    },
    env.jwtSecret,
    { expiresIn: "10m" }
  );

  const googleAuthUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  googleAuthUrl.searchParams.set("client_id", env.googleClientId);
  googleAuthUrl.searchParams.set("redirect_uri", env.googleCallbackUrl);
  googleAuthUrl.searchParams.set("response_type", "code");
  googleAuthUrl.searchParams.set("scope", "openid email profile");
  googleAuthUrl.searchParams.set("prompt", "select_account");
  googleAuthUrl.searchParams.set("state", state);

  res.redirect(302, googleAuthUrl.toString());
});

export async function googleAuthCallback(req, res) {
  try {
    ensureGoogleAuthConfigured();

    const code = String(req.query.code || "");
    const state = String(req.query.state || "");

    if (!code || !state) {
      return redirectAuthError(res, "Missing Google callback parameters");
    }

    let statePayload;
    try {
      statePayload = jwt.verify(state, env.jwtSecret);
    } catch {
      return redirectAuthError(res, "Invalid Google OAuth state");
    }

    if (!statePayload || statePayload.type !== "google_oauth_state") {
      return redirectAuthError(res, "Invalid Google OAuth state");
    }

    const tokenData = await exchangeGoogleCodeForTokens(code);
    const googleProfile = await getGoogleProfileFromIdToken(tokenData.id_token);
    const user = await findOrCreateGoogleUser(googleProfile);
    const token = signAuthToken(user._id);

    return res.redirect(302, buildAuthRedirectUrl({ token, provider: "google" }));
  } catch (error) {
    const message = error instanceof AppError ? error.message : "Google authentication failed";
    return redirectAuthError(res, message);
  }
}

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  res.json({ user: serializeUser(user) });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const email = normalizeEmail(req.body.email);
  if (!email) {
    throw new AppError("Email is required", 400);
  }

  const user = await User.findOne({ email });
  let resetLink;

  if (user) {
    await PasswordResetToken.deleteMany({ userId: user._id, consumedAt: null });
    const token = randomHex(32);
    const tokenHash = sha256(token);
    const expiresAt = new Date(Date.now() + env.resetTokenExpiresMinutes * 60 * 1000);

    await PasswordResetToken.create({
      userId: user._id,
      tokenHash,
      expiresAt,
    });

    resetLink = `${env.frontendUrl}/reset-password#type=recovery&token=${token}`;
    console.info(`Password reset link for ${email}: ${resetLink}`);
  }

  res.json({
    message: "If an account exists, a password reset link has been generated.",
    ...(env.nodeEnv !== "production" && resetLink ? { resetLink } : {}),
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const token = String(req.body.token || "");
  const password = String(req.body.password || "");

  if (!token) {
    throw new AppError("Reset token is required", 400);
  }
  if (password.length < 6) {
    throw new AppError("Password must be at least 6 characters", 400);
  }

  const tokenHash = sha256(token);
  const resetEntry = await PasswordResetToken.findOne({
    tokenHash,
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  });

  if (!resetEntry) {
    throw new AppError("Invalid or expired reset token", 400);
  }

  const user = await User.findById(resetEntry.userId);
  if (!user) {
    throw new AppError("User not found", 404);
  }

  user.passwordHash = await bcrypt.hash(password, 12);
  if (!user.provider) {
    user.provider = "local";
  }
  await user.save();

  resetEntry.consumedAt = new Date();
  await resetEntry.save();
  await PasswordResetToken.deleteMany({ userId: user._id, _id: { $ne: resetEntry._id } });

  res.json({ message: "Password updated successfully" });
});

export const logout = asyncHandler(async (_req, res) => {
  res.json({ message: "Logged out" });
});
