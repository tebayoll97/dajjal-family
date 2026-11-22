import { useId } from "react";
export function Tooltip({ content, children, placement = "top", className = "" }) {
  const id = useId();
  const safePlacement = ["top", "right", "bottom", "left"].includes(placement) ? placement : "top";
  return <span className={["ui-tooltip", className].filter(Boolean).join(" ")} aria-describedby={id}>{children}<span id={id} role="tooltip" className={`ui-tooltip-content ui-tooltip-${safePlacement}`}>{content}</span></span>;
}
