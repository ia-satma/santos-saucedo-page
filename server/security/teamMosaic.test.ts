import assert from "node:assert/strict";
import test from "node:test";
import { normalizeTeamMosaic, teamMosaicForPublic } from "../../client/src/lib/teamMosaic";
import { mergeCms } from "../../shared/cmsMerge";
import { validateCmsValue } from "../../shared/cms";
import defaults from "../../shared/cms-defaults.json";

test("team mosaic normalizes legacy strings and orders structured items", () => {
  const items = normalizeTeamMosaic([
    { id: "portrait-1", mediaPath: "/editorial/team-01.webp", enabled: false, order: 0, altByLanguage: { es: "Retrato" } },
    "/editorial/team-02.webp",
  ]);
  assert.deepEqual(items.map((item) => item.mediaPath), ["/editorial/team-01.webp", "/editorial/team-02.webp"]);
  assert.equal(items[0].enabled, false);
  assert.equal(items[0].altByLanguage.es, "Retrato");
  assert.equal(teamMosaicForPublic(items).length, 1);
});

test("CMS merge keeps structured team mosaic overrides against legacy defaults", () => {
  const merged = mergeCms({ teamMosaic: ["/editorial/team-01.webp"] }, {
    teamMosaic: [{ id: "portrait-1", mediaPath: "/editorial/team-02.webp", enabled: false, order: 0, altByLanguage: {} }],
  }) as any;
  assert.equal(merged.teamMosaic[0].mediaPath, "/editorial/team-02.webp");
  assert.equal(merged.teamMosaic[0].enabled, false);
});

test("CMS validator accepts structured team mosaic and rejects unsafe media paths", () => {
  assert.deepEqual(validateCmsValue("media", defaults.media), []);
  const value = {
    teamMosaic: [{ id: "portrait-1", mediaPath: "/editorial/team-01.webp", enabled: true, order: 0, altByLanguage: { es: "Retrato" } }],
  };
  const errors = validateCmsValue("media", { ...defaults.media, ...value });
  assert.deepEqual(errors, []);
  const invalid = validateCmsValue("media", { ...defaults.media, teamMosaic: [{ id: "bad", mediaPath: "javascript:alert(1)", enabled: true, order: 0, altByLanguage: {} }] });
  assert.ok(invalid.some((error) => error.includes("mediaPath")));
});
