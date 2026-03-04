-- Add editable homepage labels, footer text, social preview image, and AI behavior config
ALTER TABLE "Profile"
  ADD COLUMN "socialImageUrl" TEXT,
  ADD COLUMN "featuredLabel" TEXT,
  ADD COLUMN "experienceTitle" TEXT,
  ADD COLUMN "leadershipTitle" TEXT,
  ADD COLUMN "achievementsTitle" TEXT,
  ADD COLUMN "contactLabel" TEXT,
  ADD COLUMN "footerCenterText" TEXT,
  ADD COLUMN "footerRightText" TEXT,
  ADD COLUMN "aiBehaviorPrompt" TEXT;
