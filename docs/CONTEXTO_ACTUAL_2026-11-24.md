# Contexto actual del proyecto

## Edición del CMS

El CMS utiliza el editor por formularios organizado por página y bloque en `/admin/page/:pageId`. Cada página reúne sus campos editoriales, medios, catálogos relacionados, idioma, visibilidad, vista previa privada, borradores, publicación y restauración. El directorio técnico `/admin/site-config/:section` permanece como respaldo interno.

Las fuentes de prácticas, industrias, socios, notas, vacantes, medios y datos compartidos siguen siendo autoritativas. Los cambios de frontend deben mantener sus conexiones a esas fuentes y documentarse en `editorMetadata.ts` y `CMS_CONTENT_MAP.md`.

El constructor visual basado en Puck fue retirado del CMS y del frontend. Ya no existen sus rutas administrativas o públicas, su dependencia, sus composiciones `visual.*` ni su interruptor de publicación. La edición pública continúa usando los componentes actuales y el flujo editorial por formularios.

## Visibilidad

`layout.pages[page].enabled` controla la página completa. `layout.pages[page].blocks[block]` controla cada bloque. El consumidor debe usar `pageVisibility` o `blockVisible` en vez de interpretar valores manualmente.

## Pruebas realizadas


- TypeScript aprobado.
- Build de producción aprobado.
- Batería de agentes aprobada con 89 pruebas.
- Rutas públicas aprobadas con 3 pruebas.
- Visibilidad y video aprobados con 3 pruebas.
- Flujos públicos aprobados con 65 comprobaciones.
- Localización aprobada en 10 idiomas.
- Radar y Monitor aprobados con 20 pruebas.
- Testimonios aprobados con 8 pruebas.
- `npm audit --omit=dev --audit-level=moderate` sin vulnerabilidades.

El build conserva avisos previos de tamaño de chunks y tiempos de PostCSS.

## Operación

El CMS se edita desde `/admin/page/:pageId`. La ruta `/admin/site-config/:section` sigue siendo el directorio técnico de respaldo. Los cambios editoriales se guardan como borrador, se revisan en preview y se publican por separado.
