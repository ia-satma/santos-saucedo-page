import { useCmsMedia, mediaDefaults } from "@/lib/cmsMedia";
import { highFetchPriority } from "@/lib/teamPhotoSources";
import { useLanguage } from "@/contexts/LanguageContext";

type OfficePhotoKey = keyof typeof mediaDefaults.photos;

/** All placements resolve the same editable media catalog; no remote pCloud dependencies. */
export function OfficePhotography({ photo, className = "", eager = false, sizes = "(min-width: 1024px) 44vw, 90vw" }: {
  photo: OfficePhotoKey;
  className?: string;
  sizes?: string;
  eager?: boolean;
}) {
  const media = useCmsMedia();
  const { language } = useLanguage();
  const image = media.photos[photo];
  const description = media.officeGallery.find(item => item.photo === photo);
  return <img
    src={image.url}
    srcSet={image.smallUrl && image.smallUrl !== image.url ? `${image.smallUrl} 768w, ${image.url} 1536w` : undefined}
    sizes={sizes}
    alt={(language === "es" ? description?.altEs : description?.alt) || "Santos & Saucedo"}
    width={1536} height={1024} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? highFetchPriority : {})}
    className={`ss-photo block h-auto w-full ${className}`}
  />;
}

export function OfficePhotoPair({ photos, className = "" }: { photos: [OfficePhotoKey, OfficePhotoKey]; className?: string }) {
  return <div className={`grid grid-cols-2 gap-4 md:gap-6 ${className}`}>
    {photos.map(photo => <OfficePhotography key={photo} photo={photo} className="aspect-[4/3] !h-full object-cover" sizes="(min-width: 1024px) 30vw, 45vw" />)}
  </div>;
}
