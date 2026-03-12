import { generateSessionCode, generateSessionId, hashAnswer } from "./sessionUtils.js";

const SESSION_TTL_MS = 2 * 60 * 60 * 1000;
const sessionsByCode = new Map();

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [code, session] of sessionsByCode.entries()) {
    if (now - new Date(session.createdAt).getTime() > SESSION_TTL_MS) {
      sessionsByCode.delete(code);
    }
  }
}

function toPublicSession(session) {
  return {
    sessionId: session.sessionId,
    code: session.code,
    question: session.question,
    createdAt: session.createdAt,
    hostId: session.hostId || null,
  };
}

export function createPrivateSession({ question, answer, hostId = null }) {
  cleanupExpiredSessions();

  let code = generateSessionCode(6);
  let attempts = 0;
  while (sessionsByCode.has(code) && attempts < 10) {
    code = generateSessionCode(6);
    attempts += 1;
  }

  const nowIso = new Date().toISOString();
  const session = {
    sessionId: generateSessionId(),
    code,
    question,
    answerHash: hashAnswer(answer),
    createdAt: nowIso,
    hostId,
  };

  sessionsByCode.set(code, session);
  return toPublicSession(session);
}

export function getPrivateSession(code) {
  cleanupExpiredSessions();
  const value = sessionsByCode.get(String(code || "").toUpperCase());
  if (!value) return null;
  return toPublicSession(value);
}

export function verifyPrivateSession(code, answer) {
  cleanupExpiredSessions();
  const normalizedCode = String(code || "").toUpperCase();
  const session = sessionsByCode.get(normalizedCode);
  if (!session) {
    return { session: null, valid: false };
  }

  const expectedHash = session.answerHash;
  const receivedHash = hashAnswer(answer);
  const valid = receivedHash === expectedHash;
  return { session: toPublicSession(session), valid };
}

