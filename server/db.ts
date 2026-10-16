import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL!;
const isNeon = /\.neon\.tech|neon\.build/.test(databaseUrl);
// Interactive editorial transactions (ordering and relationships) need a pinned
// connection. Neon supports the same PostgreSQL connection string over TCP.
const editorialPool = new Pool({ connectionString: databaseUrl, max: 3, allowExitOnIdle: true });
export const editorialDb = drizzlePostgres(editorialPool, { schema });

export const db = (isNeon
  ? drizzleNeon(neon(databaseUrl), { schema })
  : editorialDb) as any;
