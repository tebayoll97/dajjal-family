"use client";

import { useId } from "react";

export function RangeSlider({ label, value, onChange, min = 0, max = 100, step = 1, hint, disabled = false, id, className = "" }) {
  const generatedId = useId();
  const inputId = id || generatedId;
  return (
    <div className={["ui-range-field", className].filter(Boolean).join(" ")}>
      <label className="ui-range-label" htmlFor={inputId}><span>{label}</span><output htmlFor={inputId}>{value}</output></label>
      <input id={inputId} className="ui-range" type="range" min={min} max={max} step={step} value={value} disabled={disabled} onChange={(event) => onChange?.(Number(event.target.value))} />
      {hint ? <span className="ui-range-hint">{hint}</span> : null}
    </div>
  );
}
