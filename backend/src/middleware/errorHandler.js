import { AppError } from "../utils/errors.js";

export function notFoundHandler(_req, _res, next) {
  next(new AppError("Route not found", 404));
}

export function errorHandler(err, _req, res, _next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  if (err.name === "ValidationError") {
    const first = Object.values(err.errors)[0];
    return res.status(400).json({ error: first?.message || "Validation failed" });
  }

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File size must be under 50 MB" });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: "Duplicate value" });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal server error" });
}
