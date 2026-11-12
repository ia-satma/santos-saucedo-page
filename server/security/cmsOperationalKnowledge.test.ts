import test from "node:test";
import assert from "node:assert/strict";
import {
  CMS_OPERATIONAL_KNOWLEDGE_SEEDS,
  CMS_OPERATIONAL_SKILLS,
} from "../agents/knowledge/cmsOperationalPlaybook";

test("CMS operational playbook covers the editorial controls that agents use", () => {
  const skillNames = new Set(CMS_OPERATIONAL_SKILLS.map((skill) => skill.name));
  for (const required of [
    "cms_block_mapping",
    "localized_route_validation",
    "media_reference_audit",
    "page_block_completeness",
    "santos_legal_style",
    "localized_canonical_seo",
    "testimonial_provenance_review",
    "taste_design_direction",
    "hook_generation",
    "post_formatting",
    "content_matrix",
    "carousel_storyboarding",
    "social_visual_review",
  ]) {
    assert.equal(skillNames.has(required), true, `missing skill ${required}`);
  }

  assert(CMS_OPERATIONAL_KNOWLEDGE_SEEDS.length >= 5);
  assert(CMS_OPERATIONAL_KNOWLEDGE_SEEDS.every((seed) => seed.content.length > 80));
  assert(CMS_OPERATIONAL_KNOWLEDGE_SEEDS.some((seed) => seed.key === "localized-routes"));
  assert(CMS_OPERATIONAL_KNOWLEDGE_SEEDS.some((seed) => seed.key === "testimonial-approval"));
  assert(CMS_OPERATIONAL_KNOWLEDGE_SEEDS.some((seed) => seed.key === "taste-design-direction"));
  assert(CMS_OPERATIONAL_KNOWLEDGE_SEEDS.some((seed) => seed.key === "social-media-skills"));
  assert(CMS_OPERATIONAL_KNOWLEDGE_SEEDS.some((seed) => seed.key === "labor-radar-scope"));
});
