"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PreProfileIntro from "@/components/PreProfileIntro";

type IntroLandingProps = {
  brand: string;
};

export default function IntroLanding({ brand }: IntroLandingProps) {
  const router = useRouter();

  useEffect(() => {
    router.prefetch("/home");
  }, [router]);

  return (
    <PreProfileIntro
      brand={brand}
      onDone={() => {
        router.replace("/home?intro=1");
      }}
    />
  );
}
