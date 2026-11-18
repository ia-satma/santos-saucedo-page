import test from "node:test";
import assert from "node:assert/strict";
import { reviewTranslation } from "../services/translationQa";

test("translation QA passes matching content with preserved URL and placeholders", () => {
  const result = reviewTranslation(
    { title: "Employment obligations", url: "https://example.com/a", token: "[[KEEP_0]]" } as any,
    { title: "Les obligations d'emploi", url: "https://example.com/a", token: "[[KEEP_0]]" } as any,
    "fr",
  );
  assert.equal(result.status, "passed");
});

test("translation QA blocks missing fields and broken URLs", () => {
  const result = reviewTranslation(
    { title: "Employment obligations", url: "https://example.com/a" } as any,
    { title: "", url: "https://other.example/a" } as any,
    "en",
  );
  assert.equal(result.status, "blocked");
  assert.ok(result.findings.some((finding) => finding.code === "missing_field"));
  assert.ok(result.findings.some((finding) => finding.code === "url_mismatch"));
});

test("translation QA blocks a target language without expected markers", () => {
  const result = reviewTranslation(
    { title: "Obligaciones laborales" } as any,
    { title: "Obligaciones laborales" } as any,
    "de",
  );
  assert.equal(result.status, "blocked");
  assert.ok(result.findings.some((finding) => finding.code === "language_marker_missing"));
});

test("translation QA blocks changed contact, date and HTML tokens", () => {
  const result = reviewTranslation(
    { body: "Contacta ia@satma.mx el 18/11/2026 <strong>hoy</strong>" } as any,
    { body: "Contacta otra@example.com el 19/11/2026 <em>hoy</em>" } as any,
    "fr",
  );
  assert.equal(result.status, "blocked");
  assert.ok(result.findings.some((finding) => finding.code === "email_mismatch"));
  assert.ok(result.findings.some((finding) => finding.code === "date_mismatch"));
  assert.ok(result.findings.some((finding) => finding.code === "html_mismatch"));
});
