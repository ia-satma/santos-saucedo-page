import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";
import { PRESENTATION_REFERENCE_GUIDANCE, PRESENTATION_REFERENCE_TEMPLATE } from "../services/presentation/referenceTemplate";

test("la plantilla institucional de presentaciones está disponible y documentada para el agente", () => {
  assert.equal(fs.existsSync(PRESENTATION_REFERENCE_TEMPLATE.pptx), true);
  assert.equal(fs.existsSync(PRESENTATION_REFERENCE_TEMPLATE.html), true);
  assert.match(PRESENTATION_REFERENCE_GUIDANCE, /agenda/);
  assert.match(PRESENTATION_REFERENCE_GUIDANCE, /metodología/);
  assert.match(PRESENTATION_REFERENCE_GUIDANCE, /#0B2850/);
});
