# Contexto actual del proyecto

## Integración visual del CMS

Se añadió un modo visual basado en Puck dentro de los editores organizados por página. El editor existente continúa disponible como respaldo. La implementación usa el backend y la autenticación actuales.

La composición visual se almacena en `site_config` con claves `visual.<pageId>.<language>`. Cada documento conserva borrador, publicado, versión anterior, revisión, actor, fecha y `schemaVersion`. Los bloques iniciales incluyen referencias internas a campos CMS. Al guardar o publicar, los valores editados se sincronizan con la sección editorial que los alimenta, sin duplicar fichas ni medios.

Las rutas administrativas son:

- `GET /api/admin/visual-pages/:pageId/:language`
- `PUT /api/admin/visual-pages/:pageId/:language`
- `POST /api/admin/visual-pages/:pageId/:language/publish`
- `POST /api/admin/visual-pages/:pageId/:language/restore`

La ruta pública `GET /api/visual-pages/:pageId/:language` solo devuelve la versión publicada.

## Seguridad visual

La validación está centralizada en `shared/visualPages.ts`. Se controlan páginas, idiomas, componentes, propiedades, tamaño, profundidad, rutas de medios, enlaces HTTPS y contenido ejecutable. El servidor usa RBAC y comparación CAS para evitar sobrescribir ediciones concurrentes.

Los medios se seleccionan mediante la Biblioteca de medios dentro de Puck. Las fichas se manejan como referencias. No se permite insertar JSX, JavaScript, HTML, CSS arbitrario ni propiedades de evento.

## Publicación pública

El bloque `visual` de `layout.pages.<pageId>.blocks` funciona como interruptor de publicación visual. Está apagado por defecto. Cuando se activa, el frontend puede leer la composición publicada con un adaptador independiente que no importa Puck. Los borradores nunca se sirven al público.

El editor Puck se carga de forma diferida dentro de `/admin/page/:pageId`. La dependencia pesada del editor queda en un chunk administrativo separado.

## Componentes actuales

La configuración inicial incluye Hero, texto, cita, cifras, sección existente y medios. El contrato del servidor también reserva nombres para rejillas de prácticas, industrias, equipo, Monitor, galerías, mapas, formularios, láminas, navegación, pie y espacios. Cada nuevo adaptador debe conectar una fuente CMS, una vista pública, permisos, traducciones y pruebas antes de activarse.

## Pruebas realizadas

- TypeScript aprobado.
- Build de producción aprobado.
- Validación visual y límites aprobados en 4 pruebas.
- Batería de agentes aprobada con 89 pruebas.
- Rutas públicas aprobadas con 3 pruebas.
- Visibilidad y video aprobados con 3 pruebas.
- Flujos públicos aprobados con 65 comprobaciones.
- Localización aprobada en 10 idiomas.
- Radar y Monitor aprobados con 20 pruebas.
- Testimonios aprobados con 8 pruebas.
- `npm audit --omit=dev --audit-level=moderate` sin vulnerabilidades.

El build conserva avisos previos de tamaño de chunks y tiempos de PostCSS. Puck se mantiene separado del bundle inicial de las rutas públicas.

## Operación

El CMS se edita desde `/admin/page/:pageId`. La ruta `/admin/site-config/:section` sigue siendo el directorio técnico de respaldo. Los cambios editoriales se guardan como borrador, se revisan en preview y se publican por separado. La activación del constructor visual debe probarse con la bandera de la página antes de publicarse en producción.
