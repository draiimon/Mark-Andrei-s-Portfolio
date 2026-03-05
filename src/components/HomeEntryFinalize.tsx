"use client";

import { useEffect } from "react";

export default function HomeEntryFinalize() {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.pathname === "/home" && url.searchParams.get("intro") === "1") {
      window.history.replaceState(null, "", "/home");
    }
  }, []);

  return null;
}
