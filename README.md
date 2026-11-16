# Santos & Saucedo

Sitio público, CMS editorial y servicios de apoyo para Santos & Saucedo.

El runtime operativo usa React, Vite, Express, PostgreSQL y App Storage en Replit. GitHub Pages es una exportación estática separada.

Lee primero:

- [AGENTS.md](AGENTS.md)
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
- [docs/CMS_CONTENT_MAP.md](docs/CMS_CONTENT_MAP.md)
- [docs/ENGINEERING_RULES.md](docs/ENGINEERING_RULES.md)
- [docs/RELEASE_RUNBOOK.md](docs/RELEASE_RUNBOOK.md)

## Estructura

```text
client/src/       Frontend React, rutas públicas, CMS y componentes
server/           Express, API, autenticación, servicios y agentes
shared/           Tipos, esquemas, rutas, defaults y contratos
script/           Build y generación de artefactos
scripts/          Pruebas, auditorías e importaciones
docs/             Arquitectura, reglas, inventarios y runbooks
attached_assets/  Material de entrada y fuentes de diseño
tests/            Fixtures y datos sintéticos
```

## Inicio local

```bash
npm ci
npm run replit:preflight
npm run check
npm run build
```

Para trabajar con el CMS se necesita PostgreSQL de Development y los Secrets descritos en [docs/RELEASE_RUNBOOK.md](docs/RELEASE_RUNBOOK.md). No uses una base de producción para pruebas.

## Calidad

```bash
npm run check
npm run build
npm run test:cms
npm run test:routes
npm run test:public-flows
npm run test:video-source
npm run test:localization
npm run test:privacy
npm audit --omit=dev
```

Replit usa `npm run build:deploy` y `npm run start:deploy`. Pages usa `npm run build:pages` y snapshots JSON. No mezcles ambos flujos.
