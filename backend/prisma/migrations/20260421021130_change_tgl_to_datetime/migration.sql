/*
  Warnings:

  - Changed the type of `tgl` on the `Antrian` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Antrian" DROP COLUMN "tgl",
ADD COLUMN     "tgl" TIMESTAMP(3) NOT NULL;
