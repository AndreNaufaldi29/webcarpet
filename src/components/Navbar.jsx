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
} from "react-icons/fi";

import logoAB from "../assets/Original-AB-Carpet-Logo.png";

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

  const toggleTheme = () => {
    const nextTheme = !darkMode;
    setDarkMode(nextTheme);

    localStorage.setItem(
      "theme",
      nextTheme ? "dark" : "light"
    );
  };

  const handleRequestQuote = () => {
    const cleanWhatsapp = (settings.whatsapp || "0812-5223-5800").replace(/[^0-9]/g, "");
    const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
    const msg = `Halo ${settings.companyName || "AB Carpet"}, saya ingin meminta penawaran harga & katalog karpet untuk kebutuhan kami.`;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  const menus = [
    { name: "Beranda", path: "/" },
    { name: "Katalog", path: "/catalog" },
    { name: "Portofolio", path: "/portofolio" },
    { name: "Cabang", path: "/cabang" },
  ];

  return (
    <header className="navbar">
      <div className="logo">
        <Link href="/">
          <img
            src={logoAB.src}
            alt={settings.companyName || "AB Carpet"}
            className="logo-image"
          />
        </Link>
      </div>

      <button
        className="menu-toggle"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Toggle Menu"
      >
        <nav className={`navbar-menu ${menuOpen ? "open" : ""}`}></nav>
        {menuOpen ? <FiX /> : <FiMenu />}
      </button>

      <nav
        className={`navbar-menu ${
          menuOpen ? "open" : ""
        }`}
      >
        <ul>
          {menus.map((menu) => (
            <li key={menu.path}>
              <Link
                href={menu.path}
                onClick={() => setMenuOpen(false)}
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

        <div className="mobile-actions">
          <button className="quote-btn" onClick={handleRequestQuote}>
            <FiFileText />
            <span>Minta Penawaran</span>
          </button>

          <button
            className="theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle Theme"
          >
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>
        </div>
      </nav>

      <div className="navbar-actions">
        <button className="quote-btn" onClick={handleRequestQuote}>
          <FiFileText />
          <span>Minta Penawaran</span>
        </button>

        <button
          className="theme-btn"
          onClick={toggleTheme}
          aria-label="Toggle Theme"
        >
          {darkMode ? <FiSun /> : <FiMoon />}
        </button>
      </div>
    </header>
  );
}

export default Navbar;
