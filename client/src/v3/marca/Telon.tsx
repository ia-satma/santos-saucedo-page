// Portada «telón» de la demo v3 (la § que abre el video del dron). Provisional: la termina el módulo marca.
import type { V3Lang } from "@/v3/shared";

export default function Telon({ lang }: { lang: V3Lang }) {
  return (
    <header className="sh-portada" aria-label={lang === "es" ? "Portada" : "Cover"} style={{ minHeight: "100svh" }} />
  );
}
