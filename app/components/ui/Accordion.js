"use client";
import { useId, useState } from "react";

export function Accordion({ items = [], multiple = false, defaultOpen = [], className = "", ariaLabel = "Accordion" }) {
  const instanceId = useId();
  const [openItems, setOpenItems] = useState(() => new Set(defaultOpen));
  const toggle = (key) => setOpenItems((current) => {
    const next = new Set(multiple ? current : []);
    if (current.has(key)) next.delete(key); else next.add(key);
    return next;
  });
  return <div className={["ui-accordion", className].filter(Boolean).join(" ")} role="group" aria-label={ariaLabel}>{items.map((item, index) => {
    const key = item.value ?? String(index); const open = openItems.has(key);
    const suffix = String(index);
    const panelId = `ui-accordion-${instanceId}-panel-${suffix}`;
    const triggerId = `ui-accordion-${instanceId}-trigger-${suffix}`;
    return <section className="ui-accordion-item" key={key}><h3 className="ui-accordion-heading"><button id={triggerId} type="button" className="ui-accordion-trigger" aria-expanded={open} aria-controls={panelId} onClick={() => toggle(key)}>{item.title}<span aria-hidden="true">{open ? "−" : "+"}</span></button></h3><div id={panelId} className="ui-accordion-panel" role="region" aria-labelledby={triggerId} hidden={!open}>{item.content}</div></section>;
  })}</div>;
}
