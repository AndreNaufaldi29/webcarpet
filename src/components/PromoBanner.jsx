"use client";

import { useState, useEffect } from "react";
import { getStoredSettings, subscribeSettings, DEFAULT_SETTINGS } from "@/lib/settingsStore";
import { FiX, FiArrowRight, FiTag } from "react-icons/fi";

export default function PromoBanner() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setSettings(getStoredSettings());
    const unsubscribe = subscribeSettings((updated) => {
      setSettings(updated);
    });
    return () => unsubscribe();
  }, []);

  const isActive = settings.promoActive === "true" || settings.promoActive === true;

  if (!isActive || !settings.promoText || dismissed) {
    return null;
  }

  const promoLink =
    settings.promoLink ||
    `https://wa.me/${(settings.whatsapp || "628212128701").replace(/[^0-9]/g, "")}`;

  return (
    <div className="promo-top-banner">
      <div className="promo-banner-container">
        <div className="promo-banner-content">
          <span className="promo-badge">
            <FiTag size={12} />
            <span>PROMO SPESIAL</span>
          </span>
          <p className="promo-text">{settings.promoText}</p>
        </div>

        <div className="promo-banner-actions">
          {promoLink && (
            <a
              href={promoLink}
              target="_blank"
              rel="noreferrer"
              className="promo-btn"
            >
              <span>Klaim Promo</span>
              <FiArrowRight size={13} />
            </a>
          )}

          <button
            type="button"
            className="promo-close-btn"
            onClick={() => setDismissed(true)}
            aria-label="Tutup Pengumuman"
            title="Tutup banner promo"
          >
            <FiX size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
