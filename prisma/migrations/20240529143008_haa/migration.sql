/*
  Warnings:

  - You are about to drop the column `ac` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `ar` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `at` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `au` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `av` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `cr` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `e` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `ir` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mac` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mat` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mav` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mpr` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `msa` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `msc` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `msi` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mui` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mva` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mvc` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `mvi` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `pr` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `r` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `re` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `s` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `sa` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `sc` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `si` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `u` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `ui` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `v` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `va` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `vc` on the `CvssDetail` table. All the data in the column will be lost.
  - You are about to drop the column `vi` on the `CvssDetail` table. All the data in the column will be lost.
  - Added the required column `data` to the `CvssDetail` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CvssDetail" DROP COLUMN "ac",
DROP COLUMN "ar",
DROP COLUMN "at",
DROP COLUMN "au",
DROP COLUMN "av",
DROP COLUMN "cr",
DROP COLUMN "e",
DROP COLUMN "ir",
DROP COLUMN "mac",
DROP COLUMN "mat",
DROP COLUMN "mav",
DROP COLUMN "mpr",
DROP COLUMN "msa",
DROP COLUMN "msc",
DROP COLUMN "msi",
DROP COLUMN "mui",
DROP COLUMN "mva",
DROP COLUMN "mvc",
DROP COLUMN "mvi",
DROP COLUMN "pr",
DROP COLUMN "r",
DROP COLUMN "re",
DROP COLUMN "s",
DROP COLUMN "sa",
DROP COLUMN "sc",
DROP COLUMN "si",
DROP COLUMN "u",
DROP COLUMN "ui",
DROP COLUMN "v",
DROP COLUMN "va",
DROP COLUMN "vc",
DROP COLUMN "vi",
ADD COLUMN     "data" JSONB NOT NULL;
