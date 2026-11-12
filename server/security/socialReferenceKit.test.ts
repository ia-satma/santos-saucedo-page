import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { SOCIAL_REFERENCE_GUIDANCE, SOCIAL_REFERENCE_KIT } from "../services/socialReferenceKit";

test("el kit social aprobado está disponible y deja libertad creativa al agente", () => {
  assert.equal(fs.existsSync(SOCIAL_REFERENCE_KIT.catalog), true);
  assert.equal(fs.existsSync(SOCIAL_REFERENCE_KIT.skill), true);
  assert.match(SOCIAL_REFERENCE_GUIDANCE, /1080/);
  assert.match(SOCIAL_REFERENCE_GUIDANCE, /sin limitar las ideas/);
  assert.match(SOCIAL_REFERENCE_GUIDANCE, /fotos conservan su color natural/);
});
