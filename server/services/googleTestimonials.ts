import { createHash } from "node:crypto";

export type GoogleReview = {
  id: string;
  authorName: string;
  quote: string;
  rating: number;
  language?: string;
  publishedAt?: string;
  mapsUrl?: string;
};

type GooglePlaceResponse = {
  reviews?: Array<{
    name?: string;
    rating?: number;
    text?: { text?: string; languageCode?: string };
    originalText?: { text?: string; languageCode?: string };
    publishTime?: string;
    authorAttribution?: { displayName?: string; uri?: string };
    googleMapsUri?: string;
  }>;
};

export function normalizeGooglePlaceReviews(payload: GooglePlaceResponse): GoogleReview[] {
  return (payload.reviews ?? []).flatMap((review) => {
    const quote = String(review.originalText?.text || review.text?.text || "").trim();
    const authorName = String(review.authorAttribution?.displayName || "").trim();
    if (!quote || !authorName) return [];
    const source = review.name || `${authorName}:${quote}`;
    return [{
      id: source,
      authorName,
      quote: quote.slice(0, 1200),
      rating: Math.min(5, Math.max(1, Math.round(Number(review.rating) || 5))),
      language: review.originalText?.languageCode || review.text?.languageCode,
      publishedAt: review.publishTime,
      mapsUrl: review.googleMapsUri || review.authorAttribution?.uri,
    }];
  });
}

export function googleReviewSourceId(reviewId: string): string {
  return `google:${createHash("sha256").update(reviewId).digest("hex").slice(0, 40)}`;
}

export async function fetchGooglePlaceReviews(options: {
  placeId?: string;
  apiKey?: string;
  fetchImpl?: typeof fetch;
} = {}): Promise<GoogleReview[]> {
  const placeId = (options.placeId || process.env.GOOGLE_PLACE_ID || "").trim();
  const apiKey = (options.apiKey || process.env.GOOGLE_PLACES_API_KEY || "").trim();
  if (!placeId || !apiKey) {
    throw new Error("Configura GOOGLE_PLACE_ID y GOOGLE_PLACES_API_KEY para importar reseñas de Google.");
  }
  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const response = await fetchImpl(`https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}?fields=reviews`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": "reviews",
      },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Google Places respondió ${response.status}.`);
    return normalizeGooglePlaceReviews(await response.json() as GooglePlaceResponse);
  } finally {
    clearTimeout(timeout);
  }
}
