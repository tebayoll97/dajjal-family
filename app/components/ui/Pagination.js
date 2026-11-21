export function Pagination({
  page,
  totalPages,
  onPageChange,
  ariaLabel = "Pagination",
  previousLabel = "Previous",
  nextLabel = "Next",
  pageLabel = (number) => `Page ${number}`,
  className = "",
}) {
  if (!Number.isInteger(page) || !Number.isInteger(totalPages) || totalPages < 1) return null;
  const current = Math.min(Math.max(1, page), totalPages);
  const pages = new Set([1, totalPages, current - 1, current, current + 1].filter((n) => n >= 1 && n <= totalPages));
  const ordered = [...pages].sort((a, b) => a - b);
  const items = [];
  ordered.forEach((number, index) => {
    if (index && number - ordered[index - 1] > 1) items.push({ type: "ellipsis", key: `ellipsis-${number}` });
    items.push({ type: "page", number, key: number });
  });
  return (
    <nav className={["ui-pagination", className].filter(Boolean).join(" ")} aria-label={ariaLabel}>
      <button type="button" className="ui-pagination-button" onClick={() => onPageChange?.(current - 1)} disabled={current === 1} aria-label={previousLabel}>{previousLabel}</button>
      <div className="ui-pagination-pages">
        {items.map((item) => item.type === "ellipsis"
          ? <span className="ui-pagination-ellipsis" key={item.key} aria-hidden="true">…</span>
          : <button type="button" key={item.key} className="ui-pagination-button" onClick={() => onPageChange?.(item.number)} aria-current={item.number === current ? "page" : undefined} aria-label={pageLabel(item.number)}>{item.number}</button>)}
      </div>
      <button type="button" className="ui-pagination-button" onClick={() => onPageChange?.(current + 1)} disabled={current === totalPages} aria-label={nextLabel}>{nextLabel}</button>
    </nav>
  );
}
