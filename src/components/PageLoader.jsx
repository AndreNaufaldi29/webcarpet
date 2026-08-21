"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import BrandLogo from "./BrandLogo";

export default function PageLoader() {
  const [loading, setLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset loading whenever route finishes changing
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 450); // slight smooth delay for seamless transition feel

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  // Intercept Next.js internal Link clicks to show instant loader
  useEffect(() => {
    const handleAnchorClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, anchors on same page, and target=_blank
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.getAttribute("target") === "_blank"
      ) {
        return;
      }

      // If internal link to different path, show loader
      const currentUrl = window.location.pathname + window.location.search;
      if (href !== currentUrl) {
        setLoading(true);
      }
    };

    document.addEventListener("click", handleAnchorClick);
    return () => document.removeEventListener("click", handleAnchorClick);
  }, []);

  if (!loading) return null;

  return (
    <div
      className="user-page-loader-overlay"
      role="status"
      aria-live="polite"
      aria-label="Memuat Halaman Rumah Indah Carpet..."
    >
      {/* TOP PROGRESS BAR */}
      <div className="user-page-loader-bar" />

      {/* CENTER BRAND CARD */}
      <div className="user-page-loader-card">
        {/* SPINNER WITH BRAND LOGO */}
        <div className="user-loader-spinner-wrap">
          <div className="user-loader-spinner-ring" />
          <div className="user-loader-brand-badge">
            <BrandLogo variant="icon-only" size="sm" />
          </div>
        </div>

        {/* LOADING TEXT */}
        <div className="user-loader-text-group">
          <h4 className="user-loader-title">Memuat Halaman...</h4>
          <p className="user-loader-subtitle">Rumah Indah Carpet • Karpet Premium</p>
        </div>

        {/* PULSING DOTS */}
        <div className="user-loader-dots">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>
      </div>
    </div>
  );
}
