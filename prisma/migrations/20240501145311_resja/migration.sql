/*
  Warnings:

  - You are about to drop the column `previousChatId` on the `Chat` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_previousChatId_fkey";

-- DropIndex
DROP INDEX "Chat_previousChatId_key";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "previousChatId";
