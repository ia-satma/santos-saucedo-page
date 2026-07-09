# Contexto de trabajo - Santos & Saucedo

Fecha de corte: 2026-07-09

## Proyecto

- Repositorio: https://github.com/ia-satma/santos-saucedo-page
- GitHub Pages: https://ia-satma.github.io/santos-saucedo-page/
- Rama principal usada: `main`
- Carpeta local usada por Codex:
  `C:\Users\davii\Documents\Codex\2026-07-07\repo-https-github-com-ia-satma\work\santos-saucedo-page`

## Objetivo general trabajado

Se está rediseñando y corrigiendo el frontend del sitio de Santos & Saucedo Abogados, cuidando identidad visual, logos oficiales, jerarquía tipográfica, contraste, composición del hero, tarjetas, equipo de abogados y la página de áreas laborales.

La prioridad ha sido mantener una estética sobria de firma legal, con azul profundo corporativo, serif para títulos y sans serif para párrafos.

## Lineamientos visuales vigentes

- Títulos principales y headings editoriales: serif `Baanoo`.
- Párrafos, navegación, formularios y UI: sans serif `Outfit`.
- Paleta azul aplicada:
  - Azul noche: `#0e0f2c`
  - Azul base: `#171735`
  - Azul corporativo/acento: `#202058`
  - Azul suave para textos/iconos sobre oscuro: `#d9dafb`
- Las secciones de lectura se mantienen claras para no hacer pesado el sitio.
- Las secciones oscuras usan azules profundos con contraste alto.
- Evitar repetición visual innecesaria de textos como contadores o etiquetas redundantes.
- En hero y secciones editoriales, los subtítulos deben tener cortes de línea balanceados.

## Assets oficiales y fuentes

### Logos oficiales

Se indicó usar los logos oficiales desde pCloud:

- Carpeta de logos oficiales:
  https://u.pcloud.link/publink/show?code=kZjqVr5Z8jqrVh3RYe79KlJMase6x86gy8tk
- Logo vertical blanco usado en hero:
  `LOGO-BLANCO-SS-V.svg` / `LOGO-BLANCO-SS-V-2.svg`
- Logo horizontal blanco:
  `LOGO-BLANCO-SS-H2.svg`
- Logo color para header sobre fondo claro:
  `logo-ss-color.png`

Notas importantes:

- Se corrigió el problema donde el isotipo se veía relleno incorrectamente.
- Se reemplazaron logos/isotipos incorrectos, incluido uno equivocado en footer.
- No usar logos de otra marca ni isotipos tipo "W".

### Fuente Baanoo

Archivo compartido por el usuario:

- `C:\Users\davii\Downloads\Baanoo\!F Baanoo.ttf`

Se trabajó para que los títulos usen Baanoo y los textos usen Outfit.

### Fuente Outfit

Referencia compartida por el usuario:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">
```

## Cambios principales realizados

### Hero home

- Se reemplazó el video/fondo de otra marca.
- Se usó una base visual de pCloud mientras se genera video oficial.
- Se redujo el logo para que no dominara demasiado.
- Se cambió el logo central a versión vertical para evitar repetición con el header.
- Se quitó la frase superior "Firma de derecho laboral en Nuevo León" porque no se veía bien.
- Se corrigió que seguía apareciendo esa frase desde una versión del logo/fondo.
- Se mantuvo la frase inferior "Más de 35 años de asesoría laboral".

### Header / menú

- El menú se perdía en páginas internas porque arrancaba transparente con texto blanco sobre fondo claro.
- Se corrigió el comportamiento global:
  - Home: header transparente al inicio sobre el hero.
  - Páginas internas: header visible desde arriba, con fondo claro, logo azul y texto con contraste.
  - Al hacer scroll: mantiene estado sólido.
- El logo cambia correctamente a versión azul/color cuando el fondo del menú es blanco.

Archivo clave:

- `client/src/components/Header.tsx`

### Paleta y contraste

- Se aplicó una combinación de azules profundos tomada del screenshot aprobado por el usuario.
- Se mejoró el contraste en:
  - Footer/contacto.
  - Números grandes.
  - Tarjetas de valores/enfoque/método.
  - Secciones oscuras.
- Los iconos sobre fondos oscuros se ajustaron a tonos claros.

Archivos relevantes:

- `client/src/index.css`
- `client/src/components/Footer.tsx`
- `client/src/components/AboutUsSection.tsx`
- `client/src/components/ExperienceBanner.tsx`
- `client/src/components/HeroSection.tsx`
- `client/src/components/PracticesSection.tsx`

### Sección "Santos & Saucedo Abogados tiene más de 35 años..."

- Se pidió que fuera en fondo azul marino.
- Luego se pidió que esa frase usara serif.
- Se refinó la tipografía para que encaje con el sistema Baanoo/Outfit.

### Tarjetas y valores

- Se mejoraron visualmente tarjetas de "Enfoque", "Método" y "Nuestros valores".
- Se hicieron menos planas:
  - Bordes/acento azul profundo.
  - Sombras suaves azuladas.
  - Iconos en círculo azul sólido con blanco.
  - Hover sutil.
- Se corrigió que algunos títulos no seguían la tipografía serif.

### German Desk

- Se eliminó todo lo relacionado con "German Desk" que aparecía en el sitio.

### Página de abogados / equipo

Se trabajó bastante esta sección.

Cambios hechos:

- Se corrigió layout donde un abogado quedaba solo abajo y expandido.
- Se ajustaron columnas para socios y asociados.
- Se respetó el orden configurado de socios y asociados.
- Se balancearon los 19 asociados para ocupar mejor el ancho horizontal.
- Se ajustó el zoom/encuadre de fotos de socios para evitar cortes de cara.
- Se corrigió que al hacer hover se cortaba arriba.
- Se refinó la jerarquía de encabezados:
  - Antes: `NUESTRO EQUIPO - 5 SOCIOS` y abajo `SOCIOS`.
  - Ahora: se eliminó el contador repetido y queda línea azul + `SOCIOS`.
  - Lo mismo para `ASOCIADOS` y `OF COUNSEL`.
- Se ajustó el subtítulo de la página:
  - Antes: "Conozca a los experimentados abogados que hacen de nuestra firma un líder en excelencia legal"
  - Ahora: "Conozca al equipo legal que sostiene la excelencia de nuestra firma"
- Se aplicó `text-balance` para evitar una sola palabra en la última línea.

Archivos clave:

- `client/src/pages/Team.tsx`
- `client/src/lib/teamPhotoPosition.ts`
- `client/src/index.css`

### Áreas de servicio / áreas laborales

El usuario subió fotos nuevas para la página de Áreas de Servicio:

- pCloud:
  https://u.pcloud.link/publink/show?code=kZ4QQr5ZNd6EdBp3MV4S8tvILob660yt4lYy

Se descargaron 6 imágenes:

- `AREA 1.png`
- `AREA 2.png`
- `AREA 3.png`
- `AREA 4.png`
- `AREA 5.png`
- `AREA 6.png`

Se optimizaron a WebP y se agregaron como:

- `attached_assets/service_areas/area-1-conflictos-laborales.webp`
- `attached_assets/service_areas/area-2-administracion-laboral.webp`
- `attached_assets/service_areas/area-3-diagnostico-relaciones-laborales.webp`
- `attached_assets/service_areas/area-4-planes-mejora.webp`
- `attached_assets/service_areas/area-5-auditoria-juridico-laboral.webp`
- `attached_assets/service_areas/area-6-planeacion-capacitacion.webp`

Mapeo aplicado:

1. `conflictos-individuales-colectivos`
2. `administracion-laboral`
3. `diagnostico-relaciones-laborales`
4. `planes-mejora`
5. `auditoria-juridico-laboral`
6. `planeacion-estrategica-capacitacion`

Archivo clave:

- `client/src/lib/practiceIndustryImages.ts`

Nota:

- Se hizo que las imágenes oficiales del mapeo tengan prioridad sobre imágenes genéricas del backend.

### Balance de textos en heros editoriales

Se aplicó `text-wrap: balance` a subtítulos dentro de `.editorial-page-hero` para mejorar saltos de línea en páginas internas.

Archivo:

- `client/src/index.css`

## Commits recientes importantes

Estos commits ya fueron subidos a GitHub:

- `a97950f` - Refine team page copy hierarchy
- `cc6a8ef` - Keep inner page header visible
- `7f895ee` - Clarify team section labels
- `7c51214` - Add service area photos
- `fa63c7f` - Preserve partner photo top framing
- `65548e0` - Improve partner photo framing on hover
- `edfd2e7` - Balance attorney rows and use configured order
- `8afd223` - Fix team row layout for incomplete rows
- `6438437` - Fix hero microcopy typography
- `2fde375` - Refine serif typography in values section
- `da74bba` - Use official SVG logo marks
- `4c8b222` - Replace incorrect footer logo

## Validaciones realizadas

Se validó con TypeScript y build de producción varias veces.

Comandos usados:

```powershell
& "C:\Users\davii\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\typescript\lib\tsc.js
```

```powershell
$env:VITE_STATIC_SITE='true'
$env:VITE_BASE_PATH='/santos-saucedo-page/'
& "C:\Users\davii\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe" node_modules\vite\bin\vite.js build
```

Resultados:

- TypeScript: correcto.
- Build Vite: correcto.
- Advertencias vistas:
  - Un warning de PostCSS sobre `from`.
  - Warning de chunks mayores a 500 KB.
- Esas advertencias ya existían/no bloquearon el build.

## Reglas de trabajo establecidas por el usuario

- Cada vez que se haga un cambio, subirlo a GitHub.
- Siempre compartir el link de GitHub Pages:
  https://ia-satma.github.io/santos-saucedo-page/
- El usuario revisa cambios visuales desde GitHub Pages.
- Si algo no se ve actualizado, puede ser caché de navegador o tiempo de publicación de Pages.

## Pendientes o puntos a revisar después

1. Revisar visualmente la página de Equipo ya publicada:
   - Que el subtítulo se corte bien.
   - Que no se sienta repetitivo.
   - Que socios/asociados tengan buena jerarquía.

2. Revisar todas las páginas internas con el header sólido:
   - Contacto.
   - Abogados.
   - Áreas Laborales.
   - Publicaciones.
   - Detalles de áreas.
   - Detalles de abogados.

3. Revisar performance:
   - Hay imágenes antiguas de práctica/industria de 2 MB o más.
   - Las nuevas fotos de áreas ya están optimizadas, pero otras imágenes podrían optimizarse.

4. Revisar consistencia tipográfica:
   - Baanoo para títulos.
   - Outfit para párrafos/UI.
   - Evitar serif en párrafos largos.

5. Revisar cache:
   - Si Pages no muestra cambios, probar hard refresh o incógnito.

## Estado final al crear este documento

- Repositorio local limpio antes de crear este archivo.
- Último commit funcional publicado antes de este documento: `a97950f`.
- Este archivo se crea para transferir contexto a Claude y continuar trabajo sin perder historial.

