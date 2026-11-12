import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGooglePlaceReviews, fetchGooglePlaceReviews, googleReviewSourceId } from "../services/googleTestimonials";

test("normaliza reseñas de Google sin alterar el comentario y conserva la calificación", () => {
  const rows = normalizeGooglePlaceReviews({ reviews: [{
    name: "places/reviews/one",
    rating: 4.8,
    originalText: { text: " Atención excelente. ", languageCode: "es" },
    authorAttribution: { displayName: "Cliente de prueba" },
  }] });
  assert.deepEqual(rows[0], {
    id: "places/reviews/one",
    authorName: "Cliente de prueba",
    quote: "Atención excelente.",
    rating: 5,
    language: "es",
    publishedAt: undefined,
    mapsUrl: undefined,
  });
  assert.match(googleReviewSourceId(rows[0].id), /^google:[a-f0-9]{40}$/);
});

test("importa desde Places API solo con credenciales y límite de tiempo", async () => {
  const reviews = await fetchGooglePlaceReviews({
    placeId: "place/test",
    apiKey: "secret",
    fetchImpl: async (url, init) => {
      assert.match(url, /\/places\/place%2Ftest/);
      assert.equal((init?.headers as Record<string, string>)["X-Goog-Api-Key"], "secret");
      return new Response(JSON.stringify({ reviews: [] }), { status: 200 });
    },
  });
  assert.deepEqual(reviews, []);
});
