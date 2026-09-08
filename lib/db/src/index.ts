import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

// The portfolio has a local snapshot fallback, so the API can still serve
// public content when a database has not been provisioned for this environment.
// Callers that require persistence must check for a null pool before querying.
export const pool = databaseUrl ? new Pool({ connectionString: databaseUrl }) : null;
export const db = pool ? drizzle(pool, { schema }) : null;

export * from "./schema";
