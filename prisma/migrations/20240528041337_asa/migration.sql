/*
  Warnings:

  - The values [GUEST] on the enum `SubprojectRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SubprojectRole_new" AS ENUM ('PM', 'DEVELOPER', 'TECHNICAL_WRITER', 'VIEWER', 'CONSULTANT');
ALTER TABLE "SubprojectMember" ALTER COLUMN "role" TYPE "SubprojectRole_new" USING ("role"::text::"SubprojectRole_new");
ALTER TYPE "SubprojectRole" RENAME TO "SubprojectRole_old";
ALTER TYPE "SubprojectRole_new" RENAME TO "SubprojectRole";
DROP TYPE "SubprojectRole_old";
COMMIT;
