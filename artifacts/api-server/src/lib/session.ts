export function getSessionSecret() {
  return process.env.SESSION_SECRET?.trim() || process.env.NEXTAUTH_SECRET?.trim() || "";
}