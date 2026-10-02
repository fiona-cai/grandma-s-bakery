"use client";

export function NumberField({
  value,
  onChange,
  step = 1,
  min = 0,
}: {
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
}) {
  return (
    <input
      type="number"
      className="field"
      min={min}
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
    />
  );
}
