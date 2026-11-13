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
