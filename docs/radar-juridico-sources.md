# Fuentes y conectores evaluados

Fecha de verificación: 2026-11-12.

## Fuentes oficiales que deben gobernar el contenido

| Fuente | URL | Uso previsto | Estado |
|---|---|---|---|
| SIDOF / DOF | https://sidof.segob.gob.mx/datos_abiertos | Publicaciones, notas e identificadores del DOF | Portal oficial localizado. Endpoint y límites operativos deben probarse desde el entorno antes de activar el job. |
| Aviso legal DOF | https://sidof.segob.gob.mx/avisoLegal | Condiciones de acceso y reutilización | Debe revisarse antes de almacenar o reproducir texto completo. |
| DOF | https://www.dof.gob.mx/ | Verificación y enlace canónico | Fuente de consulta oficial. |
| SJF / SCJN | https://sjf2.scjn.gob.mx/ | Tesis, jurisprudencia, precedentes y metadatos | Portal oficial localizado. Endpoint y cobertura por época deben probarse. |
| SCJN | https://www.scjn.gob.mx/ | Verificación institucional | Fuente oficial complementaria. |
| Cámara de Diputados | https://www.diputados.gob.mx/LeyesBiblio/ | Leyes federales vigentes | Fase posterior, con control de vigencia. |
| STPS | https://www.gob.mx/stps | Avisos y obligaciones laborales | Fase posterior. |
| IMSS | https://www.imss.gob.mx/ | Seguridad social y riesgos de trabajo | Fase posterior. |
| INFONAVIT | https://portalmx.infonavit.org.mx/ | Obligaciones y avisos | Fase posterior. |
| Nuevo León | https://www.nl.gob.mx/ | Autoridad estatal | Requiere adaptador separado y la fuente del Periódico Oficial estatal. |

## Repositorios candidatos

### `dof-mcp`

- Repositorio: https://github.com/amatiasdev/dof-mcp
- GitHub reporta licencia MIT, rama `main`, actualizado el 2026-10-18 y con push el 2026-11-07.
- README describe herramientas read-only para resumen diario, nota e indicadores del SIDOF, con URL oficial, procedencia y SHA-256.
- Node requerido: 22 o superior según el README.
- El servicio hospedado anunciado es público, con rate limit y sin SLA. No se debe conectar el CMS comercial a ese endpoint sin autenticación, límites propios y pruebas de disponibilidad.
- No sustituye el scheduler, persistencia, clasificación ni aprobación humana.
- El README no ofrece búsqueda general de todas las notas. Debe probarse la consulta por fecha e identificador.

**Decisión:** candidato P0 para un adaptador read-only, preferentemente ejecutado localmente o detrás de un proxy controlado. Validar API, cobertura, errores y términos antes de activarlo.

### `SCJN_SQLITE`

- Repositorio: https://github.com/EmilianoMierUjed/SCJN_SQLITE
- GitHub reporta licencia MIT, rama `main`, actualizado el 2026-07-29 y push el 2026-06-02.
- El README describe scripts Python que descargan tesis, jurisprudencias y sentencias desde una API oficial de SCJN, guardan SQLite FTS5 y admiten sincronización incremental.
- El propio proyecto estima varias horas para la descarga inicial. Son cifras del autor, no una medición independiente.
- El endpoint concreto y la cobertura actual de la Duodécima Época no están documentados de forma suficiente para certificar integración.

**Decisión:** usar sólo como proceso batch aislado o referencia de extracción después de probar cobertura y cursores. No cargarlo en el servidor web ni tratarlo como API de consulta directa.

### `Gestor_Tesis_SCJN`

- Repositorio: https://github.com/deadjoker514/Gestor_Tesis_SCJN
- GitHub detecta `NOASSERTION` aunque el README incluye un archivo con texto MIT. La licencia efectiva debe aclararse.
- Es una aplicación Flet de escritorio para extracción, búsqueda y exportación. No ofrece contrato MCP/REST para un backend.

**Decisión:** referencia secundaria. No integrar código sin aclarar licencia y convertir la extracción en un proceso controlado.

### `corpus-iuris-mcp`

- Repositorio: https://github.com/maharbanaretsagrav/corpus-iuris-mcp
- GitHub detecta `NOASSERTION`. El README incluye licencia MIT para ejemplos, pero los datos y el corpus tienen condiciones propias.
- Anuncia un MCP remoto con OAuth 2.0, cuotas y cobertura amplia. No hay garantía de SLA ni certificación independiente de actualidad laboral.

**Decisión:** no integrar comercialmente en la primera fase. Si se evalúa después, debe usar un adaptador con allowlist, OAuth, timeout, cache, provenance, límites y fallback a fuentes oficiales.

## Repositorios de soporte no prioritarios

MarkItDown, Docling, Qdrant, Satori, Sharp y referencias de skills pueden evaluarse cuando exista una necesidad concreta. No se instalarán por defecto. El CMS ya tiene extracción, sanitización, almacenamiento y generación de medios suficientes para el primer flujo.

## Matriz de verificación pendiente

| Comprobación | DOF/SIDOF | SJF/SCJN | Criterio de aceptación |
|---|---:|---:|---|
| Consulta de fecha conocida | Pendiente en entorno | N/A | Respuesta oficial reproducible |
| Recuperación por identificador | Pendiente | Pendiente | URL y metadatos verificables |
| Fecha de publicación separada de detección | Pendiente | Pendiente | No marca histórico como novedad |
| Duodécima Época | N/A | Pendiente | Registro oficial real y época almacenada |
| Reintento y timeout | Pendiente | Pendiente | Estado `partial` o `failed`, nunca falso cero |
| Licencia de código | MIT reportada | MIT reportada | Revisar archivo LICENSE en commit usado |
| Términos de contenido | Revisar aviso legal | Revisar términos SCJN | No republicar texto completo sin autorización |

## Regla de contenido

El CMS almacenará metadatos, enlaces oficiales, hashes y análisis originales. El texto íntegro sólo se conservará si la fuente y sus términos lo permiten. La publicación final debe citar la fuente y conservar el registro que permitió verificar la afirmación.
