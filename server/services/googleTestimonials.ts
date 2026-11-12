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

export type GoogleReviewDraft = GoogleReview & {
  externalId: string;
  sourceUrl: string;
  status: "draft";
};

export type OmkarReviewBatch = {
  business: string;
  loaded: number;
  ratingsOnly: number;
  nextCursor: string | null;
  drafts: GoogleReviewDraft[];
};

const SAUCEDO_SANTOS_CID = "2fc821e36c6f09dd";

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

type GooglePlaceSearchResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    googleMapsUri?: string;
    reviews?: GooglePlaceResponse["reviews"];
  }>;
};

const GOOGLE_MAPS_HOSTS = new Set(["www.google.com", "google.com", "maps.google.com"]);

export function extractGoogleMapsCid(value: unknown): string | null {
  if (typeof value !== "string") return null;
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  if (!/^https?:$/.test(url.protocol) || !GOOGLE_MAPS_HOSTS.has(url.hostname.toLowerCase())) return null;
  const queryCid = url.searchParams.get("cid")?.match(/^[0-9]+$/)?.[0];
  if (queryCid) {
    try { return BigInt(queryCid).toString(16); } catch { return null; }
  }
  const decoded = decodeURIComponent(url.href);
  const match = decoded.match(/!1s0x[0-9a-f]+:0x([0-9a-f]+)/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function normalizeGoogleMapsUrl(value: unknown): { href: string; cid: string | null; query: string } {
  let url: URL;
  try { url = new URL(typeof value === "string" ? value.trim() : ""); } catch {
    throw new Error("Introduce un enlace válido de Google Maps.");
  }
  if (!/^https?:$/.test(url.protocol) || !GOOGLE_MAPS_HOSTS.has(url.hostname.toLowerCase()) || !url.pathname.startsWith("/maps")) {
    throw new Error("El enlace debe pertenecer a Google Maps.");
  }
  const placePath = url.pathname.split("/place/")[1]?.split("/")[0] || "";
  const query = url.searchParams.get("query")?.trim() || decodeURIComponent(placePath).replace(/[+]+/g, " ").trim();
  if (!query) throw new Error("El enlace de Google Maps no incluye una ficha o búsqueda.");
  return { href: url.href, cid: extractGoogleMapsCid(url.href), query };
}

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

function verifyGoogleReviewUrl(value: unknown): string {
  let url: URL;
  try { url = new URL(typeof value === "string" ? value : ""); } catch {
    throw new Error("La respuesta incluye una reseña sin enlace verificable de Google Maps.");
  }
  const cid = extractGoogleMapsCid(url.href);
  if (!/^https?:$/.test(url.protocol) || !GOOGLE_MAPS_HOSTS.has(url.hostname.toLowerCase()) || !url.pathname.startsWith("/maps") || cid !== (process.env.GOOGLE_MAPS_CID_HEX || SAUCEDO_SANTOS_CID).toLowerCase()) {
    throw new Error("La respuesta incluye una reseña que no corresponde a Saucedo Santos S.C.");
  }
  return url.href;
}

export function normalizeOmkarReviewBatch(payload: unknown): OmkarReviewBatch {
  const body = payload && typeof payload === "object" ? payload as Record<string, unknown> : {};
  if (!Array.isArray(body.results) || body.results.length === 0 || body.results.length > 200) {
    throw new Error("Carga un JSON de Omkar Cloud con un arreglo results de 1 a 200 reseñas.");
  }
  const unique = new Map<string, GoogleReviewDraft>();
  for (const item of body.results) {
    const review = item && typeof item === "object" ? item as Record<string, unknown> : {};
    const externalId = typeof review.review_id === "string" ? review.review_id.trim() : "";
    if (!externalId) throw new Error("Hay una reseña sin identificador. Genera de nuevo el JSON en Omkar Cloud.");
    const rating = Number(review.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new Error("Hay una reseña con calificación fuera del rango de 1 a 5.");
    const sourceUrl = verifyGoogleReviewUrl(review.review_link);
    const quote = typeof review.review_text === "string" ? review.review_text.trim().slice(0, 1200) : "";
    const draft: GoogleReviewDraft = {
      id: googleReviewSourceId(`omkar:${externalId}`),
      externalId,
      authorName: typeof review.name === "string" ? review.name.trim().slice(0, 160) : "Cliente de Google",
      quote,
      rating,
      publishedAt: typeof review.published_at === "string" ? review.published_at : undefined,
      mapsUrl: sourceUrl,
      sourceUrl,
      status: "draft",
    };
    unique.set(externalId, draft);
  }
  const drafts = Array.from(unique.values()).filter((review) => review.quote.length > 0);
  return {
    business: "Saucedo Santos S.C.",
    loaded: unique.size,
    ratingsOnly: unique.size - drafts.length,
    nextCursor: typeof body.next_cursor === "string" && body.next_cursor.trim() ? body.next_cursor.trim() : null,
    drafts,
  };
}

export async function fetchGooglePlaceReviewsFromMapsUrl(options: {
  mapsUrl: string;
  apiKey?: string;
  expectedCid?: string;
  fetchImpl?: typeof fetch;
}): Promise<{ reviews: GoogleReview[]; placeId: string; cid: string; sourceUrl: string }> {
  const source = normalizeGoogleMapsUrl(options.mapsUrl);
  const expectedCid = (options.expectedCid || process.env.GOOGLE_MAPS_CID_HEX || SAUCEDO_SANTOS_CID).toLowerCase();
  if (source.cid && source.cid !== expectedCid) throw new Error("El enlace no corresponde a Saucedo Santos S.C.");
  const apiKey = (options.apiKey || process.env.GOOGLE_PLACES_API_KEY || "").trim();
  if (!apiKey) throw new Error("Configura GOOGLE_PLACES_API_KEY para extraer reseñas de Google.");
  const fetchImpl = options.fetchImpl || fetch;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  try {
    const search = await fetchImpl("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.googleMapsUri,places.reviews" },
      body: JSON.stringify({ textQuery: source.query, languageCode: "es", maxResultCount: 5 }),
      signal: controller.signal,
    });
    if (!search.ok) throw new Error(`Google Places respondió ${search.status}.`);
    const places = (await search.json() as GooglePlaceSearchResponse).places ?? [];
    const place = places.find((candidate) => {
      const cid = extractGoogleMapsCid(candidate.googleMapsUri);
      return cid === expectedCid || (!source.cid && /santos/i.test(candidate.displayName?.text || "") && /saucedo/i.test(candidate.displayName?.text || ""));
    });
    if (!place?.id) throw new Error("No se encontró la ficha verificada de Saucedo Santos en Google Maps.");
    const reviews = normalizeGooglePlaceReviews({ reviews: place.reviews });
    return { reviews, placeId: place.id, cid: extractGoogleMapsCid(place.googleMapsUri) || expectedCid, sourceUrl: source.href };
  } finally {
    clearTimeout(timeout);
  }
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
