import type { ReactNode } from "react";

// Renders base+subscript math notation (sx -> s with a small subscript x) via a real <sub>
// element rather than plain adjacent characters. Needed because Unicode has no subscript "y"
// (or most letters) to fall back on the way it does for digits (₁, ₂) elsewhere in the app.
export default function Subscript({ base, sub }: { base: ReactNode; sub: ReactNode }) {
  return (
    <span className="whitespace-nowrap">
      {base}
      <sub className="text-[0.72em]">{sub}</sub>
    </span>
  );
}
