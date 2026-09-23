const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const books = [
  {
    title: "Laskar Pelangi",
    author: "Andrea Hirata",
    year: 2005,
    genre: "Fiksi",
    description: "Novel tentang perjuangan anak-anak sekolah di Belitung.",
  },
  {
    title: "Bumi Manusia",
    author: "Pramoedya Ananta Toer",
    year: 1980,
    genre: "Sejarah",
    description: "Bagian pertama dari Tetralogi Buru yang fenomenal.",
  },
  {
    title: "Sapiens: A Brief History of Humankind",
    author: "Yuval Noah Harari",
    year: 2011,
    genre: "Non-Fiksi",
    description: "Sejarah umat manusia dari Zaman Batu hingga era modern.",
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    year: 2008,
    genre: "Teknologi",
    description: "Panduan menulis kode yang rapi dan mudah dipelihara.",
  },
  {
    title: "Atomic Habits",
    author: "James Clear",
    year: 2018,
    genre: "Pengembangan Diri",
    description: "Strategi membangun kebiasaan kecil dengan hasil besar.",
  },
  {
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    year: 1997,
    genre: "Fantasi",
    description: "Petualangan pertama Harry Potter di Hogwarts.",
  },
];

async function main() {
  console.log("Seeding data buku...");

  await prisma.buku.deleteMany();

  for (const book of books) {
    await prisma.buku.create({ data: book });
  }

  console.log(`Berhasil seed ${books.length} buku.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
