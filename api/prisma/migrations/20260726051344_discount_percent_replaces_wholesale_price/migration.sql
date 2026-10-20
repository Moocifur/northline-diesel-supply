-- AlterTable
ALTER TABLE "Part" DROP COLUMN "wholesalePrice";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "wholesaleDiscountPercent" INTEGER NOT NULL DEFAULT 0;
