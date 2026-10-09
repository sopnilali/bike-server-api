-- CreateEnum
CREATE TYPE "Role" AS ENUM ('customer', 'staff', 'admin');

-- AlterTable
ALTER TABLE "customers" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'customer';
