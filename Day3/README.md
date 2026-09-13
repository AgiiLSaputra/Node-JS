# Day 3 - ORM with PostgreSQL using Prisma

Project ini mendemonstrasikan penggunaan Prisma sebagai ORM untuk PostgreSQL dengan UI Dashboard Admin dan Public View.

## Features

### Public Pages
- **Home** - Halaman utama dengan daftar post terbaru dan statistik
- **Post Detail** - Halaman detail post dengan komentar
- **About** - Halaman informasi tentang project

### Admin Dashboard
- **Dashboard** - Overview statistik dan post terbaru
- **Users Management** - CRUD users (create, read, update, delete)
- **Posts Management** - CRUD posts dengan tag management
- **Comments Management** - Lihat dan hapus komentar
- **Tags Management** - CRUD tags

## Tech Stack

- **Backend**: Node.js + Express.js
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Templating**: EJS
- **CSS**: Tailwind CSS v4

## Models

- **User**: Menyimpan data pengguna (email, name, password, role)
- **Post**: Menyimpan artikel/postingan
- **Tag**: Menyimpan tag untuk kategorisasi post
- **Comment**: Menyimpan komentar pada post

## Relasi

- User → Post (one-to-many)
- User → Comment (one-to-many)
- Post → Comment (one-to-many)
- Post ↔ Tag (many-to-many)

---

## Cara Menjalankan

### Prasyarat

- Node.js v18+
- PostgreSQL sudah terinstall dan running
- Sudah membuat database kosong untuk project ini

### Langkah 1: Masuk ke folder project

```bash
cd Day3
```

### Langkah 2: Install dependencies

```bash
npm install
```

### Langkah 3: Konfigurasi database

Buka file `.env` dan sesuaikan `DATABASE_URL` dengan kredensial PostgreSQL kamu:

```
DATABASE_URL="postgresql://username:password@localhost:5432/nama_database?schema=public"
```

Contoh:
```
DATABASE_URL="postgresql://postgres:rahasia@localhost:5432/day3_orm?schema=public"
```

### Langkah 4: Setup database

```bash
npx prisma generate
npx prisma db push
```

### Langkah 5: Seed data (opsional, untuk data contoh)

```bash
npm run db:seed
```

### Langkah 6: Build Tailwind CSS

Buka terminal baru (terminal 1):

```bash
npm run tailwind
```

### Langkah 7: Jalankan server

Buka terminal baru (terminal 2):

```bash
npm run dev
```

### Langkah 8: Buka browser

- **Public Site**: http://localhost:3000
- **Admin Panel**: http://localhost:3000/admin
- **Login**: http://localhost:3000/auth/login

---

## Default Login

| Field | Value |
|-------|-------|
| Email | john@example.com |
| Password | hashed_password_1 |

---

## Semua Scripts

| Script | Deskripsi |
|--------|-----------|
| `npm run dev` | Jalankan server (development mode) |
| `npm run start` | Jalankan server (production mode) |
| `npm run tailwind` | Watch & build Tailwind CSS |
| `npm run db:generate` | Generate Prisma Client |
| `npm run db:push` | Push schema ke database |
| `npm run db:migrate` | Jalankan migrasi database |
| `npm run db:seed` | Seed database dengan data contoh |
| `npm run db:studio` | Buka Prisma Studio (GUI database) |

---

## Struktur Folder

```
Day3/
├── public/css/          # CSS files (Tailwind input & custom)
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.js          # Seed data
├── src/
│   ├── server.js        # Main server
│   ├── middleware/       # Auth middleware
│   ├── routes/          # Route handlers
│   └── views/           # EJS templates
│       ├── partials/    # Reusable components
│       ├── admin/       # Admin pages
│       └── public/      # Public pages
├── .env                 # Environment variables
├── .gitignore
├── package.json
└── README.md
```
