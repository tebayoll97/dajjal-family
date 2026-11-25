import Link from "next/link";
import Image from "next/image";
import { Badge } from "./Badge";
import { Card } from "./Card";
import { EditorialByline } from "./EditorialByline";

/** Compact, locale-aware article card shared by public Blog listing surfaces. */
export function BlogArticleCard({ article, locale = "id" }) {
  const isEn = locale === "en";
  const date = article.published_at
    ? new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", { dateStyle: "medium" }).format(new Date(article.published_at))
    : "";
  const categoryName = article.category?.name || (isEn ? article.category?.name_en : article.category?.name_id);
  const imageAlt = article.cover_image_alt || article.title || "DAJJAL FAMILY";

  return (
    <Card as="article" interactive className="ui-blog-article-card">
      <Link href={`/${locale}/blog/${article.slug}`} className="ui-blog-article-card__link" aria-label={article.title}>
        <div className="ui-blog-article-card__media">
          {article.cover_image_url ? (
            <Image src={article.cover_image_url} alt={imageAlt} fill sizes="(max-width: 639px) 6.5rem, (max-width: 1023px) 50vw, 33vw" unoptimized={!article.cover_image_url?.includes("/storage/v1/object/public/df-blog-media/")} loading="lazy" />
          ) : <span className="ui-blog-article-card__fallback" aria-hidden="true">DAJJAL FAMILY</span>}
        </div>
        <div className="ui-blog-article-card__body">
          {categoryName ? <Badge>{categoryName}</Badge> : null}
          <h2 className="ui-blog-article-card__title ui-text-blog-title">{article.title}</h2>
          {article.excerpt ? <p className="ui-blog-article-card__summary ui-text-blog-summary">{article.excerpt}</p> : null}
          <EditorialByline author={article.author?.display_name} date={date} dateTime={article.published_at} locale={locale} className="ui-blog-article-card__byline" />
        </div>
      </Link>
    </Card>
  );
}
