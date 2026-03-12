import test from "node:test";
import assert from "node:assert/strict";

test("env module loads", async () => {
  process.env.MONGODB_URI ||= "mongodb://localhost:27017/vanishpoint_test";
  process.env.JWT_SECRET ||= "test-secret";

  const { env } = await import("../src/config/env.js");

  assert.ok(env.mongodbUri);
  assert.ok(env.jwtSecret);
});
