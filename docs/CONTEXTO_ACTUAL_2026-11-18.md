# Contexto actual — Santos & Saucedo

Corte documental: **2026-11-18**, zona America/Monterrey. Este documento sustituye como referencia operativa al corte de octubre. Los documentos fechados antes conservan historia.

## Coordenadas

- Repositorio: `https://github.com/ia-satma/santos-saucedo-page`.
- Rama y commit: `main` en `b4b9c2d`.
- Carpeta activa: `/Volumes/alejandro /santos saucedo - página web/santos-saucedo-cms`.
- Runtime: TypeScript, React 18, Vite 8, Express 4, PostgreSQL/Drizzle y App Storage en Replit.
- Workspace: `https://replit.com/t/santos-and-saucedo/repls/santos-saucedo-page`.
- URL pública: `https://santos-saucedo.replit.app/es/`.
- CMS de traducciones: `https://santos-saucedo.replit.app/es/admin/translations`.
- Dominio futuro: `https://santossaucedo.com`.
- Publicación observada en Replit: `e429bb98`, estado Live.

## CMS

El CMS está organizado por páginas, bloques y fichas. La navegación incluye Portada, Nuestra firma, Prácticas, Industrias, Socios y equipo, Monitor Laboral, Radar jurídico, Eventos, Carreras, Pasantías, Vacantes, Contacto, Oficinas, Testimonios, páginas legales, medios, navegación, visibilidad, formularios, SEO, usuarios, seguridad y agentes IA.

Los editores de página mantienen textos, imágenes, videos, botones, SEO y visibilidad junto al bloque que los muestra. Las fichas dinámicas conservan sus catálogos propios.

## Agente global de traducciones

El agente `polyglot_translator` procesa páginas y bloques CMS además de artículos.

1. El guardado calcula el `sourceHash` de la fuente española.
2. Se encola un trabajo con `cmsSection`, el hash, `applyChanges: true` y los nueve destinos `en`, `de`, `zh`, `ko`, `ja`, `ar`, `ru`, `fr` e `it`.
3. El agente traduce únicamente textos, protege correos y teléfonos y conserva rutas, imágenes y medios.
4. El resultado se guarda como propuesta privada en `translation_cache` y `localized.<section>.<language>` con estado `pending`.
5. **Traducciones → Páginas y bloques** muestra cobertura y propuestas pendientes.
6. La aprobación valida el hash y cambia a `published` sólo la traducción revisada.
7. La ruta pública sólo sirve contenido localizado con estado `published`. Las propuestas obsoletas no aparecen como accionables.

Archivos principales: `server/cms/cmsTranslationAgent.ts`, `server/cms/siteConfig.ts`, `server/agents/specialized/PolyglotTranslatorAgent.ts`, `server/agents/core/contracts.ts`, `server/routes/agentReportRoutes.ts` y `client/src/pages/admin/AdminTranslations.tsx`.

## Verificación

- `npm run check`: aprobado.
- `npm run build`: aprobado.
- `npm run test:agents`: 77 aprobadas, 0 fallos.
- `npm run test:localization`: 10/10 idiomas, 576 entradas y 43 secciones estáticas.
- Replit: migraciones validadas, security checks, build, bundle y promote completados.
- Brave: CMS publicado cargó la cobertura global y la pestaña de páginas y bloques.
- Prueba real: se editó `Desde 2010` en Portada, se guardó, se confirmó la entrada del trabajo y se restauró el valor original.

## Incidencia externa

La ejecución real respondió `429 You have no credits remaining` del proveedor OpenAI/Replit. El orquestador y el código están activos, pero no hay saldo disponible para generar propuestas. No se publicaron traducciones inventadas ni incompletas.

## Riesgos y decisiones

- Se mantiene la revisión humana antes de publicar porque es un requisito editorial.
- El hook se ejecuta al guardar un borrador. Antes de aprobar conviene bloquear la aprobación si existe un borrador fuente posterior sin publicar.
- `/healthz/` y `/readyz` responden 200. El edge público observó 404 para `/healthz` sin barra final.
- `santossaucedo.com` queda documentado como dominio futuro, sin cambio de DNS en este corte.
- No se guardaron secretos, cookies, contraseñas, tokens, bases de datos ni datos privados en documentación.
