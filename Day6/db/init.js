// ============================================================
// db/init.js - Membuat database + menjalankan schema.sql
// Cara pakai:  npm run db:init        (buat jika belum ada)
//              npm run db:reset       (DROP lalu buat ulang)
// ============================================================
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client, Pool } = require("pg");

const reset = process.argv.includes("--reset");

const baseConfig = {
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
};

const dbName = process.env.PGDATABASE || "day6_toko";

async function main() {
  // 1. Koneksi ke database "postgres" (database bawaan) untuk bisa CREATE DATABASE
  const admin = new Client({ ...baseConfig, database: "postgres" });
  await admin.connect();

  if (reset) {
    await admin.query(`DROP DATABASE IF EXISTS ${dbName} WITH (FORCE)`);
    console.log(`[init] Database "${dbName}" di-DROP.`);
  }

  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [dbName]);
  if (exists.rowCount === 0) {
    await admin.query(`CREATE DATABASE ${dbName}`);
    console.log(`[init] Database "${dbName}" dibuat.`);
  } else {
    console.log(`[init] Database "${dbName}" sudah ada.`);
  }
  await admin.end();

  // 2. Jalankan schema.sql di database target
  const sql = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
  const db = new Pool({ ...baseConfig, database: dbName });
  await db.query(sql);
  console.log("[init] schema.sql dijalankan (tabel + index siap).");
  await db.end();
  console.log("[init] Selesai. Lanjut: npm run db:seed");
}

main().catch((err) => {
  console.error("[init] GAGAL:", err.message);
  process.exit(1);
});
