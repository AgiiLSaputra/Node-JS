const express = require("express");
const { body } = require("express-validator");
const {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
  bulkUpdateStatus,
  getMyTickets,
  createComment,
  deleteComment,
} = require("../controllers/ticketController");
const { authenticate, authorize } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// GET /api/tickets/my - Tiket milik user sendiri
router.get("/my", authenticate, getMyTickets);

// PUT /api/tickets/bulk-status - Update status massal (admin/staff only)
router.put(
  "/bulk-status",
  authenticate,
  authorize("ADMIN", "STAFF"),
  [
    body("ticketIds").isArray({ min: 1 }).withMessage("ticketIds harus array minimal 1 item"),
    body("status")
      .isIn(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"])
      .withMessage("Status tidak valid"),
  ],
  validate,
  bulkUpdateStatus
);

// GET /api/tickets - List semua tiket
router.get("/", authenticate, getTickets);

// GET /api/tickets/:id - Detail tiket
router.get("/:id", authenticate, getTicketById);

// POST /api/tickets - Buat tiket baru
router.post(
  "/",
  authenticate,
  [
    body("title").notEmpty().withMessage("Judul harus diisi"),
    body("description").notEmpty().withMessage("Deskripsi harus diisi"),
    body("priority")
      .optional()
      .isIn(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .withMessage("Prioritas tidak valid"),
  ],
  validate,
  createTicket
);

// PUT /api/tickets/:id - Update tiket
router.put(
  "/:id",
  authenticate,
  [
    body("title").optional().notEmpty().withMessage("Judul tidak boleh kosong"),
    body("description").optional().notEmpty().withMessage("Deskripsi tidak boleh kosong"),
    body("status")
      .optional()
      .isIn(["OPEN", "IN_PROGRESS", "WAITING", "RESOLVED", "CLOSED"])
      .withMessage("Status tidak valid"),
    body("priority")
      .optional()
      .isIn(["LOW", "MEDIUM", "HIGH", "URGENT"])
      .withMessage("Prioritas tidak valid"),
  ],
  validate,
  updateTicket
);

// DELETE /api/tickets/:id - Soft delete tiket
router.delete("/:id", authenticate, deleteTicket);

// POST /api/tickets/:id/comments - Tambah komentar
router.post(
  "/:id/comments",
  authenticate,
  [body("content").notEmpty().withMessage("Isi komentar harus diisi")],
  validate,
  createComment
);

// DELETE /api/tickets/comments/:id - Hapus komentar
router.delete("/comments/:id", authenticate, deleteComment);

module.exports = router;
