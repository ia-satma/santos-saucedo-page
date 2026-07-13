const teamPhotoObjectPositions: Record<string, string> = {
  "rubi-quintanilla-martinez": "62% 0%",
  // 2026 presentation founder photos are square (652x652) with more headroom
  // above the head than the old rectangular headshots. In the very wide
  // expanded hover panel (Socios grid), the default top-anchor (Y 0%) leaves
  // too much of that headroom visible and pushes the face down. Nudging Y
  // down trims the excess background above the head so the face reads higher.
  "mario-saucedo-montemayor": "50% 22%",
  "enrique-santos-guzman": "50% 22%",
  "enrique-santos-arce": "50% 22%",
  "mario-saucedo-rodriguez": "50% 22%",
};

export function getTeamPhotoObjectPosition(slug?: string | null): string {
  if (!slug) return "50% 0%";
  return teamPhotoObjectPositions[slug] || "50% 0%";
}
