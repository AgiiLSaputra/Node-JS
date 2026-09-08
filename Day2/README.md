# Day 2 - REST API dengan PostgreSQL

## Fitur yang Dipelajari

### 1. REST API dengan PostgreSQL & Prisma ORM
- Koneksi database PostgreSQL
- ORM dengan Prisma (type-safe queries)
- Validasi data dengan express-validator

### 2. Sistem Login & Register (Authentication)
- Hash password dengan bcrypt
- JWT (JSON Web Token) untuk session management
- Middleware untuk proteksi route

### 3. Blog API dengan Role (Admin & User)
- CRUD artikel (Create, Read, Update, Delete)
- Sistem komentar
- Authorization: Admin bisa hapus semua, User hanya milik sendiri

### 4. E-commerce API Sederhana
- Manajemen produk (Admin only)
- Keranjang belanja (Cart)
- Sistem order/checkout
- Relasi data: User - Order - Produk

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Database
Buat database PostgreSQL, lalu edit `.env`:
```
DATABASE_URL="postgresql://postgres:password@localhost:5432/day2_api?schema=public"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Schema ke Database
```bash
npm run db:push
```

### 5. Seed Data (Optional)
```bash
npm run db:seed
```

## API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/register | Register user baru | No |
| POST | /api/auth/login | Login | No |
| GET | /api/auth/profile | Lihat profile | Yes |
| PUT | /api/auth/profile | Update profile | Yes |

### Blog
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/blog/posts | Ambil semua posts | No |
| GET | /api/blog/posts/:id | Ambil post by ID | No |
| POST | /api/blog/posts | Buat post baru | Yes |
| PUT | /api/blog/posts/:id | Update post | Yes* |
| DELETE | /api/blog/posts/:id | Hapus post | Yes* |
| GET | /api/blog/my-posts | Ambil posts saya | Yes |
| POST | /api/blog/posts/:postId/comments | Tambah komentar | Yes |
| DELETE | /api/blog/comments/:id | Hapus komentar | Yes* |

*Owner atau Admin

### E-commerce
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /api/ecommerce/products | Ambil semua produk | No |
| GET | /api/ecommerce/products/:id | Ambil produk by ID | No |
| POST | /api/ecommerce/products | Buat produk | Admin |
| PUT | /api/ecommerce/products/:id | Update produk | Admin |
| DELETE | /api/ecommerce/products/:id | Hapus produk | Admin |
| GET | /api/ecommerce/cart | Lihat keranjang | Yes |
| POST | /api/ecommerce/cart/items | Tambah ke keranjang | Yes |
| PUT | /api/ecommerce/cart/items/:itemId | Update quantity | Yes |
| DELETE | /api/ecommerce/cart/items/:itemId | Hapus dari keranjang | Yes |
| DELETE | /api/ecommerce/cart | Kosongkan keranjang | Yes |
| POST | /api/ecommerce/orders | Checkout | Yes |
| GET | /api/ecommerce/orders | Orders saya | Yes |
| GET | /api/ecommerce/orders/all | Semua orders | Admin |
| GET | /api/ecommerce/orders/:id | Detail order | Yes* |
| PUT | /api/ecommerce/orders/:id/status | Update status | Admin |

## Test Accounts (dari seed)
- **Admin:** admin@example.com / admin123
- **User:** user@example.com / user123

## Contoh Menggunakan cURL

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"123456","name":"Test User"}'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

### Buat Post (dengan token)
```bash
curl -X POST http://localhost:3000/api/blog/posts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My First Post","content":"Hello World!"}'
```

### Tambah ke Cart
```bash
curl -X POST http://localhost:3000/api/ecommerce/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"productId":1,"quantity":2}'
```

### Checkout
```bash
curl -X POST http://localhost:3000/api/ecommerce/orders \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Struktur Project

```
Day2/
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.js            # Seed data
├── public/                # Frontend (HTML/CSS/JS)
├── src/
│   ├── config/
│   │   └── database.js    # Prisma client
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── blogController.js
│   │   └── ecommerceController.js
│   ├── middleware/
│   │   ├── auth.js        # JWT authentication
│   │   ├── role.js        # Role-based access
│   │   └── validate.js    # Validation
│   ├── routes/
│   │   ├── auth.js
│   │   ├── blog.js
│   │   └── ecommerce.js
│   └── server.js          # Main server
├── .env                   # Environment variables
├── .env.example           # Example env
├── package.json
└── README.md
```

## Konsep yang Dipelajari

### Database Relations
```
User (1) ──── (Many) Post
User (1) ──── (Many) Comment
User (1) ──── (1) Cart
User (1) ──── (Many) Order
Post (1) ──── (Many) Comment
Cart (1) ──── (Many) CartItem
Product (1) ──── (Many) CartItem
Order (1) ──── (Many) OrderItem
Product (1) ──── (Many) OrderItem
```

### Authentication Flow
1. User register → password di-hash dengan bcrypt
2. User login → verifikasi password → generate JWT
3. Akses protected route → kirim JWT di header `Authorization: Bearer <token>`
4. Middleware verifikasi JWT → decode user info → proceed

### Authorization Flow
1. Cek user sudah login (middleware auth)
2. Cek role user (middleware role)
3. Cek ownership (di controller)




