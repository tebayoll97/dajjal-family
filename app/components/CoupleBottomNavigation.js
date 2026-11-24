"use client";

import { BottomNavigation } from "@/app/components/ui";

function Icon({ name, size = 21 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/></>,
    profile: <><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 5.5a3 3 0 0 1 0 5.8M17 14a5.5 5.5 0 0 1 4.5 5.5"/></>,
    gallery: <><rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></>,
    story: <><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21zM4 4.5v16.5M8 6h8M8 10h8"/></>,
    play: <path d="m8 5 12 7-12 7z" fill="currentColor" stroke="none"/>,
    pause: <><path d="M8 5v14M16 5v14"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export default function CoupleBottomNavigation({ locale = "id", musicPlaying = false }) {
  const en = locale === "en";
  const dispatchToggle = () => window.dispatchEvent(new CustomEvent("df-couple-music-toggle"));
  return (
    <BottomNavigation
      fixed
      className="df-couple-shared-bottom-nav"
      ariaLabel={en ? "Couple page navigation" : "Navigasi halaman Couple"}
      items={[
        { key: "home", label: en ? "Home" : "Awal", icon: <Icon name="home"/>, onClick: () => document.getElementById("df-couple-home")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
        { key: "profile", label: en ? "Profile" : "Profil", icon: <Icon name="profile"/>, onClick: () => document.getElementById("df-couple-profile")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
        { key: "gallery", label: en ? "Gallery" : "Galeri", icon: <Icon name="gallery"/>, onClick: () => document.getElementById("df-couple-gallery")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
        { key: "story", label: en ? "Story" : "Kisah", icon: <Icon name="story"/>, onClick: () => document.getElementById("df-couple-story")?.scrollIntoView({ behavior: "smooth", block: "start" }) },
      ]}
      centerAction={{
        label: musicPlaying ? (en ? "Pause" : "Jeda") : (en ? "Play" : "Putar"),
        icon: <Icon name={musicPlaying ? "pause" : "play"} size={23}/>,
        active: musicPlaying,
        onClick: dispatchToggle,
      }}
    />
  );
}
