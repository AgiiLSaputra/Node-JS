const express = require("express");
const { body } = require("express-validator");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} = require("../controllers/ecommerceController");
const { authenticate } = require("../middleware/auth");
const { authorize } = require("../middleware/role");
const { validate } = require("../middleware/validate");

const router = express.Router();

// ==================== PRODUCTS ====================

// GET /api/ecommerce/products - Ambil semua produk (public)
router.get("/products", getProducts);

// GET /api/ecommerce/products/:id - Ambil produk by ID (public)
router.get("/products/:id", getProductById);

// POST /api/ecommerce/products - Buat produk baru (admin only)
router.post(
  "/products",
  authenticate,
  authorize("ADMIN"),
  [
    body("name").notEmpty().withMessage("Nama produk harus diisi"),
    body("price")
      .isFloat({ min: 0 })
      .withMessage("Harga harus berupa angka positif"),
    body("stock")
      .isInt({ min: 0 })
      .withMessage("Stok harus berupa angka non-negatif"),
  ],
  validate,
  createProduct
);

// PUT /api/ecommerce/products/:id - Update produk (admin only)
router.put(
  "/products/:id",
  authenticate,
  authorize("ADMIN"),
  [
    body("name").optional().notEmpty().withMessage("Nama tidak boleh kosong"),
    body("price")
      .optional()
      .isFloat({ min: 0 })
      .withMessage("Harga harus berupa angka positif"),
    body("stock")
      .optional()
      .isInt({ min: 0 })
      .withMessage("Stok harus berupa angka non-negatif"),
  ],
  validate,
  updateProduct
);

// DELETE /api/ecommerce/products/:id - Hapus produk (admin only)
router.delete("/products/:id", authenticate, authorize("ADMIN"), deleteProduct);

// ==================== CART ====================

// GET /api/ecommerce/cart - Ambil keranjang (authenticated)
router.get("/cart", authenticate, getCart);

// POST /api/ecommerce/cart/items - Tambah item ke keranjang (authenticated)
router.post(
  "/cart/items",
  authenticate,
  [
    body("productId").isInt().withMessage("ID Produk harus berupa integer"),
    body("quantity")
      .optional()
      .isInt({ min: 1 })
      .withMessage("Jumlah harus minimal 1"),
  ],
  validate,
  addToCart
);

// PUT /api/ecommerce/cart/items/:itemId - Update quantity (authenticated)
router.put(
  "/cart/items/:itemId",
  authenticate,
  [
    body("quantity")
      .isInt({ min: 0 })
      .withMessage("Jumlah harus berupa angka non-negatif"),
  ],
  validate,
  updateCartItem
);

// DELETE /api/ecommerce/cart/items/:itemId - Hapus item (authenticated)
router.delete("/cart/items/:itemId", authenticate, removeFromCart);

// DELETE /api/ecommerce/cart - Kosongkan keranjang (authenticated)
router.delete("/cart", authenticate, clearCart);

// ==================== ORDERS ====================

// POST /api/ecommerce/orders - Checkout (authenticated)
router.post("/orders", authenticate, createOrder);

// GET /api/ecommerce/orders - Ambil orders user (authenticated)
router.get("/orders", authenticate, getMyOrders);

// GET /api/ecommerce/orders/all - Ambil semua orders (admin only)
router.get("/orders/all", authenticate, authorize("ADMIN"), getAllOrders);

// GET /api/ecommerce/orders/:id - Ambil detail order (authenticated)
router.get("/orders/:id", authenticate, getOrderById);

// PUT /api/ecommerce/orders/:id/status - Update status (admin only)
router.put(
  "/orders/:id/status",
  authenticate,
  authorize("ADMIN"),
  [
    body("status")
      .isIn(["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"])
      .withMessage("Status pesanan tidak valid"),
  ],
  validate,
  updateOrderStatus
);

module.exports = router;
