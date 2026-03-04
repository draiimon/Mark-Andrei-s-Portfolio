-- CreateTable
CREATE TABLE "Resume" (
    "id" SERIAL NOT NULL,
    "fileName" TEXT NOT NULL DEFAULT 'resume.pdf',
    "content" BYTEA NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);
