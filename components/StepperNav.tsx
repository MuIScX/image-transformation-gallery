"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMatrix } from "@/context/MatrixContext";

const ROUTES: { href: string; label: string }[] = [
  { href: "/point", label: "Point" },
  { href: "/transforms", label: "Transforms" },
  { href: "/determinant", label: "Determinant" },
  { href: "/eigen", label: "Eigen" },
  { href: "/summary", label: "Summary" },
  { href: "/playground", label: "Playground" },
  { href: "/gallery", label: "Gallery" },
];

// Persistent stepper/progress nav on every page. Clicking any segment jumps directly there —
// navigation is not linear-only, since a presenter will want to jump around live.
export default function StepperNav() {
  const pathname = usePathname();
  const { reset } = useMatrix();
  const currentIndex = ROUTES.findIndex((r) => r.href === pathname);

  return (
    <header className="sticky top-0 z-10 border-b border-[rgba(0,0,0,0.08)] bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-content items-center gap-4 px-[28px] py-3">
        <Link
          href="/point"
          className="shrink-0 text-[14px] font-semibold tracking-tight text-foreground"
        >
          Image&nbsp;Transformation&nbsp;Gallery
        </Link>

        <nav aria-label="Walkthrough progress" className="min-w-0 flex-1 overflow-x-auto">
          <ol className="flex items-center gap-1.5">
            {ROUTES.map((route, i) => {
              const active = i === currentIndex;
              const visited = currentIndex >= 0 && i <= currentIndex;
              return (
                <li key={route.href} className="flex items-center gap-1.5">
                  <Link
                    href={route.href}
                    aria-current={active ? "step" : undefined}
                    className={`whitespace-nowrap rounded-full px-2.5 py-1 text-[13px] transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent ${
                      active
                        ? "bg-accent text-white"
                        : visited
                          ? "text-foreground hover:bg-surface"
                          : "text-foreground-soft hover:bg-surface"
                    }`}
                  >
                    {route.label}
                  </Link>
                  {i < ROUTES.length - 1 && (
                    <span aria-hidden className="h-px w-3 bg-[rgba(0,0,0,0.12)]" />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>

        <button
          type="button"
          onClick={reset}
          className="shrink-0 rounded-full bg-surface px-3 py-1 text-[13px] text-foreground-soft shadow-border-sm transition hover:text-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        >
          Reset to default
        </button>
      </div>
    </header>
  );
}

export { ROUTES };
