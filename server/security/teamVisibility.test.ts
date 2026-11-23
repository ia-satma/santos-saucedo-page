import test from "node:test";
import assert from "node:assert/strict";
import { CONFIRMED_PARTNER_SLUGS, isNamedOnTeamPage } from "@shared/teamVisibility";

test("una desactivación explícita oculta a cada socio confirmado", () => {
  for (const slug of CONFIRMED_PARTNER_SLUGS) {
    assert.equal(
      isNamedOnTeamPage({ slug, isPartner: true, isPublic: false, published: true }),
      false,
      `${slug} debe ocultarse con isPublic=false`,
    );
    assert.equal(
      isNamedOnTeamPage({ slug, isPartner: true, isPublic: true, published: false }),
      false,
      `${slug} debe ocultarse con published=false`,
    );
  }
});

test("los socios confirmados conservan visibilidad por defecto", () => {
  for (const slug of CONFIRMED_PARTNER_SLUGS) {
    assert.equal(isNamedOnTeamPage({ slug, isPartner: true, isPublic: null, published: true }), true);
  }
});

test("los perfiles no confirmados requieren visibilidad pública explícita", () => {
  assert.equal(isNamedOnTeamPage({ slug: "otro-socio", isPartner: true, isPublic: true, published: true }), true);
  assert.equal(isNamedOnTeamPage({ slug: "otro-socio", isPartner: true, isPublic: false, published: true }), false);
  assert.equal(isNamedOnTeamPage({ slug: "asociado", isPartner: false, isPublic: null, published: true }), false);
});
