export function normalizeProjectUrl(value: unknown): string | null {
  if (value == null) return null;
  const trimmed = String(value).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export type ProjectWriteBody = {
  name?: unknown;
  tagline?: unknown;
  description?: unknown;
  techStack?: unknown;
  link?: unknown;
  githubUrl?: unknown;
  highlight?: unknown;
};

export function buildProjectWriteData(body: ProjectWriteBody) {
  return {
    ...(body.name != null && { name: String(body.name) }),
    ...(body.tagline != null && { tagline: String(body.tagline) }),
    ...(body.description != null && { description: String(body.description) }),
    ...(body.techStack != null && { techStack: String(body.techStack) }),
    ...(body.link !== undefined && { link: normalizeProjectUrl(body.link) }),
    ...(body.githubUrl !== undefined && { githubUrl: normalizeProjectUrl(body.githubUrl) }),
    ...(body.highlight != null && { highlight: Boolean(body.highlight) })
  };
}
