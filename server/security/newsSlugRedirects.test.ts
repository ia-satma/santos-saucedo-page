import test from "node:test";
import assert from "node:assert/strict";
import { newsSlugRedirectKey, recordNewsSlugRedirect } from "../seo/newsSlugRedirects";

test("news slug redirects use a namespaced CMS key", () => {
  assert.equal(newsSlugRedirectKey("old-alert"), "news.slug_redirect.old-alert");
});

test("invalid slugs are ignored before touching persistence", async () => {
  await assert.doesNotReject(() => recordNewsSlugRedirect("old slug", "new-alert"));
  await assert.doesNotReject(() => recordNewsSlugRedirect("old-alert", "new alert"));
});
