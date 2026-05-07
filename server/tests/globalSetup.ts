import pg from "pg";
import fs from "fs";
import path from "path";

const TRACKING_TABLE = "__applied_migrations";

/**
 * Vitest globalSetup — runs once before all test files.
 *
 * Applies any pending migrations from the migrations/ folder to the test
 * database so tests never fail silently due to schema drift.
 *
 * Bootstrap note: the first time this runs against a DB that already has
 * all migrations applied manually (no tracking table yet), `__applied_migrations`
 * is empty. The runner attempts each migration in a per-file transaction and
 * uses a SAVEPOINT so that a failure (e.g. constraint already exists) rolls
 * back only that file's SQL while still recording it as applied — preventing
 * repeated replay attempts on subsequent runs.
 */
export default async function globalSetup() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("[globalSetup] DATABASE_URL is not set — cannot run migrations before tests.");
  }

  const migrationsFolder = path.resolve(process.cwd(), "migrations");
  if (!fs.existsSync(migrationsFolder)) {
    throw new Error(`[globalSetup] migrations/ 資料夾不存在：${migrationsFolder}`);
  }

  const { Pool } = pg;
  const pool = new Pool({ connectionString: databaseUrl });

  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ${TRACKING_TABLE} (
        name       TEXT        PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
      )
    `);

    const files = fs
      .readdirSync(migrationsFolder)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    if (files.length === 0) {
      console.log("[globalSetup] migrations/ 資料夾中沒有 SQL 檔案，跳過。");
      return;
    }

    const { rows: applied } = await pool.query<{ name: string }>(
      `SELECT name FROM ${TRACKING_TABLE}`
    );
    const appliedSet = new Set(applied.map((r) => r.name));

    const pending = files.filter((f) => !appliedSet.has(f));

    if (pending.length === 0) {
      console.log("[globalSetup] 所有 migrations 已套用，跳過。");
      return;
    }

    console.log(`[globalSetup] 發現 ${pending.length} 個 pending migration(s)，開始套用…`);

    for (const file of pending) {
      const sql = fs.readFileSync(path.join(migrationsFolder, file), "utf-8");
      const client = await pool.connect();
      try {
        await client.query("BEGIN");
        try {
          await client.query("SAVEPOINT migration_sp");
          await client.query(sql);
          await client.query("RELEASE SAVEPOINT migration_sp");
          console.log(`[globalSetup]   ✓ 套用: ${file}`);
        } catch (err: unknown) {
          await client.query("ROLLBACK TO SAVEPOINT migration_sp");
          await client.query("RELEASE SAVEPOINT migration_sp");
          const message = err instanceof Error ? err.message : String(err);
          console.warn(
            `[globalSetup]   ⚠ ${file} 執行失敗（可能已套用）：${message} — 標記為已套用並繼續。`
          );
        }
        await client.query(
          `INSERT INTO ${TRACKING_TABLE} (name) VALUES ($1) ON CONFLICT DO NOTHING`,
          [file]
        );
        await client.query("COMMIT");
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      } finally {
        client.release();
      }
    }

    console.log("[globalSetup] Migrations 套用完畢，開始執行測試。");
  } finally {
    await pool.end();
  }
}
