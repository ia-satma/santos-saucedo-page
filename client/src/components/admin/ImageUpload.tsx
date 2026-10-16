import { MediaField } from "@/features/site-config/MediaField";
export function downloadHref(url: string) {
  return /^\/generated-(images|audio)\//.test(url)
    ? `${url}${url.includes("?") ? "&" : "?"}download=1`
    : url;
}
export function ImageUpload({
  value,
  onChange,
  kind = "image",
}: {
  value: string;
  onChange: (value: string) => void;
  kind?: "image" | "video";
  placeholder?: string;
  allowVideoProviders?: boolean;
}) {
  return (
    <MediaField value={value} onChange={onChange} video={kind === "video"} />
  );
}
