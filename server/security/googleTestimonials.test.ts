import assert from "node:assert/strict";
import test from "node:test";
import { normalizeGooglePlaceReviews, fetchGooglePlaceReviews, fetchGooglePlaceReviewsFromMapsUrl, extractGoogleMapsCid, normalizeGoogleMapsUrl, googleReviewSourceId, normalizeOmkarReviewBatch } from "../services/googleTestimonials";

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

test("normaliza el laboratorio Omkar, valida la ficha de Google y separa reseñas sin texto", () => {
  const batch = normalizeOmkarReviewBatch({
    results: [
      {
        review_id: "review-1",
        name: "Cliente de prueba",
        rating: 5,
        review_text: "Excelente acompañamiento profesional.",
        published_at: "Hace un mes",
        review_link: "https://www.google.com/maps/reviews/data=!1m5!1s0x8662be314136c21b:0x2fc821e36c6f09dd!2m1!1e2!3m1!2e1",
      },
      {
        review_id: "review-2",
        name: "Cliente sin texto",
        rating: 4,
        review_text: "",
        review_link: "https://www.google.com/maps/reviews/data=!1m5!1s0x8662be314136c21b:0x2fc821e36c6f09dd!2m1!1e2!3m1!2e1",
      },
    ],
    next_cursor: "next-page",
  });
  assert.equal(batch.loaded, 2);
  assert.equal(batch.ratingsOnly, 1);
  assert.equal(batch.drafts.length, 1);
  assert.equal(batch.nextCursor, "next-page");
  assert.match(batch.drafts[0].id, /^google:/);
});

test("rechaza un JSON de Google que pertenece a otra ficha", () => {
  assert.throws(() => normalizeOmkarReviewBatch({
    results: [{
      review_id: "review-foreign",
      name: "Otra ficha",
      rating: 5,
      review_text: "Comentario",
      review_link: "https://www.google.com/maps/reviews/data=!1m5!1s0x1111111111111111:0x2222222222222222!2m1!1e2!3m1!2e1",
    }],
  }), /no corresponde/);
});

test("deriva y valida el CID desde una URL de Maps y extrae reseñas con Places Search", async () => {
  const mapsUrl = "https://www.google.com/maps/place/Saucedo+Santos+S.C./@25.6576042,-100.3678703,17z/data=!3m1!4b1!4m6!3m5!1s0x8662be314136c21b:0x2fc821e36c6f09dd!8m2!3d25.6576042!4d-100.3652954!16s%2Fg%2F1pzq4rwn2?entry=ttu";
  assert.equal(extractGoogleMapsCid(mapsUrl), "2fc821e36c6f09dd");
  assert.equal(normalizeGoogleMapsUrl(mapsUrl).query, "Saucedo Santos S.C.");
  const result = await fetchGooglePlaceReviewsFromMapsUrl({
    mapsUrl,
    apiKey: "secret",
    fetchImpl: async (url, init) => {
      assert.equal(url, "https://places.googleapis.com/v1/places:searchText");
      assert.equal((init?.headers as Record<string, string>)["X-Goog-Api-Key"], "secret");
      return new Response(JSON.stringify({ places: [{
        id: "places/saucedo",
        displayName: { text: "Santos & Saucedo" },
        googleMapsUri: mapsUrl,
        reviews: [{ name: "places/reviews/1", rating: 5, text: { text: "Excelente servicio", languageCode: "es" }, authorAttribution: { displayName: "Cliente" } }],
      }] }), { status: 200 });
    },
  });
  assert.equal(result.placeId, "places/saucedo");
  assert.equal(result.reviews[0].authorName, "Cliente");
});

test("rechaza URL de Maps de otro dominio", () => {
  assert.throws(() => normalizeGoogleMapsUrl("https://example.com/maps/place/Santos"), /Google Maps/);
});
