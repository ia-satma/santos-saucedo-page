import assert from "node:assert/strict";
import test from "node:test";
import { runRadarSources } from "../services/radarSources";

test("DOF official connector normalizes daily notes into reviewable findings", async () => {
  const originalFetch = globalThis.fetch;
  const responses = [
    { NotasMatutinas: [{ codNota: 123, fecha: "12-11-2026", codDiario: 9, codSeccion: "UNICA" }], NotasVespertinas: [], NotasExtraordinarias: [] },
    { Nota: { codNota: 123, titulo: "Acuerdo laboral", fecha: "12-11-2026", codDiario: 9, codSeccion: "UNICA", codOrgaUno: "PODER EJECUTIVO" } },
  ];
  globalThis.fetch = async () => new Response(JSON.stringify(responses.shift()), { status: 200, headers: { "content-type": "application/json" } });
  try {
    const result = await runRadarSources({ date: "2026-11-12", sources: ["dof"], limit: 5 });
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.sourceType, "dof");
    assert.match(result.items[0]?.officialUrl || "", /sidof\.segob\.gob\.mx\/notas\/123/);
  } finally { globalThis.fetch = originalFetch; }
});

test("SJF connector reports a source failure without publishing anything", async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => { throw new Error("network unavailable"); };
  try {
    const result = await runRadarSources({ date: "2026-11-12", sources: ["sjf"], limit: 5 });
    assert.equal(result.items.length, 0);
    assert.match(result.errors.join(" "), /SJF/);
  } finally { globalThis.fetch = originalFetch; }
});

test("SJF connector rejects lookalike hosts before fetching", async () => {
  const originalFetch = globalThis.fetch;
  const originalUrl = process.env.SJF_RADAR_FEED_URL;
  let called = false;
  process.env.SJF_RADAR_FEED_URL = "https://evilscjn.gob.mx/feed";
  globalThis.fetch = async () => { called = true; return new Response("{}", { status: 200 }); };
  try {
    const result = await runRadarSources({ date: "2026-11-12", sources: ["sjf"], limit: 5 });
    assert.equal(called, false);
    assert.match(result.errors.join(" "), /dominio oficial/);
  } finally {
    globalThis.fetch = originalFetch;
    if (originalUrl === undefined) delete process.env.SJF_RADAR_FEED_URL;
    else process.env.SJF_RADAR_FEED_URL = originalUrl;
  }
});

test("SCJN communications connector keeps official links, dates and labor topics", async () => {
  const originalFetch = globalThis.fetch;
  const html = `<!doctype html><table><tbody>
    <tr><td>Comunicado 161</td><td><a href="https://www.internet2.scjn.gob.mx/red2/comunicados/comunicado.asp?id=8585">La Suprema Corte fija criterios sobre relaciones laborales y seguridad social.</a></td></tr>
    <tr><td>Comunicado 160</td><td><a href="https://www.internet2.scjn.gob.mx/red2/comunicados/comunicado.asp?id=8584">La Suprema Corte informa sobre competencia económica.</a></td></tr>
  </tbody></table>`;
  globalThis.fetch = async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  try {
    const result = await runRadarSources({ date: "2026-11-12", sources: ["scjn_press"], limit: 5 });
    assert.equal(result.items.length, 2);
    assert.equal(result.items[0]?.sourceType, "scjn_press");
    assert.match(result.items[0]?.officialUrl || "", /^https:\/\/www\.internet2\.scjn\.gob\.mx\//);
    assert.equal(result.items[0]?.publishedAt?.slice(0, 10), "2026-11-12");
    assert.ok(result.items[0]?.topics.includes("laboral"));
    assert.equal(result.items[0]?.status, "new");
  } finally { globalThis.fetch = originalFetch; }
});

test("TFCA connector extracts official bulletin PDFs with publication date and review warning", async () => {
  const originalFetch = globalThis.fetch;
  const html = `<!doctype html><table><caption>Septiembre 2026</caption><tbody>
    <tr><td><a href="/work/models/TFCA/Resource/81/2/images/BL01septiembre26.pdf">1</a></td><td>2</td></tr>
  </tbody></table><a href="https://example.com/unsafe.pdf">3</a>`;
  globalThis.fetch = async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  try {
    const result = await runRadarSources({ date: "2026-11-12", sources: ["tfca"], limit: 5 });
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.sourceType, "tfca");
    assert.match(result.items[0]?.officialUrl || "", /^https:\/\/portales\.segob\.gob\.mx\/.*\.pdf$/);
    assert.equal(result.items[0]?.publishedAt?.slice(0, 10), "2026-09-01");
    assert.ok(result.items[0]?.topics.includes("laboral"));
    assert.equal(result.items[0]?.metadata.informationalOnly, true);
    assert.equal(result.items[0]?.status, "new");
  } finally { globalThis.fetch = originalFetch; }
});

test("HTML source connectors discard lookalike links without publishing them", async () => {
  const originalFetch = globalThis.fetch;
  const html = `<!doctype html><table><tbody>
    <tr><td>Comunicado malicioso</td><td><a href="https://internet2.scjn.gob.mx.evil.example/comunicado.asp?id=1">Trabajo</a></td></tr>
  </tbody></table>`;
  globalThis.fetch = async () => new Response(html, { status: 200, headers: { "content-type": "text/html" } });
  try {
    const result = await runRadarSources({ date: "2026-11-12", sources: ["scjn_press"], limit: 5 });
    assert.equal(result.items.length, 0);
    assert.match(result.errors.join(" "), /dominio oficial/);
  } finally { globalThis.fetch = originalFetch; }
});

test("SCJN SQLite connector imports tesis with official URL and reviewable content", async () => {
  const originalFetch = globalThis.fetch;
  const originalExportUrl = process.env.SCJN_SQLITE_EXPORT_URL;
  process.env.SCJN_SQLITE_EXPORT_URL = "https://example.test/scjn/tesis.json";
  globalThis.fetch = async () => new Response(JSON.stringify({ tesis: [{
    id_tesis: "9876543",
    rubro: "Jornada laboral y carga probatoria",
    texto: "El órgano jurisdiccional debe valorar la jornada acreditada.",
    materias: "Laboral",
    anio: 2026,
    mes: "noviembre",
  }] }), { status: 200, headers: { "content-type": "application/json" } });
  try {
    const result = await runRadarSources({ date: "2026-11-12", sources: ["scjn_sqlite"], limit: 5 });
    assert.equal(result.items.length, 1);
    assert.equal(result.items[0]?.sourceType, "scjn_sqlite");
    assert.equal(result.items[0]?.publishedAt?.slice(0, 10), "2026-11-01");
    assert.match(result.items[0]?.officialUrl || "", /^https:\/\/sjf2\.scjn\.gob\.mx\/detalle\/tesis\/9876543$/);
    assert.match(result.items[0]?.content || "", /jornada acreditada/);
    assert.equal(result.items[0]?.status, "new");
  } finally {
    globalThis.fetch = originalFetch;
    if (originalExportUrl === undefined) delete process.env.SCJN_SQLITE_EXPORT_URL;
    else process.env.SCJN_SQLITE_EXPORT_URL = originalExportUrl;
  }
});
