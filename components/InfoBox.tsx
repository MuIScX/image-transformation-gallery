type InfoRow = {
  label: string;
  value: string;
  warn?: boolean;
};

type InfoBoxProps = {
  rows: InfoRow[];
  note?: string;
};

// det/trace/eigenvalue readout — monospace label/value rows. Negative determinant gets --warn
// color, always paired with explanatory text elsewhere (color is never the only signal).
export default function InfoBox({ rows, note }: InfoBoxProps) {
  return (
    <div className="rounded bg-background shadow-border">
      <dl className="divide-y divide-[rgba(0,0,0,0.06)]">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-4 px-4 py-2.5">
            <dt className="font-mono text-[13px] text-foreground-soft">{row.label}</dt>
            <dd
              className={`font-mono font-mono-nums text-[14px] ${
                row.warn ? "text-warn font-semibold" : "text-foreground"
              }`}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>
      {note && (
        <p className="border-t border-[rgba(0,0,0,0.06)] px-4 py-2.5 text-[13px] leading-relaxed text-foreground-soft">
          {note}
        </p>
      )}
    </div>
  );
}
