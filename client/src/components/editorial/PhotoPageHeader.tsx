import { useCmsMedia, mediaDefaults } from "@/lib/cmsMedia";
import { highFetchPriority } from "@/lib/teamPhotoSources";
import { useState } from "react";

type OfficePhotoKey = keyof typeof mediaDefaults.photos;

// Width descriptors must match the actual office files, not a single assumed size.
const PHOTO_WIDTHS: Partial<Record<OfficePhotoKey, [number, number]>> = {
  fachada: [1159, 768],
  recepcion: [1522, 761],
  recepcionBanda: [1522, 761],
  escultura: [1024, 640],
};

type PhotoPageHeaderProps = {
  photo?: OfficePhotoKey;
  src?: string;
  smallSrc?: string;
  position?: string;
};

/**
 * Decorative image layer for the principal-section headers. CMS photo URLs stay
 * live, while the source signature ensures a failed old URL never hides a new one.
 */
export function PhotoPageHeader({ photo, src, smallSrc, position = "50% 48%" }: PhotoPageHeaderProps) {
  const media = useCmsMedia();
  const image = photo ? media.photos[photo] : undefined;
  const imageUrl = src || image?.url;
  const smallUrl = smallSrc || image?.smallUrl;
  const [largeWidth, smallWidth] = photo ? PHOTO_WIDTHS[photo] ?? [1536, 768] : [1536, 768];
  const sourceSignature = `${imageUrl || ""}|${smallUrl || ""}`;
  const [failedSource, setFailedSource] = useState("");
  const imageFailed = failedSource === sourceSignature;

  return (
    <div className="ss-photo-page-hero__media" aria-hidden="true">
      {imageUrl && !imageFailed && (
        <img
          key={sourceSignature}
          className="ss-photo-page-hero__image"
          alt=""
          src={imageUrl}
          srcSet={smallUrl && smallUrl !== imageUrl ? `${smallUrl} ${smallWidth}w, ${imageUrl} ${largeWidth}w` : undefined}
          sizes="100vw"
          width={largeWidth}
          height={1024}
          loading="eager"
          decoding="async"
          style={{ objectPosition: position }}
          onError={() => setFailedSource(sourceSignature)}
          {...highFetchPriority}
        />
      )}
    </div>
  );
}
