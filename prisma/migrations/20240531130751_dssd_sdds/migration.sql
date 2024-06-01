/*
  Warnings:

  - You are about to drop the column `cvssDetailId` on the `findings` table. All the data in the column will be lost.
  - You are about to drop the `_ChatRoomToFinding` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cvss_details` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[descriptionId]` on the table `findings` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[threatAndRiskId]` on the table `findings` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `findingId` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `ChatRoom` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "_ChatRoomToFinding" DROP CONSTRAINT "_ChatRoomToFinding_A_fkey";

-- DropForeignKey
ALTER TABLE "_ChatRoomToFinding" DROP CONSTRAINT "_ChatRoomToFinding_B_fkey";

-- DropForeignKey
ALTER TABLE "findings" DROP CONSTRAINT "findings_cvssDetailId_fkey";

-- DropForeignKey
ALTER TABLE "findings" DROP CONSTRAINT "findings_descriptionId_fkey";

-- DropForeignKey
ALTER TABLE "findings" DROP CONSTRAINT "findings_threatAndRiskId_fkey";

-- AlterTable
ALTER TABLE "ChatRoom" ADD COLUMN     "findingId" INTEGER NOT NULL,
ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "findings" DROP COLUMN "cvssDetailId";

-- DropTable
DROP TABLE "_ChatRoomToFinding";

-- DropTable
DROP TABLE "cvss_details";

-- DropTable
DROP TABLE "documents";

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CvssDetail" (
    "id" SERIAL NOT NULL,
    "data" JSONB NOT NULL,
    "findingId" INTEGER NOT NULL,

    CONSTRAINT "CvssDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CvssDetail_findingId_key" ON "CvssDetail"("findingId");

-- CreateIndex
CREATE UNIQUE INDEX "findings_descriptionId_key" ON "findings"("descriptionId");

-- CreateIndex
CREATE UNIQUE INDEX "findings_threatAndRiskId_key" ON "findings"("threatAndRiskId");

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_descriptionId_fkey" FOREIGN KEY ("descriptionId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "findings" ADD CONSTRAINT "findings_threatAndRiskId_fkey" FOREIGN KEY ("threatAndRiskId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CvssDetail" ADD CONSTRAINT "CvssDetail_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChatRoom" ADD CONSTRAINT "ChatRoom_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "findings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
