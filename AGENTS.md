# Reglas del proyecto

Estas reglas aplican a cualquier persona, agente o automatización que cambie este repositorio.

## Fuentes únicas de verdad

- El contenido editable vive en el CMS y sus APIs. `shared/cms-defaults.json` contiene el fallback versionado y la forma esperada de los datos.
- `client/src/features/site-config/editorMetadata.ts` es el índice canónico de páginas, aliases, bloques, tabs y secciones del CMS.
- Los catálogos de prácticas, industrias, equipo, notas y vacantes conservan sus propias tablas y APIs. No se copian dentro de una página.
- `shared/schema.ts` define el contrato de base de datos. Los tipos compartidos y validadores deben cambiar junto con el esquema.
- `shared/publicRoutes.ts` define la conversión entre rutas internas estables, rutas públicas en español y aliases.
- `shared/cms-static-snapshot.json`, `shared/translation-snapshot.json`, `client/public/static-api` y `dist` son artefactos de publicación. No se editan manualmente.

## Contenido público

- Cada texto, cifra, etiqueta, botón, imagen, video, caption, texto alternativo, estado de formulario y metadato visible debe tener una fuente editable o una razón documentada para ser fijo.
- Un bloque público debe tener página, nombre humano, fuente de datos, estado de visibilidad, idioma, componente consumidor y prueba.
- Los campos que aparecen en varias páginas deben conservar una fuente compartida y mostrar en el CMS dónde más se usan.
- Las animaciones se conservan. Deben tener fallback para `prefers-reduced-motion`, ahorro de datos, reproducción bloqueada y ausencia de WebGL cuando aplique.
- Los textos legales requieren revisión humana. Los agentes pueden proponer cambios, pero no publicarlos sin revisión.

## CMS y publicación editorial

- Una página tiene ruta canónica, aliases, bloques ordenados, fichas relacionadas, secciones CMS y SEO.
- La visibilidad global de una página controla ruta pública, menú, pie y contenido. La visibilidad de bloque controla solo ese bloque.
- La vista previa privada puede mostrar una página desactivada únicamente a una sesión CMS autenticada. No relajar esta autorización.
- El flujo editorial es borrador, revisión, vista previa, publicación y restauración. Un conflicto de revisión `409` no puede sobrescribir cambios ajenos.
- Guardar contenido en el CMS no requiere hacer commit ni publicar código. Cambiar componentes, contratos o rutas sí requiere commit, build y despliegue.

## Rutas y catálogos

- Al crear una página se registra en `editorMetadata.ts`, `canonicalPageOrder`, `shared/publicRoutes.ts`, el router público, el router administrativo y las pruebas de rutas.
- Al crear una ficha se enlaza al catálogo correspondiente. No se crean copias de una práctica, industria, persona o nota dentro de otra página.
- Los aliases antiguos redirigen a la ruta canónica. No se eliminan sin registrar la migración y probar el redirect.

## Medios y seguridad

- Las imágenes, videos y documentos públicos pasan por la Biblioteca de medios y App Storage.
- `private_uploads` y los namespaces privados de App Storage nunca se sirven como archivos públicos.
- No se agregan URLs externas arbitrarias para sustituir un medio del CMS.
- No se guardan secretos, contraseñas, hashes, tokens, datos de clientes ni URLs privadas en Git, logs o documentación.
- Las suites que escriben datos usan fixtures sintéticos y nunca se ejecutan contra Production.

## Calidad obligatoria

Antes de cerrar un cambio que afecte al sitio o al CMS:

1. Ejecuta `npm run check`.
2. Ejecuta `npm run build`.
3. Ejecuta las suites relacionadas con el cambio.
4. Prueba una ruta pública y una ruta administrativa cuando aplique.
5. Comprueba un cambio guardado, una recarga y el idioma afectado.
6. Si cambió visibilidad, prueba ocultar, vista previa privada y restaurar.
7. Si cambió un medio, comprueba tamaño, texto alternativo y carga pública o privada.
8. Revisa consola, errores de red, overflow horizontal y movimiento reducido.
9. Actualiza el inventario y la documentación si cambió una ruta, bloque, fuente o flujo.

No declares una tarea completa por haber compilado. El cambio debe aparecer en el flujo normal del usuario.
