/* ===== «Nuestra prioridad» (pieza mk-prioridad del módulo «marca» de la demo v3), para React =====
   Port de la parte 3 de v3/modules/marca/script.js. Se dispara una vez, sin sticky, cuando el lema se ve
   casi completo (por encima del último 22 % de la pantalla):
   0 ms las dos S se separan y se enciende la de arriba con la primera frase; 1000 ms la de abajo con la
   segunda; 2000 ms se unen; 2860 ms queda una sola §. Modo Mario (html.rm / 'rmchange'): el estado final.
   Red de seguridad de la demo: mientras no se haya disparado, cada 300 ms se compara la posición del scroll
   y, solo si cambió, se mide el lema (Chrome sin pantalla a veces no avisa al IntersectionObserver).
   La clase mk-prioridad--enlaza (la franja termina en azul noche) se pone si la sigue una sección .sobre-azul. */

export function initPrioridad(sec: HTMLElement): () => void {
  const w = window, d = document, html = d.documentElement;
  const lema = sec.querySelector<HTMLElement>(".mk-prioridad__lema") || sec;
  const isRM = () => html.classList.contains("rm");
  const undo: (() => void)[] = [];
  let relojes: number[] = [];
  let jugada = false;
  let io: IntersectionObserver | null = null;
  let revisor = 0;
  let yR: number | null = null, hR = 0;

  function dejarDeMirar() {
    if (io) { io.disconnect(); io = null; }
    if (revisor) { w.clearInterval(revisor); revisor = 0; }
  }
  function final() {
    dejarDeMirar();
    relojes.forEach((t) => w.clearTimeout(t)); relojes = [];
    sec.classList.add("is-1", "is-2", "is-3", "is-hecho");
    jugada = true;
  }
  /* Si la siguiente sección visible es oscura (.sobre-azul), la franja termina en su azul: un solo capítulo. */
  function enlazar() {
    let n = sec.nextElementSibling as HTMLElement | null;
    while (n && (n.hidden || w.getComputedStyle(n).display === "none")) n = n.nextElementSibling as HTMLElement | null;
    sec.classList.toggle("mk-prioridad--enlaza", !!n && n.classList.contains("sobre-azul"));
  }
  function despues(ms: number, c: string) { relojes.push(w.setTimeout(() => sec.classList.add(c), ms)); }
  function jugar() {
    if (jugada) return;
    if (isRM()) { final(); return; }
    jugada = true;
    sec.classList.add("is-1");   // se separan; S de arriba + primera frase
    despues(1000, "is-2");       // S de abajo + segunda frase
    despues(2000, "is-3");       // se unen
    despues(2860, "is-hecho");   // una sola § entera
  }
  function listo(r: DOMRect, vh: number) {
    const lim = vh * 0.78, vis = Math.max(0, Math.min(r.bottom, lim) - Math.max(r.top, 0));
    return vis >= r.height * 0.74 || vis >= lim * 0.6;
  }
  function revisar() {
    if (d.hidden) return;
    const y = w.pageYOffset, vh = w.innerHeight;
    if (y === yR && vh === hR) return;
    yR = y; hR = vh;
    if (listo(lema.getBoundingClientRect(), vh)) { dejarDeMirar(); jugar(); }
  }

  enlazar();
  if (isRM() || sec.classList.contains("is-hecho")) final();
  else if ("IntersectionObserver" in w) {
    /* El lema debe verse casi entero por encima del último 22 % de la pantalla.
       (Se mira la proporción real: el aviso también llega al primer píxel de intersección.) */
    io = new IntersectionObserver((es) => {
      for (const e of es) {
        const rb = e.rootBounds;
        if (e.isIntersecting && (e.intersectionRatio >= 0.74 || (rb && e.intersectionRect.height >= rb.height * 0.6))) {
          dejarDeMirar(); jugar(); return;
        }
      }
    }, { rootMargin: "0px 0px -22% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    io.observe(lema);
    revisor = w.setInterval(revisar, 300);
  } else final();

  const alScroll = () => { yR = null; };
  const alModo = () => { if (isRM()) final(); };
  const alCargar = () => enlazar();
  w.addEventListener("scroll", alScroll, { passive: true });
  w.addEventListener("rmchange", alModo);
  w.addEventListener("load", alCargar);
  w.addEventListener("resize", alCargar);
  undo.push(() => {
    w.removeEventListener("scroll", alScroll);
    w.removeEventListener("rmchange", alModo);
    w.removeEventListener("load", alCargar);
    w.removeEventListener("resize", alCargar);
  });
  if ("MutationObserver" in w) {
    const mo = new MutationObserver(() => { alModo(); enlazar(); });
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    undo.push(() => mo.disconnect());
  }

  return () => {
    dejarDeMirar();
    relojes.forEach((t) => w.clearTimeout(t)); relojes = [];
    // si se desmontó a medio juego (StrictMode, navegación), la próxima vez se repite desde el reposo
    if (!sec.classList.contains("is-hecho")) sec.classList.remove("is-1", "is-2", "is-3");
    while (undo.length) undo.pop()!();
  };
}
