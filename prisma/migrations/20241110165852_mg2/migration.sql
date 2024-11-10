/*
  Warnings:

  - You are about to drop the `ValidTokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "ValidTokens";

-- CreateTable
CREATE TABLE "ValidToken" (
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ValidToken_token_key" ON "ValidToken"("token");
