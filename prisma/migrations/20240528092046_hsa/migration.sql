-- AlterTable
ALTER TABLE "File" ADD COLUMN     "originalName" TEXT;

-- DropEnum
DROP TYPE "EntryType";
