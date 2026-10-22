// A new filename keeps browser caches and persistent responsive variants separate
// from the historical monochrome portrait, which remains untouched.
export const MARIO_PORTRAIT_SLUG = "mario-saucedo-rodriguez";
export const MARIO_PORTRAIT_FILE = `${MARIO_PORTRAIT_SLUG}-color`;
export const MARIO_PORTRAIT_URL = `/team_photos/${MARIO_PORTRAIT_FILE}.png`;

export function teamPhotoOwner(fileSlug: string): string {
  return fileSlug === MARIO_PORTRAIT_FILE ? MARIO_PORTRAIT_SLUG : fileSlug;
}
