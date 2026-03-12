import { env } from "../config/env.js";
import { AppError, asyncHandler } from "../utils/errors.js";
import {
  createPrivateSession,
  getPrivateSession,
  verifyPrivateSession,
} from "../utils/sessionStore.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export const createSession = asyncHandler(async (req, res) => {
  const question = normalizeText(req.body.question);
  const answer = normalizeText(req.body.answer);
  const hostId = req.userId || null;

  if (!question || question.length > 200) {
    throw new AppError("Security question must be between 1 and 200 characters", 400);
  }
  if (!answer || answer.length > 100) {
    throw new AppError("Expected answer must be between 1 and 100 characters", 400);
  }

  const session = createPrivateSession({ question, answer, hostId });
  const joinLink = `${env.frontendUrl}/private?code=${session.code}`;

  res.status(201).json({
    session,
    joinLink,
  });
});

export const getSessionByCode = asyncHandler(async (req, res) => {
  const code = normalizeText(req.params.code).toUpperCase();
  if (code.length !== 6) {
    throw new AppError("Session code must be 6 characters", 400);
  }

  const session = getPrivateSession(code);
  if (!session) {
    throw new AppError("Session not found or expired", 404);
  }

  res.json({ session });
});

export const verifySessionAnswer = asyncHandler(async (req, res) => {
  const code = normalizeText(req.body.code).toUpperCase();
  const answer = normalizeText(req.body.answer);

  if (code.length !== 6) {
    throw new AppError("Session code must be 6 characters", 400);
  }
  if (!answer) {
    throw new AppError("Security answer is required", 400);
  }

  const result = verifyPrivateSession(code, answer);
  if (!result.session) {
    throw new AppError("Session not found or expired", 404);
  }

  if (!result.valid) {
    throw new AppError("Incorrect security answer", 401);
  }

  res.json({
    verified: true,
    session: result.session,
  });
});

