export function IconButton({ icon, label, size = "md", variant = "ghost", className = "", type = "button", ...props }) {
  const safeSize = ["sm", "md", "lg"].includes(size) ? size : "md";
  const safeVariant = ["ghost", "secondary", "danger"].includes(variant) ? variant : "ghost";
  return <button {...props} type={type} className={["ui-icon-button", `ui-icon-button-${safeSize}`, `ui-icon-button-${safeVariant}`, className].filter(Boolean).join(" ")} aria-label={label} title={props.title || label}>{icon}</button>;
}
