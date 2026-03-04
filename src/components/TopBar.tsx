"use client";

import { Cloud } from "lucide-react";

export default function TopBar() {
  const brand = "To the clouds.";

  return (
    <header className="topbar mb-14 flex items-center justify-between">
      <span className="inline-flex items-center gap-2 text-lg font-extrabold md:text-xl">
        <Cloud className="h-5 w-5 text-amber-500" />
        <span className="brand-wave">
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
      <nav className="flex items-center gap-3 text-sm font-bold text-white md:gap-4 md:text-base">
        <a href="/api/resume" target="_blank" rel="noreferrer" className="nav-link">Resume</a>
        <a href="https://www.linkedin.com/in/mark-andrei-castillo-1741302a0/" target="_blank" rel="noreferrer" className="nav-link">LinkedIn</a>
        <a href="https://github.com/draiimon" target="_blank" rel="noreferrer" className="nav-link">GitHub</a>
      </nav>
    </header>
  );
}
