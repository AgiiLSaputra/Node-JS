const express = require("express");
const {
  getStats,
  getDailyStats,
  getByStatus,
  getByPriority,
  getByAssignee,
  getRecentAudit,
  getResolutionTime,
} = require("../controllers/analyticsController");
const { authenticate, authorize } = require("../middleware/auth");

const router = express.Router();

// Semua analytics hanya bisa diakses admin/staff
router.use(authenticate, authorize("ADMIN", "STAFF"));

// GET /api/analytics/stats - Statistik umum
router.get("/stats", getStats);

// GET /api/analytics/daily - Tiket per hari
router.get("/daily", getDailyStats);

// GET /api/analytics/by-status - Distribusi status
router.get("/by-status", getByStatus);

// GET /api/analytics/by-priority - Distribusi prioritas
router.get("/by-priority", getByPriority);

// GET /api/analytics/by-assignee - Tiket per assignee
router.get("/by-assignee", getByAssignee);

// GET /api/analytics/recent-audit - Audit log terbaru
router.get("/recent-audit", getRecentAudit);

// GET /api/analytics/resolution-time - Rata-rata waktu resolusi
router.get("/resolution-time", getResolutionTime);

module.exports = router;
