import crypto from "crypto";

const CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function normalizeValue(value) {
  return String(value || "").trim();
}

export function normalizeAnswer(answer) {
  return normalizeValue(answer).toLowerCase();
}

export function hashAnswer(answer) {
  return crypto.createHash("sha256").update(normalizeAnswer(answer)).digest("hex");
}

export function generateSessionId() {
  return crypto.randomUUID();
}

export function generateSessionCode(length = 6) {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    const idx = crypto.randomInt(0, CODE_ALPHABET.length);
    code += CODE_ALPHABET[idx];
  }
  return code;
}

