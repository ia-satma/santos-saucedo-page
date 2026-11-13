import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_SESSION_COOKIE, readCookie } from "../auth";

test("admin session cookie is parsed without exposing bearer credentials to the client", () => {
  assert.equal(ADMIN_SESSION_COOKIE, "ss_admin_session");
  assert.equal(
    readCookie({ headers: { cookie: "theme=light; ss_admin_session=abc%2B123" } }, ADMIN_SESSION_COOKIE),
    "abc+123",
  );
  assert.equal(readCookie({ headers: {} }, ADMIN_SESSION_COOKIE), null);
  assert.equal(readCookie({ headers: { cookie: "ss_admin_session=" } }, ADMIN_SESSION_COOKIE), "");
});

