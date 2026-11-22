import { cloneElement, isValidElement, useId } from "react";

export function Tooltip({ content, children, placement = "top", className = "" }) {
  const id = useId();
  const safePlacement = ["top", "right", "bottom", "left"].includes(placement) ? placement : "top";
  const trigger = isValidElement(children)
    ? cloneElement(children, { "aria-describedby": [children.props["aria-describedby"], id].filter(Boolean).join(" ") })
    : <span tabIndex={0} aria-describedby={id}>{children}</span>;
  return <span className={["ui-tooltip", className].filter(Boolean).join(" ")}>{trigger}<span id={id} role="tooltip" className={`ui-tooltip-content ui-tooltip-${safePlacement}`}>{content}</span></span>;
}
