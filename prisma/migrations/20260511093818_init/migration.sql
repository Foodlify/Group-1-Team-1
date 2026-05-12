-- CreateTable
CREATE TABLE "CartArchive" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "customerId" INTEGER NOT NULL,
    "restaurantId" INTEGER NOT NULL,
    "totalPrice" DECIMAL(10,2),
    "archivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cartData" JSONB NOT NULL,

    CONSTRAINT "CartArchive_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CartArchive_cartId_idx" ON "CartArchive"("cartId");

-- CreateIndex
CREATE INDEX "CartArchive_customerId_idx" ON "CartArchive"("customerId");

-- CreateIndex
CREATE INDEX "CartArchive_restaurantId_idx" ON "CartArchive"("restaurantId");
