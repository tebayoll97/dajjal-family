"use client";

import { usePathname } from "next/navigation";
import { stripLocalePrefix } from "@/lib/localePath";
import Header from "./Header";
import Footer from "./Footer";
import GlobalSidebar from "./GlobalSidebar";
import { LoginModalProvider } from "./LoginModalProvider";

export default function RouteChrome({ children }) {
  const pathname = stripLocalePrefix(usePathname() || "/");
  const isImmersiveGame = pathname.startsWith("/games/run-jump") || pathname.startsWith("/games/mamah-ngamuk");
  const isLogin = pathname === "/login";

  let content;
  if (isImmersiveGame) {
    content = <div className="df-immersive-route">{children}</div>;
  } else if (isLogin) {
    content = (
      <div className="df-site-shell">
        <Header />
        <div className="df-site-main">{children}</div>
      </div>
    );
  } else {
    content = (
      <div className="df-site-shell">
        <Header />
        <div className="df-workspace-layout">
          <GlobalSidebar />
          <main className="df-workspace-main">{children}</main>
        </div>
        <Footer />
      </div>
    );
  }

  return <LoginModalProvider>{content}</LoginModalProvider>;
}
