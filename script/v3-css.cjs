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
root.walkRules(rule => {
  let p = rule.parent; while (p) { if (p.type === 'atrule' && /keyframes$/.test(p.name)) return; p = p.parent; }
  rule.selectors = rule.selectors.map(scope);
});
let out = root.toString()
  .replace(/--serif\s*:\s*[^;]+;/g, '--serif: "SS Serif", "SS Serif Fallback", Georgia, serif;')
  .replace(/--sans\s*:\s*[^;]+;/g, '--sans: "SS Sans", "SS Sans Fallback", system-ui, -apple-system, "Segoe UI", sans-serif;')
  .replace(/url\((['"]?)assets\//g, 'url($1/v3/');
out = '/* Generado desde la demo v3 (scratchpad v3/, build.py): tokens, shell, módulos, páginas y tipografía,\n   todo dentro de .v3 para no tocar el resto del sitio. No editar a mano: ver client/src/v3/README.md. */\n' + out;
fs.writeFileSync(OUT, out);
console.log('ok', out.length, 'bytes');
