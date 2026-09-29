-- ============================================================
-- SKEMA DATABASE: TOKO ONLINE (Day 6)
-- Dijalankan oleh: npm run db:init
-- Di sini kamu melihat SQL "asli" (bukan schema Prisma)
-- ============================================================

-- 1. TABEL KATEGORI (satu kategori punya banyak produk -> one-to-many)
CREATE TABLE IF NOT EXISTS categories (
    id          SERIAL PRIMARY KEY,          -- SERIAL = auto-increment ala PostgreSQL
    name        VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. TABEL PRODUK (banyak produk milik satu kategori)
CREATE TABLE IF NOT EXISTS products (
    id          SERIAL PRIMARY KEY,
    category_id INT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name        VARCHAR(200) NOT NULL,
    price       NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    stock       INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    description TEXT,
    is_active   BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. TABEL PESANAN (header/parent)
CREATE TABLE IF NOT EXISTS orders (
    id             SERIAL PRIMARY KEY,
    customer_name  VARCHAR(150) NOT NULL,
    customer_email VARCHAR(200) NOT NULL,
    status         VARCHAR(20) NOT NULL DEFAULT 'pending'
                   CHECK (status IN ('pending', 'paid', 'shipped', 'cancelled')),
    total_amount   NUMERIC(12,2) NOT NULL DEFAULT 0,
    notes          TEXT,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. TABEL ITEM PESANAN (detail/child) -> one-to-many ke orders
--    Menyimpan harga SNAPSHOT saat pembelian, bukan harga produk sekarang.
CREATE TABLE IF NOT EXISTS order_items (
    id         SERIAL PRIMARY KEY,
    order_id   INT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity   INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12,2) NOT NULL
);

-- ============================================================
-- INDEX (peta jalan query) supaya search & filter cepat
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name     ON products (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_orders_status     ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_prod  ON order_items(product_id);
