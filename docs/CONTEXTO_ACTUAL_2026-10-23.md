# Contexto actual — Santos & Saucedo

Corte documental: **2026-10-27**, zona America/Monterrey. Integra el trabajo de esta conversación y la inspección de Git del 23 de octubre. Las comprobaciones del 16 y 22 de octubre se conservan como evidencia histórica; no se repitieron hoy.

## Coordenadas y estado comprobado

- Repositorio: https://github.com/ia-satma/santos-saucedo-page, rama `main`.
- Carpeta activa: `/Volumes/alejandro /santos saucedo - página web/santos-saucedo-cms`. `santos-saucedo-web` conserva una versión histórica.
- Runtime objetivo: **Node/Express + React/Vite + PostgreSQL/Neon + App Storage en Replit**. GitHub Pages corresponde a una etapa estática anterior y no ejecuta el CMS.
- Workspace: https://replit.com/t/santos-and-saucedo/repls/santos-saucedo-page
- URL pública de referencia: https://santos-saucedo.replit.app/ ; CMS: `/admin/dashboard`.
- HEAD local antes de sincronizar: `024bb1f`; tras integrar el remoto se revisa `c45b0de`.
- Tras `git fetch origin main`, remoto revisado: **`c45b0de54a2d11293b9ef7132647a5b5362cfcb6`**, commit más reciente de origin/main y de Replit al iniciar esta sincronización.
- Última sincronización observada antes de esta tarea: `024bb1f` el 22 de octubre; `/readyz` respondió 200. Eso confirma disponibilidad del servidor de workspace, no la versión publicada ni un reinicio de todos sus procesos.
- **Republish del commit c45b0de y del push documental queda pendiente de comprobar en Brave.**
- Local: URL habitual `http://localhost:5050/`; no se observó un servidor activo al revisar procesos el 23 de octubre. No afirmar que está levantado.

## Objetivo funcional y reglas del usuario

Adaptar el CMS funcional de Von Wobeser a Santos & Saucedo, conservando su estructura y edición integral: contenidos, navegación, visibilidad, equipo y orden, oficinas, formularios recibidos, usuarios y permisos, seguridad, SEO/Analytics/verificación, privacidad/cookies y herramientas IA. El ZIP de referencia está en la carpeta de trabajo. Los informes de paridad describen alcance y límites; no asumir equivalencia total por compartir estructura.

- Usar **Brave** para revisar/controlar el navegador.
- **No usar Replit Agent**. La prueba de IA con proveedores reales quedó pendiente por decisión expresa del usuario; no activar credenciales ni consumir créditos para darla por hecha.
- Mantener contenido, imágenes, orden y activación conectados al CMS; evitar cambios solamente en fallbacks si hay datos persistidos que los sustituyen.
- No guardar contraseñas, hashes, tokens ni variables reales de entorno en documentación.
- Las pruebas que escriben datos se ejecutan en PostgreSQL local con datos sintéticos; no sobre registros reales de producción.

## CMS y validación histórica

La implementación e informes del 16 de octubre incluyen usuarios/accesos; 14 agentes y herramientas de texto/copys, imágenes, voz y presentaciones; historiales con vista previa y descarga; formularios de contacto, suscripción y candidatura con CV privado; navegación/visibilidad; SEO, Analytics/Search Console y consentimiento de cookies. El panel recibió mayor legibilidad, agrupación por tarea y color por sección/agente.

Evidencia histórica del 16: TypeScript/build correctos, 58 pruebas de agentes, 216 comprobaciones HTTP del panel, 64 de formularios/archivos y tres de privacidad, además de suites CMS/editorial/accesos. Se revisaron formularios de los 14 agentes, descargas y pantallas publicadas. **Las pruebas de proveedores IA usaron respuestas controladas**, no prueban la integración real sin credenciales.

App Storage se comprobó entonces con imagen pública y archivos privados CV/PPTX/PDF/PNG, incluso retirando sus copias locales. Se comprobaron FFmpeg y ClamAV. **La importación completa de las nuevas fotografías del 22 a App Storage no quedó verificada**. GA4/Search Console/Leadinfo necesitan los identificadores del cliente salvo nueva evidencia.

Referencias del repositorio: `docs/CMS_PARIDAD_VON_WOBESER_2026-10-16.md`, `docs/CMS_PRUEBAS_2026-10-16.md`, `docs/CMS_AGENTES_HISTORIALES_2026-10-16.md`, `docs/CMS_FORMULARIOS_NAVEGACION_2026-10-16.md` y `docs/REPLIT_SETUP_SANTOS_SAUCEDO.md`.

## Frontend revisado el 22 de octubre

### Identidad, lectura y home

- Azul intermedio entre el sitio y el PDF compartido: base **#18175B**, títulos/acciones **#1D1C68**. El índigo #1E1C92 y las fuentes Lora/Outfit de julio son antecedentes, no la referencia editorial actual.
- Sistema editorial `client/src/styles/ss26.css`: Newsreader (SS Serif) y Source Sans 3 (SS Sans), autoalojadas, con Source Serif 4 para cirílico. Conservar el verde de marca y los logotipos originales.
- Mejor lectura sin exagerar: párrafos aproximadamente 18–19 px; etiquetas 14; notas 16; legal de footer 15. Revisar cada contexto, no escalar todos los textos indiscriminadamente.
- Hero con video a color, viñeta neutra; última petición: oscurecer ligeramente, velo negro alfa **.32**. Marca SS blanca con opacidad **.20**. No volver al filtro azul anterior.
- Footer más compacto (reducción medida cercana al 20%). “Cómo trabajamos” con cabecera completa y principios en retícula 2×2.
- Experiencia: **40+ años del equipo/socios**, no antigüedad de la firma. “72+” describe **ciudades en nuestra red de alianzas**, no oficinas físicas.

### Oficinas y material fotográfico

- Título público **Nuestras Oficinas / Our Offices**. Galería general, sin clasificar cada foto como recepción/sala de juntas.
- Fuente del cliente: https://u.pcloud.link/publink/show?code=kZ4peQJZmUIqo3LdRWFrf3MkUOU8vbhGYMmk ; referencia de composición: https://vonwobeser.com/nuevas-oficinas/ .
- Carpeta completa de 43 fotos descargada como archivo, no individualmente. Originales en `fotografias-santos-pcloud.zip` y `fotografias-santos-pcloud/`, fuera del repositorio; variantes WebP de 768/1536 en los recursos del sitio.
- Hero fotográfico, jerarquía entre vistas generales grandes y detalles menores, tres bloques editables de texto: introducción/ubicación, trabajo diario y biblioteca/arte. Lupa discreta y lightbox accesible con navegación y Escape.
- Catálogo CMS `media.officeGallery[]`: clave de fotografía, textos alternativos, orden, activación y destacada; reutilizado en oficinas y fotografías distribuidas en home, firma, carreras y contacto.
- **Excluir el primer plano del pulpo** de las colocaciones públicas. `photos.detalle` usa `oficina-arte-detalle-*`, no `oficina-detalle-*`; los archivos viejos pueden permanecer en el inventario histórico.

### Equipo

- Mario Saucedo Rodríguez aparece junto a los otros tres socios. Su fotografía original permanece a color; tratamiento conmemorativo suave por CSS: `grayscale(1) contrast(.94) brightness(1.04)` para su slug, también en los contextos relacionados.
- Encuadre uniforme 4:5, radio 12 px, retícula adaptable 2/4/6 columnas, interacción sutil y respeto por movimiento reducido.
- Ajustes de encuadre de las 37 fotografías anónimas en `teamPortraitFraming.json` y `.ts`; detección geométrica facial para encuadre, sin atribuir identidades. La asignación nombre→foto exige información del cliente.

### Contacto y carreras

- Formularios en tarjetas claras de radio 20 px, campos de 44 px y texto 16 px, dos columnas cuando cabe, botón de 48 px; contraste y mensajes legibles.
- Candidatura alineada visualmente con contacto; conserva CV PDF máximo 10 MB, consentimiento, validación y envío al CMS. CareerForm compartido con pasantes.
- Carreras reorganizada para eliminar el gran vacío bajo el texto, con fotos y bloques de aprendizaje, entorno, Semillero y vacantes.
- Validación de campos obligatorios y controles revisada el 22; no se enviaron mensajes ni candidaturas reales para probar el diseño.

## Incidente de recargas y sincronización del 22

La recarga continua local provenía del WebSocket del pipeline tomando los upgrades del servidor HTTP y rechazando el HMR de Vite con HTTP 400. `server/routes.ts` usa WSS `noServer: true` y reclama únicamente `/ws/pipeline`, conservando autenticación/origen; Vite atiende su propio upgrade. Se observó HMR conectado y pipeline sin sesión rechazado con 403. En preview Replit el HMR se desactiva mediante detección del entorno.

Se importó el commit Replit `94d49428a754e3bf559581b33bf6e70c45ce34b4` mediante bundle verificado y se recuperaron recursos requeridos que existían en disco pero no en ese commit. Trabajo visual: `5eaf03e`; integración previa: `7148117`; integración final con los módulos concurrentes de GitHub: **024bb1f**. El push `bab553e..024bb1f` se completó. Incluye también el módulo de testimonios con invitaciones de un uso y aprobación humana integrado desde remoto.

En Replit había un rebase abandonado con conflictos. Antes de abortarlo se guardaron una rama de seguridad y respaldo en `.git/codex-sync-backup-20261022/`, incluyendo el archivo no rastreado que bloqueaba el abort. Se restauró `.replit` y se ejecutó `git pull --ff-only origin main` hasta 024bb1f. No borrar esos respaldos sin comprobar su necesidad.

TypeScript y build de producción pasaron tras la integración final. Se comprobaron los 120 recursos del manifiesto y sus hashes. Avisos de tamaño/PostCSS no impidieron compilar. Evidencias visuales y de sincronización: carpeta hermana `evidencias-cms/`; `replit-main-sincronizado-2026-10-22.png` prueba SHA y readiness, **no publicación**.

## Cambios remotos adicionales observados el 23

Seis commits posteriores a 024bb1f, en orden:

1. `fa94832`: correcciones de afirmaciones legales laborales y migratorias.
2. `aac1425`: vCard de socios y datos estructurados in memoriam.
3. `aa140b9`: búsqueda sin depender de acentos, alineación móvil y esquinas de imágenes a sangre.
4. `df4889b`: referencia del Monitor a juntas laborales, atribución de 40 años en carreras y slug del editor.
5. `4311117`: antigüedad de la firma, duplicado en galería y justificación móvil.
6. `0a7bece`: consolidación de una sola regla móvil para texto alineado a la izquierda.

El commit c45b0de ya fue revisado con check, build, CMS, editorial, accesos, privacidad y 64 flujos públicos; quedan dos observaciones: iframe de Google Maps sin compuerta de consentimiento y URL del mapa hardcodeada. Es inspección de código/historial, no certificación funcional de esos commits. Incorporarlos antes de continuar implementando; no sobrescribir con el HEAD local anterior.

## Próximos pasos y límites

1. Sincronizar de forma segura el local con el remoto más reciente; verificar primero si existen cambios ajenos o documentales sin guardar.
2. Confirmar el SHA real de Replit y si la publicación solicitada terminó; si falta, ejecutar el flujo de publicación autorizado y comprobar el sitio público, no solo `/readyz` del workspace.
3. Comprobar las nuevas imágenes contra App Storage, manifiesto, textos alternativos y visualización pública. No asumir que Git push equivale a importar medios.
4. Revalidar formulario→CMS, navegación/edición, usuarios/permisos, testimonios y límites de archivos después de incorporar commits nuevos; usar datos sintéticos y limpiar QA.
5. Mantener pendiente la prueba IA real sin Replit Agent. Registrar configuración del cliente para Analytics/Search Console/cookies sin copiar sus secretos.
6. Conservar la foto original de Mario, el video original sin filtro, las fuentes originales de pCloud y la exclusión pública del pulpo.

Los documentos de julio son historia: no deben guiar el runtime, la carpeta activa, la tipografía, los contadores ni el estado de publicación actuales.


## Actualización 2026-10-27

Se integró localmente el commit c45b0de de origin/main. Se conservaron estas notas y se preparará un commit documental en `main`; después se verificará el push y la sincronización de Replit.
