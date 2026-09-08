import type { ReactNode } from "react";
import ClientTabMeta from "@/components/ClientTabMeta";
import GlobalBackgroundMusic from "@/components/GlobalBackgroundMusic";
import MoonCursor from "@/components/MoonCursor";
import { resolveMusicEmbed } from "@/lib/music";

export default function AppShell({ children }: { children: ReactNode }) {
  const music = resolveMusicEmbed("/uploads/music/1772698457967-vuu52gsd.mp3");

  return (
    <>
      <ClientTabMeta />
      <GlobalBackgroundMusic music={music} />
      <MoonCursor />
      {children}
    </>
  );
}