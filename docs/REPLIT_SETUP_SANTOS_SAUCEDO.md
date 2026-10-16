# Preparación de Santos & Saucedo para Replit

Este proyecto se ejecuta en Replit sin depender de Replit Agent. El flujo usa scripts versionados,
PostgreSQL, el backend Express y los controles normales de Run/Publish.

Antes de importar desde GitHub, confirma que estos cambios estén committeados y publicados en el
branch que Replit va a importar. Importar otro branch dejaría fuera `.replit`, los scripts de
preflight/provisión y esta guía.

## Orden de instalación

1. Importa el repositorio desde GitHub en un Repl privado del cliente.
2. Verifica que el archivo `.replit` usa Node 24 y `npm run start:workspace`.
3. Provisiona la base PostgreSQL de **Development**.
4. Configura los Secrets del entorno de Development.
5. Ejecuta `npm ci`.
6. Ejecuta `npm run replit:preflight`.
7. Aplica el esquema de desarrollo de forma explícita con `npm run db:push`.
8. Ejecuta `npm run start:workspace` y revisa el sitio y `/admin/login`.
9. Ejecuta `npm run check` y `npm run build`.
10. Solo después de validar Preview, crea la base de producción.
11. Provisiona explícitamente el esquema de producción y después publica.

Al hacer pull o merge, `scripts/post-merge.sh` solo instala dependencias y ejecuta TypeScript.
Al arrancar el servidor, `ensureCmsSchema` sí aplica las ampliaciones versionadas del CMS: DDL
aditivo e idempotente, dentro de una transacción y con bloqueo asesor. La provisión inicial completa
sigue siendo explícita. Revisar siempre el entorno y la migración antes de arrancar una actualización;
no ejecutar `db:push` a ciegas sobre una base con datos.

## Secrets

Configura estos valores en Replit Secrets. Nunca los guardes en `.replit`, GitHub o este documento.

### Obligatorios para backend

- `DATABASE_URL`: URL de PostgreSQL del entorno actual.
- `NODE_ENV`: `development` en Workspace/Preview; `production` en Deployment.
- `PORT`: `5000`.
- `CORS_ORIGIN`: origen exacto permitido, por ejemplo el dominio Replit y el dominio final cuando exista.
- `ENABLE_APP_AGENTS`: `false` durante la instalación inicial; cambia a `true` solo cuando las tablas y Secrets de IA estén validados.
- `ALLOW_ADMIN_INIT`: mantener `false`; el primer usuario se crea mediante `ADMIN_EMAIL` y `ADMIN_PASSWORD_HASH`.

### CMS administrativo temporal

- `ADMIN_EMAIL`: correo del administrador Santos.
- `ADMIN_PASSWORD_HASH`: hash generado para Santos; no reutilizar el hash heredado de Von Wobeser.

### Servicios opcionales

- `AI_INTEGRATIONS_OPENAI_API_KEY`
- `AI_INTEGRATIONS_OPENAI_BASE_URL`
- `AI_INTEGRATIONS_GEMINI_API_KEY`
- `AI_INTEGRATIONS_GEMINI_BASE_URL`
- `REPLIT_APP_STORAGE_BUCKET_ID`: bucket de Santos ya conectado.
- `PUBLIC_SITE_URL`: origen público del sitio.
- `AGENT_AUTO_PROCESSING`: `false` para probar agentes manualmente con la cola automática pausada.

El par de clave y base URL de IA gestionada debe ser suministrado por Replit. Texto, imágenes
y audio usan ese transporte; el audio gestionado utiliza Chat Completions, no el endpoint de TTS
directo. Nunca reutilizar un token gestionado contra el host público de OpenAI. El cliente decidió
no usar Replit Agent y dejar la activación/prueba real de IA pendiente.

Los agentes internos de la aplicación pueden quedar desactivados mientras se valida el CMS. No se
requiere Replit Agent para ejecutar, probar o publicar este proyecto.

El proyecto expone `/healthz` y `/readyz` para validar el proceso desde Replit. `/readyz` solo responde
correctamente después de registrar las rutas y completar el arranque.

## Desarrollo y producción

Development y Production deben tener bases separadas. No uses la base de producción para `db:push`,
pruebas de seed o cargas de archivos. La publicación debe crear una base de producción propia y
recibir sus Secrets de deployment.

Este repositorio todavía no incluye un ledger de migraciones versionadas; por eso la primera
provisión de Production se ejecuta de forma controlada desde el entorno que tenga seleccionada la
`DATABASE_URL` de Production:

```bash
CONFIRM_REPLIT_PRODUCTION_SCHEMA=1 npm run replit:provision-production
```

Revisa el destino antes de ejecutar el comando. Las ampliaciones actuales del CMS se encuentran
en `ensureCmsSchema` y `server/cms/agentSchema.ts`; no constituyen un ledger general de migraciones
para cualquier modificación futura del esquema.

App Storage de Santos ya fue conectado en el corte anterior. El nuevo código separa objetos
públicos (`santos-saucedo/public/`) y documentos/presentaciones privados
(`santos-saucedo/private/`), exige persistir antes de confirmar y protege las descargas privadas.
Los nuevos tipos de archivo aún necesitan una prueba de ida y vuelta en Replit con este corte.
El almacenamiento de archivos local solo sirve para desarrollo y pruebas.

La carga privada de documentos usa ClamAV y lo exige por defecto en producción. Antes de publicar
este corte, provisionar el ejecutable y las firmas y comprobar el escaneo en Replit; no desactivar
el requisito para superar la validación. La configuración actual aún no acredita esa disponibilidad.

## Alcance CMS inicial Santos

- Configuración global y navegación.
- Cuatro áreas oficiales.
- Equipo y perfiles.
- Noticias/publicaciones.
- Preview y publicación.
- Biblioteca de medios.
- Contacto, newsletter y SEO.

Se mantienen fuera de la primera instalación las entidades específicas de Von Wobeser, sus datos,
usuarios, secretos, CVs, rankings, 18 prácticas e industrias heredadas.

## Comandos de operación

```bash
npm ci
npm run replit:preflight
npm run db:push       # solo contra Development y después de revisar el esquema
npm run start:workspace
npm run check
npm run build
npm run replit:provision-production  # requiere CONFIRM_REPLIT_PRODUCTION_SCHEMA=1 y DATABASE_URL de Production
npm run start:deploy  # solo en Deployment, después de publicar el artefacto
```

## Aceptación antes de publicar el nuevo corte

1. Sincronizar el commit revisado y ejecutar `npm ci`, `npm run check` y `npm run build`.
2. Revisar el DDL aditivo y arrancar Preview con la base de Development correcta.
3. Validar usuarios/permisos sin alterar el administrador existente.
4. Verificar escáner y cargas/descargas públicas y privadas con App Storage; reiniciar y comprobar persistencia.
5. Mantener la prueba de IA real pendiente y no usar Replit Agent, como indicó el cliente.
6. Publicar después de cerrar los puntos de infraestructura; verificar `/readyz`, sitio y acceso al CMS.

Las suites `test:cms`, `test:editorial`, `test:access` y `test:panel` crean datos desechables y
rechazan bases remotas. No ejecutarlas contra Development compartido ni Production de Replit.

## Archivos, formularios y medición — nuevo corte

El build publicado ahora es `npm run build:deploy`. Incluye `replit:prepare-uploads`, que descarga las firmas oficiales de ClamAV en `dist/clamav` y prueba el escaneo. La configuración Nix incluye `ffmpeg` y `clamav`; no publicar si esa preparación falla. El runtime usa `CLAMAV_DATABASE_DIR` si se define, o las firmas incluidas en `dist/clamav`.

`SESSION_SECRET` firma las sesiones fragmentadas; utilice un valor aleatorio de al menos 32 caracteres para disponer también de enlaces firmados de baja del newsletter. No imprimir ni guardar ese valor en Git. Los fragmentos y CV usan namespaces privados propios de Santos.

Google, cookies y voz corporativa se administran desde sus accesos del menú. No es necesario editar código para introducir IDs de GA4 o verificación de Search Console. Mantener apagados los proveedores hasta configurar los datos del cliente.
