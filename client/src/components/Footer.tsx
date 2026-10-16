import Footer26 from "@/components/home26/Footer26";

// Envoltorio: las páginas públicas siguen importando "@/components/Footer"
// y reciben el pie de la marca 2026. El pie anterior queda en el historial de git.
// Acepta props antiguas y las ignora para no romper ningún import.
// CookieBanner va con el pie: escucha "ss:open-cookie-preferences" (botón del pie)
// y muestra el aviso de consentimiento a quien entra por una página interna.
// Home monta Footer26 y CookieBanner por su cuenta, sin este envoltorio: no se duplica.
// `localized`: el pie de las páginas internas sigue el idioma elegido (10 idiomas).
export default function Footer(_props: Record<string, unknown> = {}) {
  return (
    <>
      <Footer26 localized />
    </>
  );
}
