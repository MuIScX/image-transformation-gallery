type DualExplainProps = {
  plain: string;
  math: string;
};

// The app's non-negotiable teaching pattern: plain-language explanation directly above the
// precise math, always shown together. See docs/00-README.md — never hide the math side.
export default function DualExplain({ plain, math }: DualExplainProps) {
  const lines = math.split("\n");

  return (
    <div className="space-y-3">
      <p className="text-[15px] leading-relaxed text-foreground">{plain}</p>
      <div className="rounded bg-surface px-4 py-3 shadow-border-sm">
        {lines.map((line, i) => (
          <div key={i} className="font-mono font-mono-nums text-[14px] leading-relaxed text-foreground">
            {line || " "}
          </div>
        ))}
      </div>
    </div>
  );
}
