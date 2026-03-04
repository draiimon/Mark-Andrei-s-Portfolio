import { Cloud } from "lucide-react";

type TopBarProps = {
  brand: string;
  linkedinUrl?: string | null;
  githubUrl?: string | null;
};

export default function TopBar({ brand, linkedinUrl, githubUrl }: TopBarProps) {
  const linkedinHref = linkedinUrl || "#";
  const githubHref = githubUrl || "#";
  const hasLinkedIn = Boolean(linkedinUrl);
  const hasGitHub = Boolean(githubUrl);

  return (
    <header className="topbar mb-12 flex items-center justify-between gap-2 sm:mb-14 sm:gap-3">
      <span className="inline-flex min-w-0 items-center gap-1 text-[13px] font-extrabold sm:gap-2 sm:text-lg md:text-xl">
        <Cloud className="h-5 w-5 text-amber-500" />
        <span className="brand-wave whitespace-nowrap">
          {brand.split("").map((ch, idx) => (
            <span
              key={`${ch}-${idx}`}
              className="brand-letter"
              style={{ animationDelay: `${idx * 0.04}s` }}
            >
              {ch === " " ? "\u00A0" : ch}
            </span>
          ))}
        </span>
      </span>
      <nav className="flex min-w-0 items-center gap-1.5 whitespace-nowrap text-[10px] font-bold text-white sm:gap-3 sm:text-sm md:gap-4 md:text-base">
        <a href="/api/resume" target="_blank" rel="noreferrer" className="nav-link">Resume</a>
        <a href={linkedinHref} target="_blank" rel="noreferrer" className={`nav-link ${!hasLinkedIn ? "pointer-events-none opacity-40" : ""}`}>LinkedIn</a>
        <a href={githubHref} target="_blank" rel="noreferrer" className={`nav-link ${!hasGitHub ? "pointer-events-none opacity-40" : ""}`}>GitHub</a>
      </nav>
    </header>
  );
}
