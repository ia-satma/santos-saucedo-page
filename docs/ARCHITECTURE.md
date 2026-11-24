# Arquitectura vigente

## Objetivo

El proyecto separa el sitio público, el CMS, la API y los agentes sin duplicar el contenido editorial. Replit es el runtime operativo. GitHub Pages es una exportación estática independiente para revisiones que no necesitan CMS.

## Capas

```text
Browser
  ├─ React/Vite: client/src
  │   ├─ rutas públicas
  │   ├─ componentes públicos
  │   ├─ CMS administrativo
  │   └─ hooks de contenido y visibilidad
  └─ Express: server
      ├─ /api público y administrativo
      ├─ autenticación y sesiones
      ├─ servicios de medios y formularios
      ├─ agentes y auditorías
      └─ PostgreSQL / App Storage

Contratos compartidos
  └─ shared
      ├─ schema.ts
      ├─ cms-defaults.json
      ├─ cms.ts
      ├─ cmsMerge.ts
      ├─ publicRoutes.ts
      └─ siteControls.ts
```

## Responsabilidad por carpeta

| Carpeta | Responsabilidad | Regla |
| --- | --- | --- |
| `client/src/pages` | Páginas públicas y administrativas | No guardar contenido editorial nuevo directamente en el componente |
| `client/src/components` | Componentes reutilizables | Reciben datos o leen el hook CMS indicado |
| `client/src/features/site-config` | Registro y edición del CMS | Cambiar aquí el mapa de páginas y bloques |
| `client/src/hooks` | Consulta, idioma, preview y estado remoto | Mantener una sola política de lectura |
| `server/routes` | Endpoints HTTP | Validar entrada, sesión y respuesta |
| `server/cms` | Persistencia, revisiones y bundles | Guardado atómico y conflicto `409` |
| `server/services` | Integraciones y lógica de dominio | No mezclar renderizado React |
| `shared` | Contratos comunes | No duplicar tipos en frontend y backend |
| `script` | Build y exportación | Solo artefactos reproducibles |
| `scripts` | Pruebas y operaciones | Usar datos sintéticos y documentar efectos |
| `attached_assets` | Material de entrada | No asumir que un archivo local está publicado |
| `private_uploads` | Desarrollo privado | Nunca público ni versionado |

## Flujo de contenido

1. El editor abre una página desde el registro de `editorMetadata.ts`.
2. El CMS carga el bundle de página, sus fuentes compartidas, fichas, visibilidad, idioma y revisión.
3. El editor modifica un borrador y guarda con control de revisión.
4. La API valida el paquete y actualiza las fuentes relacionadas en una operación coordinada.
5. La vista previa usa los mismos componentes públicos. Si la página está desactivada, solo una sesión CMS autenticada puede forzarla a visible.
6. La publicación reemplaza el snapshot publicado y conserva la versión anterior.
7. El frontend público consume la API viva en Replit. El exportador de Pages genera `static-api` para el modo estático.

## Visibilidad

`layout.pages[page].enabled` controla la página completa. `layout.pages[page].blocks[block]` controla cada bloque. El consumidor debe usar `pageVisibility` o `blockVisible` en vez de interpretar valores manualmente.

Una página desactivada debe desaparecer de rutas públicas, menú principal, submenús, pie, enlaces automáticos y listados públicos asociados. La vista previa privada es una excepción autenticada y explícita.

## Runtime de Replit y Pages

### Replit

- Workspace: `npm run start:workspace`
- Build: `npm run build:deploy`
- Deployment: `npm run start:deploy`
- Fuente editorial: PostgreSQL y App Storage
- CMS, sesiones, agentes y mutaciones disponibles según Secrets

### GitHub Pages

- Build: `npm run build:pages`
- Fuente editorial: snapshots JSON generados
- Sin login, CMS, agentes ni mutaciones persistentes
- `client/src/lib/queryClient.ts` resuelve las consultas a `static-api`

No se debe usar un snapshot de Pages para probar persistencia del CMS de Replit.

## Estado actual conocido

- El registro de páginas y bloques ya está centralizado.
- Portada, Nuestra firma y el mosaico de colaboradores de Socios y equipo tienen formularios explícitos. Parte de las páginas restantes todavía utiliza campos heredados agrupados técnicamente. Esa migración es deuda registrada y no debe ampliarse sin actualizar el inventario.
- Algunas claves de visibilidad de bloque de páginas legales, Pasantías y Boletín todavía requieren cobertura pública completa. Cada nueva implementación debe agregar el gate y su prueba.
