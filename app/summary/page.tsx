"use client";

import DualExplain from "@/components/DualExplain";
import InfoBox from "@/components/InfoBox";
import MatrixDisplay from "@/components/MatrixDisplay";
import RecapTable from "@/components/RecapTable";
import PageNav from "@/components/PageNav";
import { useMatrix } from "@/context/MatrixContext";
import { determinant, trace, eigenInfo } from "@/lib/matrix";

// Round for display only — the underlying values above are the real, unrounded computation.
function round2(n: number): string {
  return (Math.round(n * 100) / 100).toFixed(2);
}

export default function SummaryPage() {
  const { a, b, c, d } = useMatrix();

  const det = determinant(a, b, c, d);
  const tr = trace(a, b, c, d);
  const eig = eigenInfo(a, b, c, d);

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-[26px] font-semibold tracking-tight text-foreground">Summary</h1>
        <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground-soft">
          A recap of how the pieces fit together — the page to leave on screen while taking
          questions. It connects the determinant and eigenvalues of whatever matrix is currently
          active, then a reference table for all four transforms.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">The relationship</h2>
        <DualExplain
          plain="These aren't coincidences — for any 2×2 matrix, the determinant is always the product of its eigenvalues, and the trace is always their sum. It's a quick way to sanity-check an eigenvalue calculation: multiply them together, and it should equal what you already know the determinant to be."
          math={"det(A)   = λ₁ · λ₂\ntrace(A) = λ₁ + λ₂ = a + d"}
        />

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-medium text-foreground-soft">
            Live check — currently active matrix
            <MatrixDisplay size="sm" label="A =" a={round2(a)} b={round2(b)} c={round2(c)} d={round2(d)} />
          </div>

          {eig.type === "real" ? (
            <InfoBox
              rows={[
                { label: "λ₁", value: round2(eig.values[0]) },
                { label: "λ₂", value: round2(eig.values[1]) },
                { label: "λ₁ · λ₂", value: round2(eig.values[0] * eig.values[1]) },
                { label: "det(A)", value: round2(det), warn: det < 0 },
                { label: "λ₁ + λ₂", value: round2(eig.values[0] + eig.values[1]) },
                { label: "trace(A)", value: round2(tr) },
              ]}
              note={
                det < 0
                  ? "λ₁ · λ₂ matches det(A) — and det(A) is negative here, meaning this matrix flips orientation."
                  : "λ₁ · λ₂ matches det(A), and λ₁ + λ₂ matches trace(A), confirming the relationship numerically for the current matrix."
              }
            />
          ) : (
            <InfoBox
              rows={[
                { label: "λ₁, λ₂", value: `${round2(eig.re)} ± ${round2(eig.im)}i` },
                { label: "λ₁ · λ₂ (= re² + im²)", value: round2(eig.re * eig.re + eig.im * eig.im) },
                { label: "det(A)", value: round2(det), warn: det < 0 },
                { label: "λ₁ + λ₂ (= 2·re)", value: round2(2 * eig.re) },
                { label: "trace(A)", value: round2(tr) },
              ]}
              note="This matrix has a complex conjugate pair of eigenvalues (typical of a rotation), so there's no real invariant direction to show. The relationship still holds: for a complex pair re ± im·i, the product re² + im² equals det(A), and their sum 2·re equals trace(A) — matching numerically above."
            />
          )}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-[18px] font-semibold tracking-tight text-foreground">
          Reference: all four transforms
        </h2>
        <RecapTable />
      </section>

      <p className="text-balance text-[22px] font-semibold leading-snug tracking-tight text-foreground md:text-[26px]">
        Matrices control how image coordinates move. Determinants tell us how area and orientation
        change. Eigenvalues reveal special directions that remain structurally unchanged by the
        transformation.
      </p>

      <PageNav />
    </div>
  );
}
