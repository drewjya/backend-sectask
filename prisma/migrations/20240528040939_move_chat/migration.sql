/*
  Warnings:

  - Added the required column `chatRoomId` to the `Finding` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "SubProject" DROP CONSTRAINT "SubProject_chatRoomId_fkey";

-- AlterTable
ALTER TABLE "Finding" ADD COLUMN     "chatRoomId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "SubProject" ALTER COLUMN "chatRoomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "SubProject" ADD CONSTRAINT "SubProject_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
