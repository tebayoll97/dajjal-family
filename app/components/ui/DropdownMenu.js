"use client";

import { useId, useState } from "react";
import SvgIcon from "./SvgIcon";

export function DropdownMenu({ label, children, className = "", disclosure = false, defaultOpen = false }) {
  const panelId = useId();
  const [open, setOpen] = useState(defaultOpen);
  const classes = ["ui-dropdown", disclosure ? "ui-dropdown-disclosure" : "", className].filter(Boolean).join(" ");

  if (disclosure) {
    return (
      <div className={classes}>
        <button type="button" className="ui-dropdown-trigger ui-dropdown-disclosure__trigger" aria-expanded={open} aria-controls={panelId} onClick={() => setOpen((value) => !value)}>
          <span>{label}</span>
          <SvgIcon name="chevron-down" size={16} />
        </button>
        {open ? <div id={panelId} className="ui-dropdown-panel ui-dropdown-disclosure__panel">{children}</div> : null}
      </div>
    );
  }

  return (
    <details className={classes} open={defaultOpen || undefined}>
      <summary className="ui-dropdown-trigger">{label}<SvgIcon name="chevron-down" size={16} /></summary>
      <div className="ui-dropdown-panel">{children}</div>
    </details>
  );
}
