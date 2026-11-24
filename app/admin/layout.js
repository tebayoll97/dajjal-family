import { headers } from "next/headers";

const ORIGIN = "https://dajjalfamily.com";

export const dynamic = "force-dynamic";
export const revalidate = 0;
const routeMetadata = {
  "/admin/blog": { id: "Pengelolaan Blog", en: "Blog Management", idDescription: "Kelola pendaftaran penulis, kategori, dan artikel DAJJAL FAMILY Blog.", enDescription: "Manage DAJJAL FAMILY Blog author applications, categories, and articles." },
  "/admin": { id: "Dashboard Admin", en: "Admin Dashboard", idDescription: "Pusat kendali privat untuk mengelola ekosistem Dajjal Family.", enDescription: "Private control center for managing the Dajjal Family ecosystem." },
  "/admin/players": { id: "Manajemen Pengguna", en: "User Management", idDescription: "Kelola akun, profil pemain, akses, dan aktivitas pengguna.", enDescription: "Manage user accounts, player profiles, access, and activity." },
  "/admin/contact-center": { id: "Contact Center", en: "Contact Center", idDescription: "Kelola percakapan dukungan dan notifikasi anggota.", enDescription: "Manage member support conversations and notifications." },
  "/admin/music": { id: "Music Library", en: "Music Library", idDescription: "Kelola katalog audio, metadata, publikasi, dan lirik.", enDescription: "Manage audio catalog, metadata, publication, and lyrics." },
  "/admin/manage-couple": { id: "Kelola Couple Profile", en: "Manage Couple Profiles", idDescription: "Kelola profil pasangan, konten, media, dan publikasi.", enDescription: "Manage couple profiles, content, media, and publication." },
  "/admin/wedding-gallery": { id: "Galeri Pernikahan", en: "Wedding Gallery", idDescription: "Kelola foto dan album galeri undangan pernikahan.", enDescription: "Manage wedding invitation gallery photos and albums." },
  "/admin/wedding-event": { id: "Pengaturan Acara", en: "Event Settings", idDescription: "Atur tanggal dan waktu acara undangan pernikahan.", enDescription: "Configure wedding invitation event date and time." },
  "/admin/wedding-guestbook": { id: "Buku Tamu", en: "Guestbook", idDescription: "Moderasi dan kelola pesan buku tamu undangan.", enDescription: "Moderate and manage wedding invitation guestbook messages." },
  "/admin/storage": { id: "Central Storage", en: "Central Storage", idDescription: "Kelola koneksi penyimpanan terpusat Google Drive.", enDescription: "Manage the central Google Drive storage connection." },
  "/admin/theme": { id: "Theme Manager", en: "Theme Manager", idDescription: "Pratinjau dan terbitkan preset tema global Dajjal Family.", enDescription: "Preview and publish Dajjal Family global theme presets." },
};

function getRouteMeta(path, locale) {
  if (routeMetadata[path]) return routeMetadata[path];
  if (/^\/admin\/music\/[^/]+\/lyrics/.test(path)) return {
    id: "Lyrics Studio", en: "Lyrics Studio",
    idDescription: "Atur sinkronisasi lirik berdasarkan waktu audio.",
    enDescription: "Synchronize track lyrics with audio timestamps.",
  };
  if (/^\/admin\/music\/[^/]+/.test(path)) return {
    id: "Detail Musik", en: "Music Details",
    idDescription: "Kelola metadata, audio, hak cipta, dan publikasi lagu.",
    enDescription: "Manage track metadata, audio, rights, and publication.",
  };
  return routeMetadata["/admin"];
}

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const pathname = requestHeaders.get("x-df-path") || "/admin";
  const meta = getRouteMeta(pathname, locale);
  const title = locale === "en" ? meta.en : meta.id;
  const description = locale === "en" ? meta.enDescription : meta.idDescription;
  const canonical = `${ORIGIN}/${locale}${pathname}`;
  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
    openGraph: {
      title: `${title} | Dajjal Family`,
      description,
      url: canonical,
      siteName: "Dajjal Family",
      type: "website",
      images: [{ url: "/dajjalfamily_icon_192.png", width: 192, height: 192, alt: "Dajjal Family" }],
    },
  };
}

export default function AdminLayout({ children }) {
  return children;
}
