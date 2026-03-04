-- CreateTable
CREATE TABLE "Tagline" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tagline_pkey" PRIMARY KEY ("id")
);

-- Seed previous hardcoded rotating taglines if table is empty
INSERT INTO "Tagline" ("text", "sortOrder", "createdAt", "updatedAt")
SELECT * FROM (
  VALUES
    ('builds practical DevOps workflows.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ships clean full-stack applications.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('creates reliable software systems.', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('leads teams with service and focus.', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('improves delivery through automation.', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS v("text", "sortOrder", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "Tagline");