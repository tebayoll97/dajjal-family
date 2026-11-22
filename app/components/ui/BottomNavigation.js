export function BottomNavigation({
  items = [],
  centerAction,
  ariaLabel = "Bottom navigation",
  fixed = false,
  className = "",
}) {
  const visibleItems = Array.isArray(items) ? items.slice(0, 4) : [];

  return (
    <nav
      className={["ui-bottom-navigation", fixed ? "is-fixed" : "", className].filter(Boolean).join(" ")}
      aria-label={ariaLabel}
    >
      {visibleItems.map((item) => (
        <button
          key={item.key || item.label}
          type="button"
          className="ui-bottom-navigation-item"
          onClick={item.onClick}
          aria-label={item.label}
          aria-current={item.active ? "page" : undefined}
          aria-pressed={Boolean(item.active)}
        >
          <span className="ui-bottom-navigation-icon" aria-hidden="true">{item.icon}</span>
          <span className="ui-bottom-navigation-label">{item.label}</span>
        </button>
      ))}
      {centerAction ? (
        <button
          type="button"
          className="ui-bottom-navigation-center"
          onClick={centerAction.onClick}
          aria-label={centerAction.label}
          aria-pressed={Boolean(centerAction.active)}
          disabled={Boolean(centerAction.disabled)}
        >
          <span aria-hidden="true">{centerAction.icon}</span>
          <span className="ui-bottom-navigation-center-label">{centerAction.label}</span>
        </button>
      ) : null}
    </nav>
  );
}
