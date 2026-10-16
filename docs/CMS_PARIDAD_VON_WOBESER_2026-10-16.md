# Comparación del CMS de Von Wobeser y Santos & Saucedo

Fecha: 16 de octubre de 2026. Estado de esta entrega: implementación y pruebas locales; **sin sincronización, migración ni publicación nuevas en Replit**, por instrucción del cliente.

## Referencia comprobada

- Von Wobeser: código local en `MIRROR VON WOBESER PAGE/Webpage-Von-Wobeser`, HEAD `9081d5b7a1d63013b389d8833113aeaf284699de`. El HEAD remoto de `main` coincide, consultado en modo lectura.
- Documentación del cerebro Obsidian: índice CMS, arquitectura, módulos editoriales, configuración, catálogos, medios, publicación/preview, abogados, permisos y operación. La documentación extensa está congelada en `1d818c34`; se contrastó con los dos cambios posteriores: antigüedad de socios y visibilidad editorial `unlisted`.
- Santos: base `377658dd1307c7e02ebf3e869096b60c86fc82fe`, que conserva el diseño de `d7cdf63`. Esta comparación incluye los cambios locales de esta entrega.
- No se modificó el proyecto, la base de datos ni la producción de Von Wobeser. Sus datos personales, credenciales y textos de cliente no se trasladaron a Santos.

No se afirma paridad completa. Tener una tabla o un archivo heredado no significa disponer de un módulo conectado y comprobado.

## Experiencia de administración implementada en Santos

Un shell común conserva el menú, la ruta actual y el acceso al sitio al cambiar de módulo. Las etiquetas del panel se presentan en español sin cambiar el idioma elegido por el visitante. La navegación móvil usa un panel con foco controlado. La búsqueda de secciones admite nombres, descripciones y acceso mediante Cmd/Ctrl+K.

| Grupo | Accesos |
|---|---|
| Espacio de trabajo | Resumen; Páginas y textos; Abogados y equipo; Prácticas; Monitor Laboral; Biblioteca de medios; Orden del contenido |
| Operación | Vacantes; Mensajes y suscripciones; Galería de La oficina |
| Configuración | Navegación y pie; Identidad y portada; Datos del despacho; SEO; Guía de uso |
| Avanzado, desplegable | Industrias; Traducciones; Agentes; Procesamiento; Knowledge; Salud; Auditorías; herramientas heredadas |

El resumen usa conteos reales de la API. No contiene actividad ficticia ni métricas simuladas. Las herramientas previas permanecen accesibles en `/admin/operations`; no se presentan como observabilidad completa.

`/admin/content` agrupa y permite buscar las 33 secciones registradas. El editor individual usa un selector de sección para evitar dos barras laterales competidoras. Las acciones de guardar, errores y borradores se conservan.

## Matriz funcional

**Implementado** significa que hay una pantalla y persistencia conectadas al sitio cuando esa superficie existe. **Parcial** enumera la diferencia. **Fuera del diseño** identifica módulos que Von tiene y que Santos actualmente no publica; no se incorporan páginas o contenido institucional ficticios para rellenar el menú.

| Capacidad de Von Wobeser | Santos tras esta entrega | Diferencia o criterio |
|---|---|---|
| Portada con textos y switches | Implementado | Secciones, titulares, llamadas, orden de menú y cantidad de notas; perfiles y prácticas proceden de catálogos |
| Configuración global por registro de secciones | Implementado | 33 secciones adaptadas al diseño Santos, claves conocidas y validación de servidor |
| Español e inglés independientes | Implementado | Formularios de perfiles, prácticas y Monitor; selector de idioma en configuración |
| Idiomas adicionales | Parcial | Textos globales editables y traductor heredado; no equivale al flujo editorial completo de Von |
| Proteger cambios sin guardar | Implementado en los editores nuevos y perfil/configuración | Navegación por enlaces y cierre de pestaña; algunos diálogos heredados mantienen sus controles específicos |
| Concurrencia de configuración global | Implementado | Revisión SHA-256, conflicto 409 y versión anterior como borrador |
| Configuración con historial completo | Parcial | Una versión anterior por sección; no es un historial ilimitado de todas las entidades |
| Navegación, etiquetas, visibilidad y orden | Implementado | Adaptada al menú actual; sin agregar destinos nuevos arbitrarios |
| Presets de diseño/nav con activación separada | Fuera del diseño actual | Se conserva un único diseño aprobado; no se portaron los presets clásicos de Von |
| Firma, cifras, principios e historia | Implementado | Textos e imágenes editables en sus secciones |
| Oficina, dirección, horario y fotografías | Implementado | Configuración más galería; enlaces a contacto y mapas |
| Información común de contacto | Implementado | Dirección, teléfono, correos y enlaces compartidos por los componentes del sitio |
| Nombre, cargo, rol, biografía y foto de abogados | Implementado | Carga/selección de foto y controles de publicación e Inicio |
| Listas de formación, idiomas, afiliaciones, rankings, experiencia y publicaciones | Implementado | Colecciones estructuradas editables; validadas al guardar |
| Orden editorial completo de abogados | Implementado en esta entrega | Lista completa, arrastrar o flechas, transacción, revisión y 409 ante concurrencia; incluye ocultos |
| Orden de prácticas, industrias y galería | Implementado en esta entrega | Un solo guardado transaccional; se evita intercambiar dos filas con peticiones independientes |
| Slugs duplicados de perfiles | Implementado en esta entrega | 409, sin upsert ni sobrescribir al homónimo |
| Prácticas relacionadas desde el abogado | Implementado en esta entrega | Selección por ID; actualización coherente del roster y de la ficha |
| Prácticas relacionadas desde la práctica | Implementado | Selección por ID con validación de existencia; sin inferir por nombres |
| Nombre(s), apellidos y nombre derivado | Parcial | Santos conserva nombre completo; no dispone de los tres campos separados de Von |
| Antigüedad de socio y modos expandido/colapsado/auto | Pendiente de adaptación | No se añadieron al diseño Santos en esta entrega |
| Relaciones de profesionales con industrias | Parcial | Tablas heredadas no equivalen a un editor completo de relaciones; industrias carece de ruta pública activa |
| Edición manual del Monitor Laboral | Implementado en esta entrega | Alta/edición de títulos, extractos, cuerpos ES/EN, fecha, categoría, imagen y documentos |
| Formato del cuerpo | Parcial, funcional | Editor con negrita, cursiva, enlaces, subtítulos, listas y preview; usa marcas de texto seguras, no el editor WYSIWYG completo de Von |
| Borrador, publicación y fecha programada | Implementado | Criterio público compartido; futuro y borrador responden 404 públicamente |
| Destacar notas en Inicio | Implementado en esta entrega | Prioridad en listas limitadas; el archivo completo mantiene orden por fecha |
| PDF por idioma y fuente independiente | Implementado en esta entrega | Carga/biblioteca, campos dedicados y CTA pública con fallback de idioma |
| Etiquetas del Monitor | Implementado en esta entrega | Hasta 12, únicas, con límites de longitud |
| Selección manual de autores | Implementado en esta entrega | IDs explícitos guardados en la misma transacción que la nota; un perfil oculto no aparece públicamente |
| Autoría/relación y evidencia de verificación | Parcial | La relación heredada no distingue `author` de `related`; falta la pantalla de revisión de autorías de Von |
| Integridad de enlaces de artículos | Pendiente | No existe aún el verificador de fuentes y estados detallados de Von |
| Visibilidad `listed/unlisted` | Pendiente | Santos tiene borrador/publicada/programada; no tiene el nuevo modo no listado de Von |
| Preview privado de registros guardados | Implementado en esta entrega | Perfiles, prácticas, noticias e industrias; API autenticada, cache privado y noindex; reutiliza componentes públicos |
| Preview del borrador aún sin guardar | No prometido | La vista muestra lo persistido, como el flujo de referencia; el editor de texto sí previsualiza su borrador local |
| Biblioteca central de medios | Implementado en esta entrega | Buscar, filtrar, cargar varios archivos secuencialmente, abrir, descripciones, archivar y restaurar |
| Reutilizar medios del diseño original | Implementado en esta entrega | Inventario virtual del manifiesto aprobado más archivos registrados, sin volver a subirlos |
| Reemplazar/quitar sin borrar originales | Implementado | Cambia la referencia; archivar conserva bytes y permite restaurar |
| Inventario histórico de todas las tablas de Von | Parcial | Santos reúne el manifiesto del diseño y biblioteca persistida; aún no descubre todas las referencias históricas de tablas heredadas |
| Subidas a App Storage | Implementado en la base anterior | Escritura antes de metadatos; error de storage no produce una carga exitosa ficticia |
| Firma de archivos y raster saneado | Implementado | MIME/firma y decodificación/recodificación de raster con límite de píxeles; extensiones derivadas del tipo |
| Cargas fragmentadas hasta 200 MB | Pendiente | Santos mantiene 50 MB por archivo y carga directa; el límite se muestra en la interfaz |
| Generación de variantes de video hero | Pendiente | Escritorio, móvil y poster son seleccionables; no hay transcodificación automática |
| ffprobe, cuarentena y ClamAV de Von | Pendiente | No se afirma equivalencia del pipeline de seguridad multimedia |
| Borrado durable con outbox y referencias | Diferente, seguro y reversible | Santos archiva y conserva el objeto; no ejecuta la purga irreversible del trabajador de Von |
| Vacantes visibles y vigencia | Implementado | Catálogo alimenta Carreras sólo con registros publicados y no vencidos |
| Solicitudes de carrera con CV privado | Fuera del flujo actual, pendiente si se replica | Santos usa instrucciones/correo de postulación; no dispone de la bandeja y descarga privada de CV de Von |
| Contactos leídos/no leídos | Implementado | Bandeja privada y marcado de leído |
| Gestión completa de newsletter | Parcial | Lectura de suscripciones; faltan activar/desactivar, filtros, enlace de baja y exportación del CMS de Von |
| Cookies y textos legales | Parcial | Textos editables y aviso del sitio; sin el sistema de categorías, versiones y consentimiento de tracking de Von |
| GA4, Search Console y Leadinfo | No incorporado | El SEO actual cubre textos por página; no se activó ningún rastreador adicional |
| SEO por página y favicon | Implementado en la base anterior | Edición de metadatos y marca; no equivale a toda la infraestructura de SEO del mirror de Von |
| Usuarios, permisos granulares, MFA y sesiones | Parcial | Sesiones Bearer y roles existentes; falta la administración completa de accesos y MFA de Von |
| Auditoría administrativa durable | Parcial | Eventos de cambios en logs; no se replica `admin_audit_events` y su cobertura de Von |
| Testimonios, alianzas y logos de reconocimientos | Fuera del diseño Santos | Von tiene CRUD; no se habilitaron superficies públicas ficticias en Santos |
| Pro Bono, diversidad, Alumni | Fuera del diseño Santos | Requerirían contenido y alcance propios del cliente |
| Eventos con galería, video, PDF y profesionales | Fuera de la navegación pública actual | Santos redirige Eventos al Monitor; la herramienta heredada no tiene paridad editorial con Von |
| Agentes, audio, presentaciones y salidas generadas | Parcial, módulo avanzado heredado | No se certifica por la sola presencia del panel; exige revisar cada agente, credenciales y contrato por separado |

## Implementación y pruebas locales de esta entrega

- Shell compartido, resumen, buscador, directorio de secciones, menú móvil y guía de uso.
- Biblioteca central, inventario del material del diseño, textos alternativos, archivo reversible y selección de PDF.
- Reordenador transaccional de catálogos completos con bloqueo y revisión de estado.
- Corrección de `/api/admin/team/stats`, que antes quedaba capturada por `/:id`.
- Formatos de texto seguros, sin ejecutar HTML aportado por editores.
- Editor del Monitor, relaciones guardadas en transacción, programación y preview.
- Validación y seguridad frente a duplicados de perfiles; prácticas relacionadas desde ambos formularios.
- Protección frente a refetch que pudiera reemplazar una edición local en curso.

Comandos de aceptación:

```sh
npm run check
npm run build
npm run test:cms
npm run test:editorial
```

Las suites requieren PostgreSQL **local** y rechazan una URL de base remota. Crean fixtures propios, prueban persistencia real y limpian cuentas, documentos de prueba y orden original al terminar. El reordenador se prueba con dos peticiones concurrentes: una debe guardar y la otra responder 409.

El driver de transacciones usa una conexión PostgreSQL fijada durante el guardado; se conserva el driver HTTP Neon para los flujos existentes. La comprobación en el runtime Replit/Neon real queda pendiente, porque el cliente pidió no operar allí por ahora. Una compilación local correcta no sustituye esa comprobación.

## Orden de cierre para una réplica exhaustiva

1. Revisar visualmente las pantallas y completar la aceptación de la experiencia de edición local.
2. Adaptar nombres separados, antigüedad, modos de biografía y las relaciones de industrias si se requieren en el diseño Santos.
3. Completar autorías/relaciones verificadas, `unlisted` e integridad de enlaces.
4. Portar el pipeline de medios grandes: sesiones fragmentadas, hashes, cuarentena, ffprobe, antivirus y variantes de video.
5. Completar newsletter y, si el cliente adopta ese flujo, postulaciones/CV privados.
6. Replicar permisos granulares, administración de usuarios, MFA, sesiones y auditoría durable.
7. Auditar y adaptar individualmente agentes y salidas generadas. Mantener integraciones de tracking desactivadas hasta definir su uso.
8. Sólo después de levantar la restricción del cliente: sincronizar código con Replit, verificar migraciones aditivas y conexión de transacciones, recorrer Preview y acordar la publicación pública.

Este orden permite distinguir las mejoras ya utilizables de las funciones pendientes. El panel no debe presentarse como una copia completa de Von Wobeser hasta cerrar y probar las filas pendientes aplicables.

## Resultado de aceptación de este corte

Los cuatro comandos anteriores terminaron correctamente en local. Se comprobó también el rechazo de raster truncado, la biblioteca del material aprobado, archivo/restauración, escape de HTML y bloqueo de enlaces ejecutables en el texto formateado. La revisión visual interactiva quedó pendiente: la conexión de control de Brave reportó pérdida de debugger/captura de una página anterior. Se conserva la pestaña local para continuar cuando se restablezca la conexión. No se presenta una captura de la versión anterior como evidencia del panel nuevo.
