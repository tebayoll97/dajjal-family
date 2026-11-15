"use client";

import { usePathname } from "next/navigation";
import { stripLocalePrefix } from "@/lib/localePath";
import Header from "./Header";
import Footer from "./Footer";

export default function RouteChrome({ children }) {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const isImmersiveGame = pathname.startsWith("/games/run-jump") || pathname.startsWith("/games/mamah-ngamuk");

  if (isImmersiveGame) return <div className="df-immersive-route">{children}</div>;

  return (
    <div className="df-site-shell">
      <Header />
      <div className="df-site-main">{children}</div>
      <Footer />
    </div>
  );
}
