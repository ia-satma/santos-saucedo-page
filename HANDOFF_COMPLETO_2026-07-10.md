# Handoff completo — Santos & Saucedo (sitio web)

> Documento de contexto self-contained. Con esto una nueva sesión/dev tiene el panorama completo del
> proyecto y de lo trabajado hasta **2026-07-13**. Último commit: `623cdd8` (fusión Cobertura +
> Experience Banner, arregla el salto de color del home).

---

## 1. Qué es este proyecto

Sitio web del despacho **Santos & Saucedo Abogados** — boutique de **Derecho Laboral** en San Pedro
Garza García, N.L. Construido por la agencia SATMA.

**No parte de cero:** reutiliza la plataforma premium de **Von Wobeser y Sierra** (despacho
full-service de CDMX) — React 18 + Vite + Tailwind + Express + Neon + agentes IA — y la **rebrandea**
a la boutique laboral. Etapa 1 / Fase 2: prototipo navegable aprobable.

**Regla de oro (actualizada — Presentación de Servicios 2026):** *S&S es una firma **multi-área con raíz
laboral** — 4 áreas: Laboral y Seguridad Social · Corporativo y Contractual · Migratorio · Litigio
Contencioso — **15 años como firma / +35 de experiencia**, San Pedro Garza García N.L., azul + Verde Lima
`#A5E029`, con **alianza nacional (+72 ciudades)**.* Sigue prohibido lo VW (CDMX/Polanco, full-service
ajeno, rankings, 1952/1986/"70 años", crimson `#AC162C`/`#841A1A`). **OJO:** el modelo previo "SOLO
laboral / 6 áreas" quedó **SUPERSEDED** por la presentación oficial 2026 (multi-área). `#202058`/`#B2EB3E`
es paleta S&S anterior (V2), reemplazada.

## 2. El cliente (hechos verificados)

- **Razón social:** SANTOS & SAUCEDO, S.C. (el aviso también menciona "Saucedo Santos S.C." — confirmar).
- **Modelo (Presentación 2026):** firma **multi-área con raíz laboral**. **15 años como firma / +35 de
  experiencia.** Clientes nacionales y multinacionales; **alianza con presencia en +72 ciudades** de MX.
- **Domicilio:** Río Tamazunchale 205 Norte, Col. Del Valle, San Pedro Garza García, N.L., C.P. 66220.
- **Tel:** (81) 8335 2086 · **Correo:** info@santossaucedo.com (la presentación usa msaucedom@santossaucedo.com).
- **4 áreas de especialidad** (slugs en `server/seed.ts`): (1) **Laboral y Seguridad Social**
  `laboral-seguridad-social` (raíz; incluye litigio laboral, auditorías, colectiva, compliance);
  (2) **Corporativo y Contractual** `corporativo-contractual`; (3) **Migratorio** `migratorio`;
  (4) **Litigio Contencioso** `litigio-contencioso` (civil/mercantil/penal). Servicios detallados en el seed.
- **Posicionamiento:** "Administración del capital humano y defensa legal para empresas nacionales y
  multinacionales."
- **Pendientes del PDF 2026 (por hacer):** diseño azul real del PDF + motivos verdes; secciones nuevas
  **Cobertura Nacional** (mapa MX, +72 ciudades), **Clientes** (logos globales/nacionales/Asia — requiere
  assets), **Socios Fundadores** (4); actualizar SEOHead/JsonLdSchema. Imágenes del PDF en
  `../PDF 2026 - IMAGES/`.
- **Equipo:** 24 personas publicadas (nombre/foto/cargo confirmados; **bios/idiomas/educación faltan**
  — validación del cliente). Ojo ortografía: Gúzman, Huán, Misden, Mirelles, Vásquez/Vázquez.

## 3. Coordenadas

- **Repo:** https://github.com/ia-satma/santos-saucedo-page (rama `main`, **público**).
- **GitHub Pages:** https://ia-satma.github.io/santos-saucedo-page/
- **Local (Mac):** `/Volumes/alejandro /santos saucedo - página web/santos-saucedo-web`
- **Cerebro Obsidian (memoria compartida):**
  `.../CEREBRO ALEJANDRO SATMA/proyectos/santos-saucedo/` (empezar por `wiki/overview-ss.md`).

## 4. Identidad visual

**Paleta (branding 2026-07 — Azul Noche + Verde Lima):**

| Rol | HEX | Token |
|-----|-----|-------|
| Azul Noche / **primario** (royal, del PDF 2026) | `#1E1C92` | `--primary` (`241 64% 27%`) |
| Ramp navy (gradientes hero/footer) | `#0A0826` / `#100E30` | hex fijo |
| Azul suave (texto/iconos sobre navy) | `#D9D8F7` | hex fijo |
| **Verde Lima (acento)** | **`#A5E029`** | `--brand` (`79 75% 52%`) |
| Tinta de cuerpo | `#555` | `--body` (`0 0% 33%`) |

- **Azul Noche** cimienta la estructura; **Verde Lima = acento puntual** (CTA, badges, reglas, isotipo).
- Todo es **token-driven** en `client/src/index.css` (`:root` claro + `.dark`): recolorar = cambiar
  tokens. Las bandas navy fijas se cambian por hex (siguen correctas en claro **y** oscuro).
- ⚠️ Contraste: el verde NO va para texto sobre blanco. **Azul Noche sobre lima** sí (botón CTA).
  Prohibidos los crimson VW `#AC162C`/`#841A1A`. La paleta S&S anterior (`#202058`/`#B2EB3E`) ya no se usa.

**Tipografía (branding 2026-07):** títulos serif **Lora** (Google Fonts, `--font-heading`; clásica de
alto contraste, weight 600, tracking `-0.012em`, line-height `1.12`, color oscuro Azul Noche) · cuerpo/UI
sans **Outfit** (weight 400, color `#555` vía `--body`) · eyebrows Outfit **bold** en Azul Noche.
(Baanoo quedó sin uso; su `@font-face` sigue en el CSS pero `--font-heading` ya apunta a Lora.)

**Logos V2** (en `attached_assets/logos-v2/`): `Logo-Principal` (navy+S verde → header claro),
`Logo-Variante-Blanca` (blanco+S verde → hero/header oscuro), `Isotipo-Principal-07` (S verde → footer),
+ variantes Tinta-Negra/Blanca.

**Hero:** imagen branded Cerro de la Silla + S verde, self-hosted `attached_assets/hero-monterrey.webp`.

## 5. Sistema de diseño (actualizado 2026-07-10: modo oscuro + rebrand)

Objetivo: matar el "efecto caja", profundidad, Azul Noche + Verde Lima, tipografía editorial elegante.
Utilidades globales en `client/src/index.css`:

- **`.card-soft`** — tarjeta SIN borde: redondeada **~8px**, sombra navy en capas, lift en hover.
  Estilo de card unificado; el `<Card>` base de shadcn también sin borde (`rounded-lg`).
- **`.section-ambient`** / **`.section-mist`** — fondos de sección con profundidad/ritmo.
- **`.divider-soft`** — línea que se desvanece; separadores duros atenuados a `/40`.
- **Radios:** `--radius .5rem`; Tailwind `lg .5rem` (8px, tarjetas) · `md .375rem` · `sm .25rem`
  (**4px, botones/inputs**). CTA = variante **`brand`** del Button (lima, texto Azul Noche, bold, 4px, hover).
- Iconos **lucide** trazo 1.75. **Todo el color por tokens de tema** (claro + `.dark`).

**Principio:** Azul Noche cimienta, Verde Lima puntúa, títulos serif con autoridad, cuerpo gris que
respira; nada de bordes/cajas duras. **Modo oscuro soportado por tokens** (sin texto invisible).

**Modo oscuro (regla de color):** el navy se pierde sobre fondo oscuro → en `.dark` el **acento pasa a
Verde Lima** (`--primary` = verde, `--primary-foreground` = navy, `--ring` = verde). El **fondo base en
oscuro es el navy-índigo del footer** (`--background 243 52% 11%`; toda la escala de superficies en hue
243 — cards/popover 16%, muted/secondary/accent escalonados encima — para que sea coherente, no
near-black). El texto en oscuro es **blanco neutro**
(`--foreground 0 0% 98%`, `--body 0 0% 84%`) — se quitó el tinte "hueso" cálido (hue 42). Los verdes de
marca van a **100% opacidad** (sin `/40`, `/90`). El texto muted en oscuro también es neutro
(`--muted-foreground 0 0% 68%`, sin beige). Gotcha: en clases Tailwind arbitrarias
(`bg-[…rgba(…)…]`, `shadow-[…]`) el `rgba()` **no puede llevar espacios** (`rgba(18,16,62,…)`, no
`rgba(18, 16, 62, …)`) o la clase se rompe.

**Rellenos en oscuro (ojo — `bg-primary` = VERDE en `.dark`):** por eso, todo relleno navy pequeño
(círculos de ícono, badges, chips) usa **`bg-primary` + `text-primary-foreground`** → navy+blanco en
claro, **verde+navy en oscuro** (legible). Los rellenos navy grandes que deben seguir navy en oscuro
(menú móvil full-screen, badge de socio) van en **hex fijo `bg-[#1E1C92]`** (con `text-white`). Nunca
dejes `bg-primary` con `text-white` (en oscuro sería blanco sobre verde). **Logo del header:** versión
**blanca** cuando el header está oscuro o transparente; la navy solo en header claro sólido (si no, se
pierde) — se resuelve con variantes `dark:` en dos `<img>`.

**Fondos de sección claros hardcodeados = texto invisible en oscuro:** un `bg-[linear-gradient(…#fff…)]`
(o `bg-white`, `bg-[#f…]`) **no cambia** en `.dark`, así que la sección se queda blanca pero el texto
(token) se vuelve blanco → invisible. Usa siempre superficies theme-aware: **`.section-ambient`** (base
= `--background`, para que las tarjetas resalten) o **`.section-mist`**, o tokens (`bg-background/muted`).
Pasó en `PracticesSection` (Áreas).

**Regla del verde (dónde aplicarlo):** Verde Lima va como **acento/forma** — reglas y subrayados de
sección (`h-px`/`h-0.5 bg-brand`), hairline del eyebrow, bullets, barras, la "S", el numeral gigante —
y como **texto/íconos SOBRE superficies oscuras** (fotos con overlay navy, bandas navy, modo oscuro; p.
ej. los cargos sobre las fotos de Abogados). **Nunca** como texto pequeño sobre blanco (contraste ~1.4:1,
ilegible): títulos, cuerpo y eyebrows sobre blanco se quedan en Azul Noche/tinta. Navy sobre verde (texto
navy en botón lima) sí.

## 6. Arquitectura y deploy

- **Stack:** React 18 + Vite + Tailwind + Radix/shadcn + framer-motion + i18next. Backend Express +
  Drizzle + Neon (no aplica en Pages). Para Pages: versión estática + snapshot JSON (`generate-static-api.ts`).
- **Deploy:** GitHub **Actions** (`.github/workflows/pages.yml`) en cada push a `main` → `npm run build:pages`
  → publica `dist/public`. **NO** desde `/docs`. Clave: `VITE_BASE_PATH=/santos-saucedo-page/`.
- **Local:** puerto **5050** (el 5000 lo ocupa AirPlay). `npm run dev`. TS: `npm run check`.
- **Performance (2026-07-10):** hero 2.9MB→261KB WebP; quitados 24 PNGs VW muertos (~58MB); lazy-load
  below-the-fold. **Deploy real ~8 MB.**

## 7. Reglas de trabajo

- Cada cambio → **commit → push a GitHub** → compartir link de Pages para revisión.
- **Purgar basura AppleDouble** antes de git: `find . -name "._*" -not -path "./node_modules/*" -delete`.
- Español primario (multilenguaje diferido). Si Pages no refleja: hard refresh / incógnito.

## 8. Qué se hizo en esta sesión (2026-07-10)

1. **Purga VW** — hero en 8 idiomas ("corporate excellence since 1986/Mexico City" → laboral N.L.);
   SEO/meta + footer (70 años, M&A, Chambers/Legal 500/Latin Lawyer, 1952, Polanco); About + Careers
   reescritos a laboral; borrado el mapa de rankings muerto en `PracticeGroupDetail`. `JsonLdSchema` ya estaba limpio.
2. **Logos V2 + verde lima `#B2EB3E`** — nueva marca del cliente cableada en header/hero/footer; token `--brand`.
3. **Hero branded** (Cerro de la Silla + S verde) self-hosted WebP; overlays aligerados.
4. **Performance** — self-host hero, quitar PNGs VW muertos, lazy-load.
5. **Legibilidad** — `text-[10px]`→`11px`, `text-xs`→`sm` en cuerpo de páginas internas.
6. **Iconos** — se quedó lucide, trazo unificado a 1.75.
7. **Rediseño UI** — sistema `card-soft` + profundidad; home reestilizado; barrido `card-soft` en TODAS
   las páginas internas; `<Card>` base suavizado.
8. Subidos al repo los docs internos `CONTEXTO_PROYECTO_*` e `INVESTIGACION_360_*` (repo público, con OK del cliente).

**Sesión posterior (2026-07-10, mismo día):**

9. **Refactor de modo oscuro** (`d9c96c3`) — tokenizados ≈150 colores hardcodeados
   (`text-[#202058]`→`text-primary`, tintas→`text-foreground`, grises→`text-muted-foreground`,
   borders/rings→tokens); arreglado el hover del panel admin-fallback. Dark mode legible en todo el sitio.
10. **Rebrand + tipografía** (`54cc048`) — Azul Noche + Verde Lima V1, Lora, radios editoriales.
    (Superseded por el pivote 2026-07-13 abajo — el azul cambió a "royal" del PDF.)

**Sesión 2026-07-13 — Pivote al modelo de la Presentación de Servicios 2026 (cliente entregó el PDF
oficial, 14 págs, exportado a `../PDF 2026 - IMAGES/`):**

11. **Fixes de modo oscuro** (`7e17edd`…`212d33f`) — texto "hueso" cálido → blanco neutro; ~30 reglas/
    bullets/íconos hardcodeados en navy → verde (no cambiaban en oscuro); rellenos `bg-primary` (verde en
    oscuro) con texto blanco corregidos a `text-primary-foreground`; menú móvil y badge de socio fijados
    a navy (`#12103E`→ahora royal) para no volverse verdes; logo del header con variante blanca en
    oscuro/transparente; **fondo base en oscuro = navy del footer** (`243 52% 11%`), toda la escala
    armonizada a un solo tono; fix de una sección con fondo claro hardcodeado (texto invisible en oscuro).
12. **Pivote de contenido** (`8d68a48`) — el sitio era "solo laboral/6 áreas"; la presentación oficial es
    **multi-área con raíz laboral**. `server/seed.ts` `practiceGroupsData` → **4 áreas** (Laboral y
    Seguridad Social · Corporativo y Contractual · Migratorio · Litigio Contencioso) con servicios
    exactos del PDF; posicionamiento → "administración del capital humano y defensa legal"; años →
    "15 como firma · +35 de experiencia"; nav "Áreas Laborales"→"Áreas de Práctica".
13. **Diseño → azul real del PDF** (`f918e04`) — `--primary` de `#12103E` (casi negro) a **`#1E1C92`**
    (índigo royal, como la presentación); hex-swap de bandas/aliases. Híbrido: se conserva **Lora** y el
    verde. Luego (`7bba875`) se reemplazaron los intentos de gráficos CSS por los **vectores reales del
    PDF** que el cliente subió (`attached_assets/pdf2026/`: `bg-s-navy.webp` isotipo "S" en las bandas
    azules vía `mix-blend-soft-light`; `bg-waves-gray.webp` líneas onduladas en la sección de Áreas vía
    `mix-blend-multiply`, solo modo claro). *Nota: un primer intento con SVG dibujado a mano (`1525dcd`)
    fue revertido (`a834ecf`) por feedback del cliente — usar SIEMPRE los assets reales, no recrearlos.*
14. **Sección nueva "Cobertura Nacional"** (`3fbda04`, componente `CoberturaSection.tsx`) — alianza +
    "+72 ciudades", banda azul con acentos verdes, en el home tras las Áreas.
15. **Áreas → 4 tarjetas** (`bc0e3db`) — reemplazado el listado numerado por 4 tarjetas (foto + ícono +
    etiqueta navy), estilo pág. 5 del PDF. Nuevo ícono `building-2` agregado a `lib/icons.ts`.
16. **SEO/JsonLd actualizado** (`ff7c7eb`) — `JsonLdSchema` (slogan/knowsAbout/OfferCatalog → 4 áreas) y
    `SEOHead` (¡ojo! hay un bloque `safeSeo` que tiene **prioridad** sobre `seoConfig` para
    home/about/practiceGroups — hay que editar AMBOS o el título/meta real no cambia).

**Sesión 2026-07-13 (continuación) — pulido visual sitewide + rediseño de `/practice-groups`:**

17. **Fix crop de fotos de fundadores** (`01cf205`) — en el panel expandido de `/team` la cara quedaba
    muy abajo (crop `object-position` genérico). Overrides por slug (`50% 22%`) en
    `client/src/lib/teamPhotoPosition.ts` para los 4 fundadores confirmados, sin tocar el default global.
18. **Encabezados ilegibles (bug sistémico)** (`7f21160`) — la regla base `h1-h6 { color:
    hsl(var(--foreground)) }` (`index.css`) le gana a un `text-white` heredado del contenedor en
    cualquier heading sin color propio explícito. Auditado el sitio completo (agente Explore) y
    corregidos los 3 casos confirmados: título "Cobertura Nacional" (`CoberturaSection.tsx`), título del
    modal de preferencias de cookies (`CookieBanner.tsx`), y el `<h1>` del fallback
    `StaticAdminUnavailable` en `App.tsx`. **Regla para el futuro:** todo `<h1>`-`<h6>` sobre fondo oscuro
    necesita su propio `text-white` (o token), nunca depender solo de heredar del contenedor.
19. **Fix "máscara que se mueve" en tarjetas de Áreas** (`332dbbe`) — el badge circular del ícono usaba
    `backdrop-blur-sm`, que muestrea en vivo el contenido detrás; al hacer zoom la foto en hover
    (`scale-105`), el blur se distorsionaba visiblemente. Quitado el `backdrop-blur-sm`, badge ahora
    `bg-primary/40` sólido. **No confirmado visualmente por el cliente todavía** — si el glitch persiste,
    revisar de nuevo con captura en mano.
20. **Fondos reales de vectores en los 19 heroes internos** (`108a9ec`) — `.editorial-page-hero::before`
    (compartida por todas las páginas internas vía `pt-36 pb-20 editorial-page-hero`) pasó de un patrón
    CSS de puntos a los vectores reales subidos por el cliente a pCloud (`attached_assets/pdf2026/`):
    modo claro = `bg-waves-gray.webp` (líneas onduladas, `mix-blend-multiply`); modo oscuro = `bg-s-navy.webp`
    (isotipo "S" grande, `mix-blend-soft-light`). Ojo: existían DOS selectores `.dark
    .editorial-page-hero::before` — el que manda es el que está más abajo en el archivo, no el que se
    agrega primero.
21. **Favicon — resuelto** (`ef57a00` revierte el intento roto, `4047d88` activa el bueno) — el favicon
    seguía mostrando el logo pre-rebrand. Primer intento (recrear a mano el path del SVG viejo) salió
    como un mosaico roto tipo tablero de ajedrez (el path original mezclaba el glifo "S" con un triángulo
    de marca vía winding-rule, y rellenarlo plano con un color rompía el dibujo) — revertido. Segundo
    intento, technique segura: el **PNG oficial** (`SantosSaucedo_Isotipo-Principal-07.png`, de
    `Downloads/SANTOSSAUCEDO/LOGO/`, verificado 4501×4501 con alfa real) embebido en base64 dentro de un
    `<svg>` con fondo navy `#1E1C92` (`client/public/favicon.svg`) — sin tracing manual de vectores, cero
    riesgo de winding-rule. Cableado en `client/index.html` como `<link rel="icon" type="image/svg+xml">`
    (antes del `.png`, que queda de *fallback*). **Pendiente menor:** `apple-touch-icon` (ícono al agregar
    a pantalla de inicio en iOS) sigue apuntando al `favicon.png` viejo — no se pudo rasterizar una
    versión navy+isotipo en PNG en esta sesión (sin herramientas de imagen locales; la ruta de Adobe MCP
    fue bloqueada por el clasificador de seguridad al no estar relacionada con el resto de la tarea).
    Retomar cuando haya forma de rasterizar, o pedir al cliente un PNG cuadrado ya compuesto.
22. **Rediseño de `/practice-groups`** (`ec6e0f7`) — la página completa de listado (distinta del widget
    del home) seguía con el diseño viejo: tarjetas `aspect-[4/5]` con numeral translúcido "01"-"04" en
    grid de 3 columnas, que con solo 4 áreas dejaba una tarjeta huérfana sola en la segunda fila.
    Rediseñada la tarjeta (`PracticeGroupCard`) al mismo lenguaje visual ya aprobado en el home: foto
    (grayscale→color en hover) + badge de ícono circular + barra navy inferior con nombre/descripción/CTA
    en verde lima. Grid cambiado a `sm:grid-cols-2` (2×2, `max-w-4xl`) para acomodar exactamente 4 tarjetas
    sin huérfanas.

23. **Footer con marca de agua "S"** (`7a9105b`, corregido en `d05ddd3`) — el cliente pidió el mismo
    fondo azul con la "S" de marca de agua que se usa en los heroes oscuros, aplicado al `<footer>`
    (`.footer-watermark` en `index.css`, `bg-s-navy.webp`). Primer intento con `opacity:.3` +
    `mix-blend-mode:soft-light` (mismo tratamiento que Cobertura/hero) salió **casi invisible** sobre
    el fondo ya oscuro del footer — el cliente lo reportó ("sigo viendo igual el footer"). Fix: la
    imagen se aplica **directa, sin opacity ni blend-mode** (a diferencia de Cobertura/hero, que sí
    la necesitan porque están sobre secciones donde el watermark debe ser sutil). Verificado
    visualmente comparando la imagen fuente contra la del repo antes de confirmar que eran idénticas.
24. **Fix del "tinte morado" en hover de tarjetas de Áreas** (mismo commit `d05ddd3`) — el overlay
    `rgba(18,16,62,…)` sobre la foto en `PracticeGroupCard` (rediseño del punto 22) era estático
    (no cambiaba con el hover); al pasar el cursor la foto se desatura a color pero el tinte navy se
    quedaba encima, leyéndose como una "máscara" sucia. Fix: el overlay ahora se atenúa en hover
    (`isHover ? rgba(...,0.12) : rgba(...,0.4)`, con transición) para que el color real de la foto se
    vea limpio.
25. **Fusión Cobertura Nacional + Experience Banner** (`623cdd8`) — el cliente reportó un salto de
    color feo entre "Cobertura Nacional" (azul índigo limpio `#1E1C92`) y el banner de "+35 años"
    justo debajo (mismo gradiente pero con un radial `rgba(10,8,38,0.96)` casi opaco encima, copiado
    del tratamiento de oscurecimiento de fotos del Hero — aplicado sobre un panel de color plano
    ennegrecía la sección entera). En vez de solo recalibrar el radial, se **fusionaron las dos
    secciones en una sola franja navy**: `CoberturaSection.tsx` ahora muestra 2 stat cards en fila
    ("+72 Ciudades" / "35+ Años de Experiencia") en vez de 1 sola; `ExperienceBanner.tsx` se **borró**
    (solo se usaba en `Home.tsx`, sin otras referencias). El home queda con solo 3 "momentos navy"
    deliberados y espaciados: Hero → Cobertura+Experiencia → Footer, con contenido claro entre cada
    uno — en vez de una secuencia azul-azul-oscuro-accidental.

## 9. Estado actual y commits

Todo pusheado a `main`. Deploy OK (Actions success). Último: `623cdd8`.

Ver `git log --oneline -20` para el detalle completo; hitos clave arriba en §8 (puntos 9–16).

## 10. Pendientes

**✅ Modo oscuro, rebrand V1, pivote a 4 áreas, azul del PDF, Cobertura Nacional, tarjetas de Áreas,
SEO/JsonLd — HECHO** (detalle §8).

**✅ Fotos de los 4 socios fundadores — HECHO** (`772ec4d`, `78a30fc`). Cliente reenvió las 4 en
**formato cuadrado** (`../PDF 2026 - IMAGES/socios- asociados/socios-15..18.png`, ya NO circulares).
- Enrique Santos Arce, Enrique Santos Guzmán, Mario Saucedo Montemayor: fotos actualizadas en
  `attached_assets/team_photos/*.png` (reemplazan los `.jpg` viejos; `imageUrl` en `server/seed.ts`
  actualizado a `.png`).
- **Mario Saucedo Rodríguez (†)** — no estaba en el roster activo (deceased, sin bio). Cliente pidió
  agregarlo como fundador in memoriam → nueva entrada en `teamMembersData` (`server/seed.ts`, slug
  `mario-saucedo-rodriguez`, order 4 = orden del PDF, justo tras Enrique Santos Arce; se recorrieron
  +1 los `order` de los demás, 4-24 → 5-25). Título "Socio Fundador (In Memoriam)"; **sin email/teléfono**
  a propósito (son opcionales en el schema y los botones de contacto en `TeamMemberDetail.tsx` ya están
  condicionados a `member?.email`/`member?.phone`, así que no aparecen — no se presenta como contacto
  activo). Foto en blanco y negro de la presentación.

**✅ "Asociados" → "Nuestro Equipo" (anónimo) — HECHO** (`9e109dd`, `5f29d45`). El cliente insistió
(varias veces, "el PDF es la última actualización, no hay que mantener antiguos") en que las fotos
viejas dejaran de salir. Como **no hay lista nombre→archivo** para las 37 fotos nuevas de asociados
(intenté emparejar por posición de archivo una vez — el clasificador de seguridad lo bloqueó
correctamente por riesgo de atribución incorrecta a un abogado real; no reintentar esa vía), la solución
segura fue:
- Sección "Asociados" **renombrada a "Nuestro Equipo"** y convertida en mosaico **sin nombres** con las
  37 fotos nuevas (`client/src/lib/equipoPhotos.ts`, carga vía `import.meta.glob` desde
  `attached_assets/pdf2026/equipo/team-01..37.jpg`), mismo efecto visual que las tarjetas viejas
  (grayscale→color, expansión de panel en desktop). Los datos de los 19 asociados (nombre/bio/slug)
  siguen en `server/seed.ts`, solo no se renderizan aquí.
- Sección "Socios" acotada a los **4 fundadores confirmados por nombre** (`CONFIRMED_FOUNDER_SLUGS` en
  `Team.tsx`: `mario-saucedo-montemayor`, `enrique-santos-guzman`, `enrique-santos-arce`,
  `mario-saucedo-rodriguez`). Jaime Herrera de Herrera y David Martínez Saucedo (socios pero no
  fundadores, sin foto 2026 confirmada) **ya no se muestran** con nombre/foto en `/team` — mismo criterio
  que los asociados, hasta que el cliente confirme cuál de las 37 fotos es cada uno.

**🟡 Menores de esta sesión (2026-07-13 continuación):**
- `apple-touch-icon` sigue en el PNG viejo (ver punto 21 de §8) — falta rasterizar el isotipo oficial
  sobre navy en PNG cuadrado.
- Fix del "mask que se mueve" en tarjetas de Áreas (punto 19 de §8) — aplicado pero sin confirmación
  visual del cliente todavía.

**🔴 Sigue bloqueado esperando al cliente:**
- **Lista nombre→archivo** para las 37 fotos de "Nuestro Equipo" (`socios-asociados-19..56.jpg` en
  `../PDF 2026 - IMAGES/socios- asociados/`) — sin ella no se puede poner nombre a ninguna foto (aplica
  también a Jaime Herrera y David Martínez). **NO asignar por orden de archivo sin esa lista** — ya se
  intentó y el clasificador de seguridad lo bloqueó por riesgo de atribución incorrecta.
- **Logos de clientes** (sección "Clientes" del PDF: Globales/Nacionales/Asia) — pendiente de que el
  cliente pase los logos individuales (SVG/PNG transparente).
- **Mapa de México** en Cobertura Nacional — la sección ya existe (texto + stat), falta el visual del
  mapa con Nuevo León resaltado (pág. 10 del PDF).

**Contenido (dependen del cliente, previos):** bios reales del equipo (educación, experiencia, idiomas,
ortografía de nombres); iconos sociales que apuntan a `#`; señales de autoridad (publicaciones, casos
anonimizados); SEO/GEO local.

**Menores/opcionales:** botones no-CTA quedaron a 8px (los CTA lima a 4px) — unificar a 4px si se
quiere; quitar `@font-face`/TTF de Baanoo (ya sin uso) y fuentes huérfanas (Publico/Optima/Geomanist);
borrar código/PNGs VW muertos y `RankingsSection` (no se renderiza); ocultar o no el selector "ES";
en varias páginas los idiomas no-español renderizan inglés (override ES vs no-ES).

## 11. Gotchas del entorno

- **Volumen externo** genera basura `._*` (AppleDouble) que corrompe git/binarios nativos → purgar antes de git.
- **`du` infla ~10×** en ese volumen (tamaño de cluster). Medir peso real con `stat -f%z`, no `du`.
- Puerto **5050** en local (5000 = AirPlay). Sandbox: `http.server` falla por `getcwd` en el volumen
  externo → correr desde una carpeta en `/private/tmp`.

## 12. Contenido VW que NO debe publicarse como S&S

Oficinas en Polanco/CDMX · "18 prácticas / 7 industrias / 300+ estaciones" · premios (Chambers,
Legal 500, Latin Lawyer, GIR/GAR/GCR, IFLR1000, Best Lawyers) · cita de Fernando Carreño · fundación
1952/1986 o "70 años" · prácticas full-service (M&A, corporativo, fiscal, energía, PI, banca) ·
colores crimson `#AC162C`/`#841A1A`.

---

*Generado por Claude Code el 2026-07-10; actualizado el mismo día con el refactor de modo oscuro
(`d9c96c3`) y el rebrand Azul Noche/Verde Lima + Lora (`54cc048`). Fuente de verdad viva: el cerebro
Obsidian (`proyectos/santos-saucedo/`) + este repo.*
