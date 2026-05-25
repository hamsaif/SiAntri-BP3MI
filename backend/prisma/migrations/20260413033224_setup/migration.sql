-- CreateTable
CREATE TABLE "Antrian" (
    "id" SERIAL NOT NULL,
    "nomor" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jk" TEXT NOT NULL,
    "provinsi" TEXT NOT NULL,
    "kabupaten" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "paspor" TEXT NOT NULL,
    "negara" TEXT NOT NULL,
    "sektor" TEXT NOT NULL,
    "perusahaan" TEXT NOT NULL,
    "pendidikan" TEXT NOT NULL,
    "tgl" TEXT NOT NULL,
    "hp" TEXT NOT NULL,
    "skema" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Belum Dilayani',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Antrian_pkey" PRIMARY KEY ("id")
);
