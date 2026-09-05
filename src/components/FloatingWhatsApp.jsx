"use client";

import { useState, useEffect } from "react";
import { FaWhatsapp } from "react-icons/fa";
import { getStoredSettings, subscribeSettings, DEFAULT_SETTINGS } from "@/lib/settingsStore";

export default function FloatingWhatsApp() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsubscribe = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  const cleanWhatsapp = (settings.whatsapp || "08212128701").replace(/[^0-9]/g, "");
  const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
  const company = settings.companyName || "Rumah Indah Carpet";
  const message = `Halo ${company}, saya tertarik untuk konsultasi dan ingin meminta penawaran harga karpet.`;
  const whatsappUrl = `https://wa.me/${num}?text=${encodeURIComponent(message)}`;

  return (
    <aside
      className="floating-whatsapp-wrapper"
      aria-label="Kontak WhatsApp"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip / Label */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-label"
        aria-hidden="true"
        tabIndex={-1}
      >
        <span className="floating-whatsapp-badge">Online</span>
        <span className="floating-whatsapp-text">Chat WhatsApp & Penawaran</span>
      </a>

      {/* Floating Action Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="floating-whatsapp-btn"
        aria-label="Hubungi kami via WhatsApp untuk konsultasi dan penawaran"
        title="Hubungi via WhatsApp"
      >
        <span className="floating-whatsapp-pulse" aria-hidden="true" />
        <span className="floating-whatsapp-icon-wrap">
          <FaWhatsapp className="floating-whatsapp-icon" />
        </span>
        <span className="floating-whatsapp-status-dot" title="Admin Online" />
      </a>
    </aside>
  );
}
