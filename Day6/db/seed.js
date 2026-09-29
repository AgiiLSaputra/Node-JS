// ============================================================
// db/seed.js - Mengisi data dummy (kategori, produk, pesanan)
// Cara pakai:  npm run db:seed
// ============================================================
require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.PGHOST || "localhost",
  port: Number(process.env.PGPORT) || 5432,
  user: process.env.PGUSER || "postgres",
  password: process.env.PGPASSWORD || "postgres",
  database: process.env.PGDATABASE || "day6_toko",
});

const categories = [
  { name: "Elektronik", description: "Gawai, aksesori, dan perangkat digital" },
  { name: "Fashion", description: "Pakaian, sepatu, dan aksesori gaya" },
  { name: "Rumah Tangga", description: "Kebutuhan dapur dan rumah" },
  { name: "Kesehatan", description: "Suplemen dan produk perawatan" },
];

const products = [
  { cat: "Elektronik", name: "TWS Earbuds Pro", price: 450000, stock: 25, description: "Earbuds nirkabel dengan noise cancelling" },
  { cat: "Elektronik", name: "Smartwatch Fit X2", price: 1250000, stock: 12, description: "Smartwatch layar AMOLED, tahan air 5ATM" },
  { cat: "Elektronik", name: "Powerbank 20.000mAh", price: 320000, stock: 40, description: "Powerbank fast charging 22.5W" },
  { cat: "Elektronik", name: "Keyboard Mechanical", price: 780000, stock: 8, description: "Hot-swappable RGB, switch blue" },
  { cat: "Fashion", name: "Kaos Polos Cotton Combed", price: 95000, stock: 100, description: "Katun 30s, nyaman dipakai harian" },
  { cat: "Fashion", name: "Sneakers Urban Lite", price: 549000, stock: 18, description: "Sepatu kasual sol karet anti-slip" },
  { cat: "Fashion", name: "Jam Tangan Klasik", price: 899000, stock: 6, description: "Tali kulit, mesin quartz Jepang" },
  { cat: "Rumah Tangga", name: "Blender Mini Portable", price: 275000, stock: 30, description: "Blender USB rechargeable 400ml" },
  { cat: "Rumah Tangga", name: "Panci Stainless 24cm", price: 210000, stock: 22, description: "Panci anti-lengket 3 lapis" },
  { cat: "Rumah Tangga", name: "Diffuser Aromaterapi", price: 185000, stock: 35, description: "Humidifier + lampu LED 7 warna" },
  { cat: "Kesehatan", name: "Vitamin C 1000mg", price: 65000, stock: 60, description: "Isi 100 tablet, imunitas harian" },
  { cat: "Kesehatan", name: "Digital Tensimeter", price: 430000, stock: 15, description: "Monitor tekanan darah lengan" },
];

async function main() {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Kosongkan data lama supaya aman diulang (urutan penting karena ada FOREIGN KEY)
    await client.query("TRUNCATE order_items, orders, products, categories RESTART IDENTITY CASCADE");

    // 1. Insert kategori -> ambil id-nya
    const catIds = {};
    for (const c of categories) {
      const { rows } = await client.query(
        "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
        [c.name, c.description]
      );
      catIds[c.name] = rows[0].id;
    }

    // 2. Insert produk
    for (const p of products) {
      await client.query(
        `INSERT INTO products (category_id, name, price, stock, description)
         VALUES ($1, $2, $3, $4, $5)`,
        [catIds[p.cat], p.name, p.price, p.stock, p.description]
      );
    }

    // 3. Insert 2 pesanan contoh (dengan item) memakai fungsi SQL biasa
    const order1 = await client.query(
      `INSERT INTO orders (customer_name, customer_email, status, total_amount, notes)
       VALUES ('Budi Santoso', 'budi@mail.com', 'paid', 0, 'Kirim sore hari')
       RETURNING id`
    );
    const oid1 = order1.rows[0].id;
    const items1 = [
      { pid: (await client.query("SELECT id FROM products WHERE name = $1", ["TWS Earbuds Pro"])).rows[0].id, qty: 1, price: 450000 },
      { pid: (await client.query("SELECT id FROM products WHERE name = $1", ["Vitamin C 1000mg"])).rows[0].id, qty: 2, price: 65000 },
    ];
    for (const it of items1) {
      await client.query(
        "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
        [oid1, it.pid, it.qty, it.price]
      );
    }
    const total1 = items1.reduce((s, i) => s + i.qty * i.price, 0);
    await client.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [total1, oid1]);

    const order2 = await client.query(
      `INSERT INTO orders (customer_name, customer_email, status, total_amount)
       VALUES ('Siti Aisyah', 'siti@mail.com', 'pending', 0)
       RETURNING id`
    );
    const oid2 = order2.rows[0].id;
    const it2 = (await client.query("SELECT id, price FROM products WHERE name = $1", ["Blender Mini Portable"])).rows[0];
    await client.query(
      "INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES ($1, $2, $3, $4)",
      [oid2, it2.id, 1, it2.price]
    );
    await client.query("UPDATE orders SET total_amount = $1 WHERE id = $2", [it2.price, oid2]);

    await client.query("COMMIT");
    console.log("[seed] Data dummy siap: 4 kategori, 12 produk, 2 pesanan.");
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("[seed] GAGAL:", err.message);
  process.exit(1);
});
