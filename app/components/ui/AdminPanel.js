/** Shared semantic surface for dense administrative content groups. Business state stays in the page. */
export function AdminPanel({ children, className = "", as: Element = "section", ...props }) {
  return <Element {...props} className={["ui-admin-panel", className].filter(Boolean).join(" ")}>{children}</Element>;
}
