-- Backfill Profile defaults only when fields are empty/null
UPDATE "Profile"
SET
  "availability" = CASE WHEN "availability" IS NULL OR trim("availability") = '' THEN 'Available for work' ELSE "availability" END,
  "brandName" = CASE WHEN "brandName" IS NULL OR trim("brandName") = '' THEN 'Portfolio' ELSE "brandName" END,
  "heroTagline" = CASE WHEN "heroTagline" IS NULL OR trim("heroTagline") = '' THEN 'builds in the cloud.' ELSE "heroTagline" END,
  "linkedinUrl" = CASE WHEN "linkedinUrl" IS NULL OR trim("linkedinUrl") = '' THEN 'https://www.linkedin.com/in/mark-andrei-castillo-1741302a0/' ELSE "linkedinUrl" END,
  "github" = CASE WHEN "github" IS NULL OR trim("github") = '' THEN 'https://github.com/draiimon' ELSE "github" END,
  "about" = CASE WHEN "about" IS NULL OR trim("about") = '' THEN 'Entry-level DevOps and Software Developer focused on building practical applications and reliable systems, with leadership experience from student organizations and a passion for learning new technologies.' ELSE "about" END
WHERE TRUE;

-- Seed a default featured project if none exists
INSERT INTO "Project" ("name", "tagline", "description", "techStack", "link", "githubUrl", "highlight", "createdAt", "updatedAt")
SELECT
  'PanicSense PH',
  'Real-time disaster signal monitoring',
  'Real-time disaster signal monitoring with multilingual sentiment analysis to surface urgent areas faster.',
  'Python / NLP / mBERT / Bi-GRU / LSTM',
  'https://panicsenseph.ct.ws/',
  'https://github.com/draiimon/Thesis-PanicSense/tree/main',
  TRUE,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "Project");

-- Seed default Experience entries if none exists
INSERT INTO "Experience" ("role", "company", "period", "summary", "sortOrder", "createdAt", "updatedAt")
SELECT * FROM (
  VALUES
    ('Cloud DevOps Intern', 'Oaktree Innovations', 'Mar 2025 - May 2025', 'Assisted with AWS infrastructure tasks, improved CI/CD workflows, and supported deployment automation.', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('BS Computer Science', 'Technological Institute of the Philippines - Manila', '2021 - 2025', 'Recent graduate with hands-on project experience in cloud, AI, and full-stack development.', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS v("role", "company", "period", "summary", "sortOrder", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "Experience");

-- Seed default Leadership entries if none exists
INSERT INTO "Leadership" ("org", "role", "period", "sortOrder", "createdAt", "updatedAt")
SELECT * FROM (
  VALUES
    ('Microsoft Student Community - TIP Manila', 'TSMP & Communication Committee, LORSO Rep', '2021 - 2025', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('League of Recognized Student Organizations - TIP Manila', 'Assistant Secretary, Project Manager (Operations)', '2023 - 2025', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('AWS Cloud Club - TIP Manila', 'Vice-Chief Relations Officer', '2024', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('ICONS (Information & Computing Organization of Networked Students)', 'Treasurer, Public Relations Officer, Communications Head', '2021 - 2024', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('UPHSD SHS Alumni Association', 'Public Information Officer', '2024 - 2027', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS v("org", "role", "period", "sortOrder", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "Leadership");

-- Seed default Achievement entries if none exists
INSERT INTO "Achievement" ("text", "sortOrder", "createdAt", "updatedAt")
SELECT * FROM (
  VALUES
    ('With Honor Distinction (BS Computer Science)', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Service Excellence Award', 2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Service Stewardship Award', 3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Built and deployed practical cloud/AI projects including PanicSense PH thesis', 4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
    ('Hands-on Cloud DevOps internship experience at Oaktree Innovations', 5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
) AS v("text", "sortOrder", "createdAt", "updatedAt")
WHERE NOT EXISTS (SELECT 1 FROM "Achievement");
