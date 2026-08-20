"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import logoAB from "../assets/Original-AB-Carpet-Logo.png";

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

  useEffect(() => {
    // Intercept clicks on internal links
    const handleLinkClick = (e) => {
      const target = e.target.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external links, new tabs, mailto, tel, hashes, and admin routes
      if (
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        href.startsWith("#") ||
        target.target === "_blank" ||
        target.hasAttribute("download") ||
        e.ctrlKey ||
        e.metaKey ||
        e.shiftKey
      ) {
        return;
      }

      // Ignore admin links
      if (href.startsWith("/admin")) {
        return;
      }

      // If clicking same page hash or exact same route without param change
      const currentUrl = window.location.pathname + window.location.search;
      if (href === currentUrl || href === window.location.pathname) {
        return;
      }

      // Start loading
      setLoading(true);
    };

    const handlePopState = () => {
      if (!window.location.pathname.startsWith("/admin")) {
        setLoading(true);
      }
    };

    document.addEventListener("click", handleLinkClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  // Safety fallback so loading never gets stuck
  useEffect(() => {
    if (loading) {
      const safetyTimer = setTimeout(() => {
        setLoading(false);
      }, 3500);
      return () => clearTimeout(safetyTimer);
    }
  }, [loading]);

  if (!loading) return null;

  return (
    <div className="user-page-loader-overlay" aria-live="polite" aria-busy="true">
      {/* TOP PROGRESS BAR */}
      <div className="user-page-loader-bar" />

      {/* CENTER BRAND CARD */}
      <div className="user-page-loader-card">
        {/* SPINNER WITH BRAND LOGO */}
        <div className="user-loader-spinner-wrap">
          <div className="user-loader-spinner-ring" />
          <div className="user-loader-brand-badge">
            <img
              src={logoAB.src}
              alt="AB Carpet Logo"
              className="user-loader-logo-img"
            />
          </div>
        </div>

        {/* LOADING TEXT */}
        <div className="user-loader-text-group">
          <h4 className="user-loader-title">Memuat Halaman...</h4>
          <p className="user-loader-subtitle">AB Carpet • Karpet Premium</p>
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
