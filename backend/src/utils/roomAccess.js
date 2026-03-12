import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const ROOM_ACCESS_EXPIRES_IN = "2h";

export function signRoomAccessToken(roomId) {
  return jwt.sign(
    { typ: "room_access", roomId: String(roomId) },
    env.jwtSecret,
    { expiresIn: ROOM_ACCESS_EXPIRES_IN }
  );
}

export function verifyRoomAccessToken(token, roomId) {
  if (!token) return { ok: false, error: "Missing room access token" };
  try {
    const payload = jwt.verify(String(token), env.jwtSecret);
    if (payload?.typ !== "room_access") {
      return { ok: false, error: "Invalid room access token" };
    }
    if (String(payload?.roomId || "") !== String(roomId || "")) {
      return { ok: false, error: "Room access token does not match room" };
    }
    return { ok: true, payload };
  } catch {
    return { ok: false, error: "Invalid or expired room access token" };
  }
}

