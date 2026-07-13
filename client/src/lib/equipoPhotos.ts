// Anonymous team photos from the 2026 presentation deck's "Nuestro Equipo"
// page. No name mapping exists for these (see HANDOFF pendientes), so no
// identity is asserted for any specific photo — used purely as an unlabeled
// photo mosaic, matching how the presentation itself displays them.
const photoModules = import.meta.glob("../../../attached_assets/pdf2026/equipo/*.jpg", {
  eager: true,
  import: "default",
}) as Record<string, string>;

export const equipoPhotos: string[] = Object.keys(photoModules)
  .sort()
  .map((key) => photoModules[key]);
