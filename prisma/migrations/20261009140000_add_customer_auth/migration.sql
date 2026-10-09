-- AlterTable: add auth fields to customers (backfill existing rows with empty password, must be reset)
ALTER TABLE "customers" ADD COLUMN "password" TEXT NOT NULL DEFAULT '';
ALTER TABLE "customers" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "customers" ADD COLUMN "passwordResetToken" TEXT;
ALTER TABLE "customers" ADD COLUMN "passwordResetExpires" TIMESTAMP(3);

-- Drop defaults so future rows must supply password explicitly
ALTER TABLE "customers" ALTER COLUMN "password" DROP DEFAULT;
ALTER TABLE "customers" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- CreateIndex
CREATE UNIQUE INDEX "customers_passwordResetToken_key" ON "customers"("passwordResetToken");
