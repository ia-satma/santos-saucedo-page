# Aceptación funcional del CMS Santos & Saucedo

Fecha: 16 de octubre de 2026. Entorno: PostgreSQL local, preview compilado en `localhost:5050`, navegador Brave. Referencia: ZIP de Von Wobeser entregado por el cliente. Este informe corresponde al nuevo código local, todavía sin desplegar en Replit; la publicación anterior permanece en `296072d`.

## Resultado

| Comprobación | Resultado |
|---|---|
| TypeScript (`npm run check`) | Correcto |
| Compilación (`npm run build`) | Correcta; aviso de tamaño de bundles, sin errores |
| CMS (`npm run test:cms`) | Correcto: configuración, permisos, conflictos, medios, formularios públicos y rangos de video |
| Editorial (`npm run test:editorial`) | Correcto: perfiles, relaciones, orden concurrente, ES/EN, PDF, programación, preview y archivo/restauración |
| Accesos (`npm run test:access`) | Correcto: usuarios, roles, permisos, sesiones, contraseñas, concurrencia y protección del último administrador |
| Panel (`npm run test:panel`) | 202 comprobaciones HTTP correctas |
| Agentes (`npm run test:agents`) | 48 pruebas correctas, 0 fallos y 0 omitidas |
| Navegación en Brave | 38 rutas recorridas; se corrigió Prácticas y se volvió a comprobar |
| Pestañas internas | 19 selecciones verificadas: agentes, conocimiento, auditorías y formulario de equipo |
| Adaptación móvil | Seis pantallas revisadas a 390 × 844 sin desbordamiento horizontal exterior |
| Estabilidad del editor | Texto conservado durante varios minutos; borrador de prueba descartado sin guardar |

No se afirma que cada combinación posible de datos haya sido probada ni que la navegación equivalga a ejecución completa con proveedores reales.

## Cobertura de las 202 comprobaciones HTTP

- 40 lecturas privadas y rechazo de acceso sin sesión.
- 33 secciones configurables.
- Estadísticas y validación de contratos de los 14 agentes.
- Altas, cambios y borrados de fixtures en 12 catálogos: posts, eventos, categorías, industrias, rankings, reconocimientos, clientes, testimonios, vacantes, oficinas, alianzas y desks.
- Conocimiento: alta, edición, clasificación, confirmación, aprobación y borrado de fixtures.
- Historial de textos: lectura, búsqueda, detalle, archivo y restauración.
- Rechazo de filtros inválidos y de cambios prohibidos al historial de archivos generados.
- Carga de documento privado de prueba y descarga autenticada.
- Generación real y descarga de PPTX, PDF y PNG con esquema determinista, sin proveedor de IA.

Los catálogos heredados se prueban como herramientas administrativas; eso no agrega superficies públicas al diseño de Santos.

## Agentes adaptados

`content_analyzer`, `category_agent`, `metadata_linker`, `legal_alerts`, `formatter`, `polyglot_translator`, `seo_optimizer`, `image_suggestion`, `social_media`, `newsletter`, `voice_agent`, `presentation_generator`, `content_auditor`, `website_auditor`.

Las pruebas cubren contratos, rechazo de solicitudes inválidas, ejecución seleccionada, límites/concurrencia/reintentos del orquestador, protección de contenido publicado, generación de presentaciones y persistencia con rollback. Tres pruebas adicionales usan el SDK real contra un servidor HTTP local con clave ficticia para comprobar el transporte de imágenes/audio de Replit y la compatibilidad de voz directa. Ninguna de estas pruebas demuestra calidad de IA real o disponibilidad de créditos.

## Correcciones encontradas al probar

- Prácticas esperaba un arreglo de equipo pero recibía una respuesta paginada; ahora obtiene un catálogo específico completo de opciones.
- Traducciones usaba una ruta inexistente y respuestas incompatibles; ahora muestra cobertura real y conecta al traductor canónico sobre borradores.
- Rendimiento mostraba cifras fijas; ahora lee conteos persistidos y estados vacíos reales.
- Eventos rechazaba las fechas ISO enviadas por el formulario; ahora las valida y convierte.
- Posts aceptaba campos de sistema del cliente; ahora valida campos editables y asigna autor desde la sesión.
- Herramientas internas y rutas editoriales reciben el permiso correcto; un lector no puede ejecutar escrituras ni herramientas avanzadas.
- Los autores elegidos manualmente registran verificación explícita.
- Los agentes respetan la visibilidad pública del equipo de Santos.
- Los documentos de presentación y sus resultados conservan rutas privadas y se persisten antes de confirmar la operación.
- Transporte de IA gestionada: se exige clave y base URL juntas; audio usa Chat Completions y las imágenes usan el endpoint de la integración. Un token de Replit no se envía al host público de OpenAI.
- Encabezados, texto y menús más legibles; formulario de equipo con encabezado accesible.

## Pendientes expresos

1. **IA real:** pendiente por decisión del cliente. Mantener la restricción de no utilizar Replit Agent. El panel informa si faltan proveedores; registrar 14 agentes no significa que sus proveedores estén activos.
2. **Nuevo corte en Replit:** falta sincronizar/desplegar y repetir aceptación con su infraestructura. No se actualizaron ni publicaron estos cambios durante esta ronda de pruebas.
3. **Nuevos archivos en App Storage:** la biblioteca del corte previo ya usa el bucket de Santos. Falta comprobar en Replit la persistencia tras reinicio de documentos privados, audio, imágenes generadas y presentaciones del nuevo corte.
4. **Antivirus de documentos privados:** producción exige ClamAV por defecto; falta verificar ejecutable y firmas en Replit. No se desactivó el requisito.
5. **Contenido incompleto:** la revisión local detecta seis advertencias de datos iniciales (tres registros incompletos y tres con traducción opcional faltante); requieren contenido editorial, no equivalen a fallos de navegación.
6. **Dependencias:** `npm ci` terminó correctamente. `npm audit` detectó 44 avisos totales (23 altos); `npm audit --omit=dev` detectó 35 (20 altos, 13 moderados y dos bajos, ninguno crítico). Incluye dependencias directas y transitivas. No se aplicó una actualización masiva con cambios incompatibles. Revisar exposición y corregir versiones en una ronda dedicada antes de aprobar producción; pasar pruebas funcionales no acredita seguridad de dependencias.
7. **Paridad total de Von:** MFA, cargas fragmentadas grandes, variantes automáticas de video y otros módulos específicos siguen documentados en la matriz de paridad. Esta entrega no los certifica.

## Reproducción

Con dependencias instaladas y una base PostgreSQL local desechable configurada en un `.env` ignorado:

```sh
npm run check
npm run build
npm run test:cms
npm run test:editorial
npm run test:access
npm run test:panel
npm run test:agents
```

Las suites HTTP rechazan bases remotas. No ejecutarlas contra datos reales de clientes ni contra Production. Crean y limpian sus propios fixtures; el conocimiento inicial genérico del sistema puede persistir como parte del arranque. La cuenta temporal de revisión visual se elimina al cerrar la aceptación. No se trasladaron cuentas ni documentos de Von Wobeser.

Evidencia visual en la carpeta hermana `evidencias-cms`: `usuarios-permisos-2026-10-16.jpg`, `editor-estable-2026-10-16.jpg` y `agentes-local-validado-2026-10-16.jpg`.
