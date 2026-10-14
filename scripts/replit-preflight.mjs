import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const isReplit = Boolean(process.env.REPL_ID || process.env.REPLIT_DEPLOYMENT || process.env.REPLIT_DB_URL);
const isProduction = process.env.NODE_ENV === "production";
const failures = [];
const warnings = [];

function pass(message) {
  console.log(`[replit-preflight] OK   ${message}`);
}

function warn(message) {
  warnings.push(message);
  console.warn(`[replit-preflight] WARN ${message}`);
}

function fail(message) {
  failures.push(message);
  console.error(`[replit-preflight] FAIL ${message}`);
}

const packageJsonPath = resolve("package.json");
if (!existsSync(packageJsonPath)) {
  fail("package.json no existe en el directorio de trabajo.");
} else {
  pass("package.json encontrado.");
}

const replitFilePath = resolve(".replit");
if (existsSync(replitFilePath)) {
  const replitText = readFileSync(replitFilePath, "utf8").toLowerCase();
  if (replitText.includes("vonwobeser")) {
    fail(".replit todavía contiene referencias de Von Wobeser; elimina la configuración heredada.");
  } else if (replitText.includes("[agent]")) {
    fail(".replit contiene un bloque [agent]; este proyecto usa scripts versionados, no Replit Agent.");
  } else {
    pass(".replit no contiene referencias de Von Wobeser.");
  }
}

if (!process.env.DATABASE_URL) {
  if (isReplit || isProduction) {
    fail("DATABASE_URL es obligatoria en Replit y producción.");
  } else {
    warn("DATABASE_URL no está definida; el proceso solo puede arrancar en un entorno local ya configurado.");
  }
} else {
  pass("DATABASE_URL presente (valor no mostrado).");
}

const port = Number(process.env.PORT || 5000);
if (!Number.isInteger(port) || port < 1 || port > 65535) {
  fail("PORT debe ser un entero entre 1 y 65535.");
} else {
  pass(`PORT=${port}.`);
}

if (isProduction && !process.env.CORS_ORIGIN) {
  fail("CORS_ORIGIN debe estar definida en producción; no se permite reflejar cualquier origen.");
} else if (!process.env.CORS_ORIGIN) {
  warn("CORS_ORIGIN no está definida; configúrala antes de publicar el backend.");
} else {
  pass("CORS_ORIGIN presente (valor no mostrado).");
}

if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD_HASH) {
  warn("ADMIN_EMAIL/ADMIN_PASSWORD_HASH no están completas; el seed no creará un usuario administrativo.");
} else {
  pass("credenciales administrativas provistas por Secrets (valores no mostrados).");
}

if (isProduction && process.env.ALLOW_ADMIN_INIT === "true") {
  fail("ALLOW_ADMIN_INIT=true está prohibido en producción.");
}

if (isReplit && Number(process.versions.node.split(".")[0]) < 24) {
  fail(`Replit requiere Node 24; el proceso actual usa Node ${process.versions.node}.`);
} else {
  pass(`Node ${process.versions.node}.`);
}

if (failures.length > 0) {
  console.error(`\n[replit-preflight] ${failures.length} bloqueo(s), ${warnings.length} advertencia(s).`);
  process.exit(1);
}

console.log(`\n[replit-preflight] listo: ${warnings.length} advertencia(s), sin bloqueos.`);
