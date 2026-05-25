/*
  Warnings:

  - A unique constraint covering the columns `[nomor,tgl,skema]` on the table `Antrian` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Antrian_nomor_tgl_skema_key" ON "Antrian"("nomor", "tgl", "skema");
