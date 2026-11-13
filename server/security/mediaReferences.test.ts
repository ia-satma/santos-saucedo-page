import assert from "node:assert/strict";
import test from "node:test";
import { mediaIsActiveOrphan } from "../mediaReferences";

test("archived media is excluded from active orphan findings", () => {
  const media = {
    path: "/uploads/old.png",
    filename: "old.png",
    originalName: "old.png",
    archivedAt: new Date(),
  };

  assert.equal(mediaIsActiveOrphan(media, []), false);
});

test("active unreferenced media remains reviewable", () => {
  const media = {
    path: "/uploads/new.png",
    filename: "new.png",
    originalName: "new.png",
    archivedAt: null,
  };

  assert.equal(mediaIsActiveOrphan(media, []), true);
  assert.equal(mediaIsActiveOrphan(media, ["/uploads/new.png"]), false);
});
