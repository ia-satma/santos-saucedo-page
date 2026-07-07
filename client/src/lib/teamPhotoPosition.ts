const teamPhotoObjectPositions: Record<string, string> = {
  "rubi-quintanilla-martinez": "62% 0%",
};

export function getTeamPhotoObjectPosition(slug?: string | null): string {
  if (!slug) return "50% 0%";
  return teamPhotoObjectPositions[slug] || "50% 0%";
}
