# Runbook de desarrollo y publicación

## Preparar un workspace

1. Importa el commit correcto de `main`.
2. Confirma Node 24 y `npm run start:workspace` en `.replit`.
3. Conecta PostgreSQL de Development.
4. Configura Secrets sin copiarlos al repositorio.
5. Ejecuta `npm ci` y `npm run replit:preflight`.
6. Ejecuta `npm run db:push` solo sobre Development y después de revisar el esquema.
7. Ejecuta `npm run check`, `npm run build` y las suites del cambio.

## Desarrollo

```bash
npm run start:workspace
```

Comprueba `/healthz`, `/readyz`, una ruta pública, `/admin/login` y la pantalla CMS afectada. Usa datos sintéticos para mutaciones.

## Publicación Replit

1. Confirma `git status` limpio y el SHA que se va a publicar.
2. Ejecuta las pruebas obligatorias.
3. En Replit, sincroniza `main` y ejecuta el build de Deployment.
4. Publica con `npm run build:deploy` y `npm run start:deploy` mediante `.replit`.
5. Espera a que el estado sea `Live`.
6. Comprueba el hash del bundle público y que corresponda al build nuevo.
7. Prueba la URL pública, el CMS, una ruta con alias y la API de configuración.
8. Si el cambio es editorial, comprueba guardar, recargar, preview y restaurar.

## Publicación estática de Pages

```bash
npm run build:pages
```

Este comando genera `dist/public/static-api`. Pages no tiene autenticación, CMS, agentes ni mutaciones. No uses esta publicación para certificar una función del CMS de Replit.

## Verificación posterior

- El sitio devuelve contenido y no muestra errores de consola.
- El bundle nuevo está referenciado por `index.html`.
- `/api/site-config` refleja la configuración publicada en Replit.
- Una página desactivada desaparece de ruta, menú y pie.
- `?cms-preview=1` solo muestra la página desactivada a la sesión CMS autenticada.
- La página vuelve a aparecer después de reactivar y guardar.
- No hay solicitudes fallidas, overflow horizontal ni errores de hidratación.

## Rollback

Si el despliegue falla, conserva el último publish estable y vuelve a publicarlo desde Replit. No borres datos editoriales para resolver un fallo de código. Si la causa es una migración, detén el despliegue y revisa la base de datos antes de aplicar cambios.

## Secretos y datos

Los Secrets viven en Replit. `.env.example` solo contiene nombres y ejemplos neutros. Nunca documentes valores reales, hashes, sesiones, tokens, CVs o documentos privados.
