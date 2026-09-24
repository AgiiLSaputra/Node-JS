require("dotenv").config();
const express = require("express");
const path = require("path");
const prisma = require("./config/database");

const bookRoutes = require("./routes/books");

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARE ====================

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, "../public")));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.url} ${res.statusCode} ${duration}ms`);
  });
  next();
});

// ==================== ROUTES ====================

app.use("/api/books", bookRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API info
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "REST API Belajar - Day 5",
    version: "1.0.0",
    endpoints: {
      "GET /api/books": "List buku (query: search, genre)",
      "GET /api/books/:id": "Detail buku",
      "POST /api/books": "Tambah buku (201)",
      "PUT /api/books/:id": "Update penuh",
      "PATCH /api/books/:id": "Update sebagian",
      "DELETE /api/books/:id": "Hapus buku (204)",
    },
  });
});

// 404 handler
app.use((req, res) => {
  if (req.accepts("html") && !req.url.startsWith("/api")) {
    res.sendFile(path.join(__dirname, "../public/index.html"));
  } else {
    res.status(404).json({
      success: false,
      message: "Rute tidak ditemukan",
    });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error("Kesalahan tidak tertangani:", err);
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ success: false, message: "JSON tidak valid" });
  }
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
===================================================
  REST API Belajar - Day 5
  Node.js + Express + Prisma + PostgreSQL
  Tema: Liquid Glass
===================================================
  Server  : http://localhost:${PORT}
  API     : http://localhost:${PORT}/api
  Database: PostgreSQL + Prisma ORM
===================================================
  `);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});
