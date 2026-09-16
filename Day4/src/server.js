require("dotenv").config();
const express = require("express");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

// Import middleware
const softDeleteMiddleware = require("./middleware/softDelete");
const auditMiddleware = require("./middleware/audit");

// Import routes
const authRoutes = require("./routes/auth");
const ticketRoutes = require("./routes/ticket");
const analyticsRoutes = require("./routes/analytics");

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== PRISMA SETUP ====================

const prisma = new PrismaClient({
  log: ["warn", "error"],
});

// Register Prisma middleware (WAJIB sebelum dipakai)
softDeleteMiddleware(prisma);
auditMiddleware(prisma);

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

app.use("/api/auth", authRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/analytics", analyticsRoutes);

// Root route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

// API info
app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "Ticketing System API - Day 4",
    version: "1.0.0",
    endpoints: {
      auth: {
        "POST /api/auth/register": "Register user baru",
        "POST /api/auth/login": "Login",
        "GET /api/auth/profile": "Lihat profil",
        "PUT /api/auth/profile": "Update profil",
        "GET /api/auth/users": "List users (admin only)",
      },
      tickets: {
        "GET /api/tickets": "List tiket",
        "GET /api/tickets/my": "Tiket milik saya",
        "GET /api/tickets/:id": "Detail tiket",
        "POST /api/tickets": "Buat tiket",
        "PUT /api/tickets/:id": "Update tiket",
        "DELETE /api/tickets/:id": "Hapus tiket (soft delete)",
        "PUT /api/tickets/bulk-status": "Update status massal",
        "POST /api/tickets/:id/comments": "Tambah komentar",
        "DELETE /api/tickets/comments/:id": "Hapus komentar",
      },
      analytics: {
        "GET /api/analytics/stats": "Statistik umum",
        "GET /api/analytics/daily": "Tiket per hari",
        "GET /api/analytics/by-status": "Distribusi status",
        "GET /api/analytics/by-priority": "Distribusi prioritas",
        "GET /api/analytics/by-assignee": "Tiket per assignee",
        "GET /api/analytics/recent-audit": "Audit log terbaru",
        "GET /api/analytics/resolution-time": "Rata-rata waktu resolusi",
      },
    },
    prismaFeatures: [
      "Soft Delete via Middleware",
      "Audit Log via Middleware",
      "Raw Queries ($queryRaw)",
      "Transactions",
      "Batch Operations (updateMany)",
      "Indexing",
      "Relations & Includes",
    ],
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
  res.status(500).json({
    success: false,
    message: "Terjadi kesalahan server",
  });
});

// ==================== START SERVER ====================

app.listen(PORT, () => {
  console.log(`
====================================================
  Ticketing System API - Day 4
  Prisma Advanced: Soft Delete, Audit Log, Raw Query
====================================================
  Server  : http://localhost:${PORT}
  API     : http://localhost:${PORT}/api
  Database: PostgreSQL + Prisma ORM
====================================================
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
