import Link from "next/link";
import { Card } from "./Card";

/** Locale-aware article discovery rail shared by public Blog detail pages. */
export function BlogArticleNavigation({ recentPosts = [], categories = [], locale = "id" }) {
  const isEn = locale === "en";
  return (
    <aside className="ui-blog-article-navigation" aria-label={isEn ? "Blog navigation" : "Navigasi Blog"}>
      <Card className="ui-blog-article-navigation__panel">
        <h2 className="ui-blog-article-navigation__heading">{isEn ? "Recent Posts" : "Artikel Terbaru"}</h2>
        {recentPosts.length ? (
          <ul className="ui-blog-article-navigation__list">
            {recentPosts.slice(0, 3).map((post) => (
              <li key={post.id}>
                <Link className="ui-blog-article-navigation__link" href={`/${locale}/blog/${post.slug}`}>
                  <span>{post.title}</span>
                  {post.published_at ? <time dateTime={post.published_at}>{new Intl.DateTimeFormat(isEn ? "en-US" : "id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(post.published_at))}</time> : null}
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="ui-blog-article-navigation__empty">{isEn ? "No other articles yet." : "Belum ada artikel lainnya."}</p>}
      </Card>
      <Card className="ui-blog-article-navigation__panel">
        <h2 className="ui-blog-article-navigation__heading">{isEn ? "Blog Categories" : "Kategori Blog"}</h2>
        {categories.length ? (
          <ul className="ui-blog-article-navigation__list">
            {categories.map((category) => (
              <li key={category.id}>
                <Link className="ui-blog-article-navigation__category" href={`/${locale}/blog?category=${encodeURIComponent(category.slug)}`}>
                  <span>{category.name}</span><span className="ui-blog-article-navigation__count">{category.article_count}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : <p className="ui-blog-article-navigation__empty">{isEn ? "No categories available." : "Belum ada kategori."}</p>}
      </Card>
    </aside>
  );
}
