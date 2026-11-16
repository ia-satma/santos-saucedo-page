import test from "node:test";
import assert from "node:assert/strict";
import { blockVisible, pageVisibility, withPreviewPageVisibility } from "../../client/src/lib/pageVisibility";

test("visibilidad CMS conserva el estado activo por defecto y aplica apagados globales", () => {
  const layout = {
    pages: {
      about: { enabled: false, blocks: { laminas: false, historia: true } },
    },
  };
  assert.deepEqual(pageVisibility(layout, "about"), {
    enabled: false,
    blocks: { laminas: false, historia: true },
  });
  assert.equal(blockVisible(layout, "about", "historia"), false);
  assert.equal(blockVisible(layout, "about", "laminas"), false);
  assert.equal(blockVisible({}, "about", "historia"), true);
});

test("la vista previa autenticada puede abrir una página globalmente oculta", () => {
  const layout = { pages: { industries: { enabled: false, blocks: { hero: true } } } };
  assert.equal((withPreviewPageVisibility(layout, false) as typeof layout).pages.industries.enabled, false);
  assert.equal((withPreviewPageVisibility(layout, true) as typeof layout).pages.industries.enabled, true);
});
