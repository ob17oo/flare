-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "image_url" TEXT NOT NULL,
    "launcher" TEXT NOT NULL,
    "launcher_url" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "gameEdition" TEXT NOT NULL DEFAULT 'Standart',

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
