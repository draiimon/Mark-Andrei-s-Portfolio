import { pool } from "@workspace/db";

export class EditorError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function database() {
  if (!pool) throw new EditorError(503, "Saving requires a configured DATABASE_URL. No changes were saved.");
  return pool;
}

const profileRequired = "fullName headline location email phone github objective about skills".split(" ");
export const profileFields = [...profileRequired, ..."linkedinUrl facebookUrl discordUrl instagramUrl spotifyUrl musicUrl cloudinaryCloudName cloudinaryUploadPreset availability brandName heroTagline tabTitle faviconUrl socialImageUrl featuredLabel experienceTitle leadershipTitle achievementsTitle contactLabel footerCenterText footerRightText aiBehaviorPrompt viewCount".split(" ")];
export const collections = {
  projects: { table: "Project", fields: ["name", "tagline", "description", "techStack", "link", "githubUrl", "highlight"], required: ["name", "tagline", "description", "techStack"] },
  experience: { table: "Experience", fields: ["role", "company", "period", "summary", "sortOrder"], required: ["role", "company", "period", "summary"] },
  leadership: { table: "Leadership", fields: ["org", "role", "period", "sortOrder"], required: ["org", "role", "period"] },
  achievements: { table: "Achievement", fields: ["text", "sortOrder"], required: ["text"] },
  taglines: { table: "Tagline", fields: ["text", "sortOrder"], required: ["text"] },
} as const;
export type Collection = keyof typeof collections;

export function validate(body: unknown, section: Collection | "profile", creating = false) {
  if (!body || typeof body !== "object" || Array.isArray(body)) throw new EditorError(400, "Send a JSON object.");
  const fields: readonly string[] = section === "profile" ? profileFields : collections[section].fields;
  const required: readonly string[] = section === "profile" ? profileRequired : collections[section].required;
  const patch: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(body)) {
    if (!fields.includes(key)) throw new EditorError(400, `Unknown field: ${key}`);
    if (key === "viewCount" || key === "sortOrder") {
      if (typeof value !== "number" || !Number.isInteger(value) || value < 0 || value > 2147483647) throw new EditorError(400, `${key} must be a non-negative integer.`);
    } else if (key === "highlight") {
      if (typeof value !== "boolean") throw new EditorError(400, "highlight must be true or false.");
    } else if (value === null && !required.includes(key)) {
      patch[key] = null;
      continue;
    } else if (typeof value !== "string" || value.length > 30000 || value.includes("\u0000")) {
      throw new EditorError(400, `${key} must be text (up to 30,000 characters).`);
    }
    if (typeof value === "string" && required.includes(key) && !value.trim()) throw new EditorError(400, `${key} is required.`);
    if (typeof value === "string" && ["link", "githubUrl", "github", "linkedinUrl", "facebookUrl", "instagramUrl", "spotifyUrl", "musicUrl", "faviconUrl", "socialImageUrl"].includes(key) && value.trim()) {
      const url = value.trim();
      if (!/^https?:\/\/[^\s]+$/i.test(url) && !/^\/(?!\/)[^\s]*$/.test(url)) throw new EditorError(400, `${key} must be an https:// URL or a local /path.`);
    }
    patch[key] = value;
  }
  if (creating) for (const key of required) if (!(key in patch)) throw new EditorError(400, `${key} is required.`);
  if (!Object.keys(patch).length) throw new EditorError(400, "No editable fields supplied.");
  return patch;
}

// Table/column names come exclusively from the allowlists above; values stay parameterized.
export async function updateRow(table: string, id: number, patch: Record<string, unknown>) {
  const keys = Object.keys(patch);
  const result = await database().query(`UPDATE "${table}" SET ${keys.map((key, i) => `"${key}" = $${i + 1}`).join(", ")}, "updatedAt" = NOW() WHERE "id" = $${keys.length + 1} RETURNING *`, [...Object.values(patch), id]);
  if (!result.rows.length) throw new EditorError(404, "This item no longer exists. Refresh the editor.");
  return result.rows[0];
}
