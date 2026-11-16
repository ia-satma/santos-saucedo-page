# Reglas de ingeniería y mantenimiento

## Regla de una sola fuente

Antes de añadir un dato, responde dónde se guarda, quién lo edita, qué idiomas tiene, qué páginas lo muestran y qué ocurre si está vacío. Si la respuesta no está en el código o en el mapa CMS, el cambio no está listo.

## Cómo añadir una página

1. Añade el ID y los bloques a `editorMetadata.ts`.
2. Añade la ruta estable y sus aliases a `shared/publicRoutes.ts`.
3. Añade la ruta pública y administrativa al router.
4. Define el fallback en `shared/cms-defaults.json`.
5. Añade la clave de visibilidad a `layout.pages`.
6. Conecta el componente a `useCmsContent` o a su catálogo.
7. Añade SEO, idioma, navegación, sitemap y preview.
8. Añade pruebas de ruta, persistencia, visibilidad y restauración.
9. Actualiza `docs/CMS_CONTENT_MAP.md`.

## Cómo añadir un bloque

Un bloque necesita un ID estable, nombre humano, fuente, fallback, idioma, medios y textos alternativos juntos, botones con texto y destino juntos, interruptor de bloque cuando aplique, referencia al componente público y prueba de guardado y render.

No se crean desplegables anidados para esconder campos de un mismo bloque. Si el bloque es largo, se divide visualmente con encabezados y un índice lateral.

## Cambios de datos

- Cambios de esquema van en `shared/schema.ts` y en la compatibilidad de arranque correspondiente.
- Cambios de API validan entrada con los esquemas existentes y mantienen mensajes por campo.
- Cambios de contenido por cliente se hacen desde el CMS.
- Cambios de fallback se hacen en `shared/cms-defaults.json`.
- Las ampliaciones de esquema son aditivas y reversibles.

## Pruebas por cambio

| Cambio | Pruebas mínimas |
| --- | --- |
| Página o ruta | `test:routes`, `test:public-flows`, recarga directa y alias |
| CMS o persistencia | `test:cms`, revisión `409`, guardar, recargar y restaurar |
| Visibilidad | ocultar, menú, pie, contenido, preview privada y reactivar |
| Catálogo | fixture, orden, publicación, ficha y referencias |
| Idiomas | `test:localization`, español, inglés y RTL cuando aplique |
| Formulario | validación, consentimiento, éxito, error y registro sintético |
| Medios | MIME, dimensiones, alt, rango de video y frontera público/privado |
| Animación | escritorio, móvil, movimiento reducido, ahorro de datos y sin WebGL |
| Seguridad | sesión, roles, rutas privadas y `npm audit` |
| Rendimiento | build, chunks, medios responsive, Lighthouse y consola |

## Revisión antes de push

```bash
npm run check
npm run build
npm run test:routes
npm run test:cms
npm run test:public-flows
npm run test:video-source
npm run test:localization
npm run test:privacy
npm audit --omit=dev --audit-level=high
git diff --check
git status --short
```

No se publica si falla TypeScript, build, una prueba relacionada, una ruta canónica o una comprobación de seguridad.

## Performance y compatibilidad

- Divide rutas administrativas y páginas grandes con lazy loading.
- Mantén imágenes responsive y videos con poster, `preload` controlado y fallback.
- Investiga chunks nuevos que superen 200 KB comprimidos. No ocultes la advertencia desactivando el análisis.
- Mantén PostCSS y Tailwind reproducibles desde `package-lock.json`.
- Prueba Brave y Chrome siempre. Prueba Firefox y WebKit antes de una publicación importante.
- No elimines una animación para mejorar una métrica sin conservar la experiencia equivalente y documentar el motivo.

## Evidencia

No declares cobertura total, Lighthouse 95–100 ni compatibilidad completa sin registrar comando, fecha, URL, viewport, navegador, commit y resultado. Separa siempre lo probado, lo no probado y lo pendiente.

