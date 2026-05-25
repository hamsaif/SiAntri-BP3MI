// link spredsheet : 
// https://docs.google.com/spreadsheets/d/1u8QD8TtkEezK5TMr-gdLrtC_Zmpl-CTj3Xh4nqPjyao/edit?usp=sharing


// require("dotenv").config(); // load .env

const express = require("express"); // framework server
const cors = require("cors"); // handle CORS
const { PrismaClient } = require("@prisma/client"); // ORM database
const { google } = require("googleapis"); // Google Sheets API

const app = express();
const prisma = new PrismaClient();

const PORT = 3000;

// ID spreadsheet Google Sheets
const SPREADSHEET_ID = "1u8QD8TtkEezK5TMr-gdLrtC_Zmpl-CTj3Xh4nqPjyao";

// untuk menyimpan request terakhir (anti double click)
let lastRequest = {};

console.log("DB:", process.env.DATABASE_URL);

// SETUP GOOGLE SHEETS

// autentikasi Google API
const auth = new google.auth.GoogleAuth({
  keyFile: "credentials.json", // file credential
  scopes: ["https://www.googleapis.com/auth/spreadsheets"], // akses spreadsheet
});

// ambil instance sheets
async function getSheets() {
  const client = await auth.getClient();
  return google.sheets({ version: "v4", auth: client });
}

// MIDDLEWARE

// izinkan request dari frontend
app.use(cors());

// parsing JSON body
app.use(express.json());

// FUNCTION VALIDASI

function validateAntrian(data) {
  const errors = [];

  // field wajib diisi
  const requiredFields = [
    "nama", "jk", "provinsi", "kabupaten",
    "alamat", "paspor", "negara", "sektor",
    "perusahaan", "pendidikan", "tgl", "hp", "skema"
  ];

  // cek field kosong
  requiredFields.forEach(field => {
    if (!data[field]) errors.push(`${field} wajib diisi`);
  });

  // validasi nama
  if (data.nama && data.nama.length < 3)
    errors.push("Nama minimal 3 karakter");

  // validasi paspor
  if (data.paspor && data.paspor.length < 8)
    errors.push("Paspor minimal 8 karakter");

  // validasi nomor HP
  if (data.hp && !/^08[0-9]{8,12}$/.test(data.hp))
    errors.push("Nomor HP tidak valid");

  // validasi tanggal
  if (data.tgl && !/^\d{4}-\d{2}-\d{2}$/.test(data.tgl))
    errors.push("Format tanggal harus YYYY-MM-DD");

  // enum validasi
  const allowedJK = ["L", "P"];
  const allowedSkema = ["SSW Mandiri", "Mandiri", "Cuti"];

  if (data.jk && !allowedJK.includes(data.jk))
    errors.push("Jenis kelamin tidak valid");

  if (data.skema && !allowedSkema.includes(data.skema))
    errors.push("Skema tidak valid");

  return errors;
}

// HELPER FUNCTION

// ambil prefix nomor antrian berdasarkan skema
function getPrefix(skema) {
  if (skema === "SSW Mandiri") return "SSW";
  if (skema === "Mandiri") return "M";
  if (skema === "Cuti") return "C";
  return "";
}

// generate nama sheet berdasarkan tanggal hari ini
function getTodaySheetName() {
  const today = new Date();

  const bulan = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const dd = String(today.getDate()).padStart(2, "0");
  const mm = bulan[today.getMonth()];
  const yyyy = today.getFullYear();

  return `Pelayanan_${dd}_${mm}_${yyyy}`;
}

// ROUTE: POST /antrian

app.post("/antrian", async (req, res) => {
  try {

    // CEK JAM OPERASIONAL

    const now = new Date();
    const hour = now.getHours();

    // jika di luar jam kerja → tolak
    if (hour < 8 || hour >= 16) {
      return res.status(403).json({
        message: "Layanan tutup",
        metadata: { jam_operasional: "08:00 - 16:00" }
      });
    }

    const data = req.body;


    // VALIDASI INPUT

    const errors = validateAntrian(data);

    if (errors.length > 0) {
      return res.status(400).json({
        message: "error",
        metadata: { total_error: errors.length },
        errors
      });
    }


    // RATE LIMIT (ANTI SPAM / DOUBLE CLICK)

    const nowTime = Date.now();

    // key unik per orang per hari
    const todayKey = new Date().toISOString().slice(0, 10);
    const key = `${data.nama}-${data.hp}-${data.skema}-${todayKey}`;

    // jika request terlalu cepat (<3 detik)
    if (lastRequest[key] && (nowTime - lastRequest[key] < 3000)) {
      return res.status(429).json({
        message: "Tunggu Sebentar",
        metadata: { reason: "rate_limit" }
      });
    }

    // simpan waktu request terakhir
    lastRequest[key] = nowTime;


    // GENERATE NOMOR ANTRIAN


    // ambil range hari ini
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    // cari antrian terakhir hari ini
    const last = await prisma.antrian.findFirst({
      where: {
        skema: data.skema,
        createdAt: { gte: start, lte: end }
      },
      orderBy: { createdAt: "desc" }
    });

    let nomorUrut = 1;

    // kalau ada lanjut ke nomor
    if (last) {
      const angka = parseInt(last.nomor.replace(/\D/g, ""));
      nomorUrut = angka + 1;
    }

    // ambil prefix
    const prefix = getPrefix(data.skema);

    // buat nomor 
    let nomor = prefix + String(nomorUrut).padStart(3, "0");


    // simpen ke database
    let saved = false;
    let attempt = 0;

    // retry jika nomor bentrok
    while (!saved && attempt < 3) {
      try {
        await prisma.antrian.create({
          data: {
            nomor,
            ...data,
            tgl: new Date(data.tgl),
            status: "Belum Dilayani"
          }
        });

        saved = true;

      } catch (err) {
        // jika duplicate nomor
        if (err.code === "P2002") {
          nomorUrut++;
          nomor = prefix + String(nomorUrut).padStart(3, "0");
          attempt++;
        } else {
          throw err;
        }
      }
    }


    // Simpan ke googlesheet

    const sheets = await getSheets();
    const sheetName = getTodaySheetName();

    // pastikan sheet hari ini ada
    await ensureSheetExists(sheets, sheetName);

    // insert data ke sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${sheetName}!A:O`,
      valueInputOption: "RAW",
      requestBody: {
        values: [[
          nomor,
          data.nama,
          data.jk,
          data.provinsi,
          data.kabupaten,
          data.alamat,
          data.paspor,
          data.negara,
          data.sektor,
          data.perusahaan,
          data.pendidikan,
          data.tgl,
          data.hp,
          data.skema,
          "Belum Dilayani",
          new Date().toLocaleTimeString("id-ID")
        ]]
      }
    });


    // RESPONSE KE FRONTEND

    res.json({
      message: "success",
      nomor, // penting untuk frontend
      data: {
        nama: data.nama,
        tgl: data.tgl,
        skema: data.skema
      }
    });

  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
});

// ambil semua antrian
app.get("/antrian", async (req, res) => {
  try {
    const rows = await prisma.antrian.findMany({
      orderBy: { tgl: "asc" }
    });

    // grouping berdasarkan tanggal
    const grouped = {};

    rows.forEach(item => {
      const tgl = item.tgl.toISOString().slice(0, 10);

      if (!grouped[tgl]) grouped[tgl] = [];
      grouped[tgl].push(item);
    });

    res.json({
      message: "success",
      data: grouped
    });

  } catch (err) {
    res.status(500).json({
      message: "error",
      error: err.message
    });
  }
});

// ambil antrian berdasarkan tanggal
app.get("/antrian/:tgl", async (req, res) => {
  try {
    const tgl = req.params.tgl;

    const start = new Date(tgl + "T00:00:00");
    const end = new Date(tgl + "T23:59:59");

    const data = await prisma.antrian.findMany({
      where: {
        tgl: { gte: start, lte: end }
      },
      orderBy: { nomor: "asc" }
    });

    res.json({
      message: "success",
      data: { [tgl]: data }
    });

  } catch (err) {
    res.status(500).json({
      message: "error",
      error: err.message
    });
  }
});

// run server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});