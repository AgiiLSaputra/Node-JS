const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();
const { isAuthenticated, isAdmin } = require("../middleware/auth");

// Login page
router.get("/login", (req, res) => {
  if (req.session.user) {
    return res.redirect("/admin");
  }
  res.render("admin/login", { title: "Login" });
});

// Login handler
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.render("admin/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    // For demo purposes, comparing plain text (in production, use bcrypt)
    if (user.password !== password) {
      return res.render("admin/login", {
        title: "Login",
        error: "Invalid email or password",
      });
    }

    req.session.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };

    res.redirect("/admin");
  } catch (error) {
    console.error(error);
    res.render("admin/login", {
      title: "Login",
      message: "An error occurred",
    });
  }
});

// Logout
router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

module.exports = router;
