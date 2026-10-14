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

El proyecto no ejecuta migraciones automáticamente al hacer pull o merge. `scripts/post-merge.sh`
solo instala dependencias y ejecuta TypeScript; cualquier cambio de esquema se aplica manualmente y
contra la base correcta.

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
- `PCLOUD_USERNAME`
- `PCLOUD_PASSWORD`

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

Revisa el destino antes de ejecutar el comando. Después de crear la primera base, los cambios de
esquema deben migrarse a un runner versionado antes de automatizar despliegues posteriores.

La carpeta `uploads/` actual es un fallback local heredado. Antes de aceptar cargas reales del CMS,
hay que conectar App Storage de Santos y dejar los objetos públicos y privados en namespaces separados.

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
