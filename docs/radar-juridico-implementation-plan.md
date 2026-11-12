# Plan de implementación — Radar Jurídico Laboral MX

Este plan parte de la auditoría. No instala dependencias ni cambia el frontend hasta aprobar la Fase 0.

## Fase 0 — auditoría y fixtures

**Objetivo:** dejar comprobados los contratos y una decisión de fuentes.

Archivos previstos:

- `server/radar/types.ts`
- `server/radar/sourcePolicy.ts`
- `server/radar/adapters/dof.ts`
- `server/radar/adapters/sjf.ts`
- `server/security/radar*.test.ts`
- `docs/radar-juridico-*.md`

Acciones:

1. Probar con fixtures una fecha DOF conocida y un registro SJF real.
2. Medir endpoint, formato, paginación, fecha, identificador y cobertura de Duodécima Época.
3. Confirmar licencia del commit exacto que se vaya a usar.
4. Confirmar términos de reutilización y límites de red.
5. Decidir adaptador SIDOF nativo frente a `dof-mcp` y adaptador directo frente a `SCJN_SQLITE`.

Salida: contrato de adaptador aprobado y matriz de pruebas reproducible.

## Fase 1 — inbox de documentos

**Objetivo:** importar y deduplicar documentos sin generar ni publicar.

Migración reversible propuesta:

- `legal_sources`
- `legal_documents`
- `legal_document_versions`
- `monitor_runs`

Se añadirán índices únicos por origen e identificador, más hash y URL canónica. La importación se limitará por lote y tamaño. Una caída de una fuente dejará la ejecución en `partial` o `failed` y conservará el cursor anterior.

## Fase 2 — hallazgos y clasificación

**Objetivo:** separar novedades laborales de material histórico.

Migración propuesta:

- `legal_findings`

El clasificador determinista asignará autoridad, tipo, materia, jurisdicción, época, prioridad y confianza. El agente sólo evaluará los candidatos que pasen filtros. La frase "nueva ley" quedará bloqueada para iniciativas, consultas y proyectos.

## Fase 3 — herramientas y borradores

**Objetivo:** usar los agentes existentes para producir propuestas verificables.

Acciones previstas:

1. Añadir herramientas read-only para DOF/SJF y consulta de hallazgos.
2. Extender `LegalAlertsAgent` con un payload de hallazgo estructurado, conservando su contrato actual de texto/URL.
3. Crear `editorial_drafts` o una relación explícita con `news` y `social_assets`.
4. Generar artículo, resumen, copys y brief con citas oficiales.
5. Registrar cada salida en `agentCopyHistory` con `origin='scheduled'` o `origin='manual'`.

Ninguna ruta de generación podrá poner `published=true` ni enviar a redes.

## Fase 4 — panel administrativo

**Objetivo:** hacer operable el flujo para una persona no técnica.

Rutas previstas, bajo permisos administrativos existentes:

- `GET /api/admin/radar/items`
- `POST /api/admin/radar/import`
- `POST /api/admin/radar/items/:id/analyze`
- `POST /api/admin/radar/items/:id/create-news-draft`
- `POST /api/admin/radar/items/:id/create-social-draft`
- `POST /api/admin/radar/sync/:source`
- `GET /api/admin/radar/runs`

La interfaz debe mostrar fuente, fecha, evidencia, estado, borradores relacionados y acciones de aprobar, editar, descartar o regenerar. La redacción manual se conserva en el editor de noticias y en Social Studio.

## Fase 5 — programación controlada

**Objetivo:** ejecutar sincronizaciones con confiabilidad.

Cadencia inicial sugerida en `America/Monterrey`:

- DOF: lunes a viernes 08:00 y comprobación 18:00.
- SJF: viernes 17:00 con reintentos.
- Reconciliación: diaria 19:00.
- Clasificación y candidatos: después de cada sincronización correcta.

El scheduler debe vivir en Replit Routines, GitHub Actions protegida o un worker externo. El servidor web sólo expone la operación idempotente y valida un token de servicio. No se usará `setInterval` para la sincronización legal.

## Fase 6 — fuentes complementarias

Después de estabilizar DOF/SJF se pueden añadir STPS, IMSS, INFONAVIT, leyes vigentes y Nuevo León. Cada fuente requiere su propio adaptador, términos, pruebas y estado de cobertura.

## Pruebas obligatorias

### Unidad

- normalización de fechas y URLs
- hash y deduplicación
- clasificación de documento y época
- allowlist y bloqueo SSRF
- sanitización y límite de tamaño
- contratos JSON de herramientas

### Integración

- importación repetida sin duplicados
- documento modificado crea versión
- error de fuente conserva cursor
- reintento con backoff
- ejecución concurrente bloqueada
- hallazgo real produce cita oficial
- ausencia de evidencia queda `pending` o `failed`
- generación crea borrador y nunca publicación
- Social Studio recibe provenance
- permisos de solo lectura y revisión

### Regresión

Ejecutar `npm run check`, `npm run build` y las suites existentes de CMS, agentes, traducciones, medios, publicaciones, documentos, testimonios y privacidad. Añadir la batería del radar antes de activar el scheduler.

## Rollback

1. Desactivar las fuentes en `legal_sources`.
2. Detener el scheduler externo.
3. Dejar los hallazgos y borradores en modo lectura.
4. Revertir la migración sólo después de exportar `monitor_runs`, documentos y decisiones.
5. No borrar noticias existentes ni medios relacionados.

## Coste y límites iniciales

- Lote máximo por ejecución y descarga máxima por documento.
- Tokens limitados por hallazgo y por día.
- No cargar corpus histórico masivo en una petición web.
- No vectorizar hasta demostrar que full-text y metadatos no bastan.

## Criterio de salida de la fase de diseño

La fase queda lista cuando exista una consulta oficial reproducible, un fixture real, una decisión de licencia y cobertura, contratos de adaptador, migración reversible, pruebas de dedupe/reintento/no autopublicación y un flujo manual que permita crear el mismo borrador sin scheduler.

## Estado actual

| Área | Estado |
|---|---|
| Agentes OpenAI reutilizables | Disponible |
| Cola y reintentos | Disponible |
| CMS de noticias en borrador | Disponible |
| Social Studio | Disponible |
| Fuentes DOF/SJF conectadas | Pendiente |
| Persistencia del Radar | Pendiente |
| Scheduler legal | Pendiente |
| Panel Radar | Pendiente |
| Aprobación humana | Disponible en publicación existente |
