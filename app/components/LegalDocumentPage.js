import Link from "next/link";
import { withLocalePrefix } from "@/lib/localePath";
import { getLegalDocument } from "@/lib/legalDocuments";

const related = {
  "privacy-policy": ["terms", "cookie-policy", "disclaimer"],
  terms: ["privacy-policy", "cookie-policy", "disclaimer"],
  "cookie-policy": ["privacy-policy", "terms", "disclaimer"],
  disclaimer: ["privacy-policy", "terms", "cookie-policy"],
};
const slugs = {
  "privacy-policy": "privacy-policy",
  terms: "terms",
  "cookie-policy": "cookie-policy",
  disclaimer: "disclaimer",
};

export default function LegalDocumentPage({ documentKey, locale = "id" }) {
  const t = getLegalDocument(documentKey, locale);
  if (!t) return null;
  const href = (slug) => withLocalePrefix("/" + slugs[slug], locale);
  const relatedLabels = {
    id: { "privacy-policy": "Kebijakan Privasi", terms: "Syarat & Ketentuan", "cookie-policy": "Kebijakan Cookie", disclaimer: "Disclaimer" },
    en: { "privacy-policy": "Privacy Policy", terms: "Terms & Conditions", "cookie-policy": "Cookie Policy", disclaimer: "Disclaimer" },
  };
  const contactLabel = locale === "en" ? "Contact the team" : "Hubungi tim";
  const contactHref = withLocalePrefix("/contact", locale);

  return (
    <main className="df-public-info df-legal-page">
      <header className="df-public-hero df-legal-hero">
        <span className="df-public-eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="df-public-lead">{t.lead}</p>
        <p className="df-legal-updated">{locale === "en" ? "Last updated: 26 November 2026" : "Terakhir diperbarui: 26 November 2026"}</p>
      </header>

      <div className="df-legal-layout">
        <article className="df-legal-document">
          {t.sections.map(([heading, paragraphs]) => (
            <section className="df-legal-section" key={heading}>
              <h2>{heading}</h2>
              {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </section>
          ))}
        </article>

        <aside className="df-legal-aside">
          <span className="df-public-kicker">{locale === "en" ? "RELATED POLICIES" : "KEBIJAKAN TERKAIT"}</span>
          <nav aria-label={locale === "en" ? "Related legal pages" : "Halaman legal terkait"}>
            {related[documentKey].map((slug) => (
              <Link href={href(slug)} key={slug}>{relatedLabels[locale][slug]}</Link>
            ))}
          </nav>
          <Link className="df-legal-contact" href={contactHref}>{contactLabel} <span aria-hidden="true">↗</span></Link>
        </aside>
      </div>
    </main>
  );
}
