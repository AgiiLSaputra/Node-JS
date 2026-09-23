-- CreateTable
CREATE TABLE "buku" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "genre" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buku_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "buku_title_idx" ON "buku"("title");

-- CreateIndex
CREATE INDEX "buku_author_idx" ON "buku"("author");

-- CreateIndex
CREATE INDEX "buku_genre_idx" ON "buku"("genre");
