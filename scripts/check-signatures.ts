import assert from "node:assert/strict";
import { createSignatureGenerator, signatureIds } from "../shared/signatureGenerator";

assert.deepEqual(signatureIds, ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);
const generator = createSignatureGenerator({
  assetsUrl: "https://cms.example.test/signatures/assets/",
  data: {
    name: "Prueba <CMS>",
    email: "prueba@example.test",
    linkedin: "https://linkedin.example/test",
    facebook: "https://facebook.example/test",
    web: "qa.example.test",
    instagram: "@qa.test",
  },
});
for (const id of signatureIds) {
  const html = generator.build(id);
  assert.match(html, /<!DOCTYPE html>/);
  assert.match(html, /https:\/\/cms\.example\.test\/signatures\/assets\//);
  assert.doesNotMatch(html, /Prueba <CMS>/);
  assert.match(html, /Prueba &lt;CMS&gt;/);
  if (html.includes('alt="LinkedIn"')) assert.match(html, /href="https:\/\/linkedin\.example\/test"[^>]*target="_blank"/);
  if (html.includes('alt="Facebook"')) assert.match(html, /href="https:\/\/facebook\.example\/test"[^>]*target="_blank"/);
  if (id === "12") {
    assert.match(html, /href="https:\/\/qa\.example\.test"/);
  }
}
console.log(`signature generator ok: ${signatureIds.length} templates`);
