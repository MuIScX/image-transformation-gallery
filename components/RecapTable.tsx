import type { ReactNode } from "react";
import MatrixDisplay from "@/components/MatrixDisplay";
import Subscript from "@/components/Subscript";

type Row = {
  name: string;
  matrix: [ReactNode, ReactNode, ReactNode, ReactNode] | null;
  matrixLabel?: ReactNode;
  det: ReactNode;
  eigen: ReactNode;
};

const SX = <Subscript base="s" sub="x" />;
const SY = <Subscript base="s" sub="y" />;

const ROWS: Row[] = [
  {
    name: "Scale",
    matrix: [SX, "0", "0", SY],
    det: (
      <>
        {SX}·{SY}
      </>
    ),
    eigen: (
      <>
        {SX}, {SY}
      </>
    ),
  },
  { name: "Rotation", matrix: null, matrixLabel: "R(θ)", det: "1", eigen: "cosθ ± i·sinθ" },
  { name: "Horizontal shear", matrix: ["1", "k", "0", "1"], det: "1", eigen: "1, 1" },
  { name: "Reflection (x-axis)", matrix: ["1", "0", "0", "-1"], det: "-1", eigen: "1, -1" },
  { name: "Reflection (y-axis)", matrix: ["-1", "0", "0", "1"], det: "-1", eigen: "1, -1" },
];

function RowMatrix({ row }: { row: Row }) {
  if (!row.matrix) return <>{row.matrixLabel}</>;
  const [a, b, c, d] = row.matrix;
  return <MatrixDisplay size="sm" a={a} b={b} c={c} d={d} />;
}

// Static reference table — always shows all four+ transforms, independent of live matrix state.
// Renders as a literal table on wide viewports, stacked cards under ~640px to stay legible.
export default function RecapTable() {
  return (
    <div className="rounded shadow-border">
      <table className="hidden w-full border-collapse sm:table">
        <thead>
          <tr className="border-b border-[rgba(0,0,0,0.08)] text-left">
            <th className="px-4 py-3 text-[13px] font-medium text-foreground-soft">Transformation</th>
            <th className="px-4 py-3 text-[13px] font-medium text-foreground-soft">Matrix</th>
            <th className="px-4 py-3 text-[13px] font-medium text-foreground-soft">Determinant</th>
            <th className="px-4 py-3 text-[13px] font-medium text-foreground-soft">Eigenvalues</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.name} className="border-b border-[rgba(0,0,0,0.06)] last:border-b-0">
              <td className="px-4 py-3 text-[14px] text-foreground">{row.name}</td>
              <td className="px-4 py-3 font-mono text-[13px] text-foreground">
                <RowMatrix row={row} />
              </td>
              <td className="px-4 py-3 font-mono font-mono-nums text-[13px] text-foreground">{row.det}</td>
              <td className="px-4 py-3 font-mono font-mono-nums text-[13px] text-foreground">{row.eigen}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="divide-y divide-[rgba(0,0,0,0.06)] sm:hidden">
        {ROWS.map((row) => (
          <div key={row.name} className="space-y-1.5 px-4 py-3">
            <div className="text-[14px] font-medium text-foreground">{row.name}</div>
            <div className="flex items-center justify-between font-mono text-[13px] text-foreground-soft">
              <span>matrix</span>
              <span className="text-foreground">
                <RowMatrix row={row} />
              </span>
            </div>
            <div className="flex justify-between font-mono font-mono-nums text-[13px] text-foreground-soft">
              <span>det</span>
              <span className="text-foreground">{row.det}</span>
            </div>
            <div className="flex justify-between font-mono font-mono-nums text-[13px] text-foreground-soft">
              <span>λ</span>
              <span className="text-foreground">{row.eigen}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
