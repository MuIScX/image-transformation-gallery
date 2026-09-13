import type { ReactNode } from "react";

type DualExplainProps = {
  plain: string;
  math: string | ReactNode;
};

// The app's non-negotiable teaching pattern: plain-language explanation directly above the
// precise math, always shown together. See docs/00-README.md — never hide the math side.
// `math` accepts a plain \n-joined string (rendered one line per row) or arbitrary ReactNode
// (e.g. <MatrixDisplay>) when the content needs more than plain text rows.
export default function DualExplain({ plain, math }: DualExplainProps) {
  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-relaxed text-foreground">{plain}</p>
      <div className="rounded bg-surface px-4 py-3 shadow-border-sm">
        {typeof math === "string" ? (
          math.split("\n").map((line, i) => (
            <div key={i} className="font-mono font-mono-nums text-[14px] leading-relaxed text-foreground">
              {line || " "}
            </div>
          ))
        ) : (
          <div className="font-mono font-mono-nums text-[14px] leading-relaxed text-foreground">{math}</div>
        )}
      </div>
    </div>
  );
}
