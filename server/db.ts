import * as schema from "@shared/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeon } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL!;
const isNeon = /\.neon\.tech|neon\.build/.test(databaseUrl);

export const db = (isNeon
  ? drizzleNeon(neon(databaseUrl), { schema })
  : drizzlePostgres(new Pool({ connectionString: databaseUrl }), { schema })) as any;
