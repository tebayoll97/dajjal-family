"use client";

import Link from "next/link";
import { useLanguage } from "@/app/components/LanguageProvider";
import { Card, SvgIcon } from "@/app/components/ui";
import styles from "./agent-dajjal-tools.module.css";

const COPY = {
  id: {
    eyebrow: "DAJJAL FAMILY · ON-DEVICE PROCESSING", title: "Agent Dajjal",
    intro: "Kumpulan tools yang berjalan langsung di perangkatmu. File pribadi tidak perlu dikirim ke server.",
    available: "Tersedia", planned: "Segera hadir", open: "Buka tool",
    compressor: "Kompres Gambar", compressorDesc: "Kecilkan ukuran JPG, PNG, dan WebP dengan kontrol kualitas dan dimensi.",
    remover: "Background Remover", removerDesc: "Hapus latar gambar dengan pemrosesan AI lokal.",
    separator: "Instrument Separator", separatorDesc: "Pisahkan vokal dan instrumen dari audio secara lokal.",
    local: "Pemrosesan lokal", privacy: "File tetap di perangkatmu.",
  },
  en: {
    eyebrow: "DAJJAL FAMILY · ON-DEVICE PROCESSING", title: "Agent Dajjal",
    intro: "A collection of tools that run directly on your device. Your private files do not need to be uploaded.",
    available: "Available", planned: "Coming soon", open: "Open tool",
    compressor: "Image Compressor", compressorDesc: "Reduce JPG, PNG, and WebP file sizes with quality and dimension controls.",
    remover: "Background Remover", removerDesc: "Remove image backgrounds with on-device AI processing.",
    separator: "Instrument Separator", separatorDesc: "Separate vocals and instruments from audio locally.",
    local: "Local processing", privacy: "Your files stay on your device.",
  },
};

export default function AgentDajjalToolsClient() {
  const { language } = useLanguage();
  const t = COPY[language] || COPY.id;
  const tools = [
    { id: "compressor", icon: "image", title: t.compressor, description: t.compressorDesc, href: "/df/agent-dajjal/tools/image-compressor", ready: true },
    { id: "remover", icon: "image", title: t.remover, description: t.removerDesc, ready: false },
    { id: "separator", icon: "music", title: t.separator, description: t.separatorDesc, ready: false },
  ];
  return (
    <main className={styles.page}>
      <header className="ui-page-heading">
        <div className="ui-page-heading-copy">
          <p className="ui-eyebrow">{t.eyebrow}</p>
          <h1 className="ui-heading-h1">{t.title}</h1>
          <p className="ui-subtitle">{t.intro}</p>
        </div>
      </header>
      <div className={styles.grid}>
        {tools.map((tool) => {
          const content = (
            <Card className={styles.toolCard}>
              <div className={styles.toolHead}>
                <span className={styles.toolIcon}><SvgIcon name={tool.icon} size={23} /></span>
                <span className={tool.ready ? styles.available : styles.planned}>{tool.ready ? t.available : t.planned}</span>
              </div>
              <h2>{tool.title}</h2>
              <p>{tool.description}</p>
              {tool.ready && <span className={styles.open}>{t.open}<SvgIcon name="arrow-left" size={15} /></span>}
            </Card>
          );
          return tool.ready ? <Link className={styles.link} href={tool.href} key={tool.id}>{content}</Link> : <div key={tool.id} aria-disabled="true">{content}</div>;
        })}
      </div>
      <p className={styles.privacy}><SvgIcon name="shield" size={17} />{t.privacy}</p>
    </main>
  );
}
