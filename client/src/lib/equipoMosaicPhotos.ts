import { equipoPhotos } from "./equipoPhotos";

// Mosaico "Integrantes del equipo": WebP q80 sin metadatos junto a cada JPEG de
// attached_assets/pdf2026/equipo (~19 KB frente a ~105 KB). Los JPEG se conservan y
// lib/equipoPhotos los sigue listando; si faltara alguna variante, se usan los JPEG.
const equipoWebpModules = import.meta.glob("../../../attached_assets/pdf2026/equipo/*.webp", {
  eager: true,
  import: "default",
}) as Record<string, string>;

const equipoWebp: string[] = Object.keys(equipoWebpModules)
  .sort()
  .map((key) => equipoWebpModules[key]);

export const equipoMosaicPhotos: string[] =
  equipoWebp.length === equipoPhotos.length ? equipoWebp : equipoPhotos;
