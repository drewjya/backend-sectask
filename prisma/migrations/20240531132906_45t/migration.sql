/*
  Warnings:

  - The primary key for the `DocumentWrapper` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropIndex
DROP INDEX "DocumentWrapper_documentId_key";

-- AlterTable
ALTER TABLE "DocumentWrapper" DROP CONSTRAINT "DocumentWrapper_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "DocumentWrapper_pkey" PRIMARY KEY ("id");
