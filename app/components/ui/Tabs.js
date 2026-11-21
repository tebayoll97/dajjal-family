"use client";

import { useId, useRef } from "react";

export function Tabs({ tabs = [], value, onChange, ariaLabel = "Content tabs", className = "" }) {
  const id = useId();
  const refs = useRef([]);
  const selectedIndex = Math.max(0, tabs.findIndex((tab) => tab.value === value));

  function handleKeyDown(event, index) {
    if (!tabs.length) return;

    let next;
    if (event.key === "Home") {
      next = tabs.findIndex((tab) => !tab.disabled);
    } else if (event.key === "End") {
      for (let candidate = tabs.length - 1; candidate >= 0; candidate -= 1) {
        if (!tabs[candidate].disabled) {
          next = candidate;
          break;
        }
      }
    } else if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const direction = event.key === "ArrowRight" ? 1 : -1;
      for (let offset = 1; offset <= tabs.length; offset += 1) {
        const candidate = (index + direction * offset + tabs.length) % tabs.length;
        if (!tabs[candidate].disabled) {
          next = candidate;
          break;
        }
      }
    } else {
      return;
    }

    event.preventDefault();
    if (next === undefined || next < 0) return;

    refs.current[next]?.focus();
    onChange?.(tabs[next].value);
  }

  const active = tabs[selectedIndex];

  return (
    <div className={["ui-tabs", className].filter(Boolean).join(" ")}>
      <div className="ui-tab-list" role="tablist" aria-label={ariaLabel} aria-orientation="horizontal">
        {tabs.map((tab, index) => (
          <button
            key={tab.value}
            ref={(node) => { refs.current[index] = node; }}
            type="button"
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={tab.value === value}
            aria-controls={`${id}-panel`}
            tabIndex={tab.value === value ? 0 : -1}
            disabled={tab.disabled}
            className="ui-tab"
            onClick={() => onChange?.(tab.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >{tab.label}</button>
        ))}
      </div>
      <div className="ui-tab-panel" role="tabpanel" id={`${id}-panel`} aria-labelledby={`${id}-tab-${selectedIndex}`} tabIndex={0}>
        {active?.content}
      </div>
    </div>
  );
}
