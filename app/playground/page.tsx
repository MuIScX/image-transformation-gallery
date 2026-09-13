"use client";

import { useState } from "react";
import { useMatrix } from "@/context/MatrixContext";
import { determinant, trace, eigenInfo } from "@/lib/matrix";
import MatrixInput from "@/components/MatrixInput";
import ImageCompareCanvas from "@/components/ImageCompareCanvas";
import InfoBox from "@/components/InfoBox";
import ShowMath from "@/components/ShowMath";
import PageNav from "@/components/PageNav";

// Contextual note for the info box, ported from the prototype's updateInfoBox(). Priority order:
// singular first (det ≈ 0 dominates — nothing else about the matrix matters once it collapses a
// dimension), then the identity special case, then the complex-eigenvalue (pure rotation) case,
// then negative-det orientation flip, falling back to the generic real-eigenvalue note.
function contextualNote(a: number, b: number, c: number, d: number): string {
  const det = determinant(a, b, c, d);

  if (Math.abs(det) < 1e-6) {
    return "This matrix is singular (det ≈ 0) — it squashes the whole plane down onto a line (or a point), so the image collapses and can't be undone.";
  }

  if (a === 1 && b === 0 && c === 0 && d === 1) {
    return "This is the identity matrix — it leaves every point exactly where it is, so the transformed image is identical to the original.";
  }

  const info = eigenInfo(a, b, c, d);

  if (info.type === "complex") {
    return "No real eigenvectors — this matrix is a pure rotation (plus possibly some uniform scaling). There's no direction left unchanged, so no eigenvector lines are drawn.";
  }

  if (det < 0) {
    return "The determinant is negative — this transformation flips orientation, like a mirror. The image comes out mirror-written.";
  }

  return "Real eigenvalues — the green lines mark the directions that only get stretched (not rotated) by this matrix.";
}

export default function PlaygroundPage() {
  const { a, b, c, d, setMatrix } = useMatrix();
  const [uploadedImage, setUploadedImage] = useState<HTMLImageElement | null>(null);
  const [showEigen, setShowEigen] = useState(true);

  const det = determinant(a, b, c, d);
  const tr = trace(a, b, c, d);
  const info = eigenInfo(a, b, c, d);

  const eigenValue =
    info.type === "real"
      ? `λ₁ = ${info.values[0].toFixed(2)}, λ₂ = ${info.values[1].toFixed(2)}`
      : `λ₁,₂ = ${info.re.toFixed(2)} ± ${info.im.toFixed(2)}i`;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      setUploadedImage(img);
    };
    img.src = URL.createObjectURL(file);
  }

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">Playground</h1>
        <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground-soft">
          Now try it yourself. Drag the matrix entries, jump between presets, or upload your own
          photo — everything below reacts live, and the info box explains what you&apos;re looking
          at as you go.
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <section className="space-y-5 rounded-lg bg-background p-5 shadow-border sm:p-6">
          <h2 className="text-[16px] font-semibold tracking-tight text-foreground">Matrix</h2>
          <MatrixInput
            value={{ a, b, c, d }}
            onChange={setMatrix}
            min={-3}
            max={3}
            step={0.1}
            showPresets
          />

          <div className="space-y-2 border-t border-[rgba(0,0,0,0.08)] pt-4">
            <h2 className="text-[16px] font-semibold tracking-tight text-foreground">
              Your own image
            </h2>
            <p className="text-[13px] leading-relaxed text-foreground-soft">
              Upload a photo to use in place of the sample image below. It stays loaded across any
              matrix changes — no need to re-upload.
            </p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="block w-full text-[13px] text-foreground-soft file:mr-3 file:rounded-full file:border-0 file:bg-surface file:px-3 file:py-1.5 file:text-[13px] file:font-medium file:text-foreground file:shadow-border-sm hover:file:shadow-border"
            />
          </div>
        </section>

        <section className="min-w-0 space-y-5">
          <div className="min-w-0 overflow-x-auto rounded-lg bg-background p-5 shadow-border sm:p-6">
            <div className="mb-4 flex items-center justify-end">
              <label className="flex cursor-pointer select-none items-center gap-2 text-[13px] text-foreground-soft">
                <input
                  type="checkbox"
                  checked={showEigen}
                  onChange={(e) => setShowEigen(e.target.checked)}
                  className="h-3.5 w-3.5 accent-eigen focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                />
                Show eigenvector lines
              </label>
            </div>
            <ImageCompareCanvas
              matrix={{ a, b, c, d }}
              image={uploadedImage}
              showEigenOverlay={showEigen}
              size={260}
              zoomable
            />
          </div>

          <InfoBox
            rows={[
              { label: "det(A)", value: det.toFixed(3), warn: det < 0 },
              { label: "trace(A)", value: tr.toFixed(3) },
              { label: "λ₁, λ₂", value: eigenValue },
            ]}
            note={contextualNote(a, b, c, d)}
          />
        </section>
      </div>

      <ShowMath label="Technical aside: why does the image rotate around its center, not the corner?">
        <p>
          A 2×2 matrix technically transforms coordinates around the origin (0,0). But an
          image&apos;s natural origin is usually a corner, not the center. To make
          rotation/scaling happen around the image&apos;s center — which is what looks natural —
          the app shifts the image so its center is at the origin, applies the matrix, then shifts
          it back.
        </p>
        <p>x&apos; = T_c⁻¹ · A · T_c · x, where T_c translates the center to the origin.</p>
      </ShowMath>

      <PageNav />
    </div>
  );
}
