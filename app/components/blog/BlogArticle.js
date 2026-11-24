"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Badge, Breadcrumbs, Card, EditorialByline } from "@/app/components/ui";

export default function BlogArticle({ article }) {
  const { language } = useLanguage();
  const isIndonesian = language === "id";
  const date = new Intl.DateTimeFormat(isIndonesian ? "id-ID" : "en-US", { dateStyle: "long" }).format(new Date(article.published_at));
  const paragraphs = String(article.content || "").split(String.fromCharCode(10).repeat(2)).map((part) => part.trim()).filter(Boolean);

  return (
    <main className="ui-page df-blog-article">
      <Breadcrumbs items={[
        { label: isIndonesian ? "Beranda" : "Home", href: `/${language}` },
        { label: "Blog", href: `/${language}/blog` },
        { label: article.title },
      ]} />
      <article className="ui-editorial-reading ui-stack df-blog-article-content">
        <header className="ui-page-heading">
          {article.category?.name_id ? <Badge>{isIndonesian ? article.category.name_id : article.category.name_en || article.category.name_id}</Badge> : null}
          <h1 className="ui-heading-h1">{article.title}</h1>
          {article.excerpt ? <p className="ui-subtitle">{article.excerpt}</p> : null}
          <EditorialByline
            author={article.author?.display_name}
            date={date}
            dateTime={article.published_at}
            readingTime={article.reading_minutes}
            locale={language}
          />
        </header>
        {article.cover_image_url ? (
          <Image className="df-blog-article-cover" src={article.cover_image_url} alt={article.title} width={1440} height={810} unoptimized priority />
        ) : null}
        <Card className="df-blog-prose">
          <div className="ui-prose ui-text-editorial-body">
            {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
          </div>
        </Card>
        <Link className="ui-button ui-button-secondary" href={`/${language}/blog`}>
          ← {isIndonesian ? "Kembali ke Blog" : "Back to Blog"}
        </Link>
      </article>
    </main>
  );
}
