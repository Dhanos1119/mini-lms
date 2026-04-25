-- AlterTable
ALTER TABLE "User" ADD COLUMN     "courseDuration" INTEGER,
ADD COLUMN     "phoneNumber" TEXT,
ADD COLUMN     "status" TEXT DEFAULT 'Active';
