# Constructor visual del CMS

## Estado

El CMS incorpora Puck como modo visual adicional dentro de cada editor de página. El editor largo existente sigue siendo la ruta principal de respaldo. Puck se carga de forma diferida dentro de la sección administrativa y sus estilos no forman parte del HTML inicial de las páginas públicas.

La bandera `layout.pages.<pageId>.blocks.visual` controla la publicación visual de cada página. Está apagada por defecto para evitar cambios públicos accidentales. El editor puede preparar un borrador visual aunque la bandera esté apagada. La página pública solo consulta una composición publicada cuando la bandera está activa.

## Fuentes únicas

- Los textos, medios, SEO y traducciones siguen viviendo en las secciones actuales del CMS.
- Las prácticas, industrias, socios, notas y vacantes se guardan como referencias de catálogo y no se copian en el documento visual.
- La biblioteca de medios sigue siendo la fuente de imágenes y videos.
- La visibilidad global y por bloque sigue viviendo en `layout`.
- Los componentes V3, sus animaciones y sus fallbacks no se reemplazan por JSX editable.

## Flujo editorial

1. El editor abre `/admin/page/:pageId` y activa «Editar visualmente».
2. El lienzo carga el borrador del idioma seleccionado o genera una composición inicial desde las secciones existentes.
3. El editor puede reordenar, duplicar, eliminar y editar componentes permitidos.
4. «Guardar borrador» usa la revisión CAS del documento visual.
5. «Publicar diseño» mueve el borrador a `content` y conserva la versión anterior.
6. «Restaurar anterior» crea un nuevo borrador con la versión previa.
7. La bandera `visual` debe activarse desde la visibilidad de la página para que la composición publicada reemplace el contenido principal público.

## API

- `GET /api/admin/visual-pages/:pageId/:language` carga borrador, publicado, versión anterior y revisión.
- `PUT /api/admin/visual-pages/:pageId/:language` guarda un borrador validado.
- `POST /api/admin/visual-pages/:pageId/:language/publish` publica con control de revisión.
- `POST /api/admin/visual-pages/:pageId/:language/restore` restaura la versión anterior como borrador.
- `GET /api/visual-pages/:pageId/:language` devuelve únicamente la versión publicada y nunca datos de borrador.

Todas las rutas administrativas requieren sesión, rol editorial y permisos de configuración. El servidor valida página, idioma, componente, propiedades, tamaño, profundidad, rutas internas y contenido ejecutable.

## Componentes permitidos

La configuración incluye `HeroBlock`, `VideoBlock`, `TextBlock`, `QuoteBlock`, `StatsBlock`, rejillas de catálogos, `MediaBlock`, `Gallery`, `Map`, `Form`, `VisualSheet`, `Navigation`, `Footer`, `SectionBlock` y `Spacer`. La lista está restringida en `shared/visualPages.ts`. Las rejillas conservan referencias a los catálogos y el renderer público carga sus datos mediante las APIs públicas existentes.

Los bloques iniciales de Portada conservan un `sourceMap` interno. Al guardar un borrador o publicar desde el constructor, los campos editados se sincronizan con la sección CMS correspondiente usando la revisión y el historial del CMS. El mapa no es editable como código y solo acepta rutas de secciones declaradas.

Los datos visuales incluyen `schemaVersion` para permitir migraciones. La publicación conserva actor, fecha, borrador, versión publicada y versión anterior dentro de `site_config` con claves `visual.<pageId>.<language>`.

## Reglas de seguridad

- No se acepta JSX, HTML, JavaScript, CSS arbitrario ni handlers de eventos.
- Los medios deben usar rutas internas permitidas o referencias de la Biblioteca.
- Los enlaces externos requieren HTTPS.
- Se rechazan scripts, `javascript:`, `vbscript:`, `data:text/html` y propiedades peligrosas.
- El límite actual es de 100 componentes, 12 niveles de profundidad y 500 KB por composición.
- El permiso visual de Puck no sustituye autenticación, RBAC, CSRF ni validación del servidor.
- Los logs registran acción, página, idioma y actor sin incluir contenido sensible.

## Rendimiento

`@puckeditor/core` se importa de forma diferida dentro del editor administrativo. La página pública usa un adaptador de lectura independiente que no importa Puck. El build mantiene Puck en un chunk separado del panel y conserva la ruta pública sin la dependencia del editor.

## Pruebas obligatorias

- `npm run check`
- `npm run build`
- `node --import tsx --test server/security/visualPages.test.ts`
- Guardado, conflicto, publicación y restauración con sesión editorial.
- Banderas visuales apagadas y activadas.
- Vista pública sin borradores.
- Preview privada de una página desactivada.
- Idiomas, medios, enlaces, reducción de movimiento y viewport móvil.
- Consola sin errores y ausencia de Puck en el bundle público inicial.
