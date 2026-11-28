import { headers } from "next/headers";
import ImageCompressorClient from "@/app/df/agent-dajjal/tools/image-compressor/ImageCompressorClient";

const origin = "https://dajjalfamily.com";
const fallbackImage = "/dajjalfamily_icon_192.png";

export async function generateMetadata() {
  const requestHeaders = await headers();
  const language = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const title = language === "en" ? "Image Compressor" : "Kompres Gambar";
  const description = language === "en"
    ? "Compress images locally on your device. Preview the result and download without uploading your files."
    : "Kompres gambar langsung di perangkat. Pratinjau hasil dan unduh tanpa mengunggah file.";
  const path = `/${language}/tools/image-compressor`;

  return {
    title: `${title} | DAJJAL FAMILY`,
    description,
    alternates: {
      canonical: origin + path,
      languages: {
        id: origin + "/id/tools/image-compressor",
        en: origin + "/en/tools/image-compressor",
      },
    },
    openGraph: {
      type: "website",
      siteName: "DAJJAL FAMILY",
      title,
      description,
      url: origin + path,
      images: [{ url: fallbackImage, width: 192, height: 192, alt: "DAJJAL FAMILY" }],
      locale: language === "en" ? "en_US" : "id_ID",
    },
    twitter: { card: "summary", title, description, images: [fallbackImage] },
  };
}

export default function ImageCompressorPage() {
  return <ImageCompressorClient />;
}
