import { cache } from "react";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { COUPLE_CONTENT_DEFAULTS } from "@/lib/coupleProfileDefaults";
import CoupleProfileView from "@/app/components/CoupleProfileView";

export const dynamic = "force-dynamic";

const ORIGIN = "https://dajjalfamily.com";

// Share the published profile lookup between generateMetadata and the page
// render within the same request, without caching mutable profile data across requests.
const getPublishedCoupleProfile = cache(async (slug, locale) => {
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("df_couple_profiles")
    .select("id,male_nickname,female_nickname,slug,anniversary_date,is_published")
    .eq("slug", slug)
    .eq("is_published", true)
    .maybeSingle();

  if (profileError) throw new Error("Unable to load Couple Profile.");

  if (!profile) return null;

  const [{ data: content, error: contentError }, { data: media, error: mediaError }] =
    await Promise.all([
      supabaseAdmin
        .from("df_couple_contents")
        .select("locale,content,seo_title,seo_description")
        .eq("couple_id", profile.id)
        .eq("locale", locale)
        .maybeSingle(),
      supabaseAdmin
        .from("df_couple_media")
        .select("slot_key,google_drive_file_id")
        .eq("couple_id", profile.id)
        .order("slot_key"),
    ]);

  if (contentError || mediaError) {
    throw new Error("Unable to load Couple Profile details.");
  }

  return { profile, content, media: media || [] };
});

async function getRequestLocale() {
  const requestHeaders = await headers();
  return requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
}

export async function generateMetadata({ params }) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const data = await getPublishedCoupleProfile(slug, locale);

  if (!data) {
    return {
      title: locale === "en" ? "Couple Profile not found" : "Profil Couple tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const { profile, content } = data;
  const names = `${profile.male_nickname} × ${profile.female_nickname}`;
  const title = content?.seo_title ||
    (locale === "en" ? `${names} — Couple Profile` : `${names} — Profil Couple`);
  const description = content?.seo_description || content?.content?.intro ||
    (locale === "en" ? `Explore the story of ${names}.` : `Kenali cerita ${names}.`);
  const path = `/${locale}/couple/${slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: ORIGIN + path,
      languages: {
        id: ORIGIN + `/id/couple/${slug}`,
        en: ORIGIN + `/en/couple/${slug}`,
      },
    },
    openGraph: {
      title: `${title} | Dajjal Family`,
      description,
      url: ORIGIN + path,
      siteName: "Dajjal Family",
      type: "website",
    },
    robots: { index: true, follow: true },
  };
}

export default async function CoupleProfilePage({ params }) {
  const [{ slug }, locale] = await Promise.all([params, getRequestLocale()]);
  const data = await getPublishedCoupleProfile(slug, locale);

  if (!data) notFound();

  return (
    <CoupleProfileView
      profile={data.profile}
      content={{
        ...COUPLE_CONTENT_DEFAULTS[locale],
        ...(data.content?.content || {}),
      }}
      media={data.media}
      locale={locale}
    />
  );
}
