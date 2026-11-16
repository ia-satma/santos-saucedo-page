# Instrucciones del Repl

El runtime actual de Santos & Saucedo usa Node 24, React/Vite, Express, PostgreSQL y App Storage.

## Flujo normal

- Workspace y Preview: `npm run start:workspace`
- Deployment: `npm run build:deploy` y `npm run start:deploy`
- CMS: `/admin/dashboard`
- Sitio público: `/es/`

Lee [AGENTS.md](AGENTS.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) y [docs/RELEASE_RUNBOOK.md](docs/RELEASE_RUNBOOK.md) antes de cambiar el proyecto.

## Reglas

- No uses Replit Agent para reemplazar el flujo de Git y el CMS.
- No guardes Secrets en el código, `.replit` ni la documentación.
- No ejecutes `db:push`, seeds ni pruebas destructivas contra Production.
- No edites `dist`, snapshots estáticos ni archivos generados a mano.
- Todo contenido visible debe tener fuente CMS, fallback y prueba.
- Los cambios editoriales se guardan desde el CMS. Los cambios de código requieren `check`, `build`, commit y publicación.

## Antes de publicar

```bash
npm ci
npm run replit:preflight
npm run check
npm run build
npm run test:routes
npm run test:cms
npm run test:public-flows
npm audit --omit=dev --audit-level=high
```

Después de publicar, comprueba el estado `Live`, el hash del bundle, la URL pública y el flujo CMS afectado. La exportación `npm run build:pages` es un flujo estático separado y no ejecuta el CMS.
