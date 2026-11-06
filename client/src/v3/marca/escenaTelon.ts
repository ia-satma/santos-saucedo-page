/* Telón de la portada · módulo «marca» de la demo v3 (pieza 2), con la frase que rota y la pausa
   del armazón de la demo (shell.js). Mismo guion, tiempos y curvas que la demo aprobada:
   - La § oficial es una ventana a la escena del dron; con el scroll crece hacia su nudo más grueso
     hasta que el trazo cubre la pantalla, como un telón que se abre. Abierta la escena, la § vuelve
     como marca de agua al 12 % y llegan el logo, la frase que cambia y, al final, la firma.
   - Un solo requestAnimationFrame; lee getBoundingClientRect y escribe solo transform. Duerme fuera
     de pantalla, sin scroll o con la pestaña oculta.
   - Modo Mario (html.rm): el mismo guion por fundidos, sin acercamiento, sin video y sin frase que
     cambie sola. El envoltorio .mk-js lleva también .rm (demo.css lo espera dentro de .v3).
   initTelon(raíz) → api; api.destroy() deshace todo (listeners, observadores, rAF, relojes). */

const NAT_W = 1409, NAT_H = 2160;

/* Rectángulo más grande de cada proporción (ancho/alto) que cabe COMPLETO dentro del trazo de la §,
   medido sobre el canal alfa del PNG oficial (px del PNG): [proporción, centro x, centro y, ancho, alto].
   Las pantallas apaisadas entran por el nudo izquierdo; las verticales, por el derecho. */
const RECTS: [number, number, number, number, number][] = [
  [0.42, 296, 880, 249.1, 593.1],
  [0.46, 1144, 1200, 267.8, 582.1],
  [0.50, 1152, 1208, 283.7, 567.4],
  [0.56, 1160, 1216, 305.4, 545.3],
  [0.62, 1168, 1224, 323.2, 521.2],
  [0.75, 1176, 1208, 337.4, 449.9],
  [1.00, 1184, 1184, 352.2, 352.2],
  [1.25, 1192, 1192, 371.9, 297.5],
  [1.45, 304, 760, 391.3, 269.9],
  [1.60, 312, 760, 415.9, 259.9],
  [1.78, 328, 776, 445.0, 250.0],
  [2.00, 344, 776, 480.1, 240.0],
  [2.40, 360, 784, 537.7, 224.0],
];
const MARGEN = 1.06;   // el trazo cubre la pantalla con 6 % de sobra
const K = 8;           // sobre-maquetación del marco (bordes nítidos y sin franjas a 20×)
const V_ALTO = 0.70;   // la § mide 70 % del alto de la escena al empezar…
const V_ANCHO = 0.78;  // …sin pasar del 78 % del ancho (teléfono)

/* Guion, en fracción del recorrido sticky */
const T_Z0 = 0.02, T_Z1 = 0.40;       // acercamiento
const T_F_ON = 0.60, T_F_OFF = 0.54;  // la firma aparece / se retira (histéresis)
/* Modo Mario: sin acercamiento; fundidos según la posición de scroll */
const R_ON = 0.14, R_OFF = 0.08, R_F_ON = 0.42, R_F_OFF = 0.36;

/* Frase que rota: tiempos de la demo */
const FRASE_PRIMERA = 2500, FRASE_PASO = 3200, FRASE_VUELTAS = 3;
const EASE = { out: "cubic-bezier(.16,1,.3,1)", inout: "cubic-bezier(.65,0,.35,1)", in: "cubic-bezier(.7,0,.84,0)" };

const clamp = (v: number, a: number, b: number) => (v < a ? a : v > b ? b : v);
const tramo = (p: number, a: number, b: number) => clamp((p - a) / (b - a), 0, 1);
const sinInOut = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t);
/* Seguimiento con frenado exponencial: absorbe los saltos de la rueda del ratón. */
function sigue(actual: number, meta: number, dt: number, tau: number) {
  const v = actual + (meta - actual) * (1 - Math.exp(-dt / tau));
  return Math.abs(meta - v) < 0.0004 ? meta : v;
}

export interface TelonOptions {
  /** Palabras que rotan en la frase (la primera es la que trae el texto del panel). null: frase fija. */
  words: string[] | null;
  /** Empieza en pausa (el visitante lo pausó en otra visita, o ahorra datos). */
  paused?: boolean;
  /** El navegador rechazó reproducir el video (no por una pausa): el botón pasa a «Reproducir». */
  onBlocked?: () => void;
}

export interface TelonApi {
  /** Pausa (o reanuda) el video y la frase: el botón de la portada. */
  pausa(on: boolean): void;
  /** Cambia las palabras que rotan (cambio de idioma o de la frase del panel) sin rehacer el telón:
      la portada se queda como está y la frase vuelve a empezar por la primera palabra. */
  palabras(nuevas: string[] | null): void;
  /** El video recibió (o cambió) su fuente: se reproduce si toca. */
  video(): void;
  destroy(): void;
}

export function initTelon(root: HTMLElement, opts: TelonOptions): TelonApi {
  const d = document, w = window, html = d.documentElement;
  const sec = root.querySelector<HTMLElement>(".mk-telon");
  const envoltorio = root.querySelector<HTMLElement>(".mk-js") || root;
  const escena = sec?.querySelector<HTMLElement>(".mk-telon__escena");
  const marco = sec?.querySelector<HTMLElement>(".mk-telon__marco");
  const medio = sec?.querySelector<HTMLElement>(".mk-telon__medio");
  if (!sec || !escena || !marco || !medio) return { pausa() {}, palabras() {}, video() {}, destroy() {} };
  const video = sec.querySelector<HTMLVideoElement>(".mk-telon__video");
  const agua = sec.querySelector<HTMLElement>(".mk-portada");
  const aguaSup = agua?.querySelector<HTMLElement>(".mk-mitad--sup") || null;

  /* ---------- Limpieza: todo lo que se enciende se apaga en destroy() ---------- */
  const limpiar: (() => void)[] = [];
  let vivo = true;
  const on = <T extends EventTarget>(t: T, ev: string, fn: EventListenerOrEventListenerObject, o?: AddEventListenerOptions | boolean) => {
    t.addEventListener(ev, fn, o);
    limpiar.push(() => t.removeEventListener(ev, fn, o));
  };

  /* ---------- Modo Mario ---------- */
  const mq = w.matchMedia ? w.matchMedia("(prefers-reduced-motion: reduce)") : null;
  // html.rm lo pone RmSync (App); su efecto puede correr después de este: se mira también el sistema
  let rm = html.classList.contains("rm") || !!mq?.matches;
  envoltorio.classList.toggle("rm", rm);

  // Estado de un montaje anterior (StrictMode, HMR): se empieza de cero
  sec.classList.remove("is-abierta", "is-cubre", "is-firma", "is-mueve");
  agua?.classList.remove("is-hecho");
  marco.removeAttribute("style");
  medio.removeAttribute("style");
  if (video && !video.paused && video.readyState >= 3) sec.classList.add("is-video");

  let pausado = !!opts.paused;

  /* =====================================================================
     Telón
     ===================================================================== */
  let G: { lnsf: number } | null = null, actual = 0, pintado = -1, abierta = false, firma = false, cubre = false;
  let recienVista = true, mueve = false, quieto = 0, visible = false;

  function medir() {
    if (rm || !escena || !marco || !medio) return;
    const vw = escena.clientWidth, vh = escena.clientHeight;
    if (!vw || !vh) return;
    const H0 = Math.min(vh * V_ALTO, vw * V_ANCHO * NAT_H / NAT_W), W0 = H0 * NAT_W / NAT_H;
    const mx = (vw - W0) / 2, my = (vh - H0) / 2;
    const asp = vw / vh;
    let r = RECTS[0];
    for (let i = 1; i < RECTS.length; i++) {
      if (Math.abs(Math.log(RECTS[i][0] / asp)) < Math.abs(Math.log(r[0] / asp))) r = RECTS[i];
    }
    const k = H0 / NAT_H;
    const sf = MARGEN * Math.max(vw / (r[3] * k), vh / (r[4] * k));
    /* Punto fijo del acercamiento: al escalar alrededor de él, el centro del rectángulo inscrito
       termina en el centro de la pantalla. Zoom puro, sin paneo. */
    const Lx = (sf * r[1] * k - W0 / 2) / (sf - 1);
    const Ly = (sf * r[2] * k - H0 / 2) / (sf - 1);
    G = { lnsf: Math.log(sf) };
    /* El marco se maqueta K veces más grande y se dibuja a escala s/K; el medio se contraescala
       para que la escena se quede quieta. */
    const px = mx - Lx * (K - 1), py = my - Ly * (K - 1);
    const ms = marco.style, ds = medio.style;
    ms.left = px + "px"; ms.top = py + "px"; ms.width = W0 * K + "px"; ms.height = H0 * K + "px";
    ms.transformOrigin = Lx * K + "px " + Ly * K + "px";
    ds.left = -px + "px"; ds.top = -py + "px"; ds.width = vw + "px"; ds.height = vh + "px";
    ds.transformOrigin = (Lx * K + px) + "px " + (Ly * K + py) + "px";
    pintado = -1;
    pintar(actual);
  }

  function abrir(si: boolean) {
    if (si === abierta) return;
    abierta = si;
    sec!.classList.toggle("is-abierta", si);
    /* Al cerrarse, la marca de agua vuelve a esperar: la próxima vez sus dos S encajan de nuevo. */
    if (!si && agua) agua.classList.remove("is-hecho");
    if (rm && si && agua) agua.classList.add("is-hecho");
    revisarVista();
  }
  /* La barra y la pausa pasan a blanco en cuanto la escena cubre casi toda la pantalla. */
  function cubrir(si: boolean) {
    if (si === cubre) return;
    cubre = si;
    sec!.classList.toggle("is-cubre", si);
  }
  function verFirma(si: boolean) {
    if (si === firma) return;
    firma = si;
    sec!.classList.toggle("is-firma", si);
  }

  function pintar(p: number) {
    if (!G || !marco || !medio) return;
    const z = sinInOut(tramo(p, T_Z0, T_Z1));
    const s = Math.exp(G.lnsf * z);
    /* La escena se acerca mucho menos que la ventana (de 1.08 a 1): se lee profundidad. */
    const prof = 1 + 0.08 * (1 - tramo(p, 0, T_Z1));
    const lleno = z >= 1;
    if (lleno) {
      marco.style.transform = "scale(" + 1 / K + ")";
      medio.style.transform = "scale(" + K + ")";
    } else {
      marco.style.transform = "scale(" + (s / K).toFixed(6) + ")";
      medio.style.transform = "scale(" + (K * prof / s).toFixed(6) + ")";
    }
    cubrir(z >= 0.86);
    abrir(lleno);
    verFirma(firma ? p > T_F_OFF : p >= T_F_ON);
  }

  function progreso() {
    const r = sec!.getBoundingClientRect();
    const total = r.height - escena!.clientHeight;
    return total > 0 ? clamp(-r.top / total, 0, 1) : 0;
  }
  /* Modo Mario: el mismo guion por fundidos, sin escalas. */
  function pintarRM() {
    if (!rm) return;
    const p = progreso();
    abrir(abierta ? p > R_OFF : p >= R_ON);
    cubrir(abierta);
    verFirma(firma ? p > R_F_OFF : p >= R_F_ON);
  }

  function tieneFuente() {
    return !!video && !!(video.currentSrc || video.getAttribute("src") || video.querySelector("source"));
  }
  function reproducir(si: boolean) {
    if (!video) return;
    if (si && !rm && !d.hidden && !pausado && tieneFuente()) {
      video.muted = true;
      const pr = video.play();
      if (pr && pr.catch) pr.catch((err: unknown) => {
        const n = (err as { name?: string } | null)?.name;
        if (vivo && n !== "AbortError" && !pausado && !rm) opts.onBlocked?.();
      });
    } else if (!video.paused) video.pause();
  }
  if (video) {
    on(video, "playing", () => { sec.classList.add("is-video"); despertar(); });
    // Safari en iOS no reproduce solo sin el atributo muted (React no lo escribe)
    video.muted = true; video.defaultMuted = true; video.setAttribute("muted", "");
  }
  /* La marca de agua queda en una sola pieza (sin costura) al terminar de encajar. */
  if (aguaSup) on(aguaSup, "animationend", () => { if (abierta) agua!.classList.add("is-hecho"); });

  function cuadroTelon(dt: number) {
    const meta = progreso();
    actual = recienVista ? meta : sigue(actual, meta, dt, 90);
    recienVista = false;
    if (actual !== pintado) { pintado = actual; pintar(actual); }
    if (actual !== meta || performance.now() - ultimoScroll < 120) {
      quieto = 0;
      if (!mueve) { mueve = true; sec!.classList.add("is-mueve"); }
    } else if (mueve) {
      quieto += dt;
      if (quieto > 140) { mueve = false; sec!.classList.remove("is-mueve"); }
    }
    /* Mientras el video corre y la portada se ve, el bucle sigue despierto (README de la demo:
       sin un cuadro del hilo principal, Chrome no actualiza los IntersectionObserver tras un salto). */
    return actual !== meta || mueve || (!!video && !video.paused);
  }
  function alVer(si: boolean) {
    if (!si) { recienVista = true; mueve = false; sec!.classList.remove("is-mueve"); }
    reproducir(si);
  }
  function modo(si: boolean) {
    if (si) {
      marco!.removeAttribute("style"); medio!.removeAttribute("style");
      sec!.classList.remove("is-mueve");
      mueve = false; G = null;
      abierta = sec!.classList.contains("is-abierta"); firma = sec!.classList.contains("is-firma"); cubre = sec!.classList.contains("is-cubre");
      if (abierta && agua) agua.classList.add("is-hecho");
      reproducir(false);
      pintarRM();
    } else {
      recienVista = true;
      medir();
      if (visible) reproducir(true);
    }
  }

  /* =====================================================================
     Motor: un solo rAF
     ===================================================================== */
  let raf = 0, tPrev = 0, ultimoScroll = -1e9;
  const vivoTelon = () => !rm && !!G;
  function despertar() {
    if (!vivo || raf || d.hidden || !visible || !vivoTelon()) return;
    raf = w.requestAnimationFrame(cuadro);
  }
  function cuadro(t: number) {
    raf = 0;
    if (!vivo) return;
    const dt = tPrev ? Math.min(64, t - tPrev) : 16.7;
    tPrev = t;
    let ocupado = false;
    if (visible && vivoTelon() && cuadroTelon(dt)) ocupado = true;
    if ((ocupado || t - ultimoScroll < 200) && !d.hidden && visible && vivoTelon()) raf = w.requestAnimationFrame(cuadro);
    else tPrev = 0;
  }
  limpiar.push(() => { if (raf) w.cancelAnimationFrame(raf); raf = 0; });

  if ("IntersectionObserver" in w) {
    const vigia = new IntersectionObserver((es) => {
      es.forEach((e) => {
        const antes = visible; visible = e.isIntersecting;
        if (antes !== visible) alVer(visible);
      });
      despertar();
    }, { rootMargin: "12% 0px 12% 0px" });
    vigia.observe(sec);
    limpiar.push(() => vigia.disconnect());
  } else visible = true;

  /* ---------- Cambio de modo en vivo ---------- */
  /* Se guarda continuamente la última posición de scroll y la geometría del telón (240vh en
     movimiento, 170vh en modo Mario) y se calcula un destino absoluto, como en la demo. */
  let ultimoY = w.pageYOffset, geo: { top: number; alto: number } | null = null, rafConfirma = 0;
  limpiar.push(() => { if (rafConfirma) w.cancelAnimationFrame(rafConfirma); rafConfirma = 0; });
  function geometria() { geo = { top: sec!.getBoundingClientRect().top + w.pageYOffset, alto: sec!.offsetHeight }; }
  function cambiarRM(si: boolean) {
    if (si === rm) return;
    const Y = ultimoY, antes = geo;
    rm = si;
    envoltorio.classList.toggle("rm", si);
    modo(si);
    videoSegunRM();
    if (rm) detener(); else { vueltas = 0; arrancar(true); }
    let destino = Y, dentro = false;
    if (antes) {
      const nuevo = sec!.offsetHeight;
      if (Y >= antes.top + antes.alto) destino += nuevo - antes.alto;   // ya la pasó: compensar la diferencia de alto
      else if (Y > antes.top) { destino = antes.top; dentro = true; }    // estaba dentro: al principio de la sección
    }
    geometria();
    if (Math.abs(destino - w.pageYOffset) > 1) w.scrollTo(0, destino);
    ultimoY = w.pageYOffset;
    /* Dentro del telón se confirma el destino unos cuadros después (el anclaje del navegador). */
    if (dentro) {
      let veces = 0;
      if (rafConfirma) w.cancelAnimationFrame(rafConfirma);
      const confirmar = () => {
        rafConfirma = 0;
        if (!vivo || ++veces > 4) return;
        rafConfirma = w.requestAnimationFrame(() => {
          rafConfirma = 0;
          if (!vivo) return;
          if (Math.abs(w.pageYOffset - destino) > 1) { w.scrollTo(0, destino); ultimoY = w.pageYOffset; }
          confirmar();
        });
      };
      confirmar();
    }
    despertar();
  }

  /* =====================================================================
     Frase que alterna (shell.js de la demo): solo con la portada abierta y a la vista,
     tres vueltas y descansa en la primera palabra. En modo Mario no cambia sola.
     ===================================================================== */
  const tag = sec.querySelector<HTMLElement>(".sh-tag[data-frase]");
  const slot = tag?.querySelector<HTMLElement>(".sh-tag__slot") || null;
  const pal = tag?.querySelector<HTMLElement>(".sh-tag__w") || null;
  let words = opts.words && opts.words.length ? opts.words : null;
  let W: number[] = [], idx = 0, vueltas = 0, timer = 0, enVista = false, corriendo = false, portadaVista = true;
  const animaciones = new Set<Animation>();
  function anima(el: HTMLElement, k: Keyframe[], o: KeyframeAnimationOptions) {
    const a = el.animate(k, o);
    animaciones.add(a);
    return a.finished.then(() => { animaciones.delete(a); });
  }
  function medirFrase() {
    if (!tag || !slot || !words) return;
    const m = d.createElement("b");
    m.className = "sh-tag__w"; m.style.cssText = "position:absolute;visibility:hidden;left:-9999px;translate:none";
    tag.appendChild(m);
    W = words.map((t) => { m.textContent = t; return Math.ceil(m.getBoundingClientRect().width) + 2; });
    m.remove();
    slot.style.width = W[idx] + "px";
  }
  /* Al terminar un cambio se retiran sus animaciones: la palabra vuelve a sus estilos de siempre
     (la demo dejaba fijo el espaciado final de .3em, más ancho que el de la tipografía actual,
     .26em, y la palabra se salía de su hueco y tocaba la siguiente). */
  function retirar(...as: Animation[]) { as.forEach((a) => { a.cancel(); animaciones.delete(a); }); }
  /* Cambio de palabra sin hueco: la palabra que sale y la que entra se cruzan (la nueva sube
     mientras la anterior se va) y el ancho del espacio se ajusta al mismo tiempo. Antes la
     palabra se apagaba, el espacio cambiaba de ancho vacío y luego aparecía la nueva:
     medio segundo sin palabra en cada cambio. En modo Mario solo se funden, sin moverse. */
  let entrante: HTMLElement | null = null;
  function quitarEntrante() { if (entrante) { entrante.remove(); entrante = null; } if (slot) slot.style.clipPath = ""; }
  function swap(i: number): Promise<void> {
    const txt = words![i];
    if (!pal || !slot || !tag) return Promise.resolve();
    if (!pal.animate) { pal.textContent = txt; slot.style.width = W[i] + "px"; return Promise.resolve(); }
    quitarEntrante();
    const nuevo = pal.cloneNode(false) as HTMLElement;
    nuevo.textContent = txt;
    nuevo.setAttribute("aria-hidden", "true");
    slot.appendChild(nuevo);
    entrante = nuevo;
    /* Rodillo: la palabra que sale sube y la nueva entra desde abajo; el espacio recorta solo
       arriba y abajo, así nunca se ven dos palabras encimadas. El ancho se adelanta cuando la
       nueva es más larga y espera a que salga la anterior cuando es más corta, para que ninguna
       toque «Derecho» ni «para empresas». */
    const D = rm ? 560 : 760, dy = rm ? "0em" : "1em", crece = W[i] >= (parseFloat(slot.style.width) || 0);
    if (!rm) slot.style.clipPath = "inset(0 -100vw 0 -100vw)";
    const desde = slot.style.width;
    slot.style.width = W[i] + "px"; // el ancho final queda puesto; la animación solo cubre el trayecto
    const aw = slot.animate([{ width: desde }, { width: W[i] + "px" }],
      { duration: D * 0.62, delay: crece ? D * 0.06 : D * 0.3, easing: EASE.inout, fill: "backwards" });
    const aOut = pal.animate([{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-" + dy + ")" }],
      { duration: D * 0.5, easing: EASE.in, fill: "forwards" });
    const aIn = nuevo.animate([{ opacity: 0, transform: "translateY(" + dy + ")" }, { opacity: 1, transform: "translateY(0)" }],
      { duration: D * 0.68, delay: D * 0.32, easing: EASE.out, fill: "both" });
    [aw, aOut, aIn].forEach((a) => animaciones.add(a));
    return Promise.all([aw.finished, aOut.finished, aIn.finished]).then(() => {
      slot.style.width = W[i] + "px";
      pal.textContent = txt;
      retirar(aw, aOut, aIn);
      quitarEntrante();
    });
  }
  function paso() {
    if (!vivo || !words) return;
    if (!enVista || pausado) { corriendo = false; return; }
    const sig = (idx + 1) % words.length;
    if (sig === 0) vueltas++;
    swap(sig).then(() => {
      if (!vivo) return;
      idx = sig;
      if (vueltas >= FRASE_VUELTAS && idx === 0) { corriendo = false; return; }
      timer = w.setTimeout(paso, FRASE_PASO);
    }, () => {});
  }
  function arrancar(primera?: boolean) {
    if (!words || corriendo || pausado || !enVista || rm) return;
    corriendo = true; w.clearTimeout(timer); timer = w.setTimeout(paso, primera ? FRASE_PRIMERA : FRASE_PASO);
  }
  function detener() {
    w.clearTimeout(timer); corriendo = false;
    // Un cambio a medias se corta: la palabra vuelve entera a la primera
    animaciones.forEach((a) => a.cancel()); animaciones.clear(); quitarEntrante();
    if (words && pal && slot && (idx !== 0 || pal.textContent !== words[0])) { idx = 0; pal.textContent = words[0]; slot.style.width = W[0] + "px"; }
  }
  function revisarVista() {
    const antes = enVista;
    enVista = portadaVista && abierta;
    if (enVista && !antes) { vueltas = 0; arrancar(true); } else if (!enVista && antes) detener();
  }
  limpiar.push(() => {
    w.clearTimeout(timer);
    animaciones.forEach((a) => a.cancel());
    animaciones.clear();
    quitarEntrante();
  });
  if (words && pal) {
    pal.textContent = words[0];
    medirFrase();
    if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => { if (vivo) { medirFrase(); arrancar(true); } });
    if ("IntersectionObserver" in w) {
      const io = new IntersectionObserver((es) => {
        es.forEach((e) => { portadaVista = e.isIntersecting; revisarVista(); });
      }, { threshold: 0.01 });
      io.observe(sec);
      limpiar.push(() => io.disconnect());
    }
  }

  /* ---------- Pausa (video y frase, un solo control) ---------- */
  function setPausa(si: boolean) {
    pausado = si;
    sec!.setAttribute("data-pausa", si ? "1" : "0");
    if (si) { if (video && !video.paused) video.pause(); detener(); }
    else { reproducir(visible); vueltas = 0; arrancar(); }
  }
  /* En modo Mario el video queda quieto (oculto; se ve la foto fija): nada se mueve solo. */
  function videoSegunRM() {
    if (!video) return;
    if (rm) { if (!video.paused) video.pause(); } else reproducir(visible);
  }

  /* ---------- Eventos de la página ---------- */
  on(w, "scroll", () => {
    ultimoScroll = performance.now(); ultimoY = w.pageYOffset;
    if (rm) pintarRM();
    despertar();
  }, { passive: true });
  on(w, "resize", () => {
    medir(); medirFrase();
    geometria(); ultimoScroll = performance.now(); despertar();
  });
  on(w, "load", () => { medir(); geometria(); despertar(); });
  on(d, "visibilitychange", () => {
    if (d.hidden) {
      if (raf) w.cancelAnimationFrame(raf);
      raf = 0; tPrev = 0;
      reproducir(false);
      detener();
    } else {
      if (visible) reproducir(true);
      despertar();
      if (enVista) arrancar(true);
    }
  });
  on(w, "rmchange", (e: Event) => {
    const det = (e as CustomEvent<{ rm?: boolean }>).detail;
    cambiarRM(det && typeof det.rm === "boolean" ? det.rm : html.classList.contains("rm"));
  });
  if ("MutationObserver" in w) {
    // Por si alguien cambia la clase sin disparar el evento
    const mo = new MutationObserver(() => cambiarRM(html.classList.contains("rm")));
    mo.observe(html, { attributes: true, attributeFilter: ["class"] });
    limpiar.push(() => mo.disconnect());
  }

  /* ---------- Arranque ---------- */
  sec.setAttribute("data-pausa", pausado ? "1" : "0");
  /* Se pinta ya en la posición de scroll actual (un montaje a media portada no parte de cerrado) */
  actual = progreso();
  medir();
  if (rm) pintarRM();
  geometria();
  ultimoY = w.pageYOffset;
  despertar();

  return {
    pausa(si: boolean) { if (vivo && si !== pausado) setPausa(si); },
    palabras(nuevas: string[] | null) {
      if (!vivo || !pal || !slot) return;
      const lista = nuevas && nuevas.length ? nuevas : null;
      if ((lista ? lista.join("|") : "") === (words ? words.join("|") : "")) return;
      detener();
      words = lista;
      idx = 0; vueltas = 0;
      if (!words) return;
      pal.textContent = words[0];
      medirFrase();
      if (enVista) arrancar(true);
    },
    video() { if (vivo) reproducir(visible); },
    destroy() {
      vivo = false;
      limpiar.forEach((f) => { try { f(); } catch { /* nada */ } });
      limpiar.length = 0;
      if (video && !video.paused) video.pause();
    },
  };
}
