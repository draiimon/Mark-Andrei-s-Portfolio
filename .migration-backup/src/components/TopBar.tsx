import { Cloud, Eye } from "lucide-react";

type TopBarProps = {
  brand: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
  discordUrl?: string | null;
  instagramUrl?: string | null;
  spotifyUrl?: string | null;
  viewCount?: number;
};

function extractInstagramHandle(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("instagram.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    const first = parts[0];
    if (!first) return null;
    const blocked = new Set(["p", "reel", "reels", "stories", "explore"]);
    if (blocked.has(first.toLowerCase())) return null;
    return `@${decodeURIComponent(first)}`;
  } catch {
    return null;
  }
}

function extractSpotifyHandle(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url);
    if (!u.hostname.includes("spotify.com")) return null;
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    if (parts[0].toLowerCase() === "user") return `@${decodeURIComponent(parts[1])}`;
    return `${parts[0]}: ${decodeURIComponent(parts[1])}`;
  } catch {
    return null;
  }
}

export default function TopBar({ brand, linkedinUrl, githubUrl, discordUrl, instagramUrl, spotifyUrl, viewCount }: TopBarProps) {
  const linkedinHref = linkedinUrl || "#";
  const githubHref = githubUrl || "#";
  const hasLinkedIn = Boolean(linkedinUrl);
  const hasGitHub = Boolean(githubUrl);
  const discordHandle = discordUrl?.trim() || "Discord username";
  const instagramHandle = extractInstagramHandle(instagramUrl);
  const spotifyHandle = extractSpotifyHandle(spotifyUrl);
  const socialLinks = [
    { key: "discord", href: null, label: "Discord" },
    { key: "instagram", href: instagramUrl, label: "Instagram", hover: instagramHandle || "Instagram profile" },
    { key: "spotify", href: spotifyUrl, label: "Spotify", hover: spotifyHandle || "Spotify profile" }
  ];

  return (
    <header className="topbar mb-4 flex flex-col gap-3 sm:mb-5 sm:flex-row sm:items-start sm:justify-between sm:gap-3">
      <div className="min-w-0">
        <span className="inline-flex min-w-0 items-center gap-1 text-base font-extrabold sm:gap-2 sm:text-xl md:text-2xl">
          <Cloud className="h-5 w-5 text-awsOrange" />
          <span className="brand-wave music-reactive-brand whitespace-normal">
            {brand.split("").map((ch, idx) => (
              <span
                key={`${ch}-${idx}`}
                className="brand-letter"
                style={{ animationDelay: `${idx * 0.04}s`, ["--i" as any]: idx }}
              >
                {ch === " " ? "\u00A0" : ch}
              </span>
            ))}
          </span>
        </span>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          {socialLinks.map((item) => {
            const iconMarkup = (
              <svg viewBox="0 0 24 24" className="h-[1.35rem] w-[1.35rem] fill-current" aria-hidden="true">
                {item.key === "discord" && (
                  <path d="M20.32 4.37A19.8 19.8 0 0 0 15.53 3a13.6 13.6 0 0 0-.62 1.28 18.3 18.3 0 0 0-5.82 0A13.6 13.6 0 0 0 8.47 3a19.7 19.7 0 0 0-4.79 1.37C.67 8.95-.16 13.4.26 17.79A19.9 19.9 0 0 0 6.1 20.7c.47-.64.89-1.32 1.25-2.03-.69-.26-1.35-.58-1.98-.96.17-.12.33-.25.49-.38 3.83 1.8 7.99 1.8 11.77 0 .16.13.32.26.49.38-.63.38-1.29.7-1.98.96.36.71.78 1.39 1.25 2.03a19.8 19.8 0 0 0 5.84-2.91c.49-5.1-.84-9.51-2.91-13.42ZM8.43 15.1c-1.15 0-2.09-1.05-2.09-2.34 0-1.3.92-2.34 2.09-2.34 1.18 0 2.11 1.05 2.09 2.34 0 1.29-.92 2.34-2.09 2.34Zm7.14 0c-1.15 0-2.09-1.05-2.09-2.34 0-1.3.92-2.34 2.09-2.34 1.18 0 2.11 1.05 2.09 2.34 0 1.29-.91 2.34-2.09 2.34Z" />
                )}
                {item.key === "instagram" && (
                  <>
                    <path d="M7.25 2h9.5A5.25 5.25 0 0 1 22 7.25v9.5A5.25 5.25 0 0 1 16.75 22h-9.5A5.25 5.25 0 0 1 2 16.75v-9.5A5.25 5.25 0 0 1 7.25 2Zm0 1.8A3.45 3.45 0 0 0 3.8 7.25v9.5a3.45 3.45 0 0 0 3.45 3.45h9.5a3.45 3.45 0 0 0 3.45-3.45v-9.5a3.45 3.45 0 0 0-3.45-3.45h-9.5Z" />
                    <path d="M12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z" />
                    <circle cx="17.4" cy="6.6" r="1.1" />
                  </>
                )}
                {item.key === "spotify" && (
                  <>
                    <path d="M12 2a10 10 0 1 0 10 10A10.01 10.01 0 0 0 12 2Zm4.43 14.42a.8.8 0 0 1-1.1.26 9.8 9.8 0 0 0-9.96-.58.8.8 0 1 1-.73-1.43 11.4 11.4 0 0 1 11.6.68.8.8 0 0 1 .19 1.07Zm1.2-2.9a1 1 0 0 1-1.38.33 12.2 12.2 0 0 0-12.2-.71 1 1 0 1 1-.88-1.8 14.2 14.2 0 0 1 14.2.82 1 1 0 0 1 .26 1.36Zm.14-3.04a15 15 0 0 0-14.71-.85 1.2 1.2 0 1 1-1.04-2.16 17.4 17.4 0 0 1 17.06.99 1.2 1.2 0 1 1-1.31 2.02Z" />
                  </>
                )}
              </svg>
            );

            if (item.key === "discord") {
              return (
                <span key={item.key} aria-label={item.label} className="group relative inline-flex glow-icon-link">
                  {iconMarkup}
                  <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {discordHandle}
                  </span>
                </span>
              );
            }

            if (!item.href) {
              return (
                <span
                  key={item.key}
                  aria-label={item.label}
                  className="glow-icon-link icon-unset"
                  title={`${item.label} (set link in edit)`}
                >
                  {iconMarkup}
                </span>
              );
            }

            return (
              <a
                key={item.key}
                href={item.href}
                target="_blank"
                rel="noreferrer"
                aria-label={item.label}
                className="group relative inline-flex glow-icon-link"
              >
                {iconMarkup}
                <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                  {item.hover}
                </span>
              </a>
            );
          })}
          <p className="group relative inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-200">
            <span className="inline-flex">
              <Eye className="h-[1.125rem] w-[1.125rem] text-awsOrange" />
            </span>
            {(viewCount ?? 0).toLocaleString()}
            <span className="pointer-events-none absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded bg-black/85 px-1.5 py-0.5 text-[10px] font-medium normal-case tracking-normal text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100">
              Profile views
            </span>
          </p>
        </div>
      </div>
      <nav className="flex min-w-0 flex-wrap items-center gap-3 text-xs font-bold text-white sm:gap-3 sm:text-sm md:gap-4 md:text-base">
        <a href="/api/resume" target="_blank" rel="noreferrer" className="nav-link">Resume</a>
        <a href={linkedinHref} target="_blank" rel="noreferrer" className={`nav-link ${!hasLinkedIn ? "pointer-events-none opacity-40" : ""}`}>LinkedIn</a>
        <a href={githubHref} target="_blank" rel="noreferrer" className={`nav-link ${!hasGitHub ? "pointer-events-none opacity-40" : ""}`}>GitHub</a>
      </nav>
    </header>
  );
}
