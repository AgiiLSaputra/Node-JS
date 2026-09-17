const prisma = require("../config/database");

// GET /api/tickets - List semua tiket (dengan filter)
const getTickets = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search = "",
      assigneeId,
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build filter
    const where = {
      deletedAt: null, // Soft delete filter
      ...(status && { status }),
      ...(priority && { priority }),
      ...(assigneeId && { assigneeId: parseInt(assigneeId) }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    // Jika bukan admin/staff, hanya tampilkan tiket sendiri
    if (req.user.role === "CUSTOMER") {
      where.authorId = req.user.id;
    }

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          assignee: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get tickets error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/tickets/:id - Detail tiket
const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          where: { deletedAt: null },
          include: {
            author: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "asc" },
        },
        auditLogs: {
          include: {
            user: {
              select: { id: true, name: true, email: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20, // Limit audit logs
        },
      },
    });

    if (!ticket || ticket.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan",
      });
    }

    // Cek akses: customer hanya bisa lihat tiket sendiri
    if (req.user.role === "CUSTOMER" && ticket.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    res.json({
      success: true,
      data: { ticket },
    });
  } catch (error) {
    console.error("Get ticket error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// POST /api/tickets - Buat tiket baru
const createTicket = async (req, res) => {
  try {
    const { title, description, priority, category } = req.body;

    const ticket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority || "MEDIUM",
        category,
        authorId: req.user.id,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Tiket berhasil dibuat",
      data: { ticket },
    });
  } catch (error) {
    console.error("Create ticket error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// PUT /api/tickets/:id - Update tiket
const updateTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, status, priority, assigneeId, category } = req.body;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTicket || existingTicket.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan",
      });
    }

    // Cek akses
    if (req.user.role === "CUSTOMER" && existingTicket.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // Customer tidak bisa assign tiket
    if (req.user.role === "CUSTOMER" && assigneeId) {
      return res.status(403).json({
        success: false,
        message: "Anda tidak bisa menugaskan tiket",
      });
    }

    const ticket = await prisma.ticket.update({
      where: { id: parseInt(id) },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(category !== undefined && { category }),
        ...(assigneeId !== undefined && {
          assigneeId: assigneeId ? parseInt(assigneeId) : null,
        }),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        assignee: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      success: true,
      message: "Tiket berhasil diperbarui",
      data: { ticket },
    });
  } catch (error) {
    console.error("Update ticket error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// DELETE /api/tickets/:id - Soft delete tiket
const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTicket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingTicket || existingTicket.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan",
      });
    }

    // Cek akses: hanya admin/staff atau pemilik yang bisa delete
    if (
      req.user.role === "CUSTOMER" &&
      existingTicket.authorId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // Soft delete via middleware
    await prisma.ticket.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Tiket berhasil dihapus (soft delete)",
    });
  } catch (error) {
    console.error("Delete ticket error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// PUT /api/tickets/bulk-status - Update status massal
const bulkUpdateStatus = async (req, res) => {
  try {
    const { ticketIds, status } = req.body;

    if (!ticketIds || !Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "ticketIds harus berupa array dengan minimal 1 item",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status harus diisi",
      });
    }

    // Update banyak tiket sekaligus
    const result = await prisma.ticket.updateMany({
      where: {
        id: { in: ticketIds.map((id) => parseInt(id)) },
        deletedAt: null,
      },
      data: { status },
    });

    res.json({
      success: true,
      message: `${result.count} tiket berhasil diperbarui ke status ${status}`,
      data: { updatedCount: result.count },
    });
  } catch (error) {
    console.error("Bulk update error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/tickets/my - Tiket milik user sendiri
const getMyTickets = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      authorId: req.user.id,
      deletedAt: null,
      ...(status && { status }),
    };

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          assignee: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get my tickets error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// POST /api/tickets/:id/comments - Tambah komentar
const createComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: parseInt(id) },
    });

    if (!ticket || ticket.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Tiket tidak ditemukan",
      });
    }

    // Cek akses
    if (req.user.role === "CUSTOMER" && ticket.authorId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        ticketId: parseInt(id),
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Komentar berhasil ditambahkan",
      data: { comment },
    });
  } catch (error) {
    console.error("Create comment error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// DELETE /api/tickets/comments/:id - Hapus komentar (soft delete)
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment || existingComment.deletedAt) {
      return res.status(404).json({
        success: false,
        message: "Komentar tidak ditemukan",
      });
    }

    // Cek akses: hanya admin/staff atau pemilik
    if (
      req.user.role === "CUSTOMER" &&
      existingComment.authorId !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    // Soft delete
    await prisma.comment.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Komentar berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  bulkUpdateStatus,
  getMyTickets,
  createComment,
  deleteComment,
};
