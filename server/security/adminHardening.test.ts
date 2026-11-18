import test from "node:test";
import assert from "node:assert/strict";
import { adminLoginSchema } from "@shared/schema";
import { isAllowedMutationOrigin } from "../auth";

test("admin login usernames have a bounded length", () => {
  const parsed = adminLoginSchema.safeParse({ username: "a".repeat(255), password: "password" });
  assert.equal(parsed.success, false);
});

test("admin login passwords accept exactly 8 to 16 characters", () => {
  const input = (password: string) => adminLoginSchema.safeParse({ username: "editor@example.test", password });
  assert.equal(input("1234567").success, false);
  assert.equal(input("12345678").success, true);
  assert.equal(input("1234567890123456").success, true);
  assert.equal(input("12345678901234567").success, false);
});

test("cookie mutations reject a foreign browser origin", () => {
  const request = {
    method: "POST",
    headers: { origin: "https://evil.example" },
    protocol: "https",
    get: (name: string) => (name === "host" ? "santos-saucedo.replit.app" : undefined),
  } as never;
  assert.equal(isAllowedMutationOrigin(request), false);
});

test("same-origin and bearer mutations remain allowed", () => {
  const sameOrigin = {
    method: "PATCH",
    headers: { origin: "https://santos-saucedo.replit.app" },
    protocol: "https",
    get: (name: string) => (name === "host" ? "santos-saucedo.replit.app" : undefined),
  } as never;
  const bearer = {
    method: "DELETE",
    headers: { authorization: "Bearer session-token", origin: "https://evil.example" },
    protocol: "https",
    get: () => "santos-saucedo.replit.app",
  } as never;
  assert.equal(isAllowedMutationOrigin(sameOrigin), true);
  assert.equal(isAllowedMutationOrigin(bearer), true);
});

