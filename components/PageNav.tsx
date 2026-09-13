"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ROUTES } from "@/components/StepperNav";

// Prev/Next buttons at the bottom of every page, matching the walkthrough order in
// docs/02-information-architecture.md.
export default function PageNav() {
  const pathname = usePathname();
  const index = ROUTES.findIndex((r) => r.href === pathname);
  if (index === -1) return null;

  const prev = index > 0 ? ROUTES[index - 1] : null;
  const next = index < ROUTES.length - 1 ? ROUTES[index + 1] : null;

  return (
    <div className="mt-10 flex items-center justify-between border-t border-[rgba(0,0,0,0.08)] pt-6">
      {prev ? (
        <Link
          href={prev.href}
          className="rounded-full bg-surface px-4 py-2 text-[14px] text-foreground shadow-border-sm transition hover:shadow-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        >
          ← {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link
          href={next.href}
          className="rounded-full bg-accent px-4 py-2 text-[14px] font-medium text-white shadow-border-sm transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        >
          {next.label} →
        </Link>
      ) : (
        <span />
      )}
    </div>
  );
}
