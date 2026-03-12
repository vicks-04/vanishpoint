import { env } from "../config/env.js";
import { AppError, asyncHandler } from "../utils/errors.js";
<<<<<<< HEAD
import {
  createPrivateSession,
  getPrivateSession,
  verifyPrivateSession,
} from "../utils/sessionStore.js";
=======
import { PrivateSession } from "../models/PrivateSession.js";
import { generateSessionCode, generateSessionId, hashAnswer } from "../utils/sessionUtils.js";
>>>>>>> origin/main

function normalizeText(value) {
  return String(value || "").trim();
}

<<<<<<< HEAD
=======
function toPublicSession(session) {
  return {
    sessionId: session.sessionId,
    code: session.code,
    question: session.question,
    createdAt: session.createdAt?.toISOString?.() || session.createdAt,
    hostId: session.hostId ? session.hostId.toString() : null,
  };
}

>>>>>>> origin/main
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

<<<<<<< HEAD
  const session = createPrivateSession({ question, answer, hostId });
  const joinLink = `${env.frontendUrl}/private?code=${session.code}`;

  res.status(201).json({
    session,
=======
  let code = generateSessionCode(6);
  let attempts = 0;
  while ((await PrivateSession.exists({ code })) && attempts < 10) {
    code = generateSessionCode(6);
    attempts += 1;
  }

  const session = await PrivateSession.create({
    sessionId: generateSessionId(),
    code,
    question,
    answerHash: hashAnswer(answer),
    hostId,
    expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
  });
  const joinLink = `${env.frontendUrl}/private?code=${session.code}`;

  res.status(201).json({
    session: toPublicSession(session),
>>>>>>> origin/main
    joinLink,
  });
});

export const getSessionByCode = asyncHandler(async (req, res) => {
  const code = normalizeText(req.params.code).toUpperCase();
  if (code.length !== 6) {
    throw new AppError("Session code must be 6 characters", 400);
  }

<<<<<<< HEAD
  const session = getPrivateSession(code);
=======
  const session = await PrivateSession.findOne({ code, expiresAt: { $gt: new Date() } });
>>>>>>> origin/main
  if (!session) {
    throw new AppError("Session not found or expired", 404);
  }

<<<<<<< HEAD
  res.json({ session });
=======
  res.json({ session: toPublicSession(session) });
>>>>>>> origin/main
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

<<<<<<< HEAD
  const result = verifyPrivateSession(code, answer);
  if (!result.session) {
    throw new AppError("Session not found or expired", 404);
  }

  if (!result.valid) {
=======
  const session = await PrivateSession.findOne({ code, expiresAt: { $gt: new Date() } });
  if (!session) {
    throw new AppError("Session not found or expired", 404);
  }

  const valid = hashAnswer(answer) === session.answerHash;
  if (!valid) {
>>>>>>> origin/main
    throw new AppError("Incorrect security answer", 401);
  }

  res.json({
    verified: true,
<<<<<<< HEAD
    session: result.session,
  });
});

=======
    session: toPublicSession(session),
  });
});
>>>>>>> origin/main
