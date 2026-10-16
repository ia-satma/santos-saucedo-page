# Agentes e historiales: verificación del 16 de octubre de 2026

## Alcance de la prueba de IA

Los 14 agentes están registrados. La suite `test:agents` completa 58 pruebas correctas. Se ejercitó un resultado exitoso aislado de cada agente; para los 12 que usan IA, la respuesta del proveedor se sustituyó por una muestra controlada. Esto verifica lógica, contratos, resultados y condiciones de guardado; **no certifica generación con un proveedor real**. La prueba real permanece pendiente por indicación del cliente, sin usar Replit Agent.

| Agente | Flujo comprobado |
|---|---|
| Analizador de contenido | Informe validado, puntuación y alta/actualización del análisis |
| Clasificador jurídico | Coincidencias de taxonomía, confianza mínima, idioma y protección de publicaciones |
| Vinculador de metadatos | Autores con coincidencia exacta, prácticas e industrias; solo propone autoría |
| Alertas legales | Borrador bilingüe saneado, sin publicar y con huella de la fuente |
| Formateador editorial | Propuesta ES, preservación de EN, aplicación explícita en borrador |
| Traductor jurídico | Segmentos completos, caché válida/inválida y propuesta sin escritura |
| Optimizador SEO | Cálculo real de mejora y protección de artículos publicados |
| Sugerencias visuales | Prompt validado, respuesta del generador y URL del archivo candidato |
| Contenido para redes | Cuatro canales, límites de texto, etiquetas y reutilización de imagen |
| Boletín informativo | Noticias publicadas, ES/EN, saneamiento y vínculo de baja |
| Voz corporativa | Resultado MP3, tiempo agotado y fallo de persistencia |
| Generador de presentaciones | Modelo, ilustraciones, metadatos y render real PPTX/PDF/PNG |
| Auditor de contenido | Diagnóstico aislado y ejecución desde Brave contra la base local |
| Auditor del sitio | Diagnóstico, autorización de correcciones y ejecución desde Brave contra la base local |

En Brave se abrió el formulario de cada agente y las cinco pestañas: Centro de uso, Estado de agentes, Evolución, Historial y Sistema. Los dos auditores terminaron desde la interfaz sin llamar a IA externa. Sus hallazgos corresponden al contenido de la base de pruebas; terminar el diagnóstico no significa que el contenido carezca de pendientes.

## Historiales comprobados en Brave

- Imágenes: vista ampliada y descarga de PNG original.
- Audio: reproductor con un MP3 real de prueba, duración de un segundo, reproducción iniciada y descarga.
- Copys: selección mediante el parámetro de consulta, texto completo y archivos TXT/HTML. Exportación JSON disponible por API.
- Presentaciones: tres diapositivas cargadas con sesión autenticada, descarga individual PNG, ZIP con las tres PNG y archivos PPTX/PDF válidos.
- Se verificó el contenido binario de los ocho archivos descargados. Son muestras sintéticas locales, no resultados de un proveedor de IA ni material de clientes.

Se corrigió el acceso desde el navegador a las presentaciones privadas: ahora envía la sesión en la solicitud y usa un Blob temporal para previsualizar/descargar; los archivos no se hicieron públicos ni se colocaron tokens en las URL. Las nuevas presentaciones conservan PNG privadas para vista previa incluso si solo se solicita PowerPoint. Las descargas de diapositivas aceptan modo adjunto y el ZIP conserva la numeración original.

`test:panel` completa 216 comprobaciones HTTP e incluye exportación, descarga privada, rechazo sin sesión, encabezados, ZIP y generación nativa. TypeScript y build pasan. Las otras suites de CMS, editorial, accesos, formularios y privacidad pasaron en el mismo corte antes del ajuste acotado de historiales.

## Color y legibilidad

El menú, los accesos, las tarjetas y el agente seleccionado comparten colores funcionales. Contenido usa azul; medios, naranja; registros, verde; configuración, ámbar. Cada herramienta de IA tiene un acento según su función. El color acompaña nombres, iconos y estados de selección; se conserva el tamaño legible de textos y campos. El sitio público conserva su diseño.

## Replit

El código está sincronizado con GitHub y la copia permanente del proyecto. La preparación de FFmpeg y ClamAV 1.5.4 con firmas oficiales se ejecutó correctamente en Replit. App Storage pasó la ida/vuelta de una PNG pública, un CV privado y PPTX/PDF/PNG privados, incluyendo lectura después de retirar los archivos locales. El corte funcional d8ccf71 quedó publicado en https://santos-saucedo.replit.app, con bundle index-DZfsUVAV.js. Se verificaron 12 pantallas publicadas sin alertas y la carga correcta de las cuatro prácticas. La sesión del usuario se conservó. GA4/Search Console requieren los identificadores propios del cliente. La IA real continúa pendiente.
