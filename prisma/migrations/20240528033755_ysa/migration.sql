/*
  Warnings:

  - Added the required column `cvssDetail` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CVSS_VALUE" AS ENUM ('C0', 'C1', 'C2', 'C3');

-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "cvssDetail" "CVSS_VALUE" NOT NULL;

-- CreateTable
CREATE TABLE "CvssDetail" (
    "id" SERIAL NOT NULL,
    "av" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ac" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "at" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "pr" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ui" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "vc" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "vi" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "va" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "sc" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "si" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "sa" "CVSS_VALUE" NOT NULL DEFAULT 'C2',
    "s" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "au" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "r" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "v" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "re" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "u" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mav" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mac" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mat" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mpr" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mui" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mvc" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mvi" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "mva" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "msc" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "msi" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "msa" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "cr" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ir" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "ar" "CVSS_VALUE" NOT NULL DEFAULT 'C0',
    "e" "CVSS_VALUE" NOT NULL DEFAULT 'C0',

    CONSTRAINT "CvssDetail_pkey" PRIMARY KEY ("id")
);
