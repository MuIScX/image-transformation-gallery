import type { ReactNode } from "react";

type MatrixDisplayProps = {
  a: ReactNode;
  b: ReactNode;
  c: ReactNode;
  d: ReactNode;
  size?: "sm" | "md";
  label?: ReactNode;
};

const SIZE = {
  sm: { cell: "min-w-[2.2ch] px-1 text-[12px]", bracket: "w-[5px]", gap: "gap-x-2.5 gap-y-0.5" },
  md: { cell: "min-w-[3ch] px-1.5 text-[14px]", bracket: "w-2", gap: "gap-x-4 gap-y-1" },
};

// Renders a 2x2 matrix as an actual stacked, bracketed matrix — two rows between CSS bracket
// shapes (border-left/right only, no top/bottom, matching <MatrixInput>'s bracket technique) —
// instead of a single semicolon-joined line like "[a b; c d]". Cells accept ReactNode so this
// works for both numeric values and symbolic ones (sx, cosθ, d−λ, ...). Optionally prefixed with
// a label (e.g. "A =") rendered before the bracket, vertically centered against it.
export default function MatrixDisplay({ a, b, c, d, size = "md", label }: MatrixDisplayProps) {
  const s = SIZE[size];
  return (
    <span className="inline-flex items-stretch gap-1.5 align-middle font-mono font-mono-nums">
      {label && <span className="self-center">{label}</span>}
      <span className={`shrink-0 border-y-2 border-l-2 border-current ${s.bracket}`} aria-hidden />
      <span className={`grid grid-cols-2 items-center py-0.5 leading-none ${s.gap}`}>
        <span className={s.cell}>{a}</span>
        <span className={s.cell}>{b}</span>
        <span className={s.cell}>{c}</span>
        <span className={s.cell}>{d}</span>
      </span>
      <span className={`shrink-0 border-y-2 border-r-2 border-current ${s.bracket}`} aria-hidden />
    </span>
  );
}
