import test from "node:test";
import assert from "node:assert/strict";
import { isPublicIndustryGroup, publicIndustryGroups } from "@shared/publicIndustry";

test("industry groups are public unless explicitly unpublished", () => {
  assert.equal(isPublicIndustryGroup({ published: true }), true);
  assert.equal(isPublicIndustryGroup({ published: undefined }), true);
  assert.equal(isPublicIndustryGroup({ published: false }), false);
});

test("public industry lists exclude unpublished records", () => {
  const groups = publicIndustryGroups([
    { slug: "visible", published: true },
    { slug: "legacy", published: undefined },
    { slug: "draft", published: false },
  ]);
  assert.deepEqual(groups.map((group) => group.slug), ["visible", "legacy"]);
});
