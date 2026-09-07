const prisma = require("../config/database");

// ==================== PRODUCTS ====================

// GET /api/ecommerce/products - Ambil semua produk
const getProducts = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages: Math.ceil(total / parseInt(limit)),
        },
      },
    });
  } catch (error) {
    console.error("Get products error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/ecommerce/products/:id - Ambil produk by ID
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    res.json({
      success: true,
      data: { product },
    });
  } catch (error) {
    console.error("Get product error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// POST /api/ecommerce/products - Buat produk baru (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, description, price, stock, imageUrl } = req.body;

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        stock: parseInt(stock),
        imageUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: "Produk berhasil dibuat",
      data: { product },
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// PUT /api/ecommerce/products/:id - Update produk (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, price, stock, imageUrl } = req.body;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    const product = await prisma.product.update({
      where: { id: parseInt(id) },
      data: {
        name,
        description,
        price: price ? parseFloat(price) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        imageUrl,
      },
    });

    res.json({
      success: true,
      message: "Produk berhasil diperbarui",
      data: { product },
    });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// DELETE /api/ecommerce/products/:id - Hapus produk (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.json({
      success: true,
      message: "Produk berhasil dihapus",
    });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// ==================== CART ====================

// GET /api/ecommerce/cart - Ambil keranjang user
const getCart = async (req, res) => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    // Hitung total
    const total = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    res.json({
      success: true,
      data: {
        cart: {
          ...cart,
          total,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// POST /api/ecommerce/cart/items - Tambah item ke keranjang
const addToCart = async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body;

    // Cek apakah produk exists
    const product = await prisma.product.findUnique({
      where: { id: parseInt(productId) },
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Produk tidak ditemukan",
      });
    }

    // Cek stok
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Tersedia: ${product.stock}`,
      });
    }

    // Get atau buat cart
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: req.user.id },
      });
    }

    // Cek apakah item sudah ada di cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId: parseInt(productId),
        },
      },
    });

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + parseInt(quantity);

      if (newQuantity > product.stock) {
        return res.status(400).json({
          success: false,
          message: `Tidak bisa menambah lagi. Stok tersedia: ${product.stock}`,
        });
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      // Tambah item baru
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: parseInt(productId),
          quantity: parseInt(quantity),
        },
      });
    }

    // Return updated cart
    const updatedCart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    const total = updatedCart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    res.json({
      success: true,
      message: "Produk ditambahkan ke keranjang",
      data: {
        cart: {
          ...updatedCart,
          total,
        },
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// PUT /api/ecommerce/cart/items/:itemId - Update quantity item
const updateCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: { product: true, cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
      });
    }

    // Cek ownership
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    // Cek stok
    if (parseInt(quantity) > cartItem.product.stock) {
      return res.status(400).json({
        success: false,
        message: `Stok tidak mencukupi. Tersedia: ${cartItem.product.stock}`,
      });
    }

    if (parseInt(quantity) <= 0) {
      // Hapus item jika quantity <= 0
      await prisma.cartItem.delete({
        where: { id: parseInt(itemId) },
      });
    } else {
      await prisma.cartItem.update({
        where: { id: parseInt(itemId) },
        data: { quantity: parseInt(quantity) },
      });
    }

    res.json({
      success: true,
      message: "Keranjang berhasil diperbarui",
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// DELETE /api/ecommerce/cart/items/:itemId - Hapus item dari cart
const removeFromCart = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: parseInt(itemId) },
      include: { cart: true },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Item keranjang tidak ditemukan",
      });
    }

    // Cek ownership
    if (cartItem.cart.userId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    await prisma.cartItem.delete({
      where: { id: parseInt(itemId) },
    });

    res.json({
      success: true,
      message: "Item berhasil dihapus dari keranjang",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// DELETE /api/ecommerce/cart - Kosongkan keranjang
const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    res.json({
      success: true,
      message: "Keranjang berhasil dikosongkan",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// ==================== ORDERS ====================

// POST /api/ecommerce/orders - Checkout (buat order dari cart)
const createOrder = async (req, res) => {
  try {
    // Ambil cart user
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Keranjang kosong",
      });
    }

    // Validasi stok
    for (const item of cart.items) {
      if (item.quantity > item.product.stock) {
        return res.status(400).json({
          success: false,
          message: `Stok tidak mencukupi untuk ${item.product.name}. Tersedia: ${item.product.stock}`,
        });
      }
    }

    // Hitung total
    const totalAmount = cart.items.reduce((sum, item) => {
      return sum + item.product.price * item.quantity;
    }, 0);

    // Buat order dengan transaction
    const order = await prisma.$transaction(async (tx) => {
      // Buat order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: {
          items: {
            include: { product: true },
          },
        },
      });

      // Update stok produk
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // Kosongkan cart
      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      return newOrder;
    });

    res.status(201).json({
      success: true,
      message: "Pesanan berhasil dibuat",
      data: { order },
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/ecommerce/orders - Ambil semua order user
const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: {
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/ecommerce/orders/:id - Ambil detail order
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    // Cek ownership atau admin
    if (order.userId !== req.user.id && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Akses ditolak",
      });
    }

    res.json({
      success: true,
      data: { order },
    });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// PUT /api/ecommerce/orders/:id/status - Update status order (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Pesanan tidak ditemukan",
      });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: parseInt(id) },
      data: { status },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    res.json({
      success: true,
      message: "Status pesanan berhasil diperbarui",
      data: { order: updatedOrder },
    });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

// GET /api/ecommerce/orders/all - Ambil semua order (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true },
        },
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: { orders },
    });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "Terjadi kesalahan server" });
  }
};

module.exports = {
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
};
