const prisma = require("../config/database");

/**
 * Analytics Controller
 * Menggunakan Raw Queries untuk statistik dan laporan
 */

// GET /api/analytics/stats - Statistik umum
const getStats = async (req, res) => {
  try {
    // Raw query untuk statistik tiket
    const ticketStats = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int as "totalTickets",
        COUNT(CASE WHEN "status" = 'OPEN' THEN 1 END)::int as "openTickets",
        COUNT(CASE WHEN "status" = 'IN_PROGRESS' THEN 1 END)::int as "inProgressTickets",
        COUNT(CASE WHEN "status" = 'RESOLVED' THEN 1 END)::int as "resolvedTickets",
        COUNT(CASE WHEN "status" = 'CLOSED' THEN 1 END)::int as "closedTickets",
        COUNT(CASE WHEN "deletedAt" IS NOT NULL THEN 1 END)::int as "deletedTickets"
      FROM "Ticket"
    `;

    // Statistik user
    const userStats = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int as "totalUsers",
        COUNT(CASE WHEN "role" = 'ADMIN' THEN 1 END)::int as "adminUsers",
        COUNT(CASE WHEN "role" = 'STAFF' THEN 1 END)::int as "staffUsers",
        COUNT(CASE WHEN "role" = 'CUSTOMER' THEN 1 END)::int as "customerUsers"
      FROM "User"
      WHERE "deletedAt" IS NULL
    `;

    // Statistik komentar
    const commentStats = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int as "totalComments",
        COUNT(CASE WHEN "deletedAt" IS NULL THEN 1 END)::int as "activeComments"
      FROM "Comment"
    `;

    // Statistik audit log
    const auditStats = await prisma.$queryRaw`
      SELECT
        COUNT(*)::int as "totalAuditLogs",
        COUNT(CASE WHEN "action" = 'CREATE' THEN 1 END)::int as "createActions",
        COUNT(CASE WHEN "action" = 'UPDATE' THEN 1 END)::int as "updateActions",
        COUNT(CASE WHEN "action" = 'DELETE' THEN 1 END)::int as "deleteActions"
      FROM "AuditLog"
    `;

    res.json({
      success: true,
      data: {
        tickets: ticketStats[0],
        users: userStats[0],
        comments: commentStats[0],
        audit: auditStats[0],
      },
    });
  } catch (error) {
    console.error("Get stats error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/analytics/daily - Tiket per hari (7 hari terakhir)
const getDailyStats = async (req, res) => {
  try {
    const daily = await prisma.$queryRaw`
      SELECT
        DATE_TRUNC('day', "createdAt")::date as date,
        COUNT(*)::int as count
      FROM "Ticket"
      WHERE "createdAt" >= NOW() - INTERVAL '7 days'
        AND "deletedAt" IS NULL
      GROUP BY DATE_TRUNC('day', "createdAt")
      ORDER BY date DESC
    `;

    res.json({
      success: true,
      data: { daily },
    });
  } catch (error) {
    console.error("Get daily stats error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/analytics/by-status - Distribusi status
const getByStatus = async (req, res) => {
  try {
    const byStatus = await prisma.$queryRaw`
      SELECT
        "status",
        COUNT(*)::int as count
      FROM "Ticket"
      WHERE "deletedAt" IS NULL
      GROUP BY "status"
      ORDER BY count DESC
    `;

    res.json({
      success: true,
      data: { byStatus },
    });
  } catch (error) {
    console.error("Get by status error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/analytics/by-priority - Distribusi prioritas
const getByPriority = async (req, res) => {
  try {
    const byPriority = await prisma.$queryRaw`
      SELECT
        "priority",
        COUNT(*)::int as count
      FROM "Ticket"
      WHERE "deletedAt" IS NULL
      GROUP BY "priority"
      ORDER BY count DESC
    `;

    res.json({
      success: true,
      data: { byPriority },
    });
  } catch (error) {
    console.error("Get by priority error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/analytics/by-assignee - Tiket per assignee
const getByAssignee = async (req, res) => {
  try {
    const byAssignee = await prisma.$queryRaw`
      SELECT
        u.id,
        u.name,
        u.email,
        COUNT(t.id)::int as "ticketCount",
        COUNT(CASE WHEN t."status" = 'OPEN' THEN 1 END)::int as "openCount",
        COUNT(CASE WHEN t."status" = 'IN_PROGRESS' THEN 1 END)::int as "inProgressCount",
        COUNT(CASE WHEN t."status" = 'RESOLVED' THEN 1 END)::int as "resolvedCount"
      FROM "User" u
      LEFT JOIN "Ticket" t ON t."assigneeId" = u.id AND t."deletedAt" IS NULL
      WHERE u."deletedAt" IS NULL
      GROUP BY u.id, u.name, u.email
      HAVING COUNT(t.id) > 0
      ORDER BY "ticketCount" DESC
    `;

    res.json({
      success: true,
      data: { byAssignee },
    });
  } catch (error) {
    console.error("Get by assignee error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/analytics/recent-audit - Audit log terbaru
const getRecentAudit = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const recentAudit = await prisma.$queryRaw`
      SELECT
        al.id,
        al.action,
        al.entity,
        al."entityId",
        al."oldValues",
        al."newValues",
        al."createdAt",
        u.name as "userName",
        u.email as "userEmail"
      FROM "AuditLog" al
      JOIN "User" u ON u.id = al."userId"
      ORDER BY al."createdAt" DESC
      LIMIT ${parseInt(limit)}
    `;

    res.json({
      success: true,
      data: { recentAudit },
    });
  } catch (error) {
    console.error("Get recent audit error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/analytics/resolution-time - Rata-rata waktu resolusi
const getResolutionTime = async (req, res) => {
  try {
    const resolutionTime = await prisma.$queryRaw`
      SELECT
        AVG(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600)::numeric(10,2) as "avgHoursMin",
        MIN(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600)::numeric(10,2) as "minHours",
        MAX(EXTRACT(EPOCH FROM ("updatedAt" - "createdAt")) / 3600)::numeric(10,2) as "maxHours",
        COUNT(*)::int as "totalResolved"
      FROM "Ticket"
      WHERE "status" IN ('RESOLVED', 'CLOSED')
        AND "deletedAt" IS NULL
    `;

    res.json({
      success: true,
      data: { resolutionTime: resolutionTime[0] },
    });
  } catch (error) {
    console.error("Get resolution time error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getStats,
  getDailyStats,
  getByStatus,
  getByPriority,
  getByAssignee,
  getRecentAudit,
  getResolutionTime,
};
