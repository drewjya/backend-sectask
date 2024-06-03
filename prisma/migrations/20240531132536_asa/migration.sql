/*
  Warnings:

  - Added the required column `type` to the `DocumentWrapper` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('DESCRIPTION', 'THREAT');

-- AlterTable
ALTER TABLE "DocumentWrapper" ADD COLUMN     "type" "DocType" NOT NULL;
