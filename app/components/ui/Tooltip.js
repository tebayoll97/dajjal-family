"use client";

import { cloneElement, isValidElement, useEffect, useId, useRef, useState } from "react";

export function Tooltip({ content, children, placement = "top", className = "" }) {
  const id = useId();
  const root = useRef(null);
  const [open, setOpen] = useState(false);
  const safePlacement = ["top", "top-end", "right", "bottom", "left"].includes(placement) ? placement : "top";

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event) => {
      if (root.current && !root.current.contains(event.target)) setOpen(false);
    };
    const closeOnScroll = () => setOpen(false);
    const closeOnKey = (event) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", closeOutside);
    window.addEventListener("scroll", closeOnScroll, true);
    document.addEventListener("keydown", closeOnKey);
    return () => {
      document.removeEventListener("pointerdown", closeOutside);
      window.removeEventListener("scroll", closeOnScroll, true);
      document.removeEventListener("keydown", closeOnKey);
    };
  }, [open]);

  const trigger = isValidElement(children)
    ? cloneElement(children, {
        "aria-describedby": open ? [children.props["aria-describedby"], id].filter(Boolean).join(" ") : children.props["aria-describedby"],
        "aria-expanded": open,
        onClick: (event) => {
          children.props.onClick?.(event);
          setOpen((value) => !value);
        },
      })
    : <button type="button" className="ui-tooltip-trigger" aria-label="More information" aria-describedby={open ? id : undefined} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{children}</button>;

  return <span ref={root} className={["ui-tooltip", open ? "ui-tooltip-open" : "", className].filter(Boolean).join(" ")}>{trigger}<span id={id} role="tooltip" className={`ui-tooltip-content ui-tooltip-${safePlacement}`} hidden={!open}>{content}</span></span>;
}
