# Monitor Laboral: referencias visuales

Estas cuatro referencias representan el diseño actual de `Monitor26` y
`MonitorEditorial`: escritorio (1440 × 1000) y móvil (375 × 812), en español e
inglés. Se revisaron completas, incluidos los títulos largos y las tres imágenes.
No cambian el diseño de producción.

## Ejecutar

Con la aplicación iniciada (`npm run start:workspace`):

```sh
npm run test:visual:monitor
npm run test:monitor:editorial
npm run test:visual:monitor:verify-detector
```

- El primer comando compara las cuatro referencias sin consultar noticias reales.
- El segundo conserva además todas las comprobaciones funcionales anteriores
  (publicaciones reales, enlaces, archivo, imágenes, desbordamiento, estados,
  borradores y almacenamiento vacío). Requiere al menos tres noticias reales.
- El tercero comprueba el propio detector: introduce, únicamente en el navegador
  de prueba, cambios de jerarquía, espaciado, recorte de imagen y títulos cortados.
  Debe rechazar los 16 cambios y terminar correctamente. Nunca actualiza referencias.

`VISUAL_TEST_BASE_URL` permite seleccionar otra instancia; por defecto se utiliza
el dominio de desarrollo de Replit o el servidor local en el puerto 5000.
Se utiliza Chromium de Replit cuando está disponible. Fuera de Replit, instalar
el Chromium correspondiente a Playwright (`npx playwright install chromium`) o
indicar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Comparar en Linux con la misma
versión de Chromium que figura en `environment.json`; un cambio de navegador
requiere revisar las referencias, no aumentar la tolerancia automáticamente.

## Contenido y estabilidad

Las noticias se interceptan en el navegador con
`scripts/visual/monitor-fixture.mjs`: títulos bilingües, categorías, fechas,
prioridad y URLs fijas. Las imágenes provienen de los tres archivos editoriales
incluidos en el repositorio; no necesitan servicios externos ni App Storage.
La configuración del CMS se intercepta para usar el texto predeterminado del
sitio. No se escribe en la base de datos ni se añade una ruta de prueba al sitio.
Las publicaciones o ediciones del CMS no requieren renovar estas referencias;
los cambios en el texto predeterminado, CSS, fuentes o imágenes incluidas sí.

Se fija escala 1, zona UTC, idioma, tema claro y movimiento reducido. Se cargan y
decodifican todas las imágenes diferidas y se esperan las fuentes autoalojadas.
La cabecera sticky se oculta **solo durante la captura**, sin quitar su espacio:
no pertenece al Monitor y puede cubrir distintas tarjetas según el scroll.
El resto de la sección se captura completo, sin máscaras sobre su contenido.

## Diferencias y aprobación

Se comparan dimensiones exactas y píxeles con tolerancia de 20 por canal RGB.
Falla cuando cambia más del 0,2 % de la sección o más de 491 píxeles en un
bloque de 128 × 128: así un título o recorte pequeño no se diluye en el fondo
blanco. Los bordes parciales usan el mismo límite absoluto, no un porcentaje
exageradamente sensible.

Los resultados y diferencias quedan en `generated-artifacts/monitor/`, excluido
de Git y del despliegue. Allí se guardan `*-actual.png`, `*-expected.webp`,
`*-diff.png` (diferencias resaltadas en rosa, cuando coinciden las dimensiones)
y `run.json`. Si cambian las dimensiones, comparar actual y esperado directamente.
Las capturas funcionales anteriores siguen en `/tmp/ss-monitor-editorial` o
`MONITOR_SCREENSHOTS_DIR`.

Para un cambio **intencional**:

1. Ejecutar la comparación y revisar actual/esperado/diferencias de los cuatro
   casos. Corregir primero cualquier regresión involuntaria.
2. Solo tras aprobar el nuevo diseño, ejecutar
   `npm run test:visual:monitor:update`.
3. Revisar las cuatro imágenes WebP y `environment.json` en el cambio de Git.
   El modo normal nunca crea ni modifica referencias ausentes.
4. Ejecutar otra vez la comparación y la verificación del detector.

Solo se versionan las cuatro referencias WebP sin pérdida y los metadatos
pequeños; no subir capturas de ejecución, diferencias ni vídeos.
