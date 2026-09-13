"use client";

import { useState, type ReactNode } from "react";
import { useMatrix } from "@/context/MatrixContext";
import { type Matrix2 } from "@/lib/matrix";
import DualExplain from "@/components/DualExplain";
import MatrixDisplay from "@/components/MatrixDisplay";
import MatrixInput from "@/components/MatrixInput";
import ImageCompareCanvas from "@/components/ImageCompareCanvas";
import PageNav from "@/components/PageNav";

type CardSpec = {
  id: string;
  title: string;
  plain: string;
  math: ReactNode;
  defaultMatrix: Matrix2;
  worked: ReactNode;
  property: string;
};

const CARDS: CardSpec[] = [
  {
    id: "scale",
    title: "Scale",
    plain: "Stretches or squashes the image along each axis independently.",
    math: (
      <>
        <MatrixDisplay label="A =" a="sx" b="0" c="0" d="sy" />
        <div className="mt-2">x&apos; = sx·x</div>
        <div>y&apos; = sy·y</div>
      </>
    ),
    defaultMatrix: { a: 2, b: 0, c: 0, d: 1.5 },
    worked: (
      <>
        <code className="font-mono">A = [2 0; 0 1]</code> → x-coordinates double, y unchanged →
        the image becomes twice as wide. If <code className="font-mono">sx = sy = 2</code>, the
        whole image scales uniformly.
      </>
    ),
    property:
      "Only uniform scaling (sx = sy) keeps the image's proportions — otherwise circles become ellipses, squares become rectangles.",
  },
  {
    id: "rotation",
    title: "Rotation",
    plain:
      "Spins the image around its center by an angle θ, without stretching or squashing anything.",
    math: <MatrixDisplay label="A =" a="cosθ" b="-sinθ" c="sinθ" d="cosθ" />,
    defaultMatrix: { a: 0.707, b: -0.707, c: 0.707, d: 0.707 },
    worked: (
      <>
        90° rotation → <MatrixDisplay size="sm" label="A =" a="0" b="-1" c="1" d="0" />. Apply to
        (1,0): <code className="font-mono">A·(1,0) = (0,1)</code>, so (1,0) → (0,1) — a quarter
        turn.
      </>
    ),
    property:
      "Rotation preserves distance — a point at distance r from the center stays at distance r. That's why nothing stretches or squashes, only turns.",
  },
  {
    id: "shear",
    title: "Shear",
    plain:
      "Slides points sideways by an amount proportional to their height — turns a rectangle into a parallelogram.",
    math: (
      <>
        <MatrixDisplay label="A =" a="1" b="k" c="0" d="1" />
        <div className="mt-2">x&apos; = x + k·y</div>
        <div>y&apos; = y</div>
      </>
    ),
    defaultMatrix: { a: 1, b: 0.6, c: 0, d: 1 },
    worked: (
      <>
        <code className="font-mono">k = 0.5</code> →{" "}
        <MatrixDisplay size="sm" label="A =" a="1" b="0.5" c="0" d="1" /> →{" "}
        <code className="font-mono">{"x' = x + 0.5y, y' = y"}</code> → the classic
        slanted/parallelogram look. Vertical shear exists too:{" "}
        <MatrixDisplay size="sm" label="A =" a="1" b="0" c="k" d="1" />.
      </>
    ),
    property:
      "Shear changes the shape but — perhaps surprisingly — preserves area. More on why in the Determinant section.",
  },
  {
    id: "reflection",
    title: "Reflection",
    plain: "Flips the image across a line, like a mirror.",
    math: (
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="w-[6.5rem] shrink-0 text-foreground-soft">Across y-axis:</span>
          <MatrixDisplay label="A =" a="-1" b="0" c="0" d="1" />
          <span>(x,y) → (-x, y)</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="w-[6.5rem] shrink-0 text-foreground-soft">Across x-axis:</span>
          <MatrixDisplay label="A =" a="1" b="0" c="0" d="-1" />
          <span>(x,y) → (x, -y)</span>
        </div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="w-[6.5rem] shrink-0 text-foreground-soft">Across y = x:</span>
          <MatrixDisplay label="A =" a="0" b="1" c="1" d="0" />
          <span>(x,y) → (y, x)</span>
        </div>
      </div>
    ),
    defaultMatrix: { a: -1, b: 0, c: 0, d: 1 },
    worked: (
      <>
        Take the point (3, 2): across the y-axis it lands at (-3, 2); across the x-axis at
        (3, -2); across <code className="font-mono">y = x</code> at (2, 3).
      </>
    ),
    property:
      "Reflection preserves shape and area, but reverses orientation — the image looks 'mirror-written.' That flip shows up as a negative determinant. More on why in the Determinant section.",
  },
];

function TransformCard({ spec }: { spec: CardSpec }) {
  const [matrix, setMatrix] = useState<Matrix2>(spec.defaultMatrix);
  const { setMatrix: setGlobalMatrix } = useMatrix();

  return (
    <section className="space-y-5 rounded-lg bg-background p-5 shadow-border sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-[20px] font-semibold tracking-tight text-foreground">
          {spec.title}
        </h2>
        <button
          type="button"
          onClick={() => setGlobalMatrix(matrix)}
          className="shrink-0 rounded-full bg-accent-soft px-3 py-1 text-[13px] font-medium text-accent shadow-border-sm transition hover:opacity-80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
        >
          Load this matrix →
        </button>
      </div>

      <DualExplain plain={spec.plain} math={spec.math} />

      <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-[auto_1fr]">
        <MatrixInput value={matrix} onChange={(m) => setMatrix((prev) => ({ ...prev, ...m }))} showPresets={false} />
        <div className="min-w-0 overflow-x-auto">
          <ImageCompareCanvas matrix={matrix} size={180} />
        </div>
      </div>

      <div className="rounded bg-surface px-4 py-3 text-[14px] leading-relaxed text-foreground shadow-border-sm">
        <span className="mr-1 font-medium text-foreground-soft">Worked example:</span>
        {spec.worked}
      </div>

      <p className="text-[13px] leading-relaxed text-foreground-soft">{spec.property}</p>
    </section>
  );
}

export default function TransformsPage() {
  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-[28px] font-semibold tracking-tight text-foreground">
          The four classic transforms
        </h1>
        <p className="max-w-[65ch] text-[15px] leading-relaxed text-foreground-soft">
          A matrix moves points — and here are the four moves you&apos;ll actually use: scale,
          rotation, shear, and reflection. Each card below is its own worked example, editable on
          its own; use &quot;Load this matrix&quot; to carry a card&apos;s matrix into the rest of
          the walkthrough.
        </p>
      </div>

      <div className="space-y-8">
        {CARDS.map((spec) => (
          <TransformCard key={spec.id} spec={spec} />
        ))}
      </div>

      <PageNav />
    </div>
  );
}
