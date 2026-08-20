"use client";

import { useState, useEffect } from "react";
import { getStoredSettings, subscribeSettings, DEFAULT_SETTINGS } from "@/lib/settingsStore";
import {
  getStoredBranches,
  subscribeBranches,
  syncBranchesFromDatabase,
  DEFAULT_BRANCHES,
} from "@/lib/branchStore";
import {
  FiMapPin,
  FiPhone,
  FiNavigation,
  FiStar,
  FiCheckCircle,
  FiAward,
} from "react-icons/fi";

import { FaWhatsapp, FaStore } from "react-icons/fa";

function Cabang() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [branches, setBranches] = useState(DEFAULT_BRANCHES);

  useEffect(() => {
    // 1. Settings subscription
    setSettings(getStoredSettings());
    const unsubSettings = subscribeSettings((updated) => {
      setSettings(updated);
    });

    // 2. Branches initial & DB fetch
    setBranches(getStoredBranches());
    syncBranchesFromDatabase().then((dbBranches) => {
      if (Array.isArray(dbBranches) && dbBranches.length > 0) {
        setBranches(dbBranches);
      }
    });

    // 3. Branches realtime event subscription
    const unsubBranches = subscribeBranches((updated) => {
      setBranches(updated);
    });

    return () => {
      unsubSettings();
      unsubBranches();
    };
  }, []);

  const cleanWhatsapp = (settings.whatsapp || "0812-5223-5800").replace(/[^0-9]/g, "");

  const activeBranches = branches.filter((b) => b.status !== "Nonaktif");

  const handleOpenMaps = (url) => {
    if (url) window.open(url, "_blank");
  };

  const handleWhatsApp = (branchName) => {
    const msg = `Halo ${settings.companyName || "AB Carpet"}, saya ingin konsultasi dan berkunjung ke ${branchName}.`;
    const num = cleanWhatsapp.startsWith("0") ? "62" + cleanWhatsapp.slice(1) : cleanWhatsapp;
    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <section className="branch-section">
      {/* HEADER WITH SHIMMER BADGE */}
      <div className="branch-header">
        <span className="section-badge animate-badge-pop">
          <FiStar size={12} />
          <span>JARINGAN & SHOWROOM RESMI</span>
        </span>

        <h2>Cabang & Showroom {settings.companyName || "AB Carpet"}</h2>

        <p>
          Kunjungi kantor pusat, workshop, dan showroom display kami di berbagai kota strategis Jawa Timur untuk melihat langsung ratusan sampel karpet premium.
        </p>
      </div>

      {/* STATISTIK CARDS */}
      <div className="branch-stats">
        <div className="stat-card">
          <div className="stat-card-icon blue">
            <FaStore />
          </div>
          <div className="stat-card-info">
            <h3>{activeBranches.length}+</h3>
            <span>Showroom & Cabang</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon green">
            <FiCheckCircle />
          </div>
          <div className="stat-card-info">
            <h3>500+</h3>
            <span>Proyek Selesai</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-icon orange">
            <FiAward />
          </div>
          <div className="stat-card-info">
            <h3>100%</h3>
            <span>Garansi Pemasangan</span>
          </div>
        </div>
      </div>

      {/* CABANG GRID */}
      <div className="branch-grid">
        {activeBranches.map((branch, idx) => (
          <div
            key={branch.id || idx}
            className="branch-card"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            <div className="branch-image">
              <img
                src={branch.image || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200"}
                alt={branch.name}
                className="branch-img"
              />
              <div className="branch-img-overlay" />
              <span className="branch-city">{branch.city}</span>
            </div>

            <div className="branch-content">
              <span className="branch-type-badge">{branch.badge || "Showroom Display"}</span>
              <h3>{branch.name}</h3>

              <div className="branch-info">
                <p>
                  <FiMapPin className="info-icon" />
                  <span>{branch.address}</span>
                </p>

                <p>
                  <FiPhone className="info-icon" />
                  <span>{branch.phone || settings.phone || "0812-5223-5800"}</span>
                </p>
              </div>

              <div className="branch-buttons">
                {branch.mapsUrl && (
                  <button
                    type="button"
                    className="location-btn"
                    onClick={() => handleOpenMaps(branch.mapsUrl)}
                  >
                    <FiNavigation size={16} />
                    <span>Petunjuk Arah</span>
                  </button>
                )}

                <button
                  type="button"
                  className="wa-btn"
                  onClick={() => handleWhatsApp(branch.name)}
                >
                  <FaWhatsapp size={17} />
                  <span>Hubungi Cabang</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Cabang;
