"use client";

import { useEffect, useState } from "react";

const TAGLINES = [
  "builds reliable DevOps workflows.",
  "ships clean full-stack applications.",
  "leads teams with service.",
  "improves systems through practical automation.",
  "turns ideas into usable web solutions.",
  "learns fast and applies feedback quickly.",
  "delivers projects with consistency and ownership.",
  "focuses on reliability, clarity, and impact.",
  "supports teams with communication and execution."
];

export default function TypewriterTagline() {
  const [lineIndex, setLineIndex] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const full = TAGLINES[lineIndex];
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
      if (deleting && text.length > 0) {
        setText(full.slice(0, text.length - 1));
        return;
      }
      if (deleting && text.length === 0) {
        setDeleting(false);
        setLineIndex((prev) => (prev + 1) % TAGLINES.length);
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [text, deleting, lineIndex]);

  return (
    <span className="typewriter-shell" aria-live="polite">
      <span className="typewriter-reserve">supports teams with communication and execution.</span>
      <span className="typewriter-wrap">
        {text}
        <span className="type-caret" />
      </span>
    </span>
  );
}
