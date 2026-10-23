import assert from "node:assert/strict";
import { test } from "node:test";
import { existsSync } from "node:fs";
import bundled from "./cms-media-manifest.json";
import type { News } from "./schema";
import { getHomeMonitorImage, HOME_MONITOR_IMAGES, SUPERSEDED_HOME_MONITOR_IMAGES, selectHomeMonitorItems } from "./monitorEditorial";

const article = (id: string, fields: Partial<News> = {}) => ({
  id, slug: id, published: true, featuredHome: false,
  date: new Date("2026-10-01"), imageUrl: null, ...fields,
}) as News;

test("homepage respects featured priority, date order, drafts and limit without mutating input", () => {
  const items = [
    article("older"),
    article("newest", { date: new Date("2026-10-20") }),
    article("featured", { featuredHome: true }),
    article("draft", { published: false, featuredHome: true }),
  ];
  assert.deepEqual(selectHomeMonitorItems(items).map(n => n.id), ["featured", "newest", "older"]);
  assert.deepEqual(selectHomeMonitorItems(items, 2).map(n => n.id), ["featured", "newest"]);
  assert.equal(selectHomeMonitorItems([...items, article("extra")], 5).length, 3);
  assert.deepEqual(items.map(n => n.id), ["older", "newest", "featured", "draft"]);
});

test("zero, one and two publications do not invent extra content", () => {
  for (const count of [0, 1, 2]) {
    assert.equal(selectHomeMonitorItems(Array.from({ length: count }, (_, i) => article(String(i)))).length, count);
  }
  assert.deepEqual(selectHomeMonitorItems([article("one")], 0), []);
  assert.deepEqual(selectHomeMonitorItems([article("one")], -1), []);
});

test("editor images take priority and unknown articles explicitly have no image", () => {
  const slug = Object.keys(HOME_MONITOR_IMAGES)[0];
  assert.equal(getHomeMonitorImage({ slug, imageUrl: "/media/editor-selected.webp" }), "/media/editor-selected.webp");
  assert.ok(getHomeMonitorImage({ slug, imageUrl: null })?.includes("monitor-conciliacion"));
  assert.equal(getHomeMonitorImage({ slug: "new-article", imageUrl: null }), null);
  assert.equal(getHomeMonitorImage({ slug: "new-article", imageUrl: " " }), null);
});

test("superseded face photographs resolve to the new editorial series without replacing custom choices", () => {
  for (const [slug, oldImage] of Object.entries(SUPERSEDED_HOME_MONITOR_IMAGES)) {
    const replacement = getHomeMonitorImage({ slug, imageUrl: oldImage });
    assert.notEqual(replacement, oldImage);
    assert.equal(replacement, getHomeMonitorImage({ slug, imageUrl: null }));
    assert.equal(getHomeMonitorImage({ slug, imageUrl: "/media/custom-editor-image.webp" }), "/media/custom-editor-image.webp");
  }
});

test("initial images ship as static assets and do not require a populated storage bucket", () => {
  for (const [slug, source] of Object.entries(HOME_MONITOR_IMAGES)) {
    const asset = bundled.find(entry => entry.url === source)!;
    assert.ok(existsSync(asset.source), `Bundled source exists: ${source}`);
    assert.equal(getHomeMonitorImage({ slug, imageUrl: null }), source);
    assert.equal(getHomeMonitorImage({ slug, imageUrl: `/media/${asset.key}` }), source);
  }
});
