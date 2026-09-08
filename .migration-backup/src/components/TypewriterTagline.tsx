"use client";

import { useEffect, useMemo, useState } from "react";

type TypewriterTaglineProps = {
  lines: string[];
};

export default function TypewriterTagline({ lines }: TypewriterTaglineProps) {
  const safeLines = useMemo(() => (lines.length ? lines : ["builds in the cloud."]), [lines]);
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = safeLines[lineIndex % safeLines.length];
    const minChars = full.length > 0 ? 1 : 0;
    const delay = deleting ? 40 : 70;

    const timer = setTimeout(() => {
      if (!deleting && text.length < full.length) {
        setText(full.slice(0, text.length + 1));
        return;
      }
      if (!deleting && text.length === full.length) {
        setTimeout(() => setDeleting(true), 800);
        return;
      }
      if (deleting && text.length > minChars) {
        setText(full.slice(0, text.length - 1));
        return;
      }
      if (deleting && text.length === minChars) {
        setDeleting(false);
        setLineIndex((prev) => (prev + 1) % safeLines.length);
        setText(safeLines[(lineIndex + 1) % safeLines.length].slice(0, 1));
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, lineIndex, safeLines]);

  const reserve = safeLines.reduce((longest, line) => (line.length > longest.length ? line : longest), safeLines[0]);

  return (
    <span className="typewriter-shell" aria-live="polite">
      <span className="typewriter-reserve">{reserve}</span>
      <span className="typewriter-wrap">
        {text}
        <span className="type-caret" />
      </span>
    </span>
  );
}
