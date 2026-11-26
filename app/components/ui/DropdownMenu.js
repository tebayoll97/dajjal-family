import SvgIcon from "./SvgIcon";

export function DropdownMenu({ label, children, className = "", disclosure = false, defaultOpen = false }) {
  const classes = ["ui-dropdown", disclosure ? "ui-dropdown-disclosure" : "", className].filter(Boolean).join(" ");
  return (
    <details className={classes} open={defaultOpen || undefined}>
      <summary className="ui-dropdown-trigger">{label}<SvgIcon name="chevron-down" size={16} /></summary>
      <div className="ui-dropdown-panel">{children}</div>
    </details>
  );
}
