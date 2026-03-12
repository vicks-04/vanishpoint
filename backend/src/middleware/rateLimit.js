import { AppError } from "../utils/errors.js";

function nowMs() {
  return Date.now();
}

export function createInMemoryRateLimiter({ windowMs, max, keyFn }) {
  const hits = new Map();

  return (req, _res, next) => {
    const key = keyFn(req);
    if (!key) {
      return next(new AppError("Rate limit key is missing", 500));
    }

    const now = nowMs();
    const windowStart = now - windowMs;
    const entry = hits.get(key) || [];
    const pruned = entry.filter((ts) => ts >= windowStart);

    if (pruned.length >= max) {
      return next(new AppError("Too many requests, please try again later.", 429));
    }

    pruned.push(now);
    hits.set(key, pruned);
    next();
  };
}

