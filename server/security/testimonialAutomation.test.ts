import assert from "node:assert/strict";
import test from "node:test";

process.env.DATABASE_URL ??= "postgresql://isolated:isolated@127.0.0.1:1/isolated";
process.env.NODE_ENV = "test";

const { shouldRunGoogleAutomation } = await import("../routes/testimonials");

test("programa la extracción de Google en la zona horaria configurada", () => {
  const settings = {
    enabled: true,
    mapsUrl: "https://www.google.com/maps/place/Saucedo+Santos+S.C./data=!1s0x8662be314136c21b:0x2fc821e36c6f09dd",
    timezone: "America/Monterrey",
    hour: 7,
    minute: 0,
    days: [4],
    lastRunAt: null,
    lastRunStatus: "idle" as const,
    lastRunMessage: "",
    lastRunImported: 0,
    lastRunReviewed: 0,
  };
  assert.equal(shouldRunGoogleAutomation(settings, new Date("2026-11-12T13:00:00.000Z")), true);
  assert.equal(shouldRunGoogleAutomation(settings, new Date("2026-11-12T13:01:00.000Z")), false);
});

test("no repite la extracción en el mismo día después de una ejecución", () => {
  const settings = {
    enabled: true,
    mapsUrl: "https://www.google.com/maps/place/Saucedo+Santos+S.C.",
    timezone: "America/Monterrey",
    hour: 7,
    minute: 0,
    days: [4],
    lastRunAt: "2026-11-12T13:00:00.000Z",
    lastRunStatus: "success" as const,
    lastRunMessage: "1 nuevas",
    lastRunImported: 1,
    lastRunReviewed: 1,
  };
  assert.equal(shouldRunGoogleAutomation(settings, new Date("2026-11-12T13:00:00.000Z")), false);
});
