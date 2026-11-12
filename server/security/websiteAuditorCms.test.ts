import test from "node:test";
import assert from "node:assert/strict";
import { auditCanonicalRoutes, auditCmsSnapshot, auditMediaReferences, auditTestimonials } from "../agents/specialized/websiteAuditCms";

test("CMS audit detects unknown overrides and unmapped empty sections", () => {
  const findings = auditCmsSnapshot({
    sections: { home: {}, navigation: {} },
    overrides: { legacy_panel: { title: "old" } },
    localizedKeys: ["localized.unknown.es"],
  });

  assert(findings.some((finding) => finding.issueType === "orphan_cms_section"));
  assert(findings.some((finding) => finding.issueType === "orphan_localized_section"));
  assert(findings.some((finding) => finding.issueType === "empty_cms_section" && finding.details.section === "home"));
});

test("media audit reports only unavailable CMS assets", async () => {
  const findings = await auditMediaReferences(
    [
      { url: "/editorial/ok.webp", source: "home.hero" },
      { url: "/video/missing.mp4", source: "home.hero", kind: "video" },
    ],
    async (url) => url.endsWith("ok.webp"),
  );

  assert.deepEqual(findings.map((finding) => finding.issueType), ["missing_media"]);
  assert.equal(findings[0].severity, "high");
});

test("media reference collection ignores ordinary contact URLs", async () => {
  const { collectCmsMediaReferences } = await import("../agents/specialized/websiteAuditCms");
  const refs = collectCmsMediaReferences({ contactData: { directionsUrl: "https://maps.google.com/", privacyEmail: "https://example.com" }, media: { hero: { url: "/video/hero.mp4" } } });
  assert.deepEqual(refs.map((ref) => ref.url), ["/video/hero.mp4"]);
});

test("route audit flags non-canonical and unknown CMS links", () => {
  const findings = auditCanonicalRoutes([
    { href: "/about/", source: "navigation.items[0]" },
    { href: "/articles", source: "links.news" },
    { href: "/es/about", source: "v3.es.next" },
    { href: "/does-not-exist", source: "links.bad" },
  ]);

  assert(findings.some((finding) => finding.issueType === "non_canonical_trailing_slash"));
  assert(findings.some((finding) => finding.issueType === "legacy_redirect_route"));
  assert(findings.some((finding) => finding.issueType === "locale_embedded_in_cms_route"));
  assert(findings.some((finding) => finding.issueType === "unknown_internal_route"));
});

test("testimonial audit protects captured and approved provenance", () => {
  const findings = auditTestimonials([
    { id: "published-without-approval", status: "pending", published: true, quote: "A", authorName: "B" },
    { id: "invite-without-consent", status: "pending", origin: "invite", quote: "A", authorName: "B" },
    { id: "approved-without-audit", status: "approved", published: false, quote: "A", authorName: "B" },
  ]);

  assert(findings.some((finding) => finding.issueType === "testimonial_published_without_approval"));
  assert(findings.some((finding) => finding.issueType === "testimonial_missing_consent"));
  assert(findings.some((finding) => finding.issueType === "testimonial_missing_approval_provenance"));
});
