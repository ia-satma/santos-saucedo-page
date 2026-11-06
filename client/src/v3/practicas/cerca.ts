/* Arranque diferido de las láminas: three.js, el script de cada lámina y sus dibujos se piden solo
   cuando la lámina está a una pantalla o menos de la ventana, nunca al cargar la página (el teléfono
   no descarga ~200 kB de dibujo y biblioteca para una lámina que quizá no verá).
   cerca(el, fn): llama fn una sola vez al acercarse el elemento y devuelve la limpieza. Sin
   IntersectionObserver, fn corre de inmediato. */
export function cerca(el: Element, fn: () => void, margen = "100% 0px 100% 0px"): () => void {
  if (typeof IntersectionObserver === "undefined") {
    fn();
    return () => {};
  }
  let hecho = false;
  const io = new IntersectionObserver((entradas) => {
    if (hecho || !entradas.some((e) => e.isIntersecting)) return;
    hecho = true;
    io.disconnect();
    fn();
  }, { rootMargin: margen });
  io.observe(el);
  return () => io.disconnect();
}
