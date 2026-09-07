const prisma = require("../config/database");

// ==================== POSTS ====================

// GET /api/blog/posts - Ambil semua posts (published)
const getPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = {
      published: true,
      ...(search && {
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { content: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        skip,
        take: parseInt(limit),
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
          _count: { select: { comments: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.post.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/blog/posts/:id - Ambil post by ID
const getPostById = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
        comments: {
          include: {
            author: {
              select: { id: true, name: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: { post },
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// POST /api/blog/posts - Buat post baru
const createPost = async (req, res) => {
  try {
    const { title, content, published } = req.body;

    const post = await prisma.post.create({
      data: {
        title,
        content,
        published: published || false,
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
      message: "Artikel berhasil dibuat",
      data: { post },
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// PUT /api/blog/posts/:id - Update post
const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, published } = req.body;

    // Cek apakah post exists dan milik user
    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    // Cek apakah user adalah pemilik post atau admin
    if (existingPost.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Anda hanya bisa mengedit artikel sendiri",
      });
    }

    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { title, content, published },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    res.json({
      success: true,
      message: "Artikel berhasil diperbarui",
      data: { post },
    });
  } catch (error) {
    console.error("Update post error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// DELETE /api/blog/posts/:id - Hapus post
const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const existingPost = await prisma.post.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    // Cek apakah user adalah pemilik post atau admin
    if (existingPost.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Anda hanya bisa menghapus artikel sendiri",
      });
    }

    await prisma.post.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete post error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/blog/my-posts - Ambil posts milik user sendiri
const getMyPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      where: { authorId: req.user.id },
      include: {
        _count: { select: { comments: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { posts },
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// ==================== COMMENTS ====================

// POST /api/blog/posts/:postId/comments - Tambah komentar
const createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    // Cek apakah post exists
    const post = await prisma.post.findUnique({
      where: { id: parseInt(postId) },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        authorId: req.user.id,
        postId: parseInt(postId),
      },
      include: {
        author: {
          select: { id: true, name: true },
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

// DELETE /api/blog/comments/:id - Hapus komentar
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const existingComment = await prisma.comment.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingComment) {
      return res.status(404).json({
        success: false,
        message: "Komentar tidak ditemukan",
      });
    }

    // Cek apakah user adalah pemilik komentar atau admin
    if (existingComment.authorId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Anda hanya bisa menghapus komentar sendiri",
      });
    }

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
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getMyPosts,
  createComment,
  deleteComment,
};
