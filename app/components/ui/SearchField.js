import { useId } from "react";

/**
 * Reusable semantic search control.
 * Consumers provide a visible label or an aria-label; form behavior stays native.
 */
export function SearchField({
  label,
  id,
  className = "",
  labelClassName = "",
  inputClassName = "",
  size = "md",
  ...inputProps
}) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const sizeClass = size === "sm" ? "df-search--sm" : "df-search--md";

  return (
    <div className={["df-search", sizeClass, className].filter(Boolean).join(" ")}>
      {label ? (
        <label
          className={["df-search__label", "ui-text-control-label", labelClassName].filter(Boolean).join(" ")}
          htmlFor={fieldId}
        >
          {label}
        </label>
      ) : null}
      <input
        {...inputProps}
        id={fieldId}
        type="search"
        className={["ui-input", "ui-text-control", "df-search__input", inputClassName].filter(Boolean).join(" ")}
      />
    </div>
  );
}
