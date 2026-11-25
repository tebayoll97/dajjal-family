import Link from "next/link";
import { Avatar } from "./Avatar";
import { Card } from "./Card";

export function AuthorCard({ author, locale = "id" }) {
  const isEn = locale === "en";
  const name = author?.display_name || (isEn ? "DAJJAL FAMILY Contributor" : "Kontributor DAJJAL FAMILY");
  const href = `/${locale}/blog/author/${author.slug}`;
  return (
    <Card className="ui-author-card">
      <div className="ui-author-card__identity">
        <Avatar name={name} src={author.avatar_url || undefined} size="lg" />
        <div className="ui-author-card__copy">
          <h2 className="ui-heading-h3">{name}</h2>
          <p className="ui-author-card__role">{(isEn ? author.bio_en || author.bio_id : author.bio_id || author.bio_en) || (isEn ? "Editorial contributor" : "Kontributor editorial")}</p>
        </div>
      </div>
      <div className="ui-author-card__footer">
        <span className="ui-caption">{author.article_count || 0} {isEn ? "published articles" : "artikel diterbitkan"}</span>
        <Link className="ui-link" href={href}>{isEn ? "View profile" : "Lihat profil"}</Link>
      </div>
    </Card>
  );
}
