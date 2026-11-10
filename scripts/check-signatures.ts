import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
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
  for (const [, asset] of html.matchAll(/\/signatures\/assets\/([^"?]+)/g)) {
    assert.equal(fs.existsSync(path.join("client/public/signatures/assets", asset)), true, `Falta el asset ${asset}`);
  }
  assert.doesNotMatch(html, /Prueba <CMS>/);
  assert.match(html, /Prueba &lt;CMS&gt;/);
  if (html.includes('alt="LinkedIn"')) assert.match(html, /href="https:\/\/linkedin\.example\/test"[^>]*target="_blank"/);
  if (html.includes('alt="Facebook"')) assert.match(html, /href="https:\/\/facebook\.example\/test"[^>]*target="_blank"/);
  if (id === "12") {
    assert.match(html, /href="https:\/\/qa\.example\.test"/);
  }
}
const photoGenerator = createSignatureGenerator({ assetsUrl: "https://cms.example.test/signatures/assets/", photo: "/media/qa-photo.png" });
for (const id of ["02", "05", "06", "07", "08", "10", "12"]) {
  const photoHtml = photoGenerator.build(id);
  assert.match(photoHtml, /src="https:\/\/cms\.example\.test\/media\/qa-photo\.png"/);
  assert.match(photoHtml, /data-signature-photo="true"/);
}
console.log(`signature generator ok: ${signatureIds.length} templates`);
