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
npm run test:public-flows
npm run test:privacy
npm run build:pages
npm run build:deploy
```

La comprobación pública mínima debe revisar `/`, las diez portadas localizadas, `/about`, `/news`, `/contact`, `/practice-groups`, un artículo localizado, `/sitemap.xml`, `/static-api/site-config.json` y `/static-api/translations.json`.

## Flujo de publicación

La sincronización y publicación se ejecutan manualmente desde el Shell de Replit, sin usar agentes de Replit:

```bash
cp shared/translation-snapshot.json /tmp/translation-snapshot.json
git fetch origin main
git reset --hard origin/main
cp /tmp/translation-snapshot.json shared/translation-snapshot.json
npm run check
npm run build:deploy
```

Después se cierra el Shell, se pulsa **Republish** y se verifica el dominio público y el historial de publicación. El snapshot de traducciones debe conservarse antes del `reset` y comprobarse después del build.

## Editor de firmas de correo

- El panel está en `/admin/signatures` y se limita a cuentas con permiso de medios. Incluye las 12 plantillas del ZIP de referencia, vista previa, edición de datos, carga de fotografía, copia de HTML, copia enriquecida y descarga.
- Las plantillas viven en `shared/signatureTemplates.ts`; `shared/signatureGenerator.ts` es el generador compartido entre frontend y servidor. Los recursos visuales publicados están en `client/public/signatures/assets/`.
- Las firmas se guardan en `email_signatures`. El documento HTML generado por el servidor se almacena en App Storage como `public/media/signature-<id>.html`. La descarga usa `GET /api/admin/signatures/:id/download`, autenticación y `Content-Disposition: attachment`.
- Las fotografías pasan por la biblioteca de medios existente, con validación y escaneo, y se guardan en App Storage antes de asociarse a una firma. El servidor no acepta HTML arbitrario del navegador y regenera el documento desde la plantilla y los campos validados.
- La prueba específica es `npm run test:signatures`, además de `npm run check` y `npm run build`. La publicación sigue siendo manual desde Shell de Replit y Republish, sin agentes de Replit.

## Actualización del editor de firmas — 10 de noviembre de 2026

- El editor publicado usa un panel de datos navy a la izquierda y un catálogo de las 12 plantillas a la derecha. El layout respeta el ancho real de `.admin-main-column`, por lo que la navegación global no cubre el formulario ni las vistas previas.
- Cada plantilla ofrece copia HTML, copia enriquecida, descarga `.html`, descarga PNG a 2x y vista del código. El PNG se renderiza desde el DOM con `html2canvas`; las imágenes de App Storage se inlinéan antes de capturar para evitar errores de CORS.
- Los campos de LinkedIn y Facebook se convierten en hipervínculos en todas las plantillas que muestran esos iconos. La plantilla 12 mantiene también sus enlaces de sitio web y LinkedIn.
- La navegación lateral del CMS puede minimizarse a un rail de 72 px desde la barra superior. La preferencia se conserva en `localStorage` con la clave `ss-admin-sidebar-collapsed`; en móvil permanece el panel lateral existente.
- Verificación real publicada en `https://santos-saucedo.replit.app/admin/signatures`: PNG `1200 × 500` descargado, HTML descargado, enlaces sociales actualizados y rail colapsado/expandido. La carga de fotografía queda cubierta por las pruebas de multipart y chunked upload del CMS. La selección de archivos desde el navegador de pruebas requiere permitir acceso a archivos locales en la extensión de Brave.
- El guardado conserva los datos comunes, la fotografía y la variante seleccionada. Al editar una versión guardada se regeneran las 12 vistas. La interfaz indica la plantilla seleccionada y la descarga HTML vigente.
- Las fotos se normalizan a URL pública absoluta y se recortan con `object-fit: cover` y `object-position: center` en los formatos JPG, JPEG, PNG, WebP y GIF. El test del generador comprueba también que no haya referencias a assets estáticos inexistentes.
