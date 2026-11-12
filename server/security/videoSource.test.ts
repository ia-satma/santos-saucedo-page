import test from "node:test";
import assert from "node:assert/strict";
import { getVideoEmbedUrl } from "../../client/src/lib/videoSource";

test("reconoce enlaces seguros de YouTube y Vimeo para las vistas de video", () => {
  assert.match(getVideoEmbedUrl("https://youtu.be/abcDEF_1234") ?? "", /^https:\/\/www\.youtube-nocookie\.com\/embed\/abcDEF_1234\?/);
  assert.match(getVideoEmbedUrl("https://www.youtube.com/watch?v=abcDEF_1234", true) ?? "", /autoplay=1/);
  assert.match(getVideoEmbedUrl("https://vimeo.com/123456789") ?? "", /^https:\/\/player\.vimeo\.com\/video\/123456789\?/);
  assert.equal(getVideoEmbedUrl("http://youtu.be/abcDEF_1234"), null);
  assert.equal(getVideoEmbedUrl("https://example.com/video.mp4"), null);
});
