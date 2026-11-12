import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { getSocialReferenceTemplate, listSocialReferenceTemplates, SOCIAL_REFERENCE_GUIDANCE, SOCIAL_REFERENCE_KIT } from "../services/socialReferenceKit";

test("el kit social aprobado está disponible y deja libertad creativa al agente", () => {
  assert.equal(fs.existsSync(SOCIAL_REFERENCE_KIT.catalog), true);
  assert.equal(fs.existsSync(SOCIAL_REFERENCE_KIT.skill), true);
  assert.match(SOCIAL_REFERENCE_GUIDANCE, /1080/);
  assert.match(SOCIAL_REFERENCE_GUIDANCE, /sin limitar las ideas/);
  assert.match(SOCIAL_REFERENCE_GUIDANCE, /fotos conservan su color natural/);
});

test("expone las plantillas reales de posts y carruseles y permite elegir una familia", async () => {
  const templates = await listSocialReferenceTemplates();
  assert.equal(templates.filter((template) => template.kind === "post").length, 13);
  assert.equal(templates.filter((template) => template.kind === "carousel").length, 13);
  assert.ok(templates.every((template) => template.file.endsWith(".html")));
  const post = await getSocialReferenceTemplate("post:1b - Monitor laboral-positivo");
  const carousel = await getSocialReferenceTemplate("carousel:2a - Gu-a pr-ctica-lista numerada");
  assert.equal(post?.kind, "post");
  assert.equal(carousel?.kind, "carousel");
  assert.ok((post?.summary.screens ?? 0) >= 1);
  assert.ok(post?.summary.colors.includes("#0b2850"));
});
