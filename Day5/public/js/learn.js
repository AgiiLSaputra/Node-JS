// ==================== KONTEN PENJELASAN TOPIK ====================
// Setiap topik: title, group, body (HTML), relation (hubungan dengan materi hari ini)

const LEARN_TOPICS = {
  // ============ TECH STACK ============

  "Node.js": {
    title: "Node.js",
    group: "Tech Stack",
    body: `
      <p><strong>Node.js</strong> adalah runtime JavaScript yang berjalan di <em>luar browser</em>, dibangun di atas mesin V8 (Chrome).</p>
      <ul>
        <li>Memungkinkan kita menulis backend/server memakai bahasa JavaScript</li>
        <li>Non-blocking &amp; event-driven → efisien untuk I/O seperti query database</li>
        <li>Punya ribuan paket lewat npm (Node Package Manager)</li>
      </ul>
      <p>Contoh: file <code>src/server.js</code> di project ini dijalankan oleh Node.js.</p>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Semua code REST API hari ini (<code>express</code>, <code>prisma</code>) berjalan di Node.js. Perintah <code>npm run dev</code> = Node.js menjalankan server kita.</p>
      </div>
    `,
  },

  "Express": {
    title: "Express.js",
    group: "Tech Stack",
    body: `
      <p><strong>Express</strong> adalah framework web minimal untuk Node.js yang memudahkan:</p>
      <ul>
        <li>Membuat <strong>route/endpoint</strong> (GET, POST, dll)</li>
        <li>Memasang <strong>middleware</strong> berantai</li>
        <li>Parse request body (<code>express.json()</code>)</li>
        <li>Serve file statis (HTML/CSS/JS di folder <code>public/</code>)</li>
      </ul>
      <div class="code-block">app.get("/api/books", handler)   // daftar buku
app.post("/api/books", handler)  // tambah buku</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Express adalah "tukang pos" REST API kita: ia menerima HTTP request, meneruskan ke controller yang tepat, lalu mengirim response. Route di <code>src/routes/books.js</code> adalah Express.</p>
      </div>
    `,
  },

  "PostgreSQL": {
    title: "PostgreSQL",
    group: "Tech Stack",
    body: `
      <p><strong>PostgreSQL</strong> adalah <strong>Relational Database Management System (RDBMS)</strong> — tempat data disimpan secara permanen.</p>
      <ul>
        <li>Data disimpan dalam <strong>tabel</strong> (baris &amp; kolom)</li>
        <li>Mendukung relasi antar tabel, index, transaksi (ACID)</li>
        <li>Bahasa query-nya: <strong>SQL</strong></li>
      </ul>
      <p>Di project ini database-nya bernama <code>day5_restapi</code>, tabel <code>buku</code>.</p>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Setiap request ke REST API (misal GET /api/books) pada akhirnya berujung ke query SQL di PostgreSQL — tapi kita tidak menulis SQL manual, Prisma yang menerjemahkan.</p>
      </div>
    `,
  },

  "ORM": {
    title: "ORM (Object-Relational Mapping)",
    group: "Tech Stack",
    body: `
      <p><strong>ORM</strong> adalah teknik memetakan <strong>object di kode program</strong> ↔ <strong>tabel di database</strong>.</p>
      <ul>
        <li>Object <code>{ title: "Buku A" }</code> ↔ baris di tabel <code>buku</code></li>
        <li>Tidak perlu menulis SQL manual untuk operasi dasar</li>
        <li>Ada validasi, type-checking, dan API yang konsisten</li>
      </ul>
      <p>Popular ORM di Node.js: Prisma, Sequelize, TypeORM.</p>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Prisma (ORM yang kita pakai) menerjemahkan <code>prisma.buku.findMany()</code> menjadi <code>SELECT * FROM buku</code> secara otomatis.</p>
      </div>
    `,
  },

  "Prisma": {
    title: "Prisma",
    group: "Tech Stack",
    body: `
      <p><strong>Prisma</strong> adalah ORM modern untuk Node.js &amp; TypeScript, terdiri dari:</p>
      <ul>
        <li><strong>Prisma Schema</strong> — deklarasi model database</li>
        <li><strong>Prisma Client</strong> — library yang di-import untuk query</li>
        <li><strong>Prisma Migrate</strong> — sinkronisasi schema ↔ database</li>
      </ul>
      <div class="code-block">const books = await prisma.buku.findMany()</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Controller REST API kita seluruhnya berinteraksi dengan database lewat Prisma Client: findMany (GET), create (POST), update (PUT/PATCH), delete (DELETE).</p>
      </div>
    `,
  },

  // ============ KONSEP REST ============

  "REST API": {
    title: "REST API",
    group: "Konsep REST",
    body: `
      <p><strong>REST</strong> (Representational State Transfer) adalah <strong>arsitektur</strong> untuk merancang API. Disebut "RESTful" jika mengikuti aturan:</p>
      <ul>
        <li>Menggunakan <strong>HTTP method</strong> sesuai makna (GET=ambil, POST=buat, dll)</li>
        <li>URL sebagai <strong>resource</strong> (noun), bukan aksi</li>
        <li><strong>Stateless</strong> — tiap request berdiri sendiri, server tidak menyimpan sesi</li>
        <li>Data dipertukarkan dalam format <strong>JSON</strong></li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Project ini adalah REST API lengkap: resource <code>/api/books</code>, 5 HTTP method, response JSON, stateless (tanpa session/login).</p>
      </div>
    `,
  },

  "Resource": {
    title: "Resource",
    group: "Konsep REST",
    body: `
      <p><strong>Resource</strong> adalah objek/data yang bisa diakses lewat API — dinyatakan sebagai <strong>URL (endpoint)</strong>.</p>
      <ul>
        <li>Resource sebaiknya pakai <strong>kata benda (noun)</strong>, bukan kata kerja</li>
        <li>✅ <code>/api/books</code> &nbsp; ❌ <code>/api/getAllBooks</code></li>
        <li>Aksi ditentukan oleh HTTP method, bukan URL</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Resource hari ini: <code>/api/books</code> (koleksi) dan <code>/api/books/:id</code> (satu buku). GET/POST/PUT/PATCH/DELETE diterapkan pada resource yang sama.</p>
      </div>
    `,
  },

  "Endpoint": {
    title: "Endpoint",
    group: "Konsep REST",
    body: `
      <p><strong>Endpoint</strong> = kombinasi <strong>HTTP method + URL</strong> yang menangani satu aksi.</p>
      <div class="code-block">GET    /api/books      → ambil semua buku
POST   /api/books      → tambah buku
GET    /api/books/1    → ambil buku id=1
DELETE /api/books/1    → hapus buku id=1</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Project punya 6 endpoint. Daftar lengkap ada di <code>GET /api</code> dan bisa dicoba lewat API Tester di halaman ini.</p>
      </div>
    `,
  },

  "GET": {
    title: "GET — Mengambil Data",
    group: "Konsep REST",
    body: `
      <p><strong>GET</strong> adalah HTTP method untuk <strong>mengambil/membaca</strong> data dari server (operasi <strong>R</strong>ead di CRUD).</p>
      <ul>
        <li>Tidak mengubah data di server (harusnya <strong>idempoten</strong> &amp; aman)</li>
        <li>Tidak punya body request (parameter lewat query string / path)</li>
        <li>Response sukses: <strong>200 OK</strong> berisi JSON</li>
      </ul>
      <div class="code-block">GET /api/books          → semua buku
GET /api/books/1        → buku id 1
GET /api/books?search=laskar → cari buku</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Di kode: <code>router.get("/", bookController.getAllBooks)</code> → Prisma <code>findMany()</code>. Coba lewat API Tester!</p>
      </div>
    `,
  },

  "POST": {
    title: "POST — Membuat Data",
    group: "Konsep REST",
    body: `
      <p><strong>POST</strong> adalah HTTP method untuk <strong>membuat data baru</strong> (operasi <strong>C</strong>reate di CRUD).</p>
      <ul>
        <li>Data dikirim di <strong>body request</strong> (format JSON)</li>
        <li>Bukan idempoten — 2x POST = 2 data baru</li>
        <li>Response sukses: <strong>201 Created</strong> + data yang dibuat</li>
      </ul>
      <div class="code-block">POST /api/books
{ "title": "Buku Baru", "author": "A", "year": 2026 }</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Di kode: <code>router.post("/", ...)</code> → Prisma <code>create()</code> → status 201. Validasi field wajib menghasilkan 400.</p>
      </div>
    `,
  },

  "PUT": {
    title: "PUT — Update Penuh",
    group: "Konsep REST",
    body: `
      <p><strong>PUT</strong> adalah HTTP method untuk <strong>mengganti seluruh resource</strong> (operasi <strong>U</strong>pdate di CRUD).</p>
      <ul>
        <li>Body berisi <strong>semua field</strong> — field yang tidak dikirim jadi kosong</li>
        <li>Idempoten: PUT 5x dengan data sama = hasil sama</li>
        <li>Response sukses: <strong>200 OK</strong></li>
      </ul>
      <div class="code-block">PUT /api/books/1
{ "title": "Baru", "author": "B", "year": 2020, "genre": null, "description": null }</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Di kode: <code>router.put("/:id", ...)</code> → wajib title, author, year (kalau tidak → 400) → Prisma <code>update()</code>.</p>
      </div>
    `,
  },

  "PATCH": {
    title: "PATCH — Update Sebagian",
    group: "Konsep REST",
    body: `
      <p><strong>PATCH</strong> mengupdate <strong>sebagian field saja</strong> dari resource.</p>
      <ul>
        <li>Body hanya berisi field yang mau diubah</li>
        <li>Field yang tidak dikirim <strong>tidak berubah</strong></li>
        <li>Beda utama dengan PUT: PUT = ganti semua, PATCH = ubah sebagian</li>
      </ul>
      <div class="code-block">PATCH /api/books/1
{ "year": 2021 }        ← hanya year yang berubah</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Di kode: <code>router.patch("/:id", ...)</code> memfilter field yang ada di body → Prisma <code>update({ data })</code>. Bandingkan langsung PUT vs PATCH di API Tester!</p>
      </div>
    `,
  },

  "DELETE": {
    title: "DELETE — Menghapus Data",
    group: "Konsep REST",
    body: `
      <p><strong>DELETE</strong> adalah HTTP method untuk <strong>menghapus resource</strong> (operasi <strong>D</strong>elete di CRUD).</p>
      <ul>
        <li>Tidak ada body; target ditentukan lewat URL (<code>/api/books/1</code>)</li>
        <li>Idempoten: hapus 2x = hasil sama (sudah tidak ada)</li>
        <li>Response sukses: <strong>204 No Content</strong> — tanpa body</li>
      </ul>
      <div class="code-block">DELETE /api/books/1  →  204 (sukses, tanpa body)
DELETE /api/books/99 →  404 (tidak ditemukan)</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Di kode: <code>router.delete("/:id", ...)</code> → cek existence (404 jika tidak ada) → Prisma <code>delete()</code> → <code>res.status(204).send()</code>.</p>
      </div>
    `,
  },

  "JSON": {
    title: "JSON (JavaScript Object Notation)",
    group: "Konsep REST",
    body: `
      <p><strong>JSON</strong> adalah format standar pertukaran data di REST API.</p>
      <ul>
        <li>Ringkas, mudah dibaca manusia &amp; machine</li>
        <li>Didukung semua bahasa pemrograman</li>
        <li>Request body &amp; response body REST API umumnya JSON</li>
      </ul>
      <div class="code-block">{
  "success": true,
  "data": { "id": 1, "title": "Laskar Pelangi" }
}</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Server parse JSON request dengan <code>express.json()</code>, dan seluruh response controller memakai <code>res.json(...)</code>. API Tester menyediakan textarea untuk menulis JSON body.</p>
      </div>
    `,
  },

  "Request & Response": {
    title: "Request & Response",
    group: "Konsep REST",
    body: `
      <p>Komunikasi HTTP selalu berpasangan:</p>
      <ul>
        <li><strong>Request</strong> (dari client → server): method, URL, headers, body</li>
        <li><strong>Response</strong> (dari server → client): status code, headers, body (JSON)</li>
      </ul>
      <div class="code-block">Request:  POST /api/books  { "title": "X", ... }
Response: 201 Created  { "success": true, "data": {...} }</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>API Tester memperlihatkan kedua sisi: form = request, panel hasil = response (status code + body + waktu).</p>
      </div>
    `,
  },

  "URL & Route": {
    title: "URL & Route",
    group: "Konsep REST",
    body: `
      <p><strong>URL</strong> = alamat resource. <strong>Route</strong> = daftar path di Express yang mau dilayani.</p>
      <ul>
        <li>Path parameter: <code>/api/books/:id</code> → <code>:id</code> bisa angka apa pun</li>
        <li>Query string: <code>/api/books?search=java</code> → filter opsional</li>
        <li>Akses di Express: <code>req.params.id</code> dan <code>req.query.search</code></li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Route <code>router.get("/:id")</code> membaca <code>req.params.id</code>; endpoint list membaca <code>req.query.search</code> &amp; <code>req.query.genre</code>.</p>
      </div>
    `,
  },

  "Middleware": {
    title: "Middleware",
    group: "Konsep REST",
    body: `
      <p><strong>Middleware</strong> adalah fungsi yang berjalan <strong>sebelum</strong> handler akhir — punya akses ke <code>req</code>, <code>res</code>, dan <code>next()</code>.</p>
      <ul>
        <li>Dipasang berantai: logging → parsing JSON → route → error handler</li>
        <li>Bisa memodifikasi request (mis. tambah body hasil parse)</li>
        <li>Bisa memblokir request (auth, validasi) atau menangkap error</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Server kita memakai middleware: <code>express.json()</code> (parse body), request logging, static files, dan error handler 404/500.</p>
      </div>
    `,
  },

  // ============ STATUS CODE ============

  "200 OK": {
    title: "200 OK",
    group: "Status Code",
    body: `
      <p><strong>200</strong> = request sukses, response membawa data.</p>
      <ul>
        <li>Dipakai untuk GET yang berhasil, juga PUT/PATCH yang berhasil</li>
        <li>Body berisi JSON data</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p><code>GET /api/books</code>, <code>PUT /api/books/:id</code>, dan <code>PATCH /api/books/:id</code> mengembalikan 200 saat sukses.</p>
      </div>
    `,
  },

  "201 Created": {
    title: "201 Created",
    group: "Status Code",
    body: `
      <p><strong>201</strong> = resource <strong>berhasil dibuat</strong> — khusus untuk POST (kadang PUT yang membuat resource baru).</p>
      <div class="code-block">POST /api/books → 201 Created
{ "success": true, "data": { "id": 7, ... } }</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Controller <code>createBook</code> memakai <code>res.status(201)</code> setelah <code>prisma.buku.create()</code> sukses.</p>
      </div>
    `,
  },

  "204 No Content": {
    title: "204 No Content",
    group: "Status Code",
    body: `
      <p><strong>204</strong> = aksi sukses tetapi <strong>tidak ada body</strong> response — umum untuk DELETE.</p>
      <ul>
        <li>Sukses ≠ harus selalu ada data</li>
        <li>Client cukup tahu operasinya berhasil</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p><code>DELETE /api/books/:id</code> mengembalikan <code>res.status(204).send()</code> — di API Tester response body-nya kosong, itu normal.</p>
      </div>
    `,
  },

  "400 Bad Request": {
    title: "400 Bad Request",
    group: "Status Code",
    body: `
      <p><strong>400</strong> = request tidak valid — server tidak bisa memproses karena input salah.</p>
      <ul>
        <li>JSON rusak, field wajib kosong, tipe data salah</li>
        <li>Bukan salah server, tapi salah client</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>POST tanpa <code>title/author/year</code> → 400. PATCH tanpa field apa pun → 400. Coba kirim body kosong di tester!</p>
      </div>
    `,
  },

  "404 Not Found": {
    title: "404 Not Found",
    group: "Status Code",
    body: `
      <p><strong>404</strong> = resource yang diminta <strong>tidak ditemukan</strong>.</p>
      <ul>
        <li>URL salah, atau id tidak ada di database</li>
        <li>Beda dengan 400: request-nya valid, tapi datanya tidak ada</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p><code>GET /api/books/9999</code> → 404 karena Prisma <code>findUnique()</code> mengembalikan null. Route API yang salah juga 404.</p>
      </div>
    `,
  },

  "500 Internal Server Error": {
    title: "500 Internal Server Error",
    group: "Status Code",
    body: `
      <p><strong>500</strong> = error tak terduga <strong>di sisi server</strong> (bug, database mati, dsb).</p>
      <ul>
        <li>Client tidak bisa memperbaikinya — developer yang harus</li>
        <li>Wajib ditangani dengan try/catch + error handler</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Setiap controller punya try/catch → <code>res.status(500)</code>, plus error handler global di server.js. Kalau PostgreSQL mati, response-nya 500.</p>
      </div>
    `,
  },

  // ============ PRISMA ============

  "Schema": {
    title: "Prisma Schema",
    group: "Prisma ORM",
    body: `
      <p><strong>Schema</strong> adalah deklarasi struktur database dalam file <code>prisma/schema.prisma</code> — "cetak biru" tabel.</p>
      <div class="code-block">model Buku {
  id    Int    @id @default(autoincrement())
  title String
  year  Int
}</div>
      <ul>
        <li><code>datasource</code> → koneksi database (PostgreSQL)</li>
        <li><code>generator</code> → Prisma Client yang bisa di-import</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Model <code>Buku</code> di schema = tabel <code>buku</code> di PostgreSQL. Ubah schema → jalankan migrate → Client ikut update.</p>
      </div>
    `,
  },

  "Model": {
    title: "Model Prisma",
    group: "Prisma ORM",
    body: `
      <p><strong>Model</strong> merepresentasikan satu tabel + tipenya di TypeScript/JavaScript.</p>
      <ul>
        <li>Field + tipe: <code>year Int</code>, <code>title String</code></li>
        <li><code>@id @default(autoincrement())</code> → primary key otomatis</li>
        <li><code>@@index([title])</code> → index untuk pencarian cepat</li>
        <li><code>@@map("buku")</code> → nama tabel di database</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Model <code>Buku</code> (id, title, author, year, genre, description, createdAt, updatedAt) dipakai semua endpoint REST hari ini.</p>
      </div>
    `,
  },

  "Migration": {
    title: "Prisma Migrate",
    group: "Prisma ORM",
    body: `
      <p><strong>Migration</strong> = menerapkan perubahan schema ke database + menyimpan riwayatnya.</p>
      <div class="code-block">npx prisma migrate dev --name init   # buat &amp; jalankan migration
npx prisma db push                   # push tanpa riwayat (kurang disarankan)</div>
      <ul>
        <li>SQL migration tersimpan di <code>prisma/migrations/</code></li>
        <li><code>migrate dev</code> untuk development, <code>deploy</code> untuk production</li>
        <li>Migration history membuat semua developer punya skema sama</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Hari ini kita menjalankan <code>npx prisma migrate dev --name init</code> → membuat tabel <code>buku</code> di database <code>day5_restapi</code>.</p>
      </div>
    `,
  },

  "Prisma Client": {
    title: "Prisma Client",
    group: "Prisma ORM",
    body: `
      <p><strong>Prisma Client</strong> adalah library yang di-generate dari schema — gerbang utama kita ke database.</p>
      <div class="code-block">const prisma = new PrismaClient()
await prisma.buku.findMany()   // SELECT * FROM buku</div>
      <ul>
        <li>Type-safe (di TS) &amp; auto-complete</li>
        <li>Method CRUD tinggal panggil, SQL digenerate otomatis</li>
        <li>Dipakai sekali (singleton) — import dari config/database.js</li>
      </ul>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Controller meng-import <code>prisma</code> dari <code>src/config/database.js</code> — 1 instance dipakai semua request.</p>
      </div>
    `,
  },

  "CRUD Prisma": {
    title: "CRUD di Prisma",
    group: "Prisma ORM",
    body: `
      <p>Pemetaan HTTP method → Prisma method → operasi CRUD:</p>
      <div class="code-block">GET     → findMany() / findUnique()  → Read
POST    → create()                   → Create
PUT     → update() (semua field)     → Update
PATCH   → update() (sebagian field)  → Update
DELETE  → delete()                   → Delete</div>
      <div class="relation">
        <span class="relation-title">Hubungan dengan materi hari ini</span>
        <p>Hubungan inti hari ini: <strong>HTTP method (REST) ↔ Prisma method (ORM) ↔ SQL (PostgreSQL)</strong>. GET /api/books = findMany = SELECT.</p>
      </div>
    `,
  },
};

// Pengelompokan chip
const TOPIC_GROUPS = {
  stack: ["Node.js", "Express", "PostgreSQL", "ORM", "Prisma"],
  rest: ["REST API", "Resource", "Endpoint", "GET", "POST", "PUT", "PATCH", "DELETE", "JSON", "Request & Response", "URL & Route", "Middleware"],
  status: ["200 OK", "201 Created", "204 No Content", "400 Bad Request", "404 Not Found", "500 Internal Server Error"],
  prisma: ["Schema", "Model", "Migration", "Prisma Client", "CRUD Prisma"],
};

const METHOD_TONES = {
  GET: "get",
  POST: "post",
  PUT: "put",
  PATCH: "patch",
  DELETE: "delete",
};
