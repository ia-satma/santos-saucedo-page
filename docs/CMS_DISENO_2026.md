# CMS Santos & Saucedo — conexión del diseño 2026

Base: `d7cdf63a73480e242d68bbbd3b4ab6dc77083307`. Se conserva la composición, las fuentes y el tratamiento de fotografías del diseño Clásica.

## Qué se edita

Entre a `/admin/site-config` desde «Editar contenido del sitio» en el panel. El menú agrupa la portada, la visibilidad de sus secciones, fotos y video, navegación/pie, datos del despacho, páginas internas, SEO, textos legales, consentimiento, mensajes e idiomas. Los controles son formularios; no es necesario editar JSON.

- Portada: encabezado, ciudad/año, Firma, Lo que creemos, Empresas extranjeras, títulos/introducciones de Prácticas, Socios y Monitor.
- Medios: logos claro/oscuro, favicon, video para escritorio/móvil, póster, fotos de la oficina compartidas con otras páginas y mosaico anónimo del equipo. Al cambiar una imagen principal se sustituye también la variante pequeña para evitar que el navegador muestre la fotografía anterior.
- Navegación: etiquetas por idioma, orden y visibilidad. Las rutas y los identificadores permanecen vinculados a sus páginas; los nombres se comparten con encabezados y enlaces de vuelta.
- Nuestra firma, La oficina, Carreras, Semillero, Contacto, Boletín, Monitor y fichas: contenido y etiquetas por idioma. Los textos legales se revisan por una persona; no se traducen automáticamente al guardar.
- Datos del despacho: dirección, teléfono, correo, reclutamiento, privacidad, LinkedIn y enlace de indicaciones. Se reutilizan en el pie, contacto y oficina.
- `/admin/practice-groups`: nombres/descripciones EN/ES, contenido completo de servicios, orden, publicación y personas relacionadas. Inicio y las fichas consumen el mismo catálogo. Los nombres de idiomas adicionales tienen secciones de configuración propias.
- `/admin/team`: nombres, cargos, biografías, fotos desde Galería, formación, admisiones, idiomas, afiliaciones, reconocimientos, publicaciones, experiencia y orden. «Publicar perfil» controla listado, ficha, búsqueda y sitemap; «Mostrar también en Inicio» selecciona las tarjetas de portada. No se asignan identidades al mosaico anónimo.
- `/admin/news`: publicaciones y programación existentes. Inicio y Monitor comparten la API pública filtrada.
- `/admin/jobs`: vacantes. Solo las publicadas y no vencidas aparecen en Carreras.
- `/admin/inbox`: mensajes de contacto y suscriptores. No envía correos.
- `/admin/gallery`: galería adicional de La oficina. Los espacios de foto del diseño se gestionan desde «Identidad, fotos y video».

## Persistencia y publicación

`site_config` ya existe en el modelo. Las claves permitidas, valores de respaldo y formas de cada sección viven en `shared/cms.ts` y `shared/cms-defaults.json`. No se aceptan claves arbitrarias ni campos desconocidos. Se conserva una versión anterior de cada sección y se compara la revisión al guardar; un conflicto devuelve 409 y no descarta el borrador.

El guardado escribe datos y no requiere Republish. Las pestañas abiertas se actualizan mediante invalidación de caché/BroadcastChannel y consultas periódicas; no se recarga el documento ni se interrumpe un formulario. Development y Production conservan bases distintas: publicar código no copia sus cambios editoriales.

La compatibilidad de esquema agrega únicamente las columnas `team_members.is_public`, `team_members.show_on_home`, `practice_groups.team_member_ids` y `practice_groups.published`, además de crear `site_config` si no existe. La conexión inicial incorpora las cuatro prácticas y los socios confirmados que falten. Conserva sin sobrescribir los registros existentes; las seis prácticas de la plantilla anterior se despublican solo si conservan exactamente sus nombres originales. Siguen disponibles en el panel. La aplicación registra la migración para no repetirla.

## Replit App Storage

Secret requerido en Workspace y Deployment: `REPLIT_APP_STORAGE_BUCKET_ID`. El alias `APP_STORAGE_BUCKET_ID` sigue admitido. El preflight bloquea producción si falta el bucket. No se guardan credenciales en configuración pública ni en Git.

Para cargar el material desde el shell de Replit, después de actualizar el código:

```sh
npm ci
npm run replit:import-media
```

El inventario inicial `shared/cms-media-manifest.json` contiene 86 archivos públicos del diseño: video/póster, identidad, fotografías de oficina, mosaico anónimo y retratos confirmados con variantes. El importador agrega los archivos locales referenciados por los catálogos y Galería que encuentre en la base elegida. No descarga URLs externas ni accede a carpetas fuera de los directorios públicos permitidos.

Cada archivo se sube bajo un nombre de hash, se vuelve a descargar y se compara SHA-256. Solo después se cambian las referencias. Los originales y los objetos previos se conservan; repetir la importación no cambia los nombres de los objetos. Las rutas antiguas referenciadas pero ausentes se informan en `skipped`; los archivos requeridos del diseño que falten impiden sustituir el conjunto de medios.

El índice de referencias verificado también se guarda en el bucket (`public/media/bundled-manifest.json`). Production puede resolver los medios incluidos en el diseño desde ese mismo bucket, incluso si su base no contiene todavía las claves de configuración de Development. Las imágenes nuevas o los cambios editoriales de cada base se administran por separado.

Desde «Identidad, fotos y video» puede comprobar la conexión, iniciar la importación y consultar el progreso. El backend valida las rutas de objeto y entrega rangos HTTP para videos. Las cargas nuevas aceptan PNG, JPEG, WebP, GIF, MP4, WebM y PDF, hasta 50 MB, comprobando la firma del archivo. Los SVG de marca incluidos en el diseño son material de confianza; no se admiten SVG arbitrarios en las cargas del CMS.

Fuera de Replit se permite respaldo de medios en `uploads` únicamente en desarrollo. Nunca se usa como sustituto silencioso en producción.

## Verificación

```sh
npm run check
npm run build
npm run test:cms
```

La prueba de integración exige PostgreSQL local: verifica todos los valores iniciales, sesión/roles, persistencia real, 409 por revisión vieja, campos/rutas inválidos, subida multipart, firma del archivo, integridad binaria, rangos HTTP, bandeja privada y vacantes públicas. Restaura las claves editadas y elimina los usuarios/archivos de prueba. Nunca debe ejecutarse contra una base de producción.

El build estático de Pages conserva sus respaldos, pero un CMS vivo requiere el backend Node de Replit.
