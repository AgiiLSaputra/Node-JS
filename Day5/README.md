# Day 5 - Belajar REST API

REST API dengan **Node.js + Express + Prisma ORM + PostgreSQL** + UI **Liquid Glass** berisi tombol penjelasan topik & API Tester interaktif.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **ORM:** Prisma Client
- **Database:** PostgreSQL (`day5_restapi`)
- **Frontend:** Vanilla HTML/CSS/JS — tema **Liquid Glass**

## Fitur

- **Section Belajar** — chip/topik bisa diklik → modal penjelasan + "Hubungan dengan materi hari ini"
- **API Tester** — kirim request GET/POST/PUT/PATCH/DELETE langsung dari browser, status code bisa diklik untuk penjelasan
- **Daftar Buku** — data realtime dari `GET /api/books` + pencarian

## Topik Penjelasan

| Group | Topik |
|-------|-------|
| Tech Stack | Node.js, Express, PostgreSQL, ORM, Prisma |
| Konsep REST | REST API, Resource, Endpoint, GET, POST, PUT, PATCH, DELETE, JSON, Request & Response, URL & Route, Middleware |
| Status Code | 200, 201, 204, 400, 404, 500 |
| Prisma ORM | Schema, Model, Migration, Prisma Client, CRUD Prisma |

## Struktur Project

```
Day5/
├── prisma/
│   ├── schema.prisma        # Model Buku
│   ├── migrations/          # Riwayat migration
│   └── seed.js              # Data seed (6 buku)
├── src/
│   ├── config/database.js   # Prisma client singleton
│   ├── controllers/bookController.js
│   ├── routes/books.js
│   └── server.js            # Entry point
├── public/
│   ├── index.html           # UI Liquid Glass
│   ├── css/style.css
│   └── js/
│       ├── learn.js         # Konten penjelasan topik
│       └── app.js           # Modal + API Tester + daftar buku
├── .env.example
├── .gitignore
└── package.json
```

## Setup

### 1. Install Dependencies

```bash
cd Day5
npm install
```

### 2. Setup Environment

```bash
cp .env.example .env
```

**.env:**

```
DATABASE_URL="postgresql://postgres:password@localhost:5432/day5_restapi?schema=public"
PORT=3000
```

### 3. Migrate + Seed

```bash
npx prisma migrate dev
npm run db:seed
```

### 4. Jalankan Server

```bash
npm run dev
```

Buka http://localhost:3000

## API Endpoints

| Method | Endpoint | Deskripsi | Status |
|--------|----------|-----------|--------|
| GET | `/api/books` | List buku (query: `search`, `genre`) | 200 |
| GET | `/api/books/:id` | Detail buku | 200 / 404 |
| POST | `/api/books` | Tambah buku (wajib: title, author, year) | 201 / 400 |
| PUT | `/api/books/:id` | Update penuh (wajib semua field) | 200 / 400 / 404 |
| PATCH | `/api/books/:id` | Update sebagian (min. 1 field) | 200 / 400 / 404 |
| DELETE | `/api/books/:id` | Hapus buku | 204 / 404 |

### Contoh Request

```bash
# List
curl http://localhost:3000/api/books

# Cari
curl "http://localhost:3000/api/books?search=laskar"

# Tambah
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -d '{"title":"Buku Baru","author":"Penulis","year":2026}'

# PATCH sebagian
curl -X PATCH http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -d '{"year":2021}'

# Hapus
curl -X DELETE http://localhost:3000/api/books/1
```

## Database Schema

### Buku

- `id` (Int, autoincrement, PK)
- `title` (String) — index
- `author` (String) — index
- `year` (Int)
- `genre` (String?) — index
- `description` (String?)
- `createdAt`, `updatedAt`

## NPM Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan server dengan watch |
| `npm start` | Jalankan server production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Jalankan migration |
| `npm run db:seed` | Seed data buku |
| `npm run db:studio` | Buka Prisma Studio |
| `npm run db:reset` | Reset database |

## MATERI INTI: Bagaimana semuanya terhubung

```
Browser (fetch)
   │  HTTP request (GET/POST/...)
   ▼
Express (route + middleware)
   │  teruskan ke controller
   ▼
Controller (validasi + respon)
   │  prisma.buku.findMany() / create() / ...
   ▼
Prisma Client (ORM)
   │  generate SQL otomatis
   ▼
PostgreSQL (tabel buku)
```

Satu request = alur penuh di atas → response JSON kembali ke browser.

## License

ISC
