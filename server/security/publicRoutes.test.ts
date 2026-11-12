import test from "node:test";
import assert from "node:assert/strict";
import { fromSpanishRoute, publicRoute, toSpanishRoute } from "@shared/publicRoutes";

test("Spanish public routes use editorial slugs while internal IDs remain stable", () => {
  assert.equal(publicRoute("es", "/about"), "/nuestra-firma");
  assert.equal(publicRoute("es", "/practice-groups/laboral"), "/practicas/laboral");
  assert.equal(publicRoute("es", "/team/ana"), "/socios/ana");
  assert.equal(publicRoute("es", "/news/alerta-laboral"), "/monitor-laboral/alerta-laboral");
  assert.equal(publicRoute("es", "/privacy-policy"), "/aviso-de-privacidad");
  assert.equal(publicRoute("en", "/about"), "/about");
});

test("Spanish aliases normalize back to stable CMS routes", () => {
  assert.equal(fromSpanishRoute("/nuestra-firma"), "/about");
  assert.equal(fromSpanishRoute("/practicas/laboral"), "/practice-groups/laboral");
  assert.equal(fromSpanishRoute("/monitor-laboral/alerta-laboral"), "/news/alerta-laboral");
  assert.equal(toSpanishRoute("/contact"), "/contacto");
});
