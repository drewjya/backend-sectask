/*
  Warnings:

  - You are about to drop the column `chatRoomId` on the `SubProject` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SubProject" DROP CONSTRAINT "SubProject_chatRoomId_fkey";

-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "SubProject" DROP COLUMN "chatRoomId";
