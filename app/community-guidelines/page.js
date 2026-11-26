import Link from "next/link";
import { headers } from "next/headers";

const copy = {
  id: {
    eyebrow: "DAJJAL FAMILY / KOMUNITAS",
    title: "Community Guidelines",
    lead: "Pedoman bersama untuk menjaga DAJJAL FAMILY tetap aman, ramah, dan menyenangkan bagi semua orang.",
    introTitle: "Satu keluarga, banyak kemungkinan.",
    intro: "DAJJAL FAMILY dibangun sebagai semesta digital untuk gaming, pengetahuan, kreativitas, bisnis, dan koneksi. Setiap orang berhak menikmati ruang yang saling menghormati. Pedoman ini berlaku untuk interaksi di website dan ruang komunitas resmi DAJJAL FAMILY yang dikelola atau diumumkan oleh kami.",
    sections: [
      { id: "respect", title: "1. Perlakukan orang lain dengan hormat", points: [
        "Gunakan bahasa yang sopan dan berdiskusilah dengan itikad baik, termasuk saat berbeda pendapat.",
        "Jangan melakukan perundungan, ancaman, intimidasi, pelecehan, penghinaan yang ditujukan kepada seseorang, atau mengajak orang lain menyerang anggota tertentu.",
        "Jangan menyebarkan ujaran kebencian atau menghasut diskriminasi berdasarkan identitas pribadi seseorang.",
        "Kritik ide, karya, atau perilaku secara wajar; jangan menyerang martabat atau keselamatan orangnya."
      ]},
      { id: "privacy", title: "2. Jaga privasi dan keselamatan", points: [
        "Jangan membagikan alamat rumah, nomor telepon, email pribadi, kredensial akun, dokumen identitas, lokasi langsung, atau data pribadi orang lain tanpa izin.",
        "Jangan meminta kata sandi, kode OTP, token, atau akses akun anggota lain. Tim DAJJAL FAMILY tidak membutuhkan kata sandi atau OTP milikmu.",
        "Jangan mengunggah foto, rekaman, percakapan pribadi, atau informasi sensitif orang lain tanpa hak dan persetujuan yang sesuai.",
        "Jika menemukan dugaan penipuan atau risiko keselamatan, jangan ikut menyebarkannya; laporkan melalui kanal dukungan resmi."
      ]},
      { id: "spam", title: "3. Hindari spam, penipuan, dan penyalahgunaan", points: [
        "Jangan mengirim pesan berulang, promosi tidak diminta, komentar otomatis, atau konten yang mengganggu pengalaman anggota lain.",
        "Dilarang melakukan phishing, penipuan, impersonasi, manipulasi transaksi, menyebarkan malware, atau mengarahkan anggota ke tautan berbahaya.",
        "Jangan berpura-pura menjadi staf, admin, kreator, atau perwakilan resmi DAJJAL FAMILY.",
        "Jangan mengeksploitasi bug, mengganggu layanan, memanipulasi sistem game, atau mencoba mengakses akun dan data tanpa izin."
      ]},
      { id: "content", title: "4. Bagikan konten yang pantas dan kamu berhak gunakan", points: [
        "Pastikan kamu memiliki hak atau izin yang diperlukan sebelum mengunggah teks, gambar, musik, video, logo, atau karya milik pihak lain.",
        "Jangan membagikan konten ilegal, eksploitasi, ancaman kekerasan, atau materi yang secara jelas membahayakan orang lain.",
        "Gunakan kategori dan ruang yang sesuai. Hindari konten seksual eksplisit, materi mengejutkan yang tidak relevan, atau konten yang tidak pantas untuk konteks ruang tersebut.",
        "Jangan memanipulasi identitas, hasil, bukti, atau informasi untuk menipu anggota lain."
      ]},
      { id: "constructive", title: "5. Bangun ruang yang bermanfaat", points: [
        "Bantu anggota baru, berikan konteks saat bertanya, dan hargai waktu orang yang membantu.",
        "Promosi, ajakan kolaborasi, atau penawaran bisnis harus relevan dan hanya dilakukan di tempat yang memang mengizinkannya.",
        "Ikuti aturan tambahan yang mungkin ditampilkan pada game, event, atau ruang komunitas tertentu.",
        "Gunakan fitur laporan dengan itikad baik. Jangan membuat laporan palsu atau menggunakannya untuk mengganggu anggota lain."
      ]},
      { id: "discord", title: "6. Ruang komunitas dan Discord resmi", points: [
        "Pedoman ini juga menjadi acuan dasar untuk ruang komunitas resmi DAJJAL FAMILY, termasuk Discord setelah dibuka.",
        "Discord resmi hanya akan diumumkan melalui website atau kanal resmi DAJJAL FAMILY. Berhati-hatilah terhadap undangan yang mengatasnamakan kami.",
        "Jika aturan khusus suatu ruang lebih ketat, ikuti aturan khusus tersebut selama tidak bertentangan dengan ketentuan yang berlaku."
      ]},
      { id: "reports", title: "7. Pelaporan dan tindak lanjut", points: [
        "Jika melihat pelanggaran, simpan informasi yang relevan dan laporkan melalui Contact Center dengan kategori Laporan. Hindari mengunggah ulang konten bermasalah ke ruang publik.",
        "Sampaikan kronologi secara faktual, sertakan tautan atau konteks yang diperlukan, dan jangan menyertakan data pribadi yang tidak relevan.",
        "Laporan dapat ditinjau sesuai informasi yang tersedia dan kapasitas operasional. Kami tidak menjanjikan waktu respons tertentu.",
        "Jika diperlukan untuk melindungi anggota atau layanan, DAJJAL FAMILY dapat mengambil tindakan yang proporsional, termasuk membatasi atau menghapus konten maupun akses ke fitur/ruang terkait, sesuai kebijakan dan kemampuan yang tersedia.",
        "Tidak semua laporan dapat menghasilkan tindakan yang dapat dibagikan kepada pelapor. Jangan menganggap tindakan atau hasil tertentu sebagai jaminan."
      ]},
    ],
    finalTitle: "Pedoman ini dapat diperbarui",
    finalText: "Pedoman dapat disesuaikan ketika fitur dan ruang komunitas berkembang. Periksa halaman ini secara berkala. Penggunaan layanan tetap tunduk pada Terms & Conditions dan kebijakan lain yang berlaku setelah diterbitkan.",
    updated: "Terakhir diperbarui: 19 November 2026",
    help: "Kembali ke Pusat Bantuan",
    report: "Laporkan melalui Contact Center",
    contact: "Hubungi kami",
  },
  en: {
    eyebrow: "DAJJAL FAMILY / COMMUNITY",
    title: "Community Guidelines",
    lead: "Shared principles for keeping DAJJAL FAMILY safe, welcoming, and enjoyable for everyone.",
    introTitle: "One family, many possibilities.",
    intro: "DAJJAL FAMILY is a digital universe for gaming, knowledge, creativity, business, and connection. Everyone should be able to enjoy spaces built on mutual respect. These guidelines apply to interactions on our website and official community spaces managed or announced by DAJJAL FAMILY.",
    sections: [
      { id: "respect", title: "1. Treat others with respect", points: [
        "Use considerate language and engage in good-faith discussions, including when opinions differ.",
        "Do not bully, threaten, intimidate, harass, personally demean, or encourage others to target a member.",
        "Do not share hateful content or encourage discrimination against people based on personal identity.",
        "Critique ideas, work, or conduct constructively; do not attack a person's dignity or safety."
      ]},
      { id: "privacy", title: "2. Protect privacy and safety", points: [
        "Do not share someone's home address, phone number, private email, account credentials, identity documents, live location, or personal data without permission.",
        "Never ask another member for passwords, one-time codes, tokens, or account access. DAJJAL FAMILY staff do not need your password or OTP.",
        "Do not upload another person's photos, recordings, private conversations, or sensitive information without the appropriate rights and consent.",
        "If you encounter suspected fraud or a safety risk, do not amplify it; report it through an official support channel."
      ]},
      { id: "spam", title: "3. No spam, scams, or abuse", points: [
        "Do not send repeated messages, unsolicited promotions, automated comments, or content that disrupts other members' experience.",
        "Phishing, fraud, impersonation, transaction manipulation, malware distribution, and directing members to harmful links are prohibited.",
        "Do not pretend to be DAJJAL FAMILY staff, an administrator, creator, or official representative.",
        "Do not exploit bugs, disrupt services, manipulate game systems, or attempt unauthorized access to accounts or data."
      ]},
      { id: "content", title: "4. Share appropriate content you have the right to use", points: [
        "Make sure you have the necessary rights or permission before uploading text, images, music, video, logos, or another person's work.",
        "Do not share illegal content, exploitation, threats of violence, or material that clearly puts others at risk.",
        "Use the appropriate category and space. Avoid explicit sexual content, unrelated shock material, or content unsuitable for that space.",
        "Do not falsify identities, results, evidence, or information to deceive other members."
      ]},
      { id: "constructive", title: "5. Help build a useful community", points: [
        "Welcome new members, provide context when asking questions, and respect the time of people who help.",
        "Promotions, collaboration requests, and business offers must be relevant and limited to spaces where they are permitted.",
        "Follow any additional rules displayed for a specific game, event, or community space.",
        "Use reporting features in good faith. Do not submit false reports or use reports to target other members."
      ]},
      { id: "discord", title: "6. Official community spaces and Discord", points: [
        "These guidelines also serve as baseline rules for official DAJJAL FAMILY community spaces, including Discord when it opens.",
        "The official Discord will only be announced through the DAJJAL FAMILY website or official channels. Be cautious of invitations claiming to represent us.",
        "If a specific space has additional rules, follow those rules where applicable and consistent with relevant requirements."
      ]},
      { id: "reports", title: "7. Reporting and follow-up", points: [
        "If you see a violation, keep relevant context and report it through Contact Center using the Report category. Avoid reposting problematic content publicly.",
        "Describe what happened factually, include relevant links or context, and do not submit unrelated personal data.",
        "Reports may be reviewed based on the information available and operational capacity. We do not promise a specific response time.",
        "When needed to protect members or the service, DAJJAL FAMILY may take proportionate action, including limiting or removing content or access to relevant features/spaces, subject to applicable policies and available capabilities.",
        "Not every report will result in an action or an outcome that can be shared with the reporter. No particular outcome is guaranteed."
      ]},
    ],
    finalTitle: "These guidelines may change",
    finalText: "These guidelines may be updated as our features and community spaces evolve. Check this page periodically. Use of the service remains subject to the Terms & Conditions and other applicable policies once published.",
    updated: "Last updated: 19 November 2026",
    help: "Back to Help Center",
    report: "Report through Contact Center",
    contact: "Contact us",
  },
};

export async function generateMetadata() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const t = copy[locale];
  const canonical = `https://dajjalfamily.com/${locale}/community-guidelines`;
  return {
    title: locale === "id" ? "Pedoman Komunitas" : "Community Guidelines",
    description: t.lead,
    robots: { index: true, follow: true },
    alternates: {
      canonical,
      languages: {
        id: "https://dajjalfamily.com/id/community-guidelines",
        en: "https://dajjalfamily.com/en/community-guidelines",
        "x-default": "https://dajjalfamily.com/id/community-guidelines",
      },
    },
    openGraph: {
      title: locale === "id" ? "Pedoman Komunitas" : "Community Guidelines",
      description: t.lead,
      url: canonical,
      siteName: "DAJJAL FAMILY",
      type: "website",
      locale: locale === "id" ? "id_ID" : "en_US",
    },
  };
}

export default async function CommunityGuidelinesPage() {
  const requestHeaders = await headers();
  const locale = requestHeaders.get("x-df-locale") === "en" ? "en" : "id";
  const t = copy[locale];
  const href = (path) => `/${locale}${path}`;

  return (
    <main className="df-public-info df-guidelines-page">
      <header className="df-public-hero">
        <span className="df-public-eyebrow">{t.eyebrow}</span>
        <h1>{t.title}</h1>
        <p className="df-public-lead">{t.lead}</p>
        <p className="df-guidelines-updated">{t.updated}</p>
      </header>

      <section className="df-public-section df-guidelines-content">
        <div className="df-contact-note df-guidelines-intro">
          <h2>{t.introTitle}</h2>
          <p>{t.intro}</p>
        </div>

        <div className="df-guidelines-list">
          {t.sections.map((section) => (
            <section className="df-guidelines-card" key={section.id} id={section.id}>
              <h2>{section.title}</h2>
              <ul>
                {section.points.map((point, index) => <li key={index}>{point}</li>)}
              </ul>
            </section>
          ))}
        </div>

        <div className="df-contact-note df-guidelines-final">
          <h2>{t.finalTitle}</h2>
          <p>{t.finalText}</p>
        </div>
      </section>

      <section className="df-about-cta">
        <div><span className="df-public-kicker">DAJJAL FAMILY / COMMUNITY</span><h2>{t.contact}</h2></div>
        <div className="df-public-actions">
          <Link className="df-public-button df-public-button-primary" href={href("/contact-center")}>{t.report}<span aria-hidden="true">↗</span></Link>
          <Link className="df-public-button df-public-button-secondary" href={href("/help")}>{t.help}</Link>
          <Link className="df-public-button df-public-button-secondary" href={href("/contact")}>{t.contact}</Link>
        </div>
      </section>
    </main>
  );
}
