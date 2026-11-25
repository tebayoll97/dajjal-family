import Link from "next/link";

export function EditorialByline({ author, date, dateTime, locale = "id", className = "", authorHref }) {
  const isEn = locale === "en";
  const authorName = author || "DAJJAL FAMILY";
  const profileHref = authorHref || `/${locale}/blog/author/tebayoll`;
  return (
    <div className={["ui-editorial-byline-component", className].filter(Boolean).join(" ")}>
      {dateTime ? <time className="ui-editorial-byline-component__date ui-text-editorial-meta" dateTime={dateTime}>{date}</time> : date ? <span className="ui-editorial-byline-component__date ui-text-editorial-meta">{date}</span> : null}
      <span className="ui-editorial-byline-component__author-wrap">
        <span className="ui-editorial-byline-component__label ui-text-editorial-meta">{isEn ? "By" : "Oleh"}:</span>
        <Link className="ui-editorial-byline-component__author ui-text-editorial-meta" href={profileHref}>{authorName}</Link>
      </span>
    </div>
  );
}
