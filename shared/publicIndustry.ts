import type { IndustryGroup } from "./schema";

/** Public industry records are published unless explicitly retired. */
export function isPublicIndustryGroup(item: Pick<IndustryGroup, "published">): boolean {
  return item.published !== false;
}

export function publicIndustryGroups<T extends Pick<IndustryGroup, "published">>(groups: T[]): T[] {
  return groups.filter(isPublicIndustryGroup);
}
