import { AppError } from "../utils/errors.js";
import { verifyRoomAccessToken } from "../utils/roomAccess.js";

function normalizeText(value) {
  return String(value || "").trim();
}

export function requireRoomAccess(req, _res, next) {
  const roomId = normalizeText(req.query.roomId || req.body?.roomId);
  if (!roomId) {
    return next(new AppError("roomId is required", 400));
  }

  const headerToken = req.headers["x-room-access"];
  const token = Array.isArray(headerToken) ? headerToken[0] : normalizeText(headerToken);
  const result = verifyRoomAccessToken(token, roomId);
  if (!result.ok) {
    return next(new AppError(result.error, 401));
  }

  req.roomId = roomId;
  next();
}

