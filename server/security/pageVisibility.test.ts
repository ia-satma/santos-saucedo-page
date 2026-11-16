import test from "node:test";
import assert from "node:assert/strict";
import { blockVisible, pageVisibility } from "../../client/src/lib/pageVisibility";

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
