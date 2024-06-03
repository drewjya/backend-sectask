-- DropForeignKey
ALTER TABLE "DocumentWrapper" DROP CONSTRAINT "DocumentWrapper_documentId_fkey";

-- AddForeignKey
ALTER TABLE "DocumentWrapper" ADD CONSTRAINT "DocumentWrapper_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "Document"("id") ON DELETE CASCADE ON UPDATE CASCADE;
