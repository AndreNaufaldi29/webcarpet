"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getStoredSettings, subscribeSettings, DEFAULT_SETTINGS } from "@/lib/settingsStore";
import {
  FiFileText,
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiHome,
  FiGrid,
  FiImage,
  FiMapPin,
  FiChevronRight,
  FiMessageCircle,
} from "react-icons/fi";

import BrandLogo from "./BrandLogo";

function Navbar() {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsubscribe = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setDarkMode(localStorage.getItem("theme") === "dark");
  }, []);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Auto close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // Close menu on Escape key press or window resize to desktop
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    const handleResize = () => {
      if (window.innerWidth > 900) setMenuOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);

    localStorage.setItem(
      "theme",
      nextTheme ? "dark" : "light"
    );
  };

  const handleRequestQuote = () => {
    const cleanWhatsapp = (settings.whatsapp || "08212128701").replace(/[^0-9]/g, "");
    const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
    const msg = `Halo ${settings.companyName || "Rumah Indah Carpet"}, saya ingin meminta penawaran harga & katalog karpet untuk kebutuhan kami.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const menus = [
    { name: "Beranda", path: "/", icon: FiHome },
    { name: "Katalog", path: "/catalog", icon: FiGrid },
    { name: "Portofolio", path: "/portofolio", icon: FiImage },
    { name: "Cabang", path: "/cabang", icon: FiMapPin },
  ];

  return (
    <>
      <header className="navbar">
        <div className="navbar-container">
          <div className="logo">
            <Link href="/" style={{ textDecoration: "none" }} aria-label="Rumah Indah Carpet Beranda">
              <BrandLogo variant={darkMode ? "light" : "default"} size="md" />
            </Link>
          </div>

          {/* Desktop Nav Links */}
          <nav className="navbar-menu-desktop" aria-label="Navigasi Utama">
            <ul>
              {menus.map((menu) => (
                <li key={menu.path}>
                  <Link
                    href={menu.path}
                    className={
                      pathname === menu.path
                        ? "nav-link active"
                        : "nav-link"
                    }
                  >
                    {menu.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop Right Actions */}
          <div className="navbar-actions">
            <button className="quote-btn" onClick={handleRequestQuote}>
              <FiFileText />
              <span>Minta Penawaran</span>
            </button>

            <button
              className="theme-btn"
              onClick={toggleTheme}
              aria-label="Toggle Theme"
              title={darkMode ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
            >
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>

          {/* Mobile Right Controls */}
          <div className="navbar-mobile-header-actions">
            <button
              className="mobile-quick-quote-btn"
              onClick={handleRequestQuote}
              aria-label="Minta Penawaran via WhatsApp"
              title="Minta Penawaran"
            >
              <FiMessageCircle />
            </button>

            <button
              className={`menu-toggle ${menuOpen ? "active" : ""}`}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Tutup menu navigasi" : "Buka menu navigasi"}
              aria-expanded={menuOpen}
            >
              {menuOpen ? <FiX /> : <FiMenu />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Backdrop Overlay */}
      <div
        className={`navbar-backdrop ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Slide-Out Drawer */}
      <aside
        className={`navbar-drawer ${menuOpen ? "open" : ""}`}
        aria-label="Menu Navigasi Mobile"
      >
        {/* Drawer Header */}
        <div className="drawer-header">
          <Link href="/" onClick={() => setMenuOpen(false)} style={{ textDecoration: "none" }}>
            <BrandLogo variant={darkMode ? "light" : "default"} size="sm" />
          </Link>
          <button
            className="drawer-close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Tutup menu navigasi"
          >
            <FiX />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="drawer-body">
          <div className="drawer-section-label">Navigasi Utama</div>
          <ul className="drawer-nav-list">
            {menus.map((menu) => {
              const Icon = menu.icon;
              const isActive = pathname === menu.path;
              return (
                <li key={menu.path}>
                  <Link
                    href={menu.path}
                    onClick={() => setMenuOpen(false)}
                    className={`drawer-nav-item ${isActive ? "active" : ""}`}
                  >
                    <span className="drawer-nav-icon">
                      <Icon />
                    </span>
                    <span className="drawer-nav-label">{menu.name}</span>
                    <FiChevronRight className="drawer-nav-arrow" />
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Quick Info & Consultation Card */}
          <div className="drawer-info-card">
            <div className="drawer-info-title">Butuh Konsultasi Karpet?</div>
            <div className="drawer-info-desc">
              Layanan survei, pengukuran & sampel karpet gratis langsung ke lokasi Anda.
            </div>
            <div className="drawer-info-contact">
              📞 {settings.whatsapp || "0821-2128-701"}
            </div>
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="drawer-footer">
          <button className="drawer-quote-btn" onClick={handleRequestQuote}>
            <FiMessageCircle className="quote-icon" />
            <span>Minta Penawaran Harga</span>
          </button>

          <button
            className="drawer-theme-toggle"
            onClick={toggleTheme}
            aria-label="Ganti Tema Tampilan"
          >
            <div className="drawer-theme-left">
              <span className="drawer-theme-icon">
                {darkMode ? <FiSun /> : <FiMoon />}
              </span>
              <span className="drawer-theme-text">
                {darkMode ? "Mode Terang" : "Mode Gelap"}
              </span>
            </div>
            <div className={`drawer-switch-pill ${darkMode ? "dark" : ""}`}>
              <div className="drawer-switch-thumb" />
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}

export default Navbar;

