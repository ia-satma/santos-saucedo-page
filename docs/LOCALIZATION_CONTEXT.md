# Contexto de localización y publicación

Estado verificado el 10 de noviembre de 2026 para `santos-saucedo-cms`.

## Idiomas y rutas

El sitio publica diez locales: `es`, `en`, `de`, `zh`, `ko`, `ja`, `ar`, `ru`, `fr` e `it`.
Todas las rutas públicas usan el prefijo del idioma:

```text
/es/
/en/about
/ko/news
/zh/practice-groups
```

Las rutas públicas sin prefijo redirigen con `308` a la versión en español. Los enlaces internos se reescriben con el idioma activo; las rutas de administración, API y archivos estáticos permanecen sin prefijo.

## SEO y GEO

- Cada ruta localizada entrega desde el servidor su `canonical`, `hreflang` para los diez idiomas y `x-default`.
- Las fichas de noticias generan metadatos con el título, extracto, imagen y traducción del CMS correspondiente.
- `/sitemap.xml` contiene 240 URLs localizadas (incluidas fichas de equipo, prácticas y noticias públicas), sin URLs públicas antiguas sin idioma.
- El dominio publicado es `https://santos-saucedo.replit.app`; el dominio canónico editorial continúa siendo `https://www.santossaucedo.com`.

## Snapshots y CMS

- `shared/cms-static-snapshot.json`: 43 secciones CMS publicadas para el frontend estático.
- `shared/translation-snapshot.json`: 576 entradas de entidades traducidas.
- `client/public/sitemap.xml`: copia rastreable del sitemap localizado para Pages.
- `script/generate-static-api.ts`: regenera `dist/public/static-api` y el sitemap localizado.

Los componentes deben leer contenido con `useCmsContent(section, fallback)`. Para entidades editables, se usan los snapshots publicados y la tabla de traducciones; no se debe asumir que un idioma distinto de español o inglés es inglés.

## Comandos de comprobación

```bash
npm run check
npm run test:localization
npm run test:cms
npm run test:editorial
npm run test:access
npm run test:agents
npm run test:social-studio
npm run test:documents-api
npm run test:panel
npm run test:public-flows
npm run test:privacy
npm run build:pages
npm run build:deploy
```

La comprobación pública mínima debe revisar `/`, las diez portadas localizadas, `/about`, `/news`, `/contact`, `/practice-groups`, un artículo localizado, `/sitemap.xml`, `/static-api/site-config.json` y `/static-api/translations.json`.

## Flujo de publicación

La sincronización y publicación se ejecutan manualmente desde el Shell de Replit, sin usar agentes de Replit:

```bash
git fetch origin main
git merge --no-edit origin/main
npm ci
npm run check
npm run build:deploy
```

Después se verifica el arranque con `npm run start:deploy` y `/readyz`. Se pulsa **Republish** y se confirma la etapa **Promote**, la versión activa y el dominio público. El merge conserva los commits de publicación de Replit; resuelve cualquier conflicto de snapshots antes de construir.

## Editor de firmas de correo

- El panel está en `/admin/signatures` y se limita a cuentas con permiso de medios. Incluye las 12 plantillas del ZIP de referencia, vista previa, edición de datos, carga de fotografía, copia de HTML, copia enriquecida y descarga.
- Las plantillas viven en `shared/signatureTemplates.ts`; `shared/signatureGenerator.ts` es el generador compartido entre frontend y servidor. Los recursos visuales publicados están en `client/public/signatures/assets/`.
- Las firmas se guardan en `email_signatures`. El documento HTML generado por el servidor se almacena en App Storage como `public/media/signature-<id>.html`. La descarga usa `GET /api/admin/signatures/:id/download`, autenticación y `Content-Disposition: attachment`.
- Las fotografías pasan por la biblioteca de medios existente, con validación y escaneo, y se guardan en App Storage antes de asociarse a una firma. El servidor no acepta HTML arbitrario del navegador y regenera el documento desde la plantilla y los campos validados.
- La prueba específica es `npm run test:signatures`, además de `npm run check` y `npm run build`. La publicación sigue siendo manual desde Shell de Replit y Republish, sin agentes de Replit.

## Actualización del editor de firmas — 10 de noviembre de 2026

- El editor publicado usa un panel de datos navy a la izquierda y un catálogo de las 12 plantillas a la derecha. El layout respeta el ancho real de `.admin-main-column`, por lo que la navegación global no cubre el formulario ni las vistas previas.
- Cada plantilla ofrece copia HTML, copia enriquecida, descarga `.html`, descarga PNG a 2x y vista del código. El PNG se renderiza desde el DOM con `html2canvas`; las imágenes de App Storage se inlinéan antes de capturar y las fotografías se recortan en canvas a la proporción exacta de cada plantilla antes de exportar. El HTML de fotografías CMS usa `/api/signature-photo`, que genera y cachea un PNG 2x con el recorte exacto en App Storage para conservar la proporción en Gmail y Outlook aunque ignoren `object-fit`.
- Los campos de LinkedIn y Facebook se convierten en hipervínculos en todas las plantillas que muestran esos iconos. La plantilla 12 mantiene también sus enlaces de sitio web y LinkedIn.
- La navegación lateral del CMS puede minimizarse a un rail de 72 px desde la barra superior. La preferencia se conserva en `localStorage` con la clave `ss-admin-sidebar-collapsed`; en móvil permanece el panel lateral existente.
- Verificación real publicada en `https://santos-saucedo.replit.app/admin/signatures`: PNG `1200 × 500` descargado, HTML descargado, enlaces sociales actualizados y rail colapsado/expandido. La carga de fotografía queda cubierta por las pruebas de multipart y chunked upload del CMS. La selección de archivos desde el navegador de pruebas requiere permitir acceso a archivos locales en la extensión de Brave.
- El guardado conserva los datos comunes, la fotografía y la variante seleccionada. Al editar una versión guardada se regeneran las 12 vistas. La interfaz indica la plantilla seleccionada y la descarga HTML vigente.
- Las fotos se normalizan a URL pública absoluta y se recortan con `object-fit: cover` y `object-position: center` en los formatos JPG, JPEG, PNG, WebP y GIF. El test del generador comprueba también que no haya referencias a assets estáticos inexistentes.

## Estudio de contenido Santos & Saucedo

- `/admin/presentations` genera presentaciones con la identidad Santos & Saucedo. La entrada institucional se incluye por defecto y puede desactivarse; el cierre institucional se conserva. Ofrece PPTX, PDF y PNG. La clasificación no es un campo obligatorio del formulario y las políticas de salida de datos se aplican en el servidor.
- `/admin/social` genera piezas para redes, con previsualización, edición, rediseño, copias, historial y descargas de PNG por lámina o ZIP.
- `/admin/documents` genera documentos con membrete, con edición versionada, descargas de DOCX y PDF e historial con papelera recuperable. Los documentos nuevos eligen entre las cuatro hojas oficiales de `client/public/letterheads/`: Clásica, Bandas azules, Trama institucional y Pie azul. La plantilla se guarda por versión. Los documentos anteriores conservan su formato y pueden cambiar a una de las cuatro hojas al guardar una versión nueva.
- Los archivos nuevos de redes y documentos viven en `private/studio/` en App Storage; las presentaciones conservan su espacio privado y el acceso a su historial. Las rutas administrativas verifican sesión y permisos antes de entregar archivos. Las migraciones del estudio usan el cliente TCP de PostgreSQL para que las transacciones también funcionen cuando el cliente web usa Neon HTTP.
- La configuración de texto se centraliza en `server/openai.ts`: `gpt-6.1-sol` con `service_tier: "fast"`. Los motores especializados siguen produciendo imágenes, audio y archivos. La guía PPTX instalada vive en `.agents/skills/pptx`.
