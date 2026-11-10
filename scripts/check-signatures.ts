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
const photoGenerator = createSignatureGenerator({ assetsUrl: "https://cms.example.test/signatures/assets/", photo: "/media/public/media/qa-photo.png" });
const photoBoxes: Record<string, [number, number]> = { "02": [99, 135], "05": [113, 135], "06": [113, 142], "07": [113, 192], "08": [113, 145], "10": [99, 141], "12": [170, 170] };
for (const id of Object.keys(photoBoxes)) {
  const photoHtml = photoGenerator.build(id);
  const photoMatch = photoHtml.match(/<img src="([^"]+)" data-signature-photo="true"[^>]*width="([\d.]+)" height="([\d.]+)"/);
  assert(photoMatch, `Falta la foto editable de la firma ${id}`);
  const photoUrl = new URL(photoMatch[1].replace(/&amp;/g, "&"));
  assert.equal(photoUrl.pathname, "/api/signature-photo");
  assert.equal(photoUrl.searchParams.get("source"), "/media/public/media/qa-photo.png");
  assert.equal(Number(photoUrl.searchParams.get("width")), photoBoxes[id][0]);
  assert.equal(Number(photoUrl.searchParams.get("height")), photoBoxes[id][1]);
  assert.equal(Number(photoMatch[2]), photoBoxes[id][0]);
  assert.equal(Number(photoMatch[3]), photoBoxes[id][1]);
  assert.match(photoHtml, /data-signature-photo="true"/);
}
console.log(`signature generator ok: ${signatureIds.length} templates`);
