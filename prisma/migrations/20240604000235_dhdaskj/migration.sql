-- DropForeignKey
ALTER TABLE "VersionList" DROP CONSTRAINT "VersionList_findingId_fkey";

-- AddForeignKey
ALTER TABLE "VersionList" ADD CONSTRAINT "VersionList_findingId_fkey" FOREIGN KEY ("findingId") REFERENCES "Finding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
