"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Badge, Breadcrumbs, Card, EditorialByline, BlogArticleNavigation } from "@/app/components/ui";
import EditorialContentRenderer from "./EditorialContentRenderer";

export default function BlogArticle({ article, navigation }) {
  const { language } = useLanguage();
  const isIndonesian = language === "id";
  const date = new Intl.DateTimeFormat(isIndonesian ? "id-ID" : "en-US", { dateStyle: "long" }).format(new Date(article.published_at));

  return (
    <main className="ui-page df-blog-article">
      <Breadcrumbs items={[
        { label: isIndonesian ? "Beranda" : "Home", href: `/${language}` },
        { label: "Blog", href: `/${language}/blog` },
        { label: article.title },
      ]} />
      <EditorialByline author={article.author?.display_name} date={date} dateTime={article.published_at} locale={language} className="df-blog-article-byline" />
      <div className="ui-blog-article-layout">
        <article className="ui-stack df-blog-article-content">
          <header className="ui-page-heading">
            {article.category?.name_id ? <Badge>{isIndonesian ? article.category.name_id : article.category.name_en || article.category.name_id}</Badge> : null}
            <h1 className="ui-heading-h1">{article.title}</h1>
            {article.excerpt ? <p className="ui-subtitle">{article.excerpt}</p> : null}
          </header>
          <Image className="df-blog-article-cover" src={article.cover_image_url || "/dajjalfamily_icon_192.png"} alt={article.cover_image_alt || article.title || "DAJJAL FAMILY"} width={1440} height={810} unoptimized={!article.cover_image_url?.includes("/storage/v1/object/public/df-blog-media/")} priority />
          <Card className="df-blog-prose">
            <div className="ui-prose ui-text-editorial-body"><EditorialContentRenderer content={article.content} locale={language}/></div>
          </Card>
          <Link className="ui-button ui-button-secondary" href={`/${language}/blog`}>
            ← {isIndonesian ? "Kembali ke Blog" : "Back to Blog"}
          </Link>
        </article>
        <BlogArticleNavigation locale={language} recentPosts={navigation?.recentPosts} categories={navigation?.categories}/>
      </div>
    </main>
  );
}
