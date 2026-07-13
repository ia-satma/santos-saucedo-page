# Handoff completo — Santos & Saucedo (sitio web)

> Documento de contexto self-contained. Con esto una nueva sesión/dev tiene el panorama completo del
> proyecto y de lo trabajado hasta **2026-07-13**. Último commit: `ff7c7eb` (pivote 2026 + azul PDF).

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

## 9. Estado actual y commits

Todo pusheado a `main`. Deploy OK (Actions success). Último: `ff7c7eb`.

Ver `git log --oneline -20` para el detalle completo; hitos clave arriba en §8 (puntos 9–16).

## 10. Pendientes

**✅ Modo oscuro, rebrand V1, pivote a 4 áreas, azul del PDF, Cobertura Nacional, tarjetas de Áreas,
SEO/JsonLd — HECHO** (detalle §8).

**🔴 Bloqueado esperando al cliente (2026-07-13):**
- **Fotos de socios/asociados**: el PDF trajo fotos individuales en
  `../PDF 2026 - IMAGES/socios- asociados/` — 4 socios fundadores (recorte circular, fondo pintura
  abstracta) + **37 fotos de asociados SIN nombre** (ni el archivo ni el PDF los traen). El sitio ya
  tiene 19 asociados con nombre/bio escritos → **no calzan 1 a 1**. Cliente confirmó: va a pasar la
  **lista nombre→archivo**. NO asignar por orden de archivo sin esa lista (riesgo de atribución
  incorrecta en un sitio de abogados). Fotos de fundadores: cliente las va a re-enviar en **formato
  cuadrado** (las circulares no calzan con las tarjetas `object-cover` del sitio) — no usar las
  circulares mientras tanto.
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
