# Day 4 - Ticketing System

REST API dengan **Prisma Advanced** (Soft Delete, Audit Log, Raw Queries) + Frontend UI

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js v5
- **ORM:** Prisma Client
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Token)
- **Frontend:** Vanilla HTML/CSS/JS

## Prisma Advanced Features

| Feature | Penjelasan |
|---------|------------|
| **Soft Delete** | Data tidak dihapus permanen, hanya ditandai dengan `deletedAt` |
| **Audit Log** | Semua operasi CRUD otomatis tercatat di tabel `AuditLog` |
| **Raw Queries** | Query SQL langsung via `$queryRaw` untuk analytics |
| **Batch Operations** | `updateMany` untuk update massal |
| **Indexing** | Index di field yang sering di-query |
| **Middleware** | Intercept semua query Prisma untuk soft delete & audit |

## Struktur Project

```
Day4/
├── prisma/
│   ├── schema.prisma        # Database schema
│   └── seed.js              # Data seed
├── src/
│   ├── config/
│   │   └── database.js      # Prisma client setup
│   ├── middleware/
│   │   ├── audit.js         # Audit log middleware
│   │   ├── softDelete.js    # Soft delete middleware
│   │   ├── auth.js          # JWT authentication
│   │   └── validate.js      # Request validation
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── ticketController.js
│   │   └── analyticsController.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── ticket.js
│   │   └── analytics.js
│   └── server.js            # Entry point
├── public/
│   ├── index.html           # Frontend SPA
│   ├── css/style.css        # Minimalist design
│   └── js/app.js            # Frontend logic
├── .env.example
├── .gitignore
└── package.json
```

## Setup

### 1. Install Dependencies

```bash
cd Day4
npm install
```

### 2. Setup Database

```bash
# Copy environment file
cp .env.example .env

# Edit .env sesuai konfigurasi PostgreSQL kamu
```

**.env:**
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/day4_ticketing?schema=public"
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="7d"
PORT=3000
```

### 3. Generate Prisma Client

```bash
npx prisma generate
```

### 4. Jalankan Migration

```bash
npx prisma migrate dev
```

> **Catatan:** `migrate dev` akan menjalankan semua migration di folder `prisma/migrations/` untuk membentuk struktur database. Ini lebih direkomendasikan daripada `npx prisma db push`, karena migration history ikut tersimpan dan konsisten untuk semua orang yang clone repo.

### 5. Seed Data

```bash
npm run db:seed
```

### 6. Jalankan Server

```bash
npm run dev
```

Buka http://localhost:3000

## Akun Testing

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Staff | staff1@example.com | staff123 |
| Customer | customer1@example.com | customer123 |

## API Endpoints

### Auth

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| POST | `/api/auth/register` | Register user baru | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | Lihat profil | Yes |
| PUT | `/api/auth/profile` | Update profil | Yes |
| GET | `/api/auth/users` | List semua user | Admin |

### Tickets

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/tickets` | List tiket (filter: status, priority, search) | Yes |
| GET | `/api/tickets/my` | Tiket milik saya | Yes |
| GET | `/api/tickets/:id` | Detail tiket + comments + audit log | Yes |
| POST | `/api/tickets` | Buat tiket baru | Yes |
| PUT | `/api/tickets/:id` | Update tiket | Yes |
| DELETE | `/api/tickets/:id` | Hapus tiket (soft delete) | Yes |
| PUT | `/api/tickets/bulk-status` | Update status massal | Admin/Staff |
| POST | `/api/tickets/:id/comments` | Tambah komentar | Yes |
| DELETE | `/api/tickets/comments/:id` | Hapus komentar | Yes |

### Analytics (Raw Queries)

| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| GET | `/api/analytics/stats` | Statistik umum | Admin/Staff |
| GET | `/api/analytics/daily` | Tiket per hari (7 hari) | Admin/Staff |
| GET | `/api/analytics/by-status` | Distribusi status | Admin/Staff |
| GET | `/api/analytics/by-priority` | Distribusi prioritas | Admin/Staff |
| GET | `/api/analytics/by-assignee` | Tiket per assignee | Admin/Staff |
| GET | `/api/analytics/recent-audit` | Audit log terbaru | Admin/Staff |
| GET | `/api/analytics/resolution-time` | Rata-rata waktu resolusi | Admin/Staff |

## Database Schema

```
User ─┬─> Ticket ─┬─> Comment
      │           │
      └───────────┴─> AuditLog
```

### User
- id, email, password, name, role (ADMIN/STAFF/CUSTOMER)
- deletedAt (soft delete)

### Ticket
- id, title, description, status, priority, category
- authorId, assigneeId
- deletedAt (soft delete)
- Index: status, priority, authorId, assigneeId, createdAt

### Comment
- id, content
- authorId, ticketId
- deletedAt (soft delete)

### AuditLog
- id, action, entity, entityId, oldValues (JSON), newValues (JSON)
- ipAddress, userAgent
- userId, createdAt
- Index: entity+entityId, userId, createdAt

## Prisma Middleware

### Soft Delete

```javascript
// src/middleware/softDelete.js
// Mengubah delete() menjadi update({ deletedAt: new Date() })
// Auto-filter: findMany() hanya return data yang deletedAt = null

prisma.$use(async (params, next) => {
  if (params.action === 'delete') {
    params.action = 'update';
    params.args.data = { deletedAt: new Date() };
  }
  return next(params);
});
```

### Audit Log

```javascript
// src/middleware/audit.js
// Auto-log setiap operasi create, update, delete
// Simpan oldValues dan newValues sebagai JSON

prisma.$use(async (params, next) => {
  // Simpan data sebelum operasi
  const oldValues = await prisma[model].findUnique({ where: args.where });
  
  // Jalankan operasi
  const result = await next(params);
  
  // Simpan data sesudah operasi
  await prisma.auditLog.create({
    data: { action, entity, entityId, oldValues, newValues }
  });
  
  return result;
});
```

### Raw Queries

```javascript
// Contoh: Statistik tiket
const stats = await prisma.$queryRaw`
  SELECT
    COUNT(*)::int as "totalTickets",
    COUNT(CASE WHEN "status" = 'OPEN' THEN 1 END)::int as "openTickets"
  FROM "Ticket"
`;
```

## NPM Scripts

| Command | Deskripsi |
|---------|-----------|
| `npm run dev` | Jalankan server dengan watch |
| `npm start` | Jalankan server production |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema ke database |
| `npm run db:migrate` | Jalankan migration |
| `npm run db:seed` | Seed data |
| `npm run db:studio` | Buka Prisma Studio |
| `npm run db:reset` | Reset database |

## Frontend

UI menggunakan desain **minimalist** dengan fitur:

- Login & Register
- Dashboard dengan statistik
- List tiket dengan filter & pagination
- Detail tiket dengan komentar & audit log
- Analytics (untuk admin/staff)
- Profil user

## License

ISC
