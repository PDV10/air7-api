-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "isOnSale" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "salePrice" DECIMAL(65,30);
