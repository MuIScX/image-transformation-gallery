"use client";

import { useId, useState, type ReactNode } from "react";

type ShowMathProps = {
  label?: string;
  children: ReactNode;
};

// Collapsed by default — reserved for derivations/proofs, never for facts that should be
// visible by default (see docs/00-README.md's non-negotiable design rule).
export default function ShowMath({ label = "Show the math", children }: ShowMathProps) {
  const [open, setOpen] = useState(false);
  const contentId = useId();

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={contentId}
        className="text-[14px] font-medium text-accent underline decoration-accent/30 underline-offset-4 hover:decoration-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {open ? label.replace(/^Show/, "Hide") : label}
      </button>
      {open && (
        <div id={contentId} className="mt-3 rounded bg-surface px-4 py-3 shadow-border-sm">
          <div className="font-mono font-mono-nums text-[14px] leading-relaxed text-foreground [&>*+*]:mt-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}
