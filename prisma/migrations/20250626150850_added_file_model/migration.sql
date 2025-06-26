/*
  Warnings:

  - You are about to drop the column `uploaded` on the `File` table. All the data in the column will be lost.
  - Added the required column `ownerId` to the `File` table without a default value. This is not possible if the table is not empty.
  - Made the column `ownerId` on table `Folder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "File" DROP CONSTRAINT "File_folderId_fkey";

-- DropForeignKey
ALTER TABLE "Folder" DROP CONSTRAINT "Folder_ownerId_fkey";

-- AlterTable
ALTER TABLE "File" DROP COLUMN "uploaded",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "mimeType" TEXT,
ADD COLUMN     "ownerId" TEXT NOT NULL,
ADD COLUMN     "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "url" TEXT;

-- AlterTable
ALTER TABLE "Folder" ALTER COLUMN "ownerId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Folder" ADD CONSTRAINT "Folder_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_folderId_fkey" FOREIGN KEY ("folderId") REFERENCES "Folder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
