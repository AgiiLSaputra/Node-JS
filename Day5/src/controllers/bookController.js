const prisma = require("../config/database");

// GET /api/books?search=&genre=
exports.getAllBooks = async (req, res) => {
  try {
    const { search, genre } = req.query;

    const where = {};
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { author: { contains: search, mode: "insensitive" } },
      ];
    }
    if (genre) {
      where.genre = { equals: genre, mode: "insensitive" };
    }

    const books = await prisma.buku.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      count: books.length,
      data: books,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil data buku" });
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID harus berupa angka" });
    }

    const book = await prisma.buku.findUnique({ where: { id } });
    if (!book) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }

    res.json({ success: true, data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengambil data buku" });
  }
};

// POST /api/books
exports.createBook = async (req, res) => {
  try {
    const { title, author, year, genre, description } = req.body;

    if (!title || !author || !year) {
      return res.status(400).json({
        success: false,
        message: "Field wajib: title, author, year",
      });
    }

    if (typeof year !== "number" || year < 0) {
      return res.status(400).json({ success: false, message: "year harus berupa angka" });
    }

    const book = await prisma.buku.create({
      data: {
        title,
        author,
        year,
        genre: genre || null,
        description: description || null,
      },
    });

    res.status(201).json({ success: true, message: "Buku berhasil ditambahkan", data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal menambahkan buku" });
  }
};

// PUT /api/books/:id (update penuh)
exports.updateBook = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID harus berupa angka" });
    }

    const { title, author, year, genre, description } = req.body;

    if (!title || !author || !year) {
      return res.status(400).json({
        success: false,
        message: "PUT wajib semua field: title, author, year",
      });
    }

    const existing = await prisma.buku.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }

    const book = await prisma.buku.update({
      where: { id },
      data: {
        title,
        author,
        year,
        genre: genre || null,
        description: description || null,
      },
    });

    res.json({ success: true, message: "Buku berhasil diupdate (PUT)", data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengupdate buku" });
  }
};

// PATCH /api/books/:id (update sebagian)
exports.patchBook = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID harus berupa angka" });
    }

    const allowed = ["title", "author", "year", "genre", "description"];
    const data = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({
        success: false,
        message: `PATCH minimal satu field: ${allowed.join(", ")}`,
      });
    }

    const existing = await prisma.buku.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }

    const book = await prisma.buku.update({ where: { id }, data });

    res.json({ success: true, message: "Buku berhasil diupdate (PATCH)", data: book });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal mengupdate buku" });
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (Number.isNaN(id)) {
      return res.status(400).json({ success: false, message: "ID harus berupa angka" });
    }

    const existing = await prisma.buku.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: "Buku tidak ditemukan" });
    }

    await prisma.buku.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Gagal menghapus buku" });
  }
};
