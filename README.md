# SiAntri-BP3MI

Sistem Informasi Antrian BP3MI berbasis web yang digunakan untuk mempermudah proses pengambilan nomor antrian dan rekap pelayanan secara digital.

## Deskripsi

SiAntri-BP3MI merupakan aplikasi berbasis web yang memungkinkan pengguna mengambil nomor antrian secara online tanpa harus melakukan pencatatan manual.

Data yang berhasil dikirim akan disimpan ke:

- PostgreSQL Database
- Google Spreadsheet

Sehingga dapat digunakan sebagai media operasional sekaligus rekap pelayanan.

---

## Fitur

### Pengambilan Antrian

- Input data calon pengguna layanan
- Generate nomor antrian otomatis
- Nomor antrian berdasarkan skema pelayanan

### Validasi Data

- Validasi field wajib
- Validasi nomor HP
- Validasi paspor
- Validasi jenis kelamin
- Validasi skema layanan

### Penyimpanan Data

- PostgreSQL
- Google Spreadsheet

### Rekap Pelayanan

- Menampilkan seluruh data antrian
- Menampilkan data berdasarkan tanggal

### Keamanan

- Rate Limiting
- Error Handling
- Input Validation

---

## Teknologi

### Frontend

- Vue.js 3
- Vue Router
- JavaScript

### Backend

- Node.js
- Express.js

### Database

- PostgreSQL
- Prisma ORM

### Integrasi

- Google Sheets API

### Version Control

- Git
- GitHub

---

## Struktur Project

```text
SiAntri-BP3MI
│
├── frontend
│   ├── src
│   ├── public
│   └── package.json
│
├── backend
│   ├── prisma
│   ├── src
│   │   ├── config
│   │   ├── constants
│   │   ├── controllers
│   │   ├── middlewares
│   │   ├── routes
│   │   ├── services
│   │   └── utils
│   │
│   ├── .env
│   └── server.js
│
└── README.md
```

---

## Instalasi

### Clone Repository

```bash
git clone https://github.com/hamsaif/SiAntri-BP3MI.git
```

Masuk ke folder project:

```bash
cd SiAntri-BP3MI
```

---

## Instalasi Backend

Masuk ke folder backend:

```bash
cd backend
```

Install dependency:

```bash
npm install
```

Buat file .env:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/siantri"
PORT=3000
```

Jalankan migration Prisma:

```bash
npx prisma migrate dev
```

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan server:

```bash
node server.js
```

Server akan berjalan di:

```text
http://localhost:3000
```

---

## Konfigurasi Google Spreadsheet

1. Buat project pada Google Cloud Console
2. Aktifkan Google Sheets API
3. Buat Service Account
4. Download file credentials.json
5. Letakkan file tersebut pada folder:

```text
backend/
```

6. Share Spreadsheet ke email Service Account dengan akses Editor

---

## Instalasi Frontend

Masuk ke folder frontend:

```bash
cd frontend
```

Install dependency:

```bash
npm install
```

Jalankan aplikasi:

```bash
npm run dev
```

Frontend akan berjalan di:

```text
http://localhost:5173
```

---

## Endpoint API

### Tambah Antrian

```http
POST /antrian
```

### Ambil Semua Antrian

```http
GET /antrian
```

### Ambil Antrian Berdasarkan Tanggal

```http
GET /antrian/:tgl
```

Contoh:

```http
GET /antrian/2026-05-07
```

---

## Cara Penggunaan

1. Buka aplikasi frontend
2. Isi seluruh data pada formulir
3. Klik tombol Ambil Antrian
4. Sistem akan menghasilkan nomor antrian
5. Data otomatis tersimpan ke database
6. Data otomatis tersimpan ke Google Spreadsheet

---

## Status Pengembangan

### Selesai

- Pengambilan antrian
- Generate nomor otomatis
- PostgreSQL
- Google Spreadsheet
- Rekap data
- Rate limiting

### Dalam Pengembangan

- Cetak nomor antrian
- Dashboard monitoring
- Notifikasi layanan

---

## Pengembang

Muhammad Ilham Syaifullah

Program Studi Informatika

Universitas Teknokrat Indonesia

---

## License

Project ini dibuat untuk kebutuhan pembelajaran, penelitian, dan pengembangan sistem informasi pelayanan.