export function ProgressBar({ value, max = 100, label, valueLabel, showValue = false, variant = "primary", className = "" }) {
  const safeMax = Number.isFinite(max) && max > 0 ? max : 100;
  const determinate = Number.isFinite(value);
  const safeValue = determinate ? Math.min(safeMax, Math.max(0, value)) : undefined;
  const percent = determinate ? (safeValue / safeMax) * 100 : undefined;
  const safeVariant = ["primary", "success", "warning", "danger"].includes(variant) ? variant : "primary";
  return <div className={["ui-progress", className].filter(Boolean).join(" ")}>{(label || showValue) ? <div className="ui-progress-head">{label ? <span className="ui-progress-label">{label}</span> : <span />}{showValue ? <span className="ui-progress-value">{valueLabel || (determinate ? `${Math.round(percent)}%` : "…")}</span> : null}</div> : null}<div className="ui-progress-track" role="progressbar" aria-label={label || "Progress"} aria-valuemin={0} aria-valuemax={safeMax} {...(determinate ? { "aria-valuenow": safeValue } : { "aria-valuetext": valueLabel || "In progress" })}><span className={["ui-progress-bar", `ui-progress-${safeVariant}`, !determinate ? "ui-progress-indeterminate" : ""].filter(Boolean).join(" ")} style={determinate ? { width: `${percent}%` } : undefined} /></div></div>;
}
