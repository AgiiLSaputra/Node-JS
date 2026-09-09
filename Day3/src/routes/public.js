const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Home page
router.get("/", async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: true,
        tags: true,
        comments: true,
      },
      orderBy: { createdAt: "desc" },
      take: 6,
    });

    const stats = {
      users: await prisma.user.count(),
      posts: await prisma.post.count(),
      comments: await prisma.comment.count(),
      tags: await prisma.tag.count(),
    };

    res.render("public/home", { title: "Home", posts, stats });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

// Post detail
router.get("/post/:id", async (req, res) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        author: true,
        tags: true,
        comments: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!post) {
      return res.status(404).render("public/404", { title: "Not Found" });
    }

    res.render("public/post", { title: post.title, post });
  } catch (error) {
    console.error(error);
    res.render("public/error", { title: "Error", message: error.message });
  }
});

// About page
router.get("/about", (req, res) => {
  res.render("public/about", { title: "About" });
});

module.exports = router;
