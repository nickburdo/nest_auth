/*
  Warnings:

  - The `provider` column on the `users` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE');

-- AlterTable
ALTER TABLE "users" DROP COLUMN "provider",
ADD COLUMN     "provider" "AuthProvider";

-- DropEnum
DROP TYPE "Provider";
