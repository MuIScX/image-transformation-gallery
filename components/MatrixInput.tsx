"use client";

import { PRESETS, type Matrix2 } from "@/lib/matrix";

type MatrixInputProps = {
  value: Matrix2;
  onChange: (m: Partial<Matrix2>) => void;
  showPresets?: boolean;
  min?: number;
  max?: number;
  step?: number;
};

const CELL_ORDER: (keyof Matrix2)[] = ["a", "b", "c", "d"];
const CELL_LABEL: Record<keyof Matrix2, string> = { a: "a", b: "b", c: "c", d: "d" };

// The "bracket" 2x2 matrix control — framed with CSS bracket shapes (border-left/right only,
// no top/bottom) so it visually reads as a math matrix, not a form. See docs/03-design-system.md.
export default function MatrixInput({
  value,
  onChange,
  showPresets = true,
  min = -3,
  max = 3,
  step = 0.1,
}: MatrixInputProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-stretch gap-2">
        <div className="w-3 shrink-0 border-y-2 border-l-2 border-foreground" aria-hidden />
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 py-1">
          {CELL_ORDER.map((key) => (
            <label key={key} className="flex flex-col gap-1">
              <span className="text-[12px] text-foreground-soft">
                {CELL_LABEL[key]}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={value[key]}
                step={step}
                onChange={(e) => onChange({ [key]: parseFloat(e.target.value) || 0 })}
                className="w-20 rounded bg-surface px-2 py-1 font-mono font-mono-nums text-[14px] text-foreground shadow-border-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
                aria-label={`matrix entry ${CELL_LABEL[key]}`}
              />
              <input
                type="range"
                value={value[key]}
                min={min}
                max={max}
                step={step}
                onChange={(e) => onChange({ [key]: parseFloat(e.target.value) })}
                className="w-24 accent-accent"
                aria-label={`matrix entry ${CELL_LABEL[key]} slider`}
              />
            </label>
          ))}
        </div>
        <div className="w-3 shrink-0 border-y-2 border-r-2 border-foreground" aria-hidden />
      </div>

      {showPresets && (
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onChange(preset.matrix)}
              className="rounded-full bg-surface px-3 py-1 text-[13px] text-foreground shadow-border-sm transition hover:shadow-border focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-accent"
            >
              {preset.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
