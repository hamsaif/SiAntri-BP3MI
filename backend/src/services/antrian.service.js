const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const { validateAntrian } = require("../utils/validator");
const { getPrefix } = require("../utils/helper");
const { insertRow } = require("../config/sheets");



// CREATE ANTRIAN

const create = async (data) => {

  // VALIDASI
  const errors = validateAntrian(data);
  if (errors.length > 0) {
    throw { status: 400, message: errors[0] };
  }

  // JAM OPERASIONAL
  const hour = new Date().getHours();
  if (hour < 8 || hour >= 22.00) {
    throw { status: 403, message: "Layanan tutup" };
  }

  // NOMOR ANTRIAN HARI INI
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const end = new Date();
  end.setHours(23, 59, 59, 999);

  const last = await prisma.antrian.findFirst({
    where: {
      skema: data.skema,
      createdAt: { gte: start, lte: end }
    },
    orderBy: { createdAt: "desc" }
  });

  let nomorUrut = last
    ? parseInt(last.nomor.replace(/\D/g, "")) + 1
    : 1;

  const prefix = getPrefix(data.skema);
  let nomor = prefix + String(nomorUrut).padStart(3, "0");

  // SAVE DB (ANTI TABRAKAN)
  let saved = false;
  let attempt = 0;

  while (!saved && attempt < 3) {
    try {
      await prisma.antrian.create({
        data: {
          ...data,
          nomor,
          tgl: new Date(data.tgl),
          status: "Belum Dilayani"
        }
      });

      saved = true;

    } catch (err) {
      if (err.code === "P2002") {
        nomorUrut++;
        nomor = prefix + String(nomorUrut).padStart(3, "0");
        attempt++;
      } else {
        throw err;
      }
    }
  }

  // SIMPAN KE GOOGLE SHEETS
  await insertRow([
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
  ]);

  return {
    nomor,
    nama: data.nama,
    tgl: data.tgl,
    skema: data.skema
  };
};



// GET ALL ANTRIAN

const getAll = async () => {
  const rows = await prisma.antrian.findMany({
    orderBy: { tgl: "asc" }
  });

  const grouped = {};

  rows.forEach(item => {
    const tgl = item.tgl.toISOString().slice(0, 10);

    if (!grouped[tgl]) {
      grouped[tgl] = [];
    }

    grouped[tgl].push(item);
  });

  return grouped;
};



// GET BY TANGGAL

const getByTanggal = async (tgl) => {
  const start = new Date(tgl + "T00:00:00");
  const end = new Date(tgl + "T23:59:59");

  return await prisma.antrian.findMany({
    where: {
      tgl: {
        gte: start,
        lte: end
      }
    },
    orderBy: { nomor: "asc" }
  });
};



// EXPORT SEMUA

module.exports = {
  create,
  getAll,
  getByTanggal
};