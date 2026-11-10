# Localización de Santos & Saucedo

El sitio usa diez códigos internos: `es`, `en`, `de`, `zh`, `ko`, `ja`, `ar`, `ru`, `fr` e `it`. El código `zh` representa mandarín simplificado (`zh-CN`) y `ko` coreano (`ko-KR`). El catálogo vive en `shared/constants.ts` y lo consumen el frontend, el servidor y los agentes.

## Generar y publicar traducciones

La traducción masiva usa el agente Polyglot con **GPT-6.1 Sol** (`gpt-6.1-sol`) y el nivel `fast` fijado en el servidor. Guarda la clave en Replit Secrets o en el entorno del servidor.

```text
OPENAI_API_KEY=...
OPENAI_REASONING_EFFORT=high
```

Con `DATABASE_URL` y la integración configurada, ejecutar:

```bash
npm run translate:all
```

El comando traduce y publica las secciones CMS, socios, prácticas, industrias y noticias. Guarda la fuente, el hash y la fecha de publicación; si una respuesta está incompleta, detiene esa traducción y no publica contenido vacío.

## Frontend sin backend

Después de generar las traducciones, exportar el snapshot que usa el frontend estático:

```bash
npm run cms:export-static
npm run build:pages
```

`shared/translation-snapshot.json` contiene las traducciones de entidades y `shared/cms-static-snapshot.json` las secciones CMS. El frontend local/estático no llama a la API para cambiar de idioma cuando esos snapshots están presentes.

## Verificación

```bash
npm run test:localization
npm run check
npm run test:agents
npm run build
```

El selector conserva los diez idiomas, `zh` escribe `lang="zh-CN"`, `ko` escribe `lang="ko-KR"` y árabe mantiene `dir="rtl"`.
