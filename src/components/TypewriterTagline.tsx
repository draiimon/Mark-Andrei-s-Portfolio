"use client";

import { useEffect, useState } from "react";

const TAGLINES = [
  "builds in the cloud.",
  "ships clean full-stack apps.",
  "keeps learning every release."
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
    <span className="typewriter-wrap">
      {text}
      <span className="type-caret" />
    </span>
  );
}
