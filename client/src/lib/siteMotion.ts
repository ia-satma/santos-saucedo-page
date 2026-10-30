// Movimiento del sitio (sistema «Folio», ss26.css): bloques que suben al aparecer ([data-reveal]),
// fotos que se abren de abajo hacia arriba ([data-curtain]), filetes que se dibujan ([data-trazo]),
// titulares cuyas palabras suben desde una máscara ([data-lineas]) y paneles que entran al cruzar
// el viewport. Las imágenes del contenido reciben además un desplazamiento parallax muy corto.
// Se marca con el atributo data-in (no con una clase): React reescribe className al cambiar de
// estado y borraría la marca. Los observadores cubren todo el sitio; las páginas que llegan después
// (SPA) se recogen con un MutationObserver.
// Con "reducir movimiento" o sin IntersectionObserver no se activa y todo se ve desde el inicio.
const SELECTOR = ":is([data-reveal], [data-curtain], [data-trazo], [data-lineas]):not([data-in])";
const PANEL_SELECTOR = "main > section, main > [data-testid^=\"section-\"], main [data-testid^=\"section-\"], footer.ss26";
const IMAGE_SELECTOR = "main img:not([data-no-parallax])";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

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

  const panels = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-scroll-in", "");
        panels.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -14% 0px", threshold: 0.08 },
  );

  const parallaxElements = new Set<HTMLElement>();
  let parallaxFrame = 0;
  const updateParallax = () => {
    parallaxFrame = 0;
    const viewport = window.innerHeight || 1;
    parallaxElements.forEach((image) => {
      if (!image.isConnected) {
        parallaxElements.delete(image);
        return;
      }
      const rect = image.getBoundingClientRect();
      const span = Math.max(viewport + rect.height, 1);
      const center = rect.top + rect.height / 2;
      const progress = clamp((center - viewport / 2) / (span / 2), -1, 1);
      image.style.setProperty("--ss-parallax-y", `${Math.round(progress * -14)}px`);
    });
  };
  const requestParallax = () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateParallax);
  };
  window.addEventListener("scroll", requestParallax, { passive: true });
  window.addEventListener("resize", requestParallax, { passive: true });

  const watchPanels = (root: ParentNode) => {
    const candidates: Element[] = [];
    if (root instanceof Element && root.matches(PANEL_SELECTOR)) candidates.push(root);
    root.querySelectorAll(PANEL_SELECTOR).forEach((el) => candidates.push(el));
    for (const panel of candidates) {
      if (panel.hasAttribute("data-scroll-panel")) continue;
      panel.setAttribute("data-scroll-panel", "");
      const siblings = panel.parentElement?.querySelectorAll(":scope > section, :scope > [data-testid^=\"section-\"]");
      const index = siblings ? Array.from(siblings).indexOf(panel) : 0;
      if (panel instanceof HTMLElement) panel.style.setProperty("--scroll-index", String(Math.max(index, 0)));
      panels.observe(panel);
    }
  };

  const watchImages = (root: ParentNode) => {
    const candidates: Element[] = [];
    if (root instanceof Element && root.matches(IMAGE_SELECTOR)) candidates.push(root);
    root.querySelectorAll(IMAGE_SELECTOR).forEach((el) => candidates.push(el));
    for (const image of candidates) {
      if (!(image instanceof HTMLElement)) continue;
      image.setAttribute("data-scroll-parallax", "");
      parallaxElements.add(image);
    }
    requestParallax();
  };

  const watch = (root: ParentNode) => {
    root.querySelectorAll(SELECTOR).forEach((el) => io.observe(el));
    watchPanels(root);
    watchImages(root);
  };

  document.documentElement.classList.add("ss-motion");
  watch(document);
  new MutationObserver((records) => {
    for (const record of records) {
      record.addedNodes.forEach((node) => {
        if (!(node instanceof Element)) return;
        if (node.matches(SELECTOR)) io.observe(node);
        if (node.matches(PANEL_SELECTOR)) watchPanels(node);
        if (node.matches(IMAGE_SELECTOR)) watchImages(node);
        watch(node);
      });
    }
  }).observe(document.body, { childList: true, subtree: true });
}
