import { headers } from "next/headers";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import CoupleProfileClient from "./CoupleProfileClient";

const ORIGIN = "https://dajjalfamily.com";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const { data: profile } = await supabaseAdmin.from("df_couple_profiles")
    .select("id,male_nickname,female_nickname,slug,is_published")
    .eq("slug", slug).eq("is_published", true).maybeSingle();

  if (!profile) return {
    title: locale === "en" ? "Couple Profile not found" : "Profil Couple tidak ditemukan",
    robots: { index: false, follow: false },
  };

  const { data: content } = await supabaseAdmin.from("df_couple_contents")
    .select("seo_title,seo_description,content")
    .eq("couple_id", profile.id).eq("locale", locale).maybeSingle();

  const names = `${profile.male_nickname} × ${profile.female_nickname}`;
  const title = content?.seo_title || (locale === "en" ? `${names} — Couple Profile` : `${names} — Profil Couple`);
  const description = content?.seo_description || content?.content?.intro ||
    (locale === "en" ? `Explore the story of ${names}.` : `Kenali cerita ${names}.`);
  const path = `/${locale}/couple/${slug}`;
  return {
    title,
    description,
    alternates: { canonical: ORIGIN + path, languages: { id: ORIGIN + `/id/couple/${slug}`, en: ORIGIN + `/en/couple/${slug}` } },
    openGraph: { title: `${title} | Dajjal Family`, description, url: ORIGIN + path, siteName: "Dajjal Family", type: "website" },
    robots: { index: true, follow: true },
  };
}

export default async function CoupleProfilePage({ params }) {
  const { slug } = await params;
  return <CoupleProfileClient slug={slug} />;
}
