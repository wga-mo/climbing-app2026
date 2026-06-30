"use client";

import { useEffect, useRef, useState } from "react";

const clampClasses = {
  1: "line-clamp-1",
  2: "line-clamp-2",
  3: "line-clamp-3",
  4: "line-clamp-4",
  5: "line-clamp-5",
  6: "line-clamp-6",
};

export default function CollapsibleText({
  title,
  text,
  defaultOpen = false,
  lines = 2,
  className = "mt-6",
  buttonClassName = "mt-2 text-sm font-medium text-gray-600 hover:text-black",
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [canCollapse, setCanCollapse] = useState(false);
  const textRef = useRef(null);

  const clampClass = clampClasses[lines] || "line-clamp-2";

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    function checkOverflow() {
        const style = window.getComputedStyle(el);
        const lineHeight = parseFloat(style.lineHeight);

        const threshold = lineHeight * (lines + 1);

        setCanCollapse(el.scrollHeight > threshold + 1);
    }

    checkOverflow();

    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, [text, lines]);

  if (!text) return null;

  return (
    <section className={className}>
      {title && <h2 className="text-xl font-semibold">{title}</h2>}

      <p
        ref={textRef}
        className={`mt-2 whitespace-pre-line ${
          !open && canCollapse ? clampClass : ""
        }`}
      >
        {text}
      </p>

      {canCollapse && (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={buttonClassName}
        >
          {open ? "▲ Show less" : "▼ Show more"}
        </button>
      )}
    </section>
  );
}