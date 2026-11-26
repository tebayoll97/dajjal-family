export const metadata = {
  title: "Pixel Bio Generator — Darkwar Survival",
  description: "Buat kode bio pixel Darkwar Survival dari gambar atau teks. Atur komposisi, bitmap font, dan warna RGB langsung di perangkat.",
  alternates: {
    languages: {
      id: "https://dajjalfamily.com/id/df/tools-dw/generator-pixel",
      en: "https://dajjalfamily.com/en/df/tools-dw/generator-pixel",
    },
  },
  openGraph: {
    type: "website",
    siteName: "DAJJAL FAMILY",
    title: "Pixel Bio Generator — Darkwar Survival",
    description: "Create Darkwar Survival pixel bio codes from images or text with live RGB preview.",
    images: [{ url: "https://dajjalfamily.com/dajjalfamily_icon_192.png", width: 192, height: 192, alt: "DAJJAL FAMILY" }],
  },
  twitter: {
    card: "summary",
    title: "Pixel Bio Generator — Darkwar Survival",
    description: "Create Darkwar Survival pixel bio codes from images or text.",
    images: ["https://dajjalfamily.com/dajjalfamily_icon_192.png"],
  },
};

export default function DarkwarToolsLayout({ children }) {
  return children;
}
