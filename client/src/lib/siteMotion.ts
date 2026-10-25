// Movimiento del sitio (sistema «Folio», ss26.css): bloques que suben al aparecer ([data-reveal]),
// fotos que se abren de abajo hacia arriba ([data-curtain]), filetes que se dibujan ([data-trazo])
// y titulares cuyas palabras suben desde una máscara ([data-lineas]), una sola vez cada uno.
// Se marca con el atributo data-in (no con una clase): React reescribe className al cambiar de
// estado y borraría la marca. Un solo observador para
// todo el sitio; las páginas que llegan después (SPA) se recogen con un MutationObserver.
// Con "reducir movimiento" o sin IntersectionObserver no se activa y todo se ve desde el inicio.
const SELECTOR = ":is([data-reveal], [data-curtain], [data-trazo], [data-lineas]):not([data-in])";

export function initSiteMotion() {
  if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-in", "");
        io.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px" },
  );
  const watch = (root: ParentNode) => root.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));

  document.documentElement.classList.add("ss-motion");
  watch(document);
  new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(SELECTOR)) io.observe(node);
        watch(node);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
}
