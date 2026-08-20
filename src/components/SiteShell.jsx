"use client";

import { useEffect, Suspense } from "react";
import { usePathname } from "next/navigation";

import Navbar from "./Navbar";
import Footer from "./footer";
import PageLoader from "./PageLoader";
import ScrollReveal from "./ScrollReveal";
import SEOManager from "./SEOManager";
import PromoBanner from "./PromoBanner";

export default function SiteShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <div className="site-shell">
      <SEOManager />
      <PromoBanner />
      <Suspense fallback={null}>
        <PageLoader />
      </Suspense>
      <ScrollReveal />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}

