# Handoff completo — Santos & Saucedo (sitio web)

> Documento de contexto self-contained. Con esto una nueva sesión/dev tiene el panorama completo del
> proyecto y de lo trabajado hasta **2026-07-10**. Último commit: `54cc048` (rebrand + modo oscuro).

---

## 1. Qué es este proyecto

Sitio web del despacho **Santos & Saucedo Abogados** — boutique de **Derecho Laboral** en San Pedro
Garza García, N.L. Construido por la agencia SATMA.

**No parte de cero:** reutiliza la plataforma premium de **Von Wobeser y Sierra** (despacho
full-service de CDMX) — React 18 + Vite + Tailwind + Express + Neon + agentes IA — y la **rebrandea**
a la boutique laboral. Etapa 1 / Fase 2: prototipo navegable aprobable.

**Regla de oro para detectar contenido heredado:** *S&S es SOLO laboral, +35 años, San Pedro Garza
García N.L., **Azul Noche `#12103E` + Verde Lima `#A5E029`** (branding 2026-07).* Cualquier texto/dato
que diga otra cosa (CDMX, Polanco, full-service, rankings, 1986/1952, 70 años) es herencia de Von
Wobeser (VW) a purgar. Nota: `#202058`/`#B2EB3E` era la paleta S&S **anterior** (V2), ya reemplazada —
no es VW; los crimson VW `#AC162C`/`#841A1A` siguen prohibidos.

## 2. El cliente (hechos verificados)

- **Razón social:** SANTOS & SAUCEDO, S.C. (el aviso también menciona "Saucedo Santos S.C." — confirmar).
- **Especialidad:** Derecho Laboral (única). **Trayectoria:** +35 años. **Clientes:** empresas nacionales e internacionales.
- **Domicilio:** Río Tamazunchale 205 Norte, Col. Del Valle, San Pedro Garza García, N.L., C.P. 66220.
- **Tel:** (81) 8335 2086 · **Correo:** info@santossaucedo.com · **Horario:** L–V 9:00–19:00.
- **6 áreas laborales:** (1) conflictos individuales y colectivos ante juntas, (2) revisión de
  administración laboral, (3) diagnóstico de relaciones laborales, (4) planes de mejora,
  (5) auditoría jurídico-laboral, (6) planeación estratégica, cursos y talleres.
- **Posicionamiento:** "Derecho laboral estratégico para empresas."
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
| Azul Noche / **primario** | `#12103E` | `--primary` (`243 59% 15%`) |
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
10. **Rebrand + tipografía** (`54cc048`) — **Azul Noche `#12103E` + Verde Lima `#A5E029`** (nueva marca,
    reemplaza `#202058`/`#B2EB3E`); títulos **Lora**, cuerpo `#555`, eyebrows bold; variante `brand` del
    Button (CTA lima/navy/4px); radios editoriales (tarjetas 8px, botones 4px); limpieza de bordes-caja.
    Todo por tokens → modo oscuro intacto. (Nota: el repo tenía finales de línea mezclados; algunos
    archivos se normalizaron a LF en ese commit — solo las líneas de color/radio son cambios reales.)

## 9. Estado actual y commits

Todo pusheado a `main`. Deploy OK (Actions success). Último: `54cc048`.

```
54cc048 Rebrand: Lora serif + Azul Noche/Verde Lima palette, editorial radii, declutter
d9c96c3 Refactor dark mode: tokenize hardcoded text/border/ring colors sitewide
f614fce Add full project handoff/context doc (2026-07-10)
4a7e192 Propagate soft card style to all internal pages
25303ce Redesign UI: kill the box effect, add depth, modernize type
94169f6 Swap hero to branded Monterrey image, lighten overlays so green S shows
f396481 Optimize performance: self-host hero as WebP, drop dead images, lazy-load
244f18d Add project context and 360 research docs
83befe6 Refine icon direction: keep lucide, unify stroke weight to 1.75
4d682cb Improve legibility: bump undersized text on internal pages
1cff25a Tint the oversized "6" in Labor Areas with the lime-green accent
c63b0a0 Amplify lime-green brand accent across more areas
f3c058c Purge Von Wobeser heritage, add V2 logos, add lime-green brand accent
```

## 10. Pendientes

**✅ #1 — Refactor de modo oscuro — HECHO** (`d9c96c3`). Superficies y textos convertidos a tokens de
tema en todo el sitio; el dark mode se ve premium y consistente (verificado en el CSS desplegado).

**✅ Rebrand + tipografía — HECHO** (`54cc048`): Azul Noche/Verde Lima, Lora, cuerpo `#555`, radios
editoriales, limpieza de cajas. Detalle en §4 y §5.

**Contenido (dependen del cliente):** bios reales del equipo (educación, experiencia, idiomas,
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
