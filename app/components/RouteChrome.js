"use client";

import { usePathname } from "next/navigation";
import { stripLocalePrefix } from "@/lib/localePath";
import Header from "./Header";
import Footer from "./Footer";
import GlobalSidebar from "./GlobalSidebar";

export default function RouteChrome({ children }) {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const isImmersiveGame = pathname.startsWith("/games/run-jump") || pathname.startsWith("/games/mamah-ngamuk");
  const isHome = pathname === "/";
  if (isImmersiveGame) return <div className="df-immersive-route">{children}</div>;
  return (
    <div className={isHome ? "df-site-shell df-home-route-shell" : "df-site-shell"}>
      <Header />
      <div className="df-site-body">
        {!isHome && <GlobalSidebar />}
        <div className="df-site-main">{children}</div>
      </div>
      <Footer />
    </div>
  );
}
