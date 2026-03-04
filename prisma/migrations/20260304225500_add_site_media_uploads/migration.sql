CREATE TABLE "SiteMedia" (
  "id" SERIAL NOT NULL,
  "key" TEXT NOT NULL,
  "contentType" TEXT NOT NULL,
  "content" BYTEA NOT NULL,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteMedia_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteMedia_key_key" ON "SiteMedia"("key");
