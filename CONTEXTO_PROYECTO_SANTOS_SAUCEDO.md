# Contexto completo del proyecto Santos & Saucedo Page

Actualizado: 7 de julio de 2026  
Repositorio: https://github.com/ia-satma/santos-saucedo-page  
GitHub Pages: https://ia-satma.github.io/santos-saucedo-page/

## Resumen ejecutivo

Este proyecto es la adaptación y publicación del sitio de Santos & Saucedo a partir de una base heredada de Von Wobeser. La prioridad principal cambió desde un prototipo manual hacia una publicación real del frontend completo en GitHub Pages, para que el cliente pueda revisar avances visuales y de contenido en una URL pública conforme se actualiza el repositorio.

La versión actual ya no debe entenderse como maqueta aislada. El objetivo es que el frontend real de React/Vite se construya y publique automáticamente en GitHub Pages desde `main`. Como GitHub Pages no puede ejecutar backend, el sitio público funciona con un modo estático basado en archivos JSON generados desde la misma fuente de datos/seed del proyecto.

El backend, CMS, admin, agentes, uploads, login y acciones persistentes quedan fuera del alcance funcional de GitHub Pages. En Pages, esas funciones no deben parecer operativas. La experiencia pública sí debe estar completa: home, equipo, áreas de práctica, industrias, noticias, oficinas, contacto, assets, videos, imágenes y rutas internas navegables.

## Necesidad del usuario y del cliente

El usuario dejó claro que el cliente necesita ver los avances en GitHub Pages, no en una versión local ni en un prototipo separado. La frase clave del proyecto ha sido: todo lo que se vea en local como frontend público debe poder verse también en GitHub Pages.

Requisitos expresados durante el trabajo:

- El sitio publicado debe ser el frontend real, no una página manual en `/docs`.
- GitHub Pages debe actualizarse al actualizar el repositorio.
- Todo lo Von Wobeser debe cambiarse a Santos & Saucedo.
- Los logos y fotos oficiales compartidos por pCloud deben integrarse.
- La información faltante puede apoyarse en el sitio oficial de Santos & Saucedo: https://www.santossaucedo.com/
- El sitio no debe verse negro/pesado.
- La dirección visual final debe ser clara, editorial, premium y limpia.
- El color corporativo navy `#202058` debe conservarse.
- El fondo debe ser blanco puro, no beige.
- El modo día/noche debe funcionar bien y no provocar bugs de contraste.
- Las fotos del equipo deben verse bien, incluyendo casos específicos como Rubí Quintanilla.

## Estado actual

Rama actual: `main`  
Estado remoto reciente: `origin/main` alineado con `main`  
Último commit conocido: `b5a181f Adjust Rubi Quintanilla photo framing`

El sitio público actual se despliega con GitHub Actions hacia:

https://ia-satma.github.io/santos-saucedo-page/

La última publicación revisada de GitHub Pages fue exitosa después del ajuste de Rubí Quintanilla. La home pública responde correctamente. Las rutas internas tipo SPA pueden servirse mediante `404.html`; en GitHub Pages, una ruta directa puede devolver status HTTP 404 aunque el shell de la app cargue. Eso es comportamiento típico del fallback SPA en Pages.

## Estructura principal del proyecto

Carpeta de trabajo:

```text
/Volumes/alejandro /santos saucedo - página web/santos-saucedo-web
```

Áreas principales:

```text
client/                         Frontend React/Vite
server/                         Backend Express y seed de datos
shared/                         Tipos/esquemas compartidos
script/generate-static-api.ts   Generador del snapshot JSON estático
.github/workflows/pages.yml     Workflow de despliegue a GitHub Pages
attached_assets/                Assets importados o compartidos
attached_assets/team_photos/    Fotos oficiales del equipo
```

Scripts relevantes en `package.json`:

```json
{
  "dev": "NODE_ENV=development tsx server/index.ts",
  "build": "tsx script/build.ts",
  "build:pages": "VITE_STATIC_SITE=true VITE_BASE_PATH=/santos-saucedo-page/ vite build && tsx script/generate-static-api.ts",
  "start": "NODE_ENV=production node dist/index.cjs",
  "check": "tsc",
  "db:push": "drizzle-kit push"
}
```

## Historia del trabajo

### 1. Base heredada

El repositorio arrancó con una importación inicial de una fuente de Von Wobeser:

```text
dbef58f Initial import: Von Wobeser source as base for Santos & Saucedo rebrand
```

La primera etapa fue transformar esa base en una experiencia Santos & Saucedo. Al inicio todavía existían referencias, estilos, textos y decisiones heredadas de Von Wobeser.

### 2. Primer prototipo de rebranding

Se construyó una primera versión de rebranding para mostrar Santos & Saucedo:

```text
2118e5f Add static rebrand preview page for GitHub Pages
0d454b1 Implement Santos Saucedo rebrand prototype
b29132a Update GitHub Pages client preview
5c05ee5 Align Pages preview with local prototype
```

En esta etapa todavía había una diferencia importante entre lo que estaba en local y lo que se publicaba en GitHub Pages. El usuario aclaró que eso no servía para el cliente: GitHub Pages debía reflejar el frontend real, no una preview separada.

### 3. Publicación del frontend real en GitHub Pages

Se implementó el cambio clave del proyecto:

```text
95102b3 Deploy real frontend to GitHub Pages
72ec380 Fix Pages asset paths
```

Cambios principales:

- Se reemplazó la idea de mantener una página manual en `/docs`.
- Se configuró GitHub Actions para construir el frontend real de Vite.
- Se configuró `base` para GitHub Pages con `/santos-saucedo-page/`.
- Se ajustaron rutas y assets para funcionar dentro del subpath del repositorio.
- Se generó `404.html` igual a `index.html` para fallback de SPA.
- Se agregó modo estático para Pages con `VITE_STATIC_SITE=true`.
- Se generaron archivos JSON en `dist/public/static-api`.
- El build publicado sale de `dist/public`.

Workflow actual:

```yaml
name: Deploy GitHub Pages

on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - Checkout
      - Setup Node 24
      - npm ci
      - npm run build:pages
      - Configure Pages
      - Upload dist/public

  deploy:
    needs: build
    steps:
      - Deploy with actions/deploy-pages
```

### 4. Modo estático para GitHub Pages

Como GitHub Pages no tiene backend, se creó un modo estático:

```text
VITE_STATIC_SITE=true
```

El cliente detecta ese modo en:

```text
client/src/lib/queryClient.ts
```

La base estática se arma con:

```ts
const staticBaseUrl = `${import.meta.env.BASE_URL}static-api`;
```

Esto permite que los GET públicos no dependan de `/api`, sino de archivos generados en:

```text
dist/public/static-api/
```

El snapshot se genera en:

```text
script/generate-static-api.ts
```

El script también copia:

```text
dist/public/index.html -> dist/public/404.html
```

para permitir navegación SPA con refresh o enlaces directos dentro de GitHub Pages.

Endpoints públicos cubiertos por el snapshot:

- `site-content`
- `stats`
- `news`
- `practice-groups`
- `industry-groups`
- `team`
- `office-images`
- `representative-matters`
- `events`
- `search`
- detalles por `slug` o `id` cuando aplica

Acciones que requieren backend:

- Login
- Admin/CMS
- Agentes
- Uploads
- Mutaciones persistentes
- Traducciones dinámicas del servidor
- Envíos reales de contacto

En Pages estas acciones no deben venderse como funcionales. La intención es que el cliente revise el sitio público, no que administre contenido desde GitHub Pages.

### 5. Rebranding Von Wobeser -> Santos & Saucedo

Se continuó limpiando contenido heredado:

```text
b96aa60 Rebrand remaining Von Wobeser references
c633ff8 Align Santos phone number
```

Cambios de marca y contenido:

- Sustitución de referencias a Von Wobeser.
- Integración de Santos & Saucedo como marca principal.
- Uso del navy corporativo `#202058`.
- Actualización de metadata/SEO/schema.
- Enfoque de firma legal laboral.
- Ubicación en San Pedro Garza García, Nuevo León.
- Teléfono alineado: `+52 81 8335 2086`.
- Correo de contacto: `info@santossaucedo.com`.

Fuentes usadas o consideradas:

- Sitio oficial: https://www.santossaucedo.com/
- Assets/logos/fotos compartidos por pCloud.
- Contenido del seed del proyecto.

### 6. Logos y assets oficiales

Se integraron assets de Santos & Saucedo. En el build existen variantes de logo, incluyendo versiones a color y blancas.

Objetivo de assets:

- Que GitHub Pages publique los mismos assets del build real.
- Evitar copiar manualmente imágenes a una página de preview.
- Mantener logos, videos e imágenes dentro del flujo normal de Vite.

### 7. Fotos oficiales del equipo

El usuario avisó que en pCloud se agregaron fotos de socios y pidió integrarlas.

Se agregaron fotos oficiales del equipo:

```text
7776237 Add official Santos team photos and content
```

Ubicación:

```text
attached_assets/team_photos/
```

En `server/seed.ts` los perfiles usan rutas como:

```text
/team_photos/{slug}.jpg
```

Ejemplo confirmado:

```text
/team_photos/rubi-quintanilla-martinez.jpg
```

Estas fotos se publican como parte del sitio real, no como assets sueltos de una maqueta.

### 8. Auditoría visual: sitio demasiado oscuro

El usuario indicó que la página se veía demasiado negra y pesada. Se auditó el sitio y se encontraron muchos estilos heredados o hardcodeados:

```text
bg-[#111110]
bg-[#1a1a19]
from-black
bg-black
text-white/50
text-white/60
```

Se hizo una primera mejora hacia una línea editorial clara y premium:

```text
b4dde3f Refresh public site color palette
```

Cambios principales:

- Menos fondos negros dominantes.
- Más superficies claras.
- Navy corporativo como acento.
- Textos secundarios con mejor contraste.
- Overlays de fotos menos pesados.
- Secciones públicas más limpias.
- Footer conservado oscuro, pero no negro puro.

Se tocaron áreas como:

- Home
- Prácticas
- Industrias
- Equipo
- Rankings/experiencia
- Oficinas
- Contacto
- Páginas internas
- CTAs
- Tarjetas de socios
- Overlays de foto/video

### 9. Corrección de paleta: blanco puro, no beige

Después de la primera propuesta clara, el usuario pidió quitar el beige y usar blanco puro. También pidió revisar modo día/noche porque había bugs de color y contraste.

Se realizó:

```text
d26835e Fix light and dark color modes
```

Decisión visual actual:

- Modo claro con fondo blanco puro.
- Texto principal en tinta suave, no negro puro.
- Navy corporativo `#202058` como color principal.
- Grises neutros para tarjetas y bordes.
- Modo oscuro controlado, con fondos navy/charcoal y contraste revisado.

Tokens y helpers relevantes:

```text
--background: 0 0% 100%
.editorial-page-hero
.section-paper
.section-stone
.navy-photo-scrim
.navy-photo-scrim-strong
.dark .editorial-page-hero
.dark .section-paper
.dark .section-stone
```

Se corrigió el comportamiento del tema:

```text
client/src/components/ThemeToggle.tsx
```

Comportamiento actual:

- Por defecto el sitio carga en modo claro.
- Solo usa modo oscuro si `localStorage.theme === "dark"`.
- Ya no sigue automáticamente el modo oscuro del sistema.
- En carga inicial limpia o aplica la clase `dark` correctamente.

Esto resolvió el caso donde el sitio podía quedarse con clase oscura y colores mezclados.

### 10. Ajuste específico de Rubí Quintanilla

El usuario reportó que Rubí Quintanilla se veía mal, mientras los demás perfiles se veían bien.

Perfil identificado:

```text
Rubí Quintanilla Martínez
slug: rubi-quintanilla-martinez
image: /team_photos/rubi-quintanilla-martinez.jpg
```

Archivo:

```text
attached_assets/team_photos/rubi-quintanilla-martinez.jpg
```

Diagnóstico:

- Imagen vertical 800x1000.
- El rostro estaba alto y hacia la derecha.
- El recorte común `50% 0%` no favorecía esa foto en tarjetas y detalle.

Se hizo preview local con varias posiciones:

```text
50% 0%
60% 0%
64% 0%
58% 18%
```

Se eligió:

```text
62% 0%
```

Implementación:

```text
client/src/lib/teamPhotoPosition.ts
```

Contenido esencial:

```ts
const teamPhotoObjectPositions: Record<string, string> = {
  "rubi-quintanilla-martinez": "62% 0%",
};

export function getTeamPhotoObjectPosition(slug?: string | null): string {
  if (!slug) return "50% 0%";
  return teamPhotoObjectPositions[slug] || "50% 0%";
}
```

Se aplicó en:

```text
client/src/pages/Team.tsx
client/src/pages/TeamMemberDetail.tsx
client/src/components/TeamMemberCard.tsx
```

Commit:

```text
b5a181f Adjust Rubi Quintanilla photo framing
```

Después del build, el bundle público contenía la regla:

```text
{"rubi-quintanilla-martinez":"62% 0%"}
```

## Línea de tiempo por commits

```text
dbef58f Initial import: Von Wobeser source as base for Santos & Saucedo rebrand
2118e5f Add static rebrand preview page for GitHub Pages
0d454b1 Implement Santos Saucedo rebrand prototype
b29132a Update GitHub Pages client preview
5c05ee5 Align Pages preview with local prototype
95102b3 Deploy real frontend to GitHub Pages
72ec380 Fix Pages asset paths
b96aa60 Rebrand remaining Von Wobeser references
c633ff8 Align Santos phone number
7776237 Add official Santos team photos and content
b4dde3f Refresh public site color palette
d26835e Fix light and dark color modes
b5a181f Adjust Rubi Quintanilla photo framing
```

## Validaciones realizadas

Validaciones locales usadas durante el proyecto:

```bash
npm run check
npm run build:pages
git diff --check
```

Notas observadas:

- `npm run check` pasó en las rondas relevantes.
- `npm run build:pages` pasó en las rondas relevantes.
- En esta máquina, el build a veces requiere permisos elevados por comportamiento de `tsx` creando pipes temporales en `/var/folders/...`. Eso fue un tema del sandbox/entorno, no un fallo del código.
- Se observaron warnings no bloqueantes:
  - Browserslist/caniuse-lite outdated.
  - Warning de PostCSS sobre `from`.
  - Algunos chunks mayores a 500 kB.
  - Aviso de GitHub Actions sobre Node, actualizado a Node 24 en el workflow.

Deploys de GitHub Pages revisados durante el trabajo:

```text
28898827948  Paleta visual
28899354719  Modo claro/oscuro
28899877201  Ajuste Rubí Quintanilla
```

## Estado de GitHub Pages

El despliegue se ejecuta desde GitHub Actions con:

```text
.github/workflows/pages.yml
```

El build publicado usa:

```bash
npm run build:pages
```

La salida publicada:

```text
dist/public
```

URL pública:

```text
https://ia-satma.github.io/santos-saucedo-page/
```

La expectativa del proyecto es que cada push a `main` actualice la página pública.

## Decisiones técnicas importantes

### GitHub Pages no reemplaza backend

GitHub Pages solo sirve archivos estáticos. Por eso:

- No se puede ejecutar Express ahí.
- No se puede persistir contenido desde formularios.
- No se puede iniciar sesión.
- No se puede usar CMS real.
- No se pueden ejecutar agentes o procesos del backend.

La solución correcta para Pages fue crear un snapshot JSON estático del contenido público.

### Snapshot desde la misma fuente de datos

El snapshot no debe ser una segunda maqueta mantenida a mano. Debe salir del mismo seed/datos usados por el proyecto para evitar divergencia entre local y Pages.

Archivo clave:

```text
script/generate-static-api.ts
```

### Subpath de GitHub Pages

Como el sitio vive en:

```text
/santos-saucedo-page/
```

Vite necesita:

```text
VITE_BASE_PATH=/santos-saucedo-page/
```

Config:

```text
vite.config.ts
```

Línea relevante:

```ts
base: process.env.VITE_BASE_PATH || "/",
```

### Rutas SPA

Para soportar refresh/direct links:

```text
index.html -> 404.html
```

Esto permite que GitHub Pages entregue el shell de React aunque la ruta no exista como archivo físico.

## Branding actual

Marca:

```text
Santos & Saucedo
```

Color principal:

```text
#202058
```

Teléfono:

```text
+52 81 8335 2086
```

Correo:

```text
info@santossaucedo.com
```

Ubicación:

```text
San Pedro Garza García, Nuevo León, México
```

Dirección visual aprobada por conversación:

- Editorial clara.
- Premium.
- Limpia.
- Blanco puro.
- Navy corporativo.
- Menos negro.
- Mejor contraste.
- Fotos visibles y menos apagadas.

## Archivos clave para seguir trabajando

Frontend:

```text
client/src/
client/src/pages/
client/src/components/
client/src/lib/queryClient.ts
client/src/lib/teamPhotoPosition.ts
client/src/components/ThemeToggle.tsx
client/src/index.css
```

Backend/datos:

```text
server/seed.ts
server/index.ts
shared/
```

Static Pages:

```text
script/generate-static-api.ts
vite.config.ts
.github/workflows/pages.yml
```

Assets:

```text
attached_assets/
attached_assets/team_photos/
```

Documentación existente:

```text
replit.md
design_guidelines.md
AGENT_SYSTEM.md
```

## Comandos útiles

Instalar dependencias:

```bash
npm ci
```

Levantar local con backend:

```bash
npm run dev
```

Validar TypeScript:

```bash
npm run check
```

Build normal:

```bash
npm run build
```

Build para GitHub Pages:

```bash
npm run build:pages
```

Revisar estado git:

```bash
git status --short
```

Ver últimos commits:

```bash
git log --oneline --decorate -15
```

Publicar cambios:

```bash
git add .
git commit -m "Mensaje descriptivo"
git push origin main
```

## Pendientes y riesgos conocidos

### QA visual en navegador

Se hizo validación de build y revisión puntual, pero queda como buena práctica correr una revisión visual completa en navegador para:

- Home
- Equipo
- Detalle de socios
- Noticias
- Áreas de práctica
- Industrias
- Oficinas
- Contacto
- Vista móvil
- Vista desktop
- Modo claro
- Modo oscuro

En intentos previos, Playwright/Chromium no estaba disponible localmente por falta de ejecutable instalado. Se puede usar el navegador de la app o instalar navegadores de Playwright si se decide hacer QA automatizado.

### Tamaño de chunks

El build reportó chunks grandes. No bloquea el deploy, pero puede optimizarse después con code splitting o revisión de dependencias pesadas.

### Direct links en GitHub Pages

La estrategia `404.html` permite que la app cargue en rutas internas, pero GitHub Pages puede devolver status HTTP 404 en una ruta directa aunque muestre el sitio. Si eso se vuelve importante para SEO o métricas, habría que valorar hash routing o una estrategia alternativa.

### Admin/CMS

El admin real necesita backend. En Pages debe quedar bloqueado o claramente marcado como no disponible. No debe parecer que guarda cambios.

### Contenido oficial

El contenido puede seguir refinándose contra:

- Información oficial del sitio de Santos & Saucedo.
- Materiales del cliente.
- Logos/fotos del pCloud.
- Revisión legal/corporativa final del cliente.

### Archivos AppleDouble

En el árbol se han visto archivos `._*` típicos de macOS/volúmenes externos. `git status` estaba limpio, pero conviene evitar agregarlos a commits si aparecen como untracked.

## Cómo continuar

Para cualquier cambio visual o de contenido:

1. Hacer el cambio en el frontend/datos reales, no en una maqueta separada.
2. Correr `npm run check`.
3. Correr `npm run build:pages`.
4. Revisar localmente `dist/public` si el cambio toca assets o rutas.
5. Hacer commit.
6. Hacer push a `main`.
7. Confirmar que GitHub Actions termina en success.
8. Revisar la URL pública de GitHub Pages.

## Regla principal del proyecto

La regla más importante acordada con el usuario es:

> GitHub Pages debe mostrar el frontend real del proyecto y actualizarse con el repositorio. No debe ser un prototipo separado.

Todo cambio futuro debe respetar esa regla.
