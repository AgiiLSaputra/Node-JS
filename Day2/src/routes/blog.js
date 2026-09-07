const express = require("express");
const { body } = require("express-validator");
const {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  createComment,
  deleteComment,
} = require("../controllers/blogController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// GET /api/blog/posts - Ambil semua posts (public)
router.get("/posts", getPosts);

// GET /api/blog/posts/:id - Ambil post by ID (public)
router.get("/posts/:id", getPostById);

// POST /api/blog/posts - Buat post baru (authenticated)
router.post(
  "/posts",
  authenticate,
  [
    body("title").notEmpty().withMessage("Judul harus diisi"),
    body("content").notEmpty().withMessage("Isi harus diisi"),
  ],
  validate,
  createPost
);

// PUT /api/blog/posts/:id - Update post (authenticated, owner atau admin)
router.put(
  "/posts/:id",
  authenticate,
  [
    body("title").optional().notEmpty().withMessage("Judul tidak boleh kosong"),
    body("content").optional().notEmpty().withMessage("Isi tidak boleh kosong"),
  ],
  validate,
  updatePost
);

// DELETE /api/blog/posts/:id - Hapus post (authenticated, owner atau admin)
router.delete("/posts/:id", authenticate, deletePost);

// GET /api/blog/my-posts - Ambil posts milik user sendiri
router.get("/my-posts", authenticate, getMyPosts);

// POST /api/blog/posts/:postId/comments - Tambah komentar (authenticated)
router.post(
  "/posts/:postId/comments",
  authenticate,
  [body("content").notEmpty().withMessage("Isi komentar harus diisi")],
  validate,
  createComment
);

// DELETE /api/blog/comments/:id - Hapus komentar (authenticated, owner atau admin)
router.delete("/comments/:id", authenticate, deleteComment);

module.exports = router;
