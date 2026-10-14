import { spawnSync } from "node:child_process";

if (process.env.CONFIRM_REPLIT_PRODUCTION_SCHEMA !== "1") {
  console.error("Este comando modifica el esquema de la base indicada por DATABASE_URL.");
  console.error("Confirma el destino y vuelve a ejecutarlo con CONFIRM_REPLIT_PRODUCTION_SCHEMA=1.");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL es obligatoria para provisionar la base de producción.");
  process.exit(1);
}

console.log("Provisionando el esquema de Santos & Saucedo en la base indicada por DATABASE_URL.");
console.log("No se muestran ni se guardan credenciales. Revisa que sea la base Production correcta.");

const result = spawnSync("npm", ["run", "db:push"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);
