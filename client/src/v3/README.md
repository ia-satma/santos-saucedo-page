# Diseño «demo v3» en el sitio

La demo v3 (aprobada el 5-11-2026) se pasó al sitio página por página. Cada página usa el
mismo marcado y las mismas clases que la demo, así que su CSS se aplica sin cambios.

## Piezas

- `demo.css`: todo el CSS de la demo (tokens, módulos, páginas, tipografía), encerrado en `.v3`
  para no tocar el resto del sitio. **No se edita a mano**: se genera desde la demo. Los ajustes
  propios del sitio van en el CSS de cada módulo (`./<módulo>/*.css`), también bajo `.v3`.
- `shared.tsx`: `V3Main` (el `<main class="v3" data-vista>`), `V3PageHeader` (foto a todo lo
  ancho, título y entrada), `V3NextPage` (la «página siguiente» al final), `useV3Lang()`
  (español o inglés; los demás idiomas ven el inglés y el bloque declara `lang="en"`) y
  `useV3Module(ref, init)`. Importarlo carga `demo.css`.
- `rm.tsx`: el «Modo Mario». `html.rm` sigue la preferencia del sistema «reducir movimiento»;
  con él nada se mueve solo. Avisa con el evento `rmchange` de `window`.
- Carpetas por módulo (`marca`, `home`, `firma`, `practicas`, `industrias`, `socios`): cada una
  con sus componentes y su `init*(raíz) → limpieza`, que es el `script.js` de la demo convertido
  para que React lo monte y desmonte al navegar.
- Fotos conceptuales en `client/public/v3/` (servidas en `/v3/…`), créditos en
  `creditos-fotos.txt`; three.js r149 en `/v3/libs/three.min.js`, cargado solo donde hay láminas.

## Regenerar `demo.css`

Con la demo en `$S/v3` (módulos, `shell/` y `tokens.css`):

```
node script/v3-css.cjs $S/v3 client/src/v3/demo.css
```

El guion concatena los estilos de la demo y los reescribe con postcss:
`:root/html/body` → `.v3`; `html.rm X` → `html.rm .v3 X`; `[data-vista=…]` y `[data-seccion=…]`
pasan a `.v3`; `--serif`/`--sans` apuntan a «SS Serif» (Newsreader) y «SS Sans» (Hanken
Grotesk); `url(assets/…)` → `url(/v3/…)`.

## Reglas

- Textos nuevos de la demo: español tal cual y su traducción al inglés, en registro sobrio e
  institucional. Lo que ya existe en 10 idiomas (firma, equipo, prácticas) se sigue leyendo
  del CMS.
- Prácticas: las cuatro del sitio (`/api/practice-groups`), nunca las de la demo.
- Socios: siempre cuatro, en este orden: Mario Saucedo Montemayor, Enrique Santos Guzmán,
  Enrique Santos Arce y Mario Saucedo Rodríguez (in memoriam).
- El encabezado y el pie son los del sitio (`Header26`, `Footer26`); las escenas fijas de la demo
  usan `var(--ss-header-h)` en lugar de su barra de 60 px.
- Logo y § siempre de los archivos oficiales; fotos y video a color; lima solo sobre fondo
  oscuro.
