import Link from "next/link";
import { Avatar } from "./Avatar";
import { Card } from "./Card";

/** Public contributor identity card. Profile data is supplied by a server-side query. */
export function ContributorCard({ contributor, locale = "id" }) {
  const isEn = locale === "en";
  const name = contributor?.display_name || (isEn ? "DAJJAL FAMILY Contributor" : "Kontributor DAJJAL FAMILY");
  const href = `/${locale}/contributors/profile/${contributor.slug}`;
  const biography = isEn ? contributor.bio_en || contributor.bio_id : contributor.bio_id || contributor.bio_en;
  return (
    <Card className="ui-contributor-card">
      <div className="ui-contributor-card__identity">
        <Avatar name={name} src={contributor.avatar_url || undefined} size="lg" />
        <div className="ui-contributor-card__copy">
          <h2 className="ui-heading-h3">{name}</h2>
          <p className="ui-contributor-card__role">{biography || (isEn ? "DAJJAL FAMILY contributor" : "Kontributor DAJJAL FAMILY")}</p>
        </div>
      </div>
      <div className="ui-contributor-card__footer">
        <span className="ui-caption">{contributor.article_count || 0} {isEn ? "published articles" : "artikel diterbitkan"}</span>
        <Link className="ui-link" href={href}>{isEn ? "View profile" : "Lihat profil"}</Link>
      </div>
    </Card>
  );
}
