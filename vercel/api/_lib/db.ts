import pg from "pg";

const { Pool } = pg;

// Module-scoped pool — Vercel reuses warm function instances, so this pool
// survives across invocations. New cold starts create one new pool.
let pool: pg.Pool | null = null;

export function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error("DATABASE_URL is not set");
    }
    pool = new Pool({
      connectionString,
      max: 1, // serverless: keep pool small
      idleTimeoutMillis: 10_000,
    });
  }
  return pool;
}
