/* Módulo «industrias» (in-) de la demo v3, de modules/industrias/script.js.
   La foto y el índice siguen a la industria que pasa por el centro de la pantalla.
   En tableta y teléfono, cada foto se asienta una vez al llegar. El Modo Mario lo resuelve la hoja de estilos.
   Cambio respecto a la demo: la foto fija queda bajo el encabezado del sitio (Header26); su alto lo da
   la hoja (--in-top = --ss-header-h), así que ya no se mide la barra fija de la demo. */

export function initIndustrias(root: HTMLElement): () => void {
  const html = document.documentElement;
  const arts = Array.from(root.querySelectorAll<HTMLElement>(".in-art"));
  const fotos = Array.from(root.querySelectorAll<HTMLElement>(".in-foto"));
  const idx = Array.from(root.querySelectorAll<HTMLAnchorElement>(".in-indice a"));
  const limpiar: Array<() => void> = [];
  let act = -1;

  function poner(i: number) {
    if (i === act || i < 0) return;
    act = i;
    fotos.forEach((f, k) => f.classList.toggle("is-on", k === i));
    idx.forEach((a, k) => {
      a.classList.toggle("is-on", k === i);
      if (k === i) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
    arts.forEach((a, k) => a.classList.toggle("is-on", k === i));
  }

  /* alto del encabezado del sitio: la foto se queda justo debajo de él */
  const arriba = () => parseFloat(getComputedStyle(root).getPropertyValue("--in-top")) || 68;

  poner(0);
  root.classList.add("in-js");

  if ("IntersectionObserver" in window) {
    const centro = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) poner(+((e.target as HTMLElement).dataset.i || 0)); });
    }, { rootMargin: "-50% 0px -50% 0px" });
    arts.forEach((a) => centro.observe(a));

    const llega = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-vista"); llega.unobserve(e.target); } });
    }, { threshold: 0.2 });
    arts.forEach((a) => llega.observe(a));
    limpiar.push(() => { centro.disconnect(); llega.disconnect(); });
  } else {
    arts.forEach((a) => a.classList.add("is-vista"));
  }

  /* enlaces de la misma página (índice y cierre): desplazamiento sin cambiar de página ni de dirección */
  function ir(t: HTMLElement) {
    const y = t.getBoundingClientRect().top + window.scrollY - arriba() + 1;
    window.scrollTo({ top: y, behavior: html.classList.contains("rm") ? "auto" : "smooth" });
  }
  root.querySelectorAll<HTMLAnchorElement>(".in-indice a, .in-cierre a").forEach((a) => {
    const alClic = (e: MouseEvent) => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
      const t = document.getElementById((a.getAttribute("href") || "").slice(1));
      if (!t) return;
      e.preventDefault();
      ir(t);
    };
    a.addEventListener("click", alClic);
    limpiar.push(() => a.removeEventListener("click", alClic));
  });

  return () => { limpiar.forEach((f) => f()); };
}
