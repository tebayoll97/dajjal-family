export function SectionHeader({ title, description, eyebrow, actions, level = 2, className = "" }) {
  const Heading = level === 3 ? "h3" : "h2";
  return <div className={["ui-section-heading", className].filter(Boolean).join(" ")}><div className="ui-section-heading-copy">{eyebrow ? <p className="ui-eyebrow">{eyebrow}</p> : null}<Heading className={level === 3 ? "ui-heading-h3" : "ui-heading-h2"}>{title}</Heading>{description ? <p className="ui-section-description">{description}</p> : null}</div>{actions ? <div className="ui-section-actions">{actions}</div> : null}</div>;
}
