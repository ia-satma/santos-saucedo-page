// Junta el CSS de la demo v3 en el mismo orden que su build.py y lo encierra en .v3
// para que no toque el resto del sitio. Uso: node script/v3-css.cjs <carpeta-demo-v3> <salida.css>
const fs = require('fs'), path = require('path');
const postcss = require('postcss');
const [,, V, OUT] = process.argv;
const MODS = ['marca', 'practicas', 'anatomia', 'figuras', 'filosofia', 'mapa', 'personas', 'industrias'];
const files = ['tokens.css', 'shell/shell.css', ...MODS.map(m => `modules/${m}/style.css`), 'shell/integracion.css', 'shell/paginas.css', 'shell/tipografia.css'];
const MOVE = /(\[data-(?:vista|seccion)[^\]]*\]|:not\(\[data-(?:vista|seccion)[^\]]*\]\))/g;
// Clases que los guiones de la demo ponen en <html> (Modo Mario, § armada, oficinas…): «.rm X»
// se escribe html.rm .v3 X. Se conserva también .v3 .rm X para las piezas que llevan la clase
// en un envoltorio propio dentro de la página.
const HTML_CLASSES = /^((?:\.(?:rm|mk-js|sh-js-ofi|con-resenas|sin-notas))+)((?:[.:#\[][^\s>+~]*)?)(.*)$/;
function scope(sel) {
  sel = sel.trim();
  const h = HTML_CLASSES.exec(sel);
  if (h && !h[2]) return `html${h[1]} .v3${h[3].replace(/^\s*>\s*/, ' ')}, .v3 ${sel}`;
  if (sel === ':root' || sel === 'html' || sel === 'body') return '.v3';
  if (/^(::selection|:focus-visible|:where|::)/.test(sel)) return '.v3 ' + sel;
  const m = /^(html|body|:root)((?:[.:#\[][^\s>+~]*)?)(.*)$/.exec(sel);
  if (m && (m[2] === '' ? /^[\s>+~]/.test(m[3]) || m[3] === '' : true)) {
    let comp = m[2]; const moved = [];
    comp = comp.replace(MOVE, x => { moved.push(x); return ''; });
    const rest = m[3].replace(/^\s*>\s*/, ' ');
    const v3 = '.v3' + moved.join('');
    if (m[1] === 'html' && comp) return `html${comp} ${v3}${rest}`;
    return `${v3}${rest}`;
  }
  return '.v3 ' + sel;
}
let css = files.map(f => `/* ===== ${f} ===== */\n` + fs.readFileSync(path.join(V, f), 'utf8')).join('\n');
const root = postcss.parse(css);
// La barra fija de teléfono de la demo (sh-barra) no se usa en el sitio: sin su hueco abajo
root.walkRules(rule => {
  if (rule.selector.trim() === 'body' && rule.nodes.every(d => d.type === 'decl' && d.prop === 'padding-bottom' && /64px/.test(d.value))) rule.remove();
});
// Piezas propias de la demo que el sitio no pinta: la barra y el panel de ajustes (sh-demobar,
// sh-ajustes y sus controles sh-seg, sh-sw, sh-switch), las «Notas para la junta» (sh-nota y
// html.sin-notas) y el encabezado, el menú y el pie de la demo (sh-skip, sh-nav, sh-sub, sh-fija,
// sh-menu, sh-pie). Se quita cada selector que exige una de esas clases (fuera de :not(), :is(),
// :has()…) y la regla que se queda sin selectores. Una clase que aparezca en cualquier archivo de
// client/src (también dentro de una plantilla o un comentario) se conserva con todas sus reglas.
const DEMO_CHROME = /^(?:sh-(?:demobar|ajustes|ajustes-btn|ajustes-flot|seg|sw|switch|switches|nota|skip|nav|sub|fija|menu|pie)(?:(?:__|--)[\w-]+)?|sin-notas)$/;
const SRC = path.join(__dirname, '..', 'client', 'src');
// Sin contar el propio CSS generado (client/src/v3/demo.css o la salida pedida)
const generados = new Set([path.resolve(SRC, 'v3', 'demo.css'), OUT ? path.resolve(OUT) : '']);
const srcTokens = new Set();
(function leer(d) {
  for (const f of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, f.name);
    if (f.isDirectory()) leer(p);
    else if (/\.(?:[cm]?[jt]sx?|css|html|json|md)$/.test(f.name) && !generados.has(path.resolve(p))) {
      for (const t of fs.readFileSync(p, 'utf8').match(/[A-Za-z_][\w-]*/g) || []) srcTokens.add(t);
    }
  }
})(SRC);
const inKeyframes = rule => { for (let p = rule.parent; p; p = p.parent) if (p.type === 'atrule' && /keyframes$/.test(p.name)) return true; return false; };
// Clases que el selector exige: fuera de corchetes y de los paréntesis de las pseudoclases
function requiredClasses(sel) {
  let s = sel.replace(/\[[^\]]*\]/g, '');
  while (/\([^()]*\)/.test(s)) s = s.replace(/\([^()]*\)/g, '');
  return [...s.matchAll(/\.([A-Za-z_][\w-]*)/g)].map(m => m[1]);
}
const dropped = new Set(), kept = new Set(), droppedAnims = new Set();
let droppedRules = 0, droppedSels = 0;
root.walkRules(rule => {
  if (inKeyframes(rule)) return;
  const sels = rule.selectors.filter(sel => {
    const chrome = requiredClasses(sel).filter(c => DEMO_CHROME.test(c));
    chrome.filter(c => srcTokens.has(c)).forEach(c => kept.add(c));
    const off = chrome.filter(c => !srcTokens.has(c));
    off.forEach(c => dropped.add(c));
    return off.length === 0;
  });
  if (sels.length === rule.selectors.length) return;
  droppedSels += rule.selectors.length - sels.length;
  if (sels.length) { rule.selectors = sels; return; }
  rule.walkDecls(/^animation(?:-name)?$/, d => d.value.split(/[\s,]+/).forEach(n => droppedAnims.add(n)));
  rule.remove();
  droppedRules++;
});
// Las animaciones que solo usaban esas reglas, y los @media/@supports que quedaron vacíos
const restante = root.toString();
root.walkAtRules(/keyframes$/, at => {
  if (!droppedAnims.has(at.params)) return;
  const usos = restante.split(at.params).length - 1; // la propia @keyframes cuenta una
  if (usos <= 1 && !srcTokens.has(at.params)) at.remove();
});
let vacias = true;
while (vacias) {
  vacias = false;
  root.walkAtRules(at => { if (at.nodes && !at.nodes.some(n => n.type !== 'comment')) { at.remove(); vacias = true; } });
}
console.log(`demo: ${droppedRules} reglas y ${droppedSels} selectores fuera (${[...dropped].sort().join(' ')})` +
  (kept.size ? `; se conservan porque client/src las usa: ${[...kept].sort().join(' ')}` : ''));
root.walkRules(rule => {
  if (inKeyframes(rule)) return;
  rule.selectors = rule.selectors.map(scope);
});
let out = root.toString()
  .replace(/--serif\s*:\s*[^;]+;/g, '--serif: "SS Serif", "SS Serif Fallback", Georgia, serif;')
  .replace(/--sans\s*:\s*[^;]+;/g, '--sans: "SS Sans", "SS Sans Fallback", system-ui, -apple-system, "Segoe UI", sans-serif;')
  .replace(/url\((['"]?)assets\//g, 'url($1/v3/');
out = '/* Generado desde la demo v3 (scratchpad v3/, build.py): tokens, shell, módulos, páginas y tipografía,\n   todo dentro de .v3 para no tocar el resto del sitio. No editar a mano: ver client/src/v3/README.md. */\n' + out;
fs.writeFileSync(OUT, out);
console.log('ok', out.length, 'bytes');
