-- Add configurable accent RGB channels for global theme color.
ALTER TABLE "Profile"
ADD COLUMN "accentRed" INTEGER NOT NULL DEFAULT 255,
ADD COLUMN "accentGreen" INTEGER NOT NULL DEFAULT 153,
ADD COLUMN "accentBlue" INTEGER NOT NULL DEFAULT 0;
