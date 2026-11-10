import assert from "node:assert/strict";
import { createSignatureGenerator, signatureIds } from "../shared/signatureGenerator";

assert.deepEqual(signatureIds, ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"]);
const generator = createSignatureGenerator({
  assetsUrl: "https://cms.example.test/signatures/assets/",
  data: { name: "Prueba <CMS>", email: "prueba@example.test", linkedin: "https://linkedin.example/test" },
});
for (const id of signatureIds) {
  const html = generator.build(id);
  assert.match(html, /<!DOCTYPE html>/);
  assert.match(html, /https:\/\/cms\.example\.test\/signatures\/assets\//);
  assert.doesNotMatch(html, /Prueba <CMS>/);
  assert.match(html, /Prueba &lt;CMS&gt;/);
}
console.log(`signature generator ok: ${signatureIds.length} templates`);
