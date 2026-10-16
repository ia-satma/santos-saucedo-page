# Formularios, archivos y estructura administrativa

Corte del 16 de octubre de 2026, posterior a la adaptación de los 14 agentes. Referencias: ZIP de Von Wobeser proporcionado por el cliente, `client/src/lib/adminNav.ts`, `AdminLayout.tsx` y las capturas compartidas. La estructura se adapta a las páginas existentes de Santos; no se inventan secciones institucionales como Pro Bono o Alumni.

## Cambios

- Color funcional consistente: azul para contenido, naranja para medios, verde para registros, ámbar para configuración y tonos propios de cada herramienta de IA. Los estados conservan texto, iconos y selección visible; los cambios se limitan al CMS.
- Menú lateral con grupos desplegables y estado conservado: contenido, archivos, registros recibidos, configuración, creación con IA y diagnóstico. Se retira “Herramientas anteriores”. Resumen con accesos directos a IA, usuarios, Google y cookies.
- Agentes IA, Copys IA, Diapositivas con IA, Imágenes con IA, Voz con IA y Voz corporativa tienen acceso propio. Las pantallas de imágenes y audio incluyen el formulario de creación, además del historial. Las credenciales de IA real siguen pendientes; no se utilizó Replit Agent.
- Usuarios y contraseñas permanece reservado al administrador principal. El servidor comprueba permisos en cada operación; el menú usa la misma política.
- Menús públicos y submenús: etiquetas por idioma, destinos locales/HTTPS, activación, orden, enlaces del pie, visibilidad de cabecera, buscador e idiomas. Enlaces de llamadas a la acción en su sección propia.
- Inicio: activar/ocultar bloques y reordenar las seis secciones. El video puede apagarse, tiene póster y utiliza respaldo si falla.
- Contacto y suscripción: controles de activación y textos, persistencia, bandeja con búsqueda, lectura/no leído y estado de suscripción. CSV protegido frente a fórmulas y enlace firmado de baja; abrir un enlace no da de baja automáticamente.
- Carreras y Semillero: formulario de candidatura con consentimiento y CV PDF de hasta 10 MB. Archivo privado persistido antes de confirmar; bandeja de Recursos Humanos, descarga autenticada, seguimiento y archivo/restauración. El permiso de CV es independiente del catálogo de vacantes; el rol de consulta no recibe acceso automático.
- Biblioteca: imágenes JPEG/PNG/WebP/GIF, PDF y video MP4/M4V/WebM/MOV/OGV. Normaliza MIME desconocido del navegador; valida firma y decodificación. PDF requiere estructura legible; video pasa por FFprobe y FFmpeg. Archivos grandes utilizan sesiones firmadas con integridad SHA-256, fragmentos privados y límite de 200 MB. El selector conserva la referencia anterior si una carga falla o se cancela.
- Google Search Console: token validado y etiqueta en el HTML original de desarrollo y producción. No requiere ejecutar JavaScript para verla. El resultado de propiedad se verifica en la cuenta de Google.
- Google Analytics 4 y Leadinfo: IDs y activación editables; apagados por defecto. Solo se cargan en el dominio HTTPS autorizado, fuera del CMS/preview y tras consentimiento. No se aceptan scripts arbitrarios.
- Cookies: aceptar, rechazar, configurar categorías, guardar, reabrir desde el pie, caducidad y versión. Activar un proveedor nuevo invalida decisiones anteriores. Preferencias montadas una sola vez para conservarse al navegar.

## Pruebas

- `npm run check` y `npm run build`: correctos.
- `test:cms`, `test:editorial`, `test:access`: correctos.
- `test:panel`: 207 comprobaciones HTTP, 40 lecturas privadas y 38 secciones de configuración (los campos de cookies antiguos se conservan solo por compatibilidad API).
- `test:public-flows`: 64 comprobaciones: menús/submenús, orden, enlaces, meta tag, contacto, suscripción, CSV/baja, imagen/PDF/video reales, reproducción por rangos, carga fragmentada e integridad, CV privado y permisos de Recursos Humanos.
- `test:agents`: 58 pruebas, sin llamadas de IA externas. Los 14 agentes tienen un escenario exitoso aislado; los adaptadores de modelo y persistencia se sustituyen cuando corresponde. Se prueban borrador/publicado, aplicación explícita, caché ligada al texto fuente, traducción por segmentos, taxonomía real, autoría propuesta, cuatro redes, saneamiento y errores. PPTX/PDF/PNG se generan con los motores reales en las suites de render y panel.
- `test:privacy`: tres pruebas de versión/caducidad, dominio/preview y bloqueo/carga/retiro de Analytics con navegador simulado, sin conectar a Google.
- Brave: 19 rutas administrativas del nuevo corte; selección de los 14 formularios y las cinco pestañas del sistema de agentes, ambos auditores ejecutados sin IA externa; envío de Contacto y Newsletter desde sus formularios y llegada al CMS; configurador de cookies; carga real desde selector de PDF, MP4 e imagen de 4,13 MB fragmentada. La pestaña publicada anterior mostraba un error `map` en Prácticas y un bundle anterior; la corrección está incluida.

Las suites usan PostgreSQL local y archivos desechables, restauran las secciones modificadas y eliminan sus propios expedientes. No se ejecutan contra Production. Las muestras de video y PDF se generan en la prueba; no se copian documentos de clientes.

## Infraestructura y límites de aceptación

El build de Deployment utiliza `build:deploy`: compila y ejecuta `replit:prepare-uploads`, que comprueba FFmpeg, descarga firmas oficiales con FreshClam y realiza un escaneo de prueba. `.replit` declara FFmpeg; `replit.nix` fija ClamAV 1.5.4 desde el repositorio oficial de NixOS porque el canal antiguo ofrece la rama 1.3 fuera de soporte. Si faltan herramientas o firmas, la preparación falla y no se certifica una carga segura ficticia. Las firmas pertenecen al artefacto `dist/clamav` y no se versionan. El arranque añade la tabla de candidaturas sin borrar tablas ni datos existentes.

Falta validar el nuevo corte en el runtime de Replit: preparación del escáner, ida/vuelta de los nuevos archivos públicos/privados y publicación. La activación real de GA4/Search Console/Leadinfo necesita los IDs propios del cliente; no se inventaron. Guardar IDs no equivale a verificar propiedad o recepción de datos en sus cuentas. La IA real sigue pendiente por decisión del cliente.

Se aplicaron correcciones compatibles de dependencias sin `--force`: auditoría actual 26 avisos totales (16 moderados, 10 altos); 20 en producción (11 moderados, 9 altos), sin críticos. Los avisos restantes requieren evaluación de cambios mayores; el informe anterior conserva su contexto histórico. Este corte no certifica una auditoría de seguridad ni paridad de módulos institucionales que Santos no utiliza.

Fuentes técnicas: [Consent Mode de Google](https://developers.google.com/tag-platform/security/guides/consent), [verificación de Search Console](https://support.google.com/webmasters/answer/9008080?hl=es), [firmas de ClamAV](https://docs.clamav.net/manual/Usage/SignatureManagement.html).
