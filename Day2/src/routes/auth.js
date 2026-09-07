const express = require("express");
const { body } = require("express-validator");
const { register, login, getProfile, updateProfile } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");
const { validate } = require("../middleware/validate");

const router = express.Router();

// POST /api/auth/register
router.post(
  "/register",
  [
    body("email").isEmail().withMessage("Harap masukkan email yang valid"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password harus minimal 6 karakter"),
    body("name").notEmpty().withMessage("Nama harus diisi"),
  ],
  validate,
  register
);

// POST /api/auth/login
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Harap masukkan email yang valid"),
    body("password").notEmpty().withMessage("Password harus diisi"),
  ],
  validate,
  login
);

// GET /api/auth/profile
router.get("/profile", authenticate, getProfile);

// PUT /api/auth/profile
router.put(
  "/profile",
  authenticate,
  [
    body("name").optional().notEmpty().withMessage("Nama tidak boleh kosong"),
    body("email").optional().isEmail().withMessage("Harap masukkan email yang valid"),
  ],
  validate,
  updateProfile
);

module.exports = router;
