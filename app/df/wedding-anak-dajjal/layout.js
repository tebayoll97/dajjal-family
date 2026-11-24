import { headers } from "next/headers";

const ORIGIN = "https://dajjalfamily.com";
const PATH = "/df/wedding-anak-dajjal";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const canonical = ORIGIN + "/" + locale + PATH;
  const title = locale === "id"
    ? "Undangan Digital Anak Dajjal & Malika"
    : "Anak Dajjal & Malika Digital Wedding Invitation";
  const description = locale === "id"
    ? "Anda diundang untuk merayakan momen istimewa Anak Dajjal & Malika. Buka undangan digital untuk melihat detail acara."
    : "You are invited to celebrate Anak Dajjal & Malika. Open the digital invitation to explore the celebration details.";

  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        id: ORIGIN + "/id" + PATH,
        en: ORIGIN + "/en" + PATH,
      },
    },
    openGraph: {
      title: title + " | Dajjal Family",
      description,
      url: canonical,
      siteName: "Dajjal Family",
      type: "website",
      images: [
        {
          url: "https://drive.google.com/thumbnail?id=106R3DVD9nT5Am1XUMrtYlxvpftCxgXkg&sz=w1200",
          width: 1200,
          height: 630,
          alt: "Undangan Digital Anak Dajjal & Malika — Dajjal Family",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: title + " | Dajjal Family",
      description,
      images: ["https://drive.google.com/thumbnail?id=106R3DVD9nT5Am1XUMrtYlxvpftCxgXkg&sz=w1200"],
    },
    robots: { index: true, follow: true },
  };
}

export default function AnakDajjalMalikaInvitationLayout({ children }) {
  return children;
}
