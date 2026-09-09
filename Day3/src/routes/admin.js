const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Apply auth middleware to all admin routes
router.use(isAuthenticated);
router.use(isAdmin);

// Dashboard
router.get("/", async (req, res) => {
  try {
    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      comments: await prisma.comment.count(),
      tags: await prisma.tag.count(),
    };

    const recentPosts = await prisma.post.findMany({
      include: { author: true, tags: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });

    res.render("admin/dashboard", { title: "Admin Dashboard", stats, recentPosts });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

// ==================== USERS ====================

router.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.render("admin/users", { title: "Manage Users", users });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.get("/users/create", (req, res) => {
  res.render("admin/user-form", { title: "Create User", user: null });
});

router.post("/users/create", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: role || "user",
      },
    });

    req.session.success = "User created successfully";
    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    res.render("admin/user-form", {
      title: "Create User",
      user: null,
      error: error.message,
    });
  }
});

router.get("/users/:id/edit", async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!user) {
      req.session.error = "User not found";
      return res.redirect("/admin/users");
    }

    res.render("admin/user-form", { title: "Edit User", user });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.post("/users/:id/update", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const userId = parseInt(req.params.id);

    const updateData = { name, email, role };
    if (password) {
      updateData.password = password;
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    req.session.success = "User updated successfully";
    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    res.render("admin/user-form", {
      title: "Edit User",
      user,
      error: error.message,
    });
  }
});

router.post("/users/:id/delete", async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: parseInt(req.params.id) },
    });

    req.session.success = "User deleted successfully";
    res.redirect("/admin/users");
  } catch (error) {
    console.error(error);
    req.session.error = error.message;
    res.redirect("/admin/users");
  }
});

// ==================== POSTS ====================

router.get("/posts", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: { author: true, tags: true },
      orderBy: { createdAt: "desc" },
    });
    res.render("admin/posts", { title: "Manage Posts", posts });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.get("/posts/create", async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.render("admin/post-form", { title: "Create Post", post: null, users, allTags });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.post("/posts/create", async (req, res) => {
  try {
    const { title, content, authorId, published, tags } = req.body;

    const tagIds = tags ? tags.map(Number) : [];

    await prisma.post.create({
      data: {
        title,
        content,
        authorId: parseInt(authorId),
        published: published === "true",
        tags: {
          connect: tagIds.map((id) => ({ id })),
        },
      },
    });

    req.session.success = "Post created successfully";
    res.redirect("/admin/posts");
  } catch (error) {
    console.error(error);
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.render("admin/post-form", {
      title: "Create Post",
      post: null,
      users,
      allTags,
      error: error.message,
    });
  }
});

router.get("/posts/:id/edit", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { tags: true },
    });

    if (!post) {
      req.session.error = "Post not found";
      return res.redirect("/admin/posts");
    }

    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });

    res.render("admin/post-form", { title: "Edit Post", post, users, allTags });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.post("/posts/:id/update", async (req, res) => {
  try {
    const { title, content, authorId, published, tags } = req.body;
    const postId = parseInt(req.params.id);

    const tagIds = tags ? tags.map(Number) : [];

    // Disconnect all existing tags, then connect new ones
    await prisma.post.update({
      where: { id: postId },
      data: {
        title,
        content,
        authorId: parseInt(authorId),
        published: published === "true",
        tags: {
          set: tagIds.map((id) => ({ id })),
        },
      },
    });

    req.session.success = "Post updated successfully";
    res.redirect("/admin/posts");
  } catch (error) {
    console.error(error);
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { tags: true },
    });
    const users = await prisma.user.findMany({ orderBy: { name: "asc" } });
    const allTags = await prisma.tag.findMany({ orderBy: { name: "asc" } });
    res.render("admin/post-form", {
      title: "Edit Post",
      post,
      users,
      allTags,
      error: error.message,
    });
  }
});

router.post("/posts/:id/delete", async (req, res) => {
  try {
    await prisma.post.delete({
      where: { id: parseInt(req.params.id) },
    });

    req.session.success = "Post deleted successfully";
    res.redirect("/admin/posts");
  } catch (error) {
    console.error(error);
    req.session.error = error.message;
    res.redirect("/admin/posts");
  }
});

// ==================== COMMENTS ====================

router.get("/comments", async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      include: { author: true, post: true },
      orderBy: { createdAt: "desc" },
    });
    res.render("admin/comments", { title: "Manage Comments", comments });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.post("/comments/:id/delete", async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: parseInt(req.params.id) },
    });

    req.session.success = "Comment deleted successfully";
    res.redirect("/admin/comments");
  } catch (error) {
    console.error(error);
    req.session.error = error.message;
    res.redirect("/admin/comments");
  }
});

// ==================== TAGS ====================

router.get("/tags", async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    });
    res.render("admin/tags", { title: "Manage Tags", tags });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.get("/tags/create", (req, res) => {
  res.render("admin/tag-form", { title: "Create Tag", tag: null });
});

router.post("/tags/create", async (req, res) => {
  try {
    const { name } = req.body;

    await prisma.tag.create({
      data: { name },
    });

    req.session.success = "Tag created successfully";
    res.redirect("/admin/tags");
  } catch (error) {
    console.error(error);
    res.render("admin/tag-form", {
      title: "Create Tag",
      tag: null,
      error: error.message,
    });
  }
});

router.get("/tags/:id/edit", async (req, res) => {
  try {
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!tag) {
      req.session.error = "Tag not found";
      return res.redirect("/admin/tags");
    }

    res.render("admin/tag-form", { title: "Edit Tag", tag });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

router.post("/tags/:id/update", async (req, res) => {
  try {
    const { name } = req.body;

    await prisma.tag.update({
      where: { id: parseInt(req.params.id) },
      data: { name },
    });

    req.session.success = "Tag updated successfully";
    res.redirect("/admin/tags");
  } catch (error) {
    console.error(error);
    const tag = await prisma.tag.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    res.render("admin/tag-form", {
      title: "Edit Tag",
      tag,
      error: error.message,
    });
  }
});

router.post("/tags/:id/delete", async (req, res) => {
  try {
    await prisma.tag.delete({
      where: { id: parseInt(req.params.id) },
    });

    req.session.success = "Tag deleted successfully";
    res.redirect("/admin/tags");
  } catch (error) {
    console.error(error);
    req.session.error = error.message;
    res.redirect("/admin/tags");
  }
});

module.exports = router;
