const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  console.log("Mengisi data seed...\n");

  // ==================== USERS ====================

  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      email: "admin@example.com",
      password: adminPassword,
      name: "Admin Utama",
      role: "ADMIN",
    },
  });
  console.log("Admin dibuat:", admin.email);

  const staffPassword = await bcrypt.hash("staff123", 10);
  const staff1 = await prisma.user.upsert({
    where: { email: "staff1@example.com" },
    update: {},
    create: {
      email: "staff1@example.com",
      password: staffPassword,
      name: "Staff Support 1",
      role: "STAFF",
    },
  });
  console.log("Staff 1 dibuat:", staff1.email);

  const staff2 = await prisma.user.upsert({
    where: { email: "staff2@example.com" },
    update: {},
    create: {
      email: "staff2@example.com",
      password: staffPassword,
      name: "Staff Support 2",
      role: "STAFF",
    },
  });
  console.log("Staff 2 dibuat:", staff2.email);

  const customerPassword = await bcrypt.hash("customer123", 10);
  const customer1 = await prisma.user.upsert({
    where: { email: "customer1@example.com" },
    update: {},
    create: {
      email: "customer1@example.com",
      password: customerPassword,
      name: "Budi Santoso",
      role: "CUSTOMER",
    },
  });
  console.log("Customer 1 dibuat:", customer1.email);

  const customer2 = await prisma.user.upsert({
    where: { email: "customer2@example.com" },
    update: {},
    create: {
      email: "customer2@example.com",
      password: customerPassword,
      name: "Siti Rahayu",
      role: "CUSTOMER",
    },
  });
  console.log("Customer 2 dibuat:", customer2.email);

  // ==================== TICKETS ====================

  const tickets = [
    {
      title: "Login gagal setelah update password",
      description:
        "Saya sudah mengupdate password namun saat login dengan password baru selalu gagal. Sudah coba clear cache browser tapi tetap tidak bisa.",
      status: "OPEN",
      priority: "HIGH",
      category: "Auth",
      authorId: customer1.id,
      assigneeId: staff1.id,
    },
    {
      title: "Halaman dashboard loading sangat lambat",
      description:
        "Dashboard membutuhkan waktu lebih dari 10 detik untuk load. Hal ini terjadi setelah penambahan fitur baru minggu lalu.",
      status: "IN_PROGRESS",
      priority: "URGENT",
      category: "Performance",
      authorId: customer1.id,
      assigneeId: staff1.id,
    },
    {
      title: "Tombol export PDF tidak berfungsi",
      description:
        "Saat klik tombol export PDF di halaman laporan, tidak ada yang terjadi. Tidak ada error message juga.",
      status: "OPEN",
      priority: "MEDIUM",
      category: "Bug",
      authorId: customer2.id,
      assigneeId: staff2.id,
    },
    {
      title: "Request fitur: Dark mode",
      description:
        "Tolong tambahkan fitur dark mode untuk aplikasi. Banyak user yang meminta fitur ini.",
      status: "WAITING",
      priority: "LOW",
      category: "Feature Request",
      authorId: customer2.id,
    },
    {
      title: "Error 500 saat upload file",
      description:
        "Saat upload file dengan ukuran lebih dari 5MB, muncul error 500 internal server error.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Bug",
      authorId: customer1.id,
      assigneeId: staff2.id,
    },
    {
      title: "Integrasi payment gateway belum selesai",
      description:
        "Payment gateway Midtrans sudah terdaftar tapi integrasi dengan sistem belum selesai. Butuh bantuan untuk testing.",
      status: "RESOLVED",
      priority: "HIGH",
      category: "Integration",
      authorId: customer2.id,
      assigneeId: staff1.id,
    },
    {
      title: "User tidak bisa reset password",
      description:
        "Fitur reset password via email tidak mengirimkan email. Sudah cek spam juga tidak ada.",
      status: "CLOSED",
      priority: "MEDIUM",
      category: "Auth",
      authorId: customer1.id,
      assigneeId: staff2.id,
    },
    {
      title: "Mobile responsive issue di tablet",
      description:
        "Tampilan aplikasi berantakan saat dibuka di tablet iPad. Bagian sidebar hilang.",
      status: "OPEN",
      priority: "MEDIUM",
      category: "UI/UX",
      authorId: customer2.id,
      assigneeId: staff1.id,
    },
    {
      title: "Butuh akses API untuk integrasi",
      description:
        "Kami butuh akses API untuk integrasi dengan sistem ERP internal perusahaan. Mohon setup API key.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      category: "Integration",
      authorId: customer1.id,
      assigneeId: staff1.id,
    },
    {
      title: "Optimasi query database",
      description:
        "Query untuk laporan penjualan sangat lambat. Perlu optimasi query dan tambah index.",
      status: "RESOLVED",
      priority: "URGENT",
      category: "Performance",
      authorId: staff1.id,
      assigneeId: staff1.id,
    },
  ];

  for (const ticket of tickets) {
    const existing = await prisma.ticket.findFirst({
      where: { title: ticket.title },
    });
    if (!existing) {
      await prisma.ticket.create({ data: ticket });
    }
  }
  console.log("Tiket contoh dibuat:", tickets.length);

  // ==================== COMMENTS ====================

  const allTickets = await prisma.ticket.findMany();

  // Komentar untuk tiket pertama
  if (allTickets[0]) {
    const comments = [
      {
        content: "Saya sudah coba reset password dari database, silakan coba login lagi.",
        authorId: staff1.id,
        ticketId: allTickets[0].id,
      },
      {
        content: "Sudah bisa login, terima kasih!",
        authorId: customer1.id,
        ticketId: allTickets[0].id,
      },
    ];

    for (const comment of comments) {
      const existing = await prisma.comment.findFirst({
        where: {
          content: comment.content,
          ticketId: comment.ticketId,
        },
      });
      if (!existing) {
        await prisma.comment.create({ data: comment });
      }
    }
  }

  // Komentar untuk tiket kedua
  if (allTickets[1]) {
    const comments = [
      {
        content: "Sedang investigate, kemungkinan ada query N+1 di dashboard.",
        authorId: staff1.id,
        ticketId: allTickets[1].id,
      },
      {
        content: "Sudah temukan masalahnya, sedang diperbaiki.",
        authorId: staff1.id,
        ticketId: allTickets[1].id,
      },
    ];

    for (const comment of comments) {
      const existing = await prisma.comment.findFirst({
        where: {
          content: comment.content,
          ticketId: comment.ticketId,
        },
      });
      if (!existing) {
        await prisma.comment.create({ data: comment });
      }
    }
  }

  console.log("Komentar contoh dibuat");

  // ==================== SUMMARY ====================

  const totalUsers = await prisma.user.count();
  const totalTickets = await prisma.ticket.count();
  const totalComments = await prisma.comment.count();

  console.log("\n=== Seed Selesai ===");
  console.log(`Total Users: ${totalUsers}`);
  console.log(`Total Tickets: ${totalTickets}`);
  console.log(`Total Comments: ${totalComments}`);
  console.log("\nAkun untuk testing:");
  console.log("Admin   : admin@example.com / admin123");
  console.log("Staff 1 : staff1@example.com / staff123");
  console.log("Staff 2 : staff2@example.com / staff123");
  console.log("Customer 1: customer1@example.com / customer123");
  console.log("Customer 2: customer2@example.com / customer123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
