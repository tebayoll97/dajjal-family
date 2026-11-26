import { Card } from "./Card";

const copy = {
  id: {
    whatsapp: { name: "WhatsApp Business", description: "Chat langsung dengan tim kami", value: "+62 851-4132-0943", action: "Hubungi DAJJAL FAMILY melalui WhatsApp di nomor +62 851-4132-0943. Tautan terbuka di tab baru." },
    telegram: { name: "Telegram", description: "Terhubung melalui Telegram", value: "@dajjalf4mily", action: "Hubungi DAJJAL FAMILY melalui Telegram di username @dajjalf4mily. Tautan terbuka di tab baru." },
    official: "KANAL RESMI",
  },
  en: {
    whatsapp: { name: "WhatsApp Business", description: "Start a direct chat with our team", value: "+62 851-4132-0943", action: "Contact DAJJAL FAMILY on WhatsApp at +62 851-4132-0943. Opens in a new tab." },
    telegram: { name: "Telegram", description: "Connect with us on Telegram", value: "@dajjalf4mily", action: "Contact DAJJAL FAMILY on Telegram at @dajjalf4mily. Opens in a new tab." },
    official: "OFFICIAL CHANNEL",
  },
};

function ChannelIcon({ channel }) {
  if (channel === "whatsapp") return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="M20.52 3.48A11.83 11.83 0 0 0 1.9 17.76L.5 23.5l5.87-1.54A11.83 11.83 0 0 0 20.52 3.48Z" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinejoin="round" />
      <path d="M8.12 6.95c-.3-.66-.62-.67-.91-.68h-.78c-.27 0-.7.1-1.07.5-.37.4-1.4 1.37-1.4 3.34s1.43 3.88 1.63 4.15c.2.27 2.76 4.42 6.82 6.02 3.37 1.33 4.06 1.07 4.79 1 .73-.07 2.36-.97 2.7-1.9.33-.94.33-1.74.23-1.9-.1-.17-.37-.27-.77-.47-.4-.2-2.36-1.17-2.73-1.3-.37-.14-.63-.2-.9.2-.27.4-1.03 1.3-1.26 1.57-.23.27-.47.3-.87.1-.4-.2-1.7-.63-3.24-2.01-1.2-1.07-2.01-2.4-2.24-2.8-.24-.4-.03-.62.17-.82.18-.18.4-.47.6-.7.2-.24.27-.4.4-.67.14-.27.07-.5-.03-.7-.1-.2-.9-2.17-1.23-2.97Z" fill="currentColor" transform="translate(1 0) scale(.9)" />
    </svg>
  );
  return <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M21.6 4.2 18.4 19c-.2 1-.8 1.2-1.6.8l-4.5-3.3-2.2 2.1c-.2.2-.4.4-.8.4l.3-4.6 8.4-7.6c.4-.3-.1-.5-.6-.2L6.9 13.2l-4.4-1.4c-1-.3-1-1 .2-1.5L20 3.8c.9-.3 1.8.2 1.6.4Z" fill="currentColor" /></svg>;
}

export function ContactChannelCard({ channel, locale = "id", href }) {
  if (!["whatsapp", "telegram"].includes(channel) || !href) return null;
  const language = locale === "en" ? "en" : "id";
  const item = copy[language][channel];
  return (
    <Card as="a" interactive href={href} target="_blank" rel="noopener noreferrer" aria-label={item.action} className={`ui-contact-channel-card ui-contact-channel-card--${channel}`}>
      <span className="ui-contact-channel-card__icon" aria-hidden="true"><ChannelIcon channel={channel} /></span>
      <span className="ui-contact-channel-card__copy">
        <span className="ui-contact-channel-card__eyebrow">{copy[language].official}</span>
        <strong className="ui-contact-channel-card__title">{item.name}</strong>
        <span className="ui-contact-channel-card__description">{item.description}</span>
        <span className="ui-contact-channel-card__value">{item.value}</span>
      </span>
      <svg className="ui-contact-channel-card__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M7 17 17 7M7 7h10v10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
    </Card>
  );
}
