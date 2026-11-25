import Link from "next/link";
import { Breadcrumbs, Button, EmptyState, AuthorCard } from "@/app/components/ui";

export default function BlogAuthorDirectory({ authors = [], locale = "id" }) {
  const isEn = locale === "en";
  return (
    <main className="ui-page df-blog-author-directory">
      <Breadcrumbs items={[
        { label: isEn ? "Home" : "Beranda", href: `/${locale}` },
        { label: "Blog", href: `/${locale}/blog` },
        { label: isEn ? "Authors" : "Penulis" },
      ]} />
      <header className="ui-page-heading">
        <p className="ui-eyebrow">DAJJAL FAMILY / BLOG</p>
        <h1 className="ui-heading-h1">{isEn ? "Meet Our Contributors" : "Kenali Para Kontributor"}</h1>
        <p className="ui-subtitle">{isEn ? "The people behind the stories, insights, and ideas published by DAJJAL FAMILY." : "Orang-orang di balik cerita, wawasan, dan gagasan yang diterbitkan oleh DAJJAL FAMILY."}</p>
        <div className="ui-cluster">
          <span className="ui-caption">{authors.length} {isEn ? "contributors" : "kontributor"}</span>
          <Link className="ui-button ui-button-secondary" href={`/${locale}/author/me`}>{isEn ? "Contributor workspace" : "Ruang kerja kontributor"}</Link>
        </div>
      </header>
      {authors.length ? <section className="ui-author-grid" aria-label={isEn ? "Published contributors" : "Kontributor aktif"}>
        {authors.map((author) => <AuthorCard key={author.id} author={author} locale={locale} />)}
      </section> : <EmptyState title={isEn ? "No contributors to show yet" : "Belum ada kontributor"} description={isEn ? "Approved contributors will appear here after publishing an article." : "Kontributor yang telah disetujui akan tampil di sini setelah menerbitkan artikel."} action={<Button as="a" href={`/${locale}/author/apply`}>{isEn ? "Apply to contribute" : "Daftar sebagai kontributor"}</Button>} />}
    </main>
  );
}
