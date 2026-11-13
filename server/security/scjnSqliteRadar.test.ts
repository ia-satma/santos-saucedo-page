import assert from "node:assert/strict";
import test from "node:test";
import { normalizeScjnSqliteExport } from "../services/scjnSqliteRadar";

test("normaliza un export de SCJN_SQLITE con trazabilidad y fechas", () => {
  const [item] = normalizeScjnSqliteExport({ tesis: [{
    id_tesis: "1234567",
    rubro: "Despido injustificado y carga de la prueba",
    texto: "El patrón debe acreditar la causa.",
    precedentes: "Amparo directo 1/2026",
    materias: "Laboral, Seguridad social",
    instancia: "Tribunal Colegiado",
    epoca: "Duodécima",
    anio: 2026,
    mes: "noviembre",
  }] }, "2026-11-12");
  assert.equal(item.sourceType, "scjn_sqlite");
  assert.equal(item.sourceId, "1234567");
  assert.equal(item.publishedAt, "2026-11-01T00:00:00.000Z");
  assert.match(item.officialUrl, /sjf2\.scjn\.gob\.mx\/detalle\/tesis\/1234567/);
  assert.match(item.content, /Precedentes/);
  assert.ok(item.topics.includes("Derecho laboral"));
});

test("acepta un arreglo de filas y descarta registros sin identificador", () => {
  const items = normalizeScjnSqliteExport([{ id_tesis: "1", rubro: "Criterio", source_url: "https://evil.example/tesis/1" }, { rubro: "Sin ID" }], "2026-11-12");
  assert.equal(items.length, 1);
  assert.equal(items[0]?.officialUrl, "https://sjf2.scjn.gob.mx/detalle/tesis/1");
});
