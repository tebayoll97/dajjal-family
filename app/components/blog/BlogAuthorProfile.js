import Link from "next/link";
import { Breadcrumbs, Card, Avatar, BlogArticleCard } from "@/app/components/ui";

export default function BlogAuthorProfile({ profile, locale = "id" }) {
  const isEn = locale === "en";
  const name = profile.author.display_name;
  return (
    <main className="ui-page df-blog-author-page">
      <Breadcrumbs items={[
        { label: isEn ? "Home" : "Beranda", href: `/${locale}` },
        { label: "Blog", href: `/${locale}/blog` },
        { label: isEn ? "Author" : "Penulis", href: `/${locale}/blog/author/${profile.author.slug}` },
        { label: name },
      ]} />
      <Card className="df-blog-author-profile">
        <Avatar name={name} size="xl" />
        <div className="ui-stack-sm">
          <p className="ui-eyebrow">{isEn ? "BLOG AUTHOR" : "PENULIS BLOG"}</p>
          <h1 className="ui-heading-h1">{name}</h1>
          <p className="ui-subtitle">{isEn ? "Editorial contributor at DAJJAL FAMILY, sharing stories, useful insights, and updates from our digital universe." : "Penulis DAJJAL FAMILY yang berbagi cerita, wawasan bermanfaat, dan kabar dari semesta digital kami."}</p>
        </div>
      </Card>
      <section className="ui-stack df-blog-author-articles" aria-labelledby="author-articles-title">
        <div className="ui-section-heading">
          <div className="ui-section-heading-copy">
            <h2 id="author-articles-title" className="ui-heading-h2">{isEn ? "Articles by" : "Artikel oleh"} {name}</h2>
            <p className="ui-section-description">{profile.articles.length} {isEn ? "published articles" : "artikel diterbitkan"}</p>
          </div>
          <Link className="ui-link" href={`/${locale}/blog`}>{isEn ? "All articles" : "Semua artikel"}</Link>
        </div>
        {profile.articles.length ? <div className="ui-blog-article-grid">{profile.articles.map((article) => <BlogArticleCard key={article.id} article={article} locale={locale} />)}</div> : <p className="ui-caption">{isEn ? "No published articles yet." : "Belum ada artikel yang diterbitkan."}</p>}
      </section>
    </main>
  );
}
