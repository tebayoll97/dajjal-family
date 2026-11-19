"use client";
export default function ContactCenterMessage({ name, avatar, body, date, pending = false, sendingLabel = "Sending…" }) {
  const initial = (name || "D").trim().charAt(0).toUpperCase();
  return <article className={`df-support-message ${pending ? "is-pending" : ""}`} aria-live={pending ? "polite" : undefined}>
    <span className="df-support-message-avatar">{avatar ? <img src={avatar} alt="" loading="lazy" /> : <span aria-hidden="true">{initial}</span>}</span>
    <strong className="df-support-message-head">{name}</strong>
    <p className="df-support-message-body">{body}</p>
    <span className="df-support-message-foot">{pending ? <><span className="df-support-typing-dots" aria-hidden="true"><i/><i/><i/></span><span>{sendingLabel}</span></> : date}</span>
  </article>;
}
