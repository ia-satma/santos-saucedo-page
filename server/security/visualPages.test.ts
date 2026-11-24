import test from "node:test";
import assert from "node:assert/strict";
import {
  emptyVisualPageData,
  normalizeVisualPageData,
  validateVisualPageData,
  visualPageKey,
} from "@shared/visualPages";

test("visual page validation accepts a controlled internal component", () => {
  const data = {
    content: [{ type: "HeroBlock", props: { title: "Capacidad de reacción", image: "/editorial/hero.webp", href: "/es/about" } }],
    root: { maxWidth: "site" },
  };
  assert.deepEqual(normalizeVisualPageData(data), data);
  assert.equal(visualPageKey("home", "es"), "visual.home.es");
});

test("visual page validation rejects unknown components and executable content", () => {
  const errors = validateVisualPageData({
    content: [
      { type: "Unknown", props: {} },
      { type: "Text", props: { children: "<script>alert(1)</script>" } },
      { type: "MediaBlock", props: { image: "https://cdn.example.com/file.webp" } },
    ],
  });
  assert.ok(errors.some((error) => error.includes("no está permitido")));
  assert.ok(errors.some((error) => error.includes("contenido inseguro")));
  assert.ok(errors.some((error) => error.includes("ruta interna")));
});

test("visual page validation enforces component and nesting limits", () => {
  const tooMany = { content: Array.from({ length: 101 }, () => ({ type: "Spacer", props: {} })) };
  assert.ok(validateVisualPageData(tooMany).some((error) => error.includes("100 componentes")));
  const deep = { content: [{ type: "Text", props: { value: { a: { b: { c: { d: { e: { f: { g: { h: { i: { j: { k: "too deep" } } } } } } } } } } } } }] };
  assert.ok(validateVisualPageData(deep).some((error) => error.includes("profundidad máxima")));
});

test("empty visual page data is a safe starting document", () => {
  assert.deepEqual(emptyVisualPageData(), { content: [], root: {} });
});
