import NextLink from "next/link";
export function Link({ children, href, external = false, variant = "default", className = "", target, rel, ...props }) {
  const safeVariant = ["default", "subtle", "strong"].includes(variant) ? variant : "default";
  const safeTarget = target || (external ? "_blank" : undefined);
  const safeRel = rel || (safeTarget === "_blank" ? "noopener noreferrer" : undefined);
  return <NextLink href={href} {...props} target={safeTarget} rel={safeRel} className={["ui-link", `ui-link-${safeVariant}`, className].filter(Boolean).join(" ")}>{children}</NextLink>;
}
