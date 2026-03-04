"use client";

import { useEffect, useState } from "react";

const TAGLINES = [
  "builds things with code.",
  "builds in the cloud.",
  "ships reliable web systems.",
  "keeps learning and improving."
];

export default function RotatingTagline() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % TAGLINES.length);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  return (
    <span className="inline-block min-h-[1.2em] text-awsOrange fade-rise">
      {TAGLINES[index]}
    </span>
  );
}
