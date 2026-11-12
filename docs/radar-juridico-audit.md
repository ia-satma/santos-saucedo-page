# Auditoría del Radar Jurídico Laboral MX

Fecha de auditoría: 2026-11-12  
Repositorio auditado: `santos-saucedo-cms`  
Estado: diagnóstico, sin cambios de comportamiento en producción.

## Alcance

Se revisó la especificación `RADAR_JURIDICO_LABORAL_MX_CODEX.md`, el texto de trabajo compartido, el código del CMS y la disponibilidad documental de los repositorios candidatos. Esta fase no modifica el frontend público, no publica contenido y no instala dependencias.

## Stack y ejecución

- Aplicación TypeScript con Express en servidor y React/Vite en cliente.
- PostgreSQL con Drizzle ORM. La aplicación usa `editorialDb` en `server/db.ts`.
- Sesiones, autenticación, roles y permisos propios en `server/auth.ts`.
- Almacenamiento público y privado con App Storage en `server/replitStorage.ts`.
- Scripts operativos en `scripts/` y pruebas Node/Playwright.
- Comandos existentes: `npm run check`, `npm run build`, suites de CMS, agentes, rutas, privacidad, medios, documentos, testimonios y pruebas visuales.
- `package.json` ya incluye `openai`, `cheerio`, `sanitize-html`, `pg`, `drizzle-orm` y `tsx`. No hace falta añadir una capa de agentes o un framework de workflows para la primera fase.

## CMS y flujo editorial existente

El modelo `news` en `shared/schema.ts` ya conserva título, extracto, contenido, slug, fuente, fecha, traducciones, categoría, publicación, programación, estado de procesamiento y veredicto del consejo legal. `published` nace en `false`, por lo que el flujo es apto para borradores.

El CMS ya tiene:

- Editor administrativo de noticias y publicaciones en `server/routes.ts`.
- Política de publicación y validación de fuente en `server/newsPublicationPolicy.ts`.
- Traducciones en `newsTranslations`.
- Relaciones de publicaciones con abogados, prácticas e industrias.
- Auditoría técnica en `websiteAudits` y `websiteAuditFindings`.
- Historial de copias de agentes en `agentCopyHistory`.
- Generación de posts/carruseles en `server/routes/socialAssetRoutes.ts` y `server/services/socialStudio.ts`.
- Documentos con membrete y biblioteca privada.

El módulo pedido debe reutilizar esas piezas y conservar la edición manual en el CMS.

## Agentes OpenAI existentes

Los 14 agentes ejecutables se registran en `server/agents/index.ts` y se validan contra `shared/agentConstants.ts`. La ejecución pasa por `AgentOrchestrator` y sus servicios de cola, reintentos, procesamiento y reportes.

Los agentes relevantes para el radar son:

- `legal_alerts`: transforma una fuente oficial permitida en una noticia bilingüe en estado `ready_for_approval`.
- `content_analyzer`: analiza calidad, SEO, ramas jurídicas e industrias.
- `category_agent`: sugiere categorías, prácticas e industrias.
- `social_media`: genera borradores para LinkedIn, X, Instagram y Facebook.
- `seo_optimizer`: propone metadatos y mejoras de indexación.
- `polyglot_translator`: mantiene traducciones en idiomas activos.
- `content_auditor` y `website_auditor`: revisan completitud, enlaces, traducciones y SEO.

`BaseAgent` inyecta únicamente conocimiento aprobado desde `AgentKnowledgeStore`. La fuente jurídica debe entrar como datos delimitados, no como instrucciones. `LegalAlertsAgent` ya aplica allowlist de hosts, límite de tamaño, sanitización, hash SHA-256 y creación de borrador sin publicación.

## Jobs, scheduler y persistencia

La cola `agentJobs` admite prioridad, estados, reintentos, reclamación atómica y recuperación de trabajos estancados. `agentEvents` conserva eventos de ejecución. Esto es reutilizable para tareas de análisis y generación editorial.

El único scheduler de aplicación actual es un `setInterval` horario en `server/index.ts` para limpiar sesiones expiradas. No existe un recolector DOF/SJF, cursor de fuentes, lock de sincronización ni historial específico de monitor. Un scheduler de fuentes no debe depender de `setInterval` en un despliegue autoscale. Debe ejecutarse como rutina externa o proceso controlado que invoque un endpoint administrativo idempotente.

## Integraciones encontradas

No están incluidos en el repositorio `dof-mcp`, `SCJN_SQLITE`, `Gestor_Tesis_SCJN` ni `corpus-iuris-mcp`. Tampoco hay una API oficial de DOF o SCJN configurada en secretos. No se encontró un endpoint de monitor legal existente.

El agente legal actual permite URLs oficiales `.gob.mx` y hosts expresamente permitidos. La allowlist necesita ampliarse sólo después de verificar los hosts finales de SIDOF y SJF, con pruebas de red controladas.

## Capacidades que se pueden reutilizar

1. `news` como destino de borradores web.
2. `agentJobs` y `agentEvents` como cola y trazabilidad de ejecuciones.
3. `agentCopyHistory` para conservar propuestas de texto y su origen.
4. `LegalAlertsAgent` para el primer borrador jurídico bilingüe.
5. `SocialMediaAgent` y Social Studio para copys y piezas sociales.
6. `AgentKnowledgeStore` para glosario jurídico, reglas editoriales y fuentes aprobadas.
7. permisos `editorial`, `agent_knowledge_admin` y roles `editor`/`admin`.
8. políticas actuales de sanitización, protección de SSRF y publicación humana.

## Piezas que faltan

- Adaptadores de fuente oficiales con contrato común.
- Tablas de fuentes, documentos, versiones, hallazgos y ejecuciones.
- Dedupe por identificador oficial y hash.
- Cursores y detección de cambios.
- Clasificación determinista previa al modelo.
- Herramientas de lectura para los agentes.
- Bandeja administrativa del radar.
- Job runner externo o rutina programada.
- Fixtures de fuentes oficiales y pruebas de caída, reintentos, permisos y no autopublicación.

## Riesgos y límites

- La licencia del código de un repositorio no autoriza por sí sola la reproducción comercial del contenido oficial.
- La ausencia de resultados tras una falla de fuente no puede interpretarse como ausencia de novedades.
- El texto descargado de una fuente es contenido no confiable y puede contener prompt injection.
- Una tesis aislada no equivale a jurisprudencia obligatoria. La época, tipo, órgano, publicación y vigencia deben quedar en metadatos verificables.
- El histórico inicial de SCJN puede requerir horas y almacenamiento separado. No debe ejecutarse dentro de una petición web.
- El Periódico Oficial de Nuevo León requiere una fuente y adaptador independiente.

## Decisión de auditoría

La integración es compatible si se construye como módulo backend incremental. La primera fase debe usar un inbox de hallazgos y borradores, reutilizar los agentes actuales y evitar cualquier publicación automática. No se recomienda clonar ni activar repositorios externos dentro del proceso web antes de validar licencia, endpoint, cobertura y coste operativo.

## Evidencia y pendientes

### Confirmado en código

- Cola y reintentos de agentes.
- Conocimiento aprobado y skills por agente.
- Noticias bilingües con estado de borrador.
- Generación social con revisión.
- Validación de fuentes externas y sanitización.
- Scheduler actual limitado a mantenimiento de sesiones.

### No implementado

- Recolección diaria DOF.
- Sincronización semanal SJF/SCJN.
- Persistencia legal específica.
- Herramientas `search_dof`, `search_scjn_theses` y similares.
- Panel Radar en el CMS.

### No verificado todavía

- Cobertura empírica de la Duodécima Época en `SCJN_SQLITE`.
- Endpoints y límites actuales de SIDOF y SJF para cada consulta.
- Términos de reutilización del contenido oficial para el caso comercial.
- Credenciales, cuotas y disponibilidad de cualquier proveedor externo.
